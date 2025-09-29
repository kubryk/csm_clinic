import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const filePath = join(process.cwd(), 'public', 'uploads', ...resolvedParams.path);

        // Check if file exists
        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read file
        const fileBuffer = await readFile(filePath);

        // Get file extension to determine content type
        const extension = resolvedParams.path[resolvedParams.path.length - 1].split('.').pop()?.toLowerCase();

        let contentType = 'application/octet-stream';
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'mp4':
                contentType = 'video/mp4';
                break;
            case 'mov':
                contentType = 'video/quicktime';
                break;
            case 'avi':
                contentType = 'video/x-msvideo';
                break;
            case 'webm':
                contentType = 'video/webm';
                break;
        }

        return new NextResponse(fileBuffer as any, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
