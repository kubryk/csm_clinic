import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        console.log('Postiz route - received formData with keys:', Array.from(formData.keys()));

        // Get Postiz API configuration
        const apiKey = process.env.POSTIZ_API_KEY;
        const postizUrl = process.env.POSTIZ_BASE_URL;

        if (!apiKey || !postizUrl) {
            return NextResponse.json(
                { error: 'POSTIZ_API_KEY or POSTIZ_BASE_URL is not configured' },
                { status: 500 }
            );
        }

        // Forward the request to Postiz API
        const response = await fetch(`${postizUrl}/api/public/v1/upload`, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                // Don't set Content-Type for FormData - let browser set it with boundary
            },
            body: formData,
        });

        console.log('Postiz API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Postiz API error response:', errorText);
            throw new Error(`Postiz API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Try to parse JSON response, but handle non-JSON responses gracefully
        let data;
        try {
            data = await response.json();
            console.log('Postiz API success response:', data);
        } catch (jsonError) {
            // If response is not JSON, return success with text
            const textData = await response.text();
            console.log('Postiz API non-JSON response:', textData);
            data = { success: true, message: textData };
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in Postiz API route:', error);

        return NextResponse.json(
            { error: 'Failed to process Postiz posting request' },
            { status: 500 }
        );
    }
}
