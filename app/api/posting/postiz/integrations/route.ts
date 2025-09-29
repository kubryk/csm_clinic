import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get Postiz API configuration
        const apiKey = process.env.POSTIZ_API_KEY;
        const postizUrl = process.env.POSTIZ_BASE_URL;

        if (!apiKey || !postizUrl) {
            return NextResponse.json(
                { error: 'POSTIZ_API_KEY or POSTIZ_BASE_URL is not configured' },
                { status: 500 }
            );
        }

        // Build API URL - always fetch all integrations
        const apiUrl = `${postizUrl}/api/public/v1/integrations`;

        console.log(`Fetching all integrations from: ${apiUrl}`);

        // Fetch integrations from Postiz API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        console.log(`Postiz integrations API response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Postiz integrations API error response:', errorText);
            throw new Error(`Postiz API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Parse response
        const data = await response.json();
        console.log(`Postiz integrations API success response:`, data);
        console.log(`Integrations count: ${Array.isArray(data) ? data.length : data.integrations?.length || 0}`);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in Postiz integrations API route:', error);

        return NextResponse.json(
            { error: 'Failed to fetch integrations from Postiz API', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}