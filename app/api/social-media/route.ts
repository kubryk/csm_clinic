import { NextRequest, NextResponse } from 'next/server';
import { getSocialMediaIntegrations } from '@/lib/api/social-media';

export async function GET(request: NextRequest) {
    try {
        const data = await getSocialMediaIntegrations();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in social-media API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch social media integrations' },
            { status: 500 }
        );
    }
}
