import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check environment variables
        const apiKey = process.env.POSTIZ_API_KEY;
        const postizUrl = process.env.POSTIZ_BASE_URL;

        console.log('Environment check:');
        console.log('POSTIZ_API_KEY:', apiKey ? 'Set' : 'Not set');
        console.log('POSTIZ_BASE_URL:', postizUrl || 'Not set');

        if (!apiKey || !postizUrl) {
            return NextResponse.json({
                error: 'Environment variables not configured',
                details: {
                    POSTIZ_API_KEY: apiKey ? 'Set' : 'Not set',
                    POSTIZ_BASE_URL: postizUrl || 'Not set'
                }
            }, { status: 500 });
        }

        // Test API call
        const testUrl = `${postizUrl}/api/public/v1/posts`;
        console.log('Testing API URL:', testUrl);

        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        console.log('API Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            return NextResponse.json({
                error: 'Postiz API error',
                status: response.status,
                details: errorText
            }, { status: 500 });
        }

        const data = await response.json();
        console.log('API Success Response:', data);

        return NextResponse.json({
            success: true,
            message: 'API is working',
            postsCount: Array.isArray(data) ? data.length : data.posts?.length || 0,
            data: data
        });

    } catch (error) {
        console.error('Test API error:', error);
        return NextResponse.json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
