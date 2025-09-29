import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');

        console.log(`Starting cleanup of uploads directory: ${uploadsDir}`);

        // Read all files in uploads directory
        const files = await readdir(uploadsDir);
        console.log(`Found ${files.length} files in uploads directory`);

        let deletedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Delete each file
        for (const file of files) {
            try {
                const filePath = join(uploadsDir, file);
                const stats = await stat(filePath);

                // Only delete files (not directories)
                if (stats.isFile()) {
                    await unlink(filePath);
                    deletedCount++;
                    console.log(`Deleted file: ${file}`);
                }
            } catch (error) {
                errorCount++;
                const errorMsg = `Failed to delete ${file}: ${error instanceof Error ? error.message : String(error)}`;
                errors.push(errorMsg);
                console.error(errorMsg);
            }
        }

        const result = {
            success: true,
            message: `Cleanup completed`,
            deletedCount,
            errorCount,
            totalFiles: files.length,
            errors: errors.length > 0 ? errors : undefined
        };

        console.log(`Cleanup result:`, result);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error in cleanup route:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to cleanup uploads directory',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');

        console.log(`Checking uploads directory: ${uploadsDir}`);

        // Read all files in uploads directory
        const files = await readdir(uploadsDir);

        const fileDetails = [];
        let totalSize = 0;

        for (const file of files) {
            try {
                const filePath = join(uploadsDir, file);
                const stats = await stat(filePath);

                if (stats.isFile()) {
                    fileDetails.push({
                        name: file,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    });
                    totalSize += stats.size;
                }
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }

        const result = {
            success: true,
            totalFiles: fileDetails.length,
            totalSize,
            totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
            files: fileDetails
        };

        console.log(`Uploads directory info:`, result);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error in cleanup GET route:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to get uploads directory info',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
