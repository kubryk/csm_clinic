import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Blotato route - received JSON body:', body);
        console.log('Blotato targets:', body.targets);
        console.log('Blotato URL:', body.url);

        // Get Blotato API configuration
        const apiKey = process.env.BLOTATO_API_KEY;
        const blotatoUrl = 'https://backend.blotato.com/v2/media';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'BLOTATO_API_KEY is not configured' },
                { status: 500 }
            );
        }

        // Forward the request to Blotato API
        const response = await fetch(blotatoUrl, {
            method: 'POST',
            headers: {
                'blotato-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('Blotato API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Blotato API error response:', errorText);
            throw new Error(`Blotato API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Try to parse JSON response, but handle non-JSON responses gracefully
        let data;
        try {
            data = await response.json();
            console.log('Blotato API success response:', data);
        } catch (jsonError) {
            // If response is not JSON, return success with text
            const textData = await response.text();
            console.log('Blotato API non-JSON response:', textData);
            data = { success: true, message: textData };
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in Blotato API route:', error);

        return NextResponse.json(
            { error: 'Failed to process Blotato posting request' },
            { status: 500 }
        );
    }
}
