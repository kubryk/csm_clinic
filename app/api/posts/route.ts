import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        console.log(`Fetching posts from Postiz API with startDate: ${startDate}, endDate: ${endDate}`);

        // Add cache headers to reduce API calls
        const headers = new Headers();
        headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache

        // Validate dates if provided (expecting UTC format like 2025-09-30T23:59:59Z)
        if (startDate && isNaN(new Date(startDate).getTime())) {
            return NextResponse.json(
                { error: 'Invalid startDate format. Expected UTC format like 2025-09-30T23:59:59Z' },
                { status: 400 }
            );
        }

        if (endDate && isNaN(new Date(endDate).getTime())) {
            return NextResponse.json(
                { error: 'Invalid endDate format. Expected UTC format like 2025-09-30T23:59:59Z' },
                { status: 400 }
            );
        }

        // Get Postiz API configuration
        const apiKey = process.env.POSTIZ_API_KEY;
        const postizUrl = process.env.POSTIZ_BASE_URL;

        if (!apiKey || !postizUrl) {
            return NextResponse.json(
                { error: 'POSTIZ_API_KEY or POSTIZ_BASE_URL is not configured' },
                { status: 500 }
            );
        }

        // Build query parameters - Postiz API requires both startDate and endDate
        const queryParams = new URLSearchParams();

        // If no dates provided, use default range (last 30 days)
        const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const defaultEndDate = endDate || new Date().toISOString();

        queryParams.append('startDate', defaultStartDate);
        queryParams.append('endDate', defaultEndDate);

        console.log(`Using startDate: ${defaultStartDate}`);
        console.log(`Using endDate: ${defaultEndDate}`);

        const apiUrl = `${process.env.POSTIZ_BASE_URL}/api/public/v1/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        console.log(apiUrl);

        console.log(`Postiz API URL: ${apiUrl}`);
        console.log(`Postiz API Key: ${apiKey ? 'Set' : 'Not set'}`);
        console.log(`Postiz Base URL: ${postizUrl}`);

        // Fetch posts from Postiz API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        console.log(`Postiz API response status: ${response.status}`);
        console.log(`Postiz API response headers:`, Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Postiz API error response:', errorText);

            // Handle rate limiting (429)
            if (response.status === 429) {
                return NextResponse.json({
                    error: 'Rate limit exceeded',
                    message: 'Занадто багато запитів до API. Спробуйте пізніше.',
                    retryAfter: response.headers.get('Retry-After') || 60
                }, { status: 429 });
            }

            throw new Error(`Postiz API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Parse response
        const data = await response.json();
        console.log(`Postiz API success response:`, data);
        console.log(`Posts count: ${Array.isArray(data) ? data.length : data.posts?.length || 0}`);

        return NextResponse.json(data, { headers });

    } catch (error) {
        console.error('Error in posts API route:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch posts from Postiz API',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
