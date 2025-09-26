import { NextRequest, NextResponse } from 'next/server';

// Configure for large file uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb',
        },
    },
};

export async function POST(request: NextRequest) {
    let timeoutId: NodeJS.Timeout | undefined;

    try {
        // Set timeout for large file uploads (10 minutes)
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

        const formData = await request.formData();

        // Get API key from server environment (not public)
        const apiKey = process.env.CSM_API_KEY;
        const n8nSubmitFormWebhook = process.env.N8N_SUBMIT_FORM_WEBHOOK;

        if (!apiKey || !n8nSubmitFormWebhook) {
            return NextResponse.json(
                { error: 'CSM_API_KEY or N8N_SUBMIT_FORM_WEBHOOK is not configured' },
                { status: 500 }
            );
        }

        // Forward the request to the external webhook with proper headers
        const response = await fetch(n8nSubmitFormWebhook, {
            method: 'POST',
            headers: {
                'csm-api-key': apiKey
            },
            body: formData,
            signal: controller.signal
        });

        // Clear timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`External API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in posting API route:', error);

        // Clear timeout on error
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Handle specific error types
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout - file too large or upload too slow' },
                { status: 408 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to process posting request' },
            { status: 500 }
        );
    }
}
