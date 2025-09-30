import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Helper function to save file to public folder and get public URL
async function saveFileToPublic(file: any): Promise<string> {
    try {
        console.log(`Starting to save file: ${file.name}, size: ${file.size} bytes`);

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        console.log(`Uploads directory: ${uploadsDir}`);
        await mkdir(uploadsDir, { recursive: true });
        console.log(`Directory created/verified: ${uploadsDir}`);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}_${randomString}.${fileExtension}`;
        console.log(`Generated filename: ${fileName}`);

        // Save file
        const filePath = join(uploadsDir, fileName);
        console.log(`Full file path: ${filePath}`);

        const arrayBuffer = await file.arrayBuffer();
        console.log(`ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);

        await writeFile(filePath, Buffer.from(arrayBuffer));
        console.log(`File written successfully to: ${filePath}`);

        // Verify file exists
        const fs = require('fs');
        const stats = fs.statSync(filePath);
        console.log(`File verification - size: ${stats.size} bytes, exists: ${fs.existsSync(filePath)}`);

        // Return full public URL
        const baseUrl = process.env.BASE_URL || 'https://localhost:3000';
        const publicUrl = `${baseUrl}/api/uploads/${fileName}`;
        console.log(`File saved to: ${filePath}`);
        console.log(`Public URL: ${publicUrl}`);

        return publicUrl;
    } catch (error) {
        console.error('Error saving file to public:', error);
        throw error;
    }
}





export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const metadata = formData.get('metadata') as string;
        const metadataObj = JSON.parse(metadata);

        console.log('metadata:', metadataObj);
        console.log('targets:', metadataObj.targets);

        // Extract files from formData
        const files: any[] = [];
        for (const [key, value] of formData.entries()) {
            if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
                files.push(value);
            }
        }

        console.log(`Processing ${files.length} file(s)`);

        const results: string[] = [];
        const postizResults: any[] = [];
        const blotatoResults: any[] = [];

        // Separate targets by provider
        const postizTargets = metadataObj.targets.filter((target: any) => target.source === 'postiz');
        const blotatoTargets = metadataObj.targets.filter((target: any) => target.source === 'blotato');

        // Process each file separately
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);

            // Send to Postiz if we have Postiz targets
            if (postizTargets.length > 0) {
                console.log(`Sending file ${file.name} to Postiz via internal route...`);
                try {
                    const postizFormData = new FormData();
                    postizFormData.append('targets', JSON.stringify(postizTargets));
                    postizFormData.append('metadata', JSON.stringify(metadataObj));
                    postizFormData.append('file', file);

                    // Import the Postiz route handler directly instead of making HTTP call
                    const { POST: postizHandler } = await import('./postiz/route');
                    const postizRequest = new NextRequest(`${process.env.BASE_URL}/api/posting/postiz`, {
                        method: 'POST',
                        body: postizFormData,
                    });
                    const postizResponse = await postizHandler(postizRequest);

                    if (postizResponse.ok) {
                        results.push(`Postiz (${file.name}): Success`);
                        console.log(`Postiz success for ${file.name}`);

                        // Collect Postiz result
                        try {
                            const postizData = await postizResponse.json();
                            console.log(`Postiz response data for ${file.name}:`, postizData);

                            postizResults.push({
                                fileName: file.name,
                                success: true,
                                result: postizData
                            });
                        } catch (parseError) {
                            console.error(`Error parsing Postiz response for ${file.name}:`, parseError);
                            postizResults.push({
                                fileName: file.name,
                                success: false,
                                error: 'Failed to parse Postiz response'
                            });
                        }
                    } else {
                        results.push(`Postiz (${file.name}): Failed`);
                        console.error(`Postiz error for ${file.name}:`, postizResponse.status, postizResponse.statusText);

                        postizResults.push({
                            fileName: file.name,
                            success: false,
                            error: `Postiz API error: ${postizResponse.status} ${postizResponse.statusText}`
                        });
                    }
                } catch (error) {
                    results.push(`Postiz (${file.name}): Error`);
                    console.error(`Postiz request error for ${file.name}:`, error);

                    postizResults.push({
                        fileName: file.name,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            // Send to Blotato if we have Blotato targets
            if (blotatoTargets.length > 0) {
                console.log(`Saving file ${file.name} to public folder for Blotato...`);
                try {
                    // Save file to public folder and get public URL
                    const publicUrl = await saveFileToPublic(file);
                    console.log(`File ${file.name} saved with public URL: ${publicUrl}`);

                    const blotatoPayload = {
                        url: publicUrl  // Only URL in body
                    };

                    // Import the Blotato route handler directly instead of making HTTP call
                    const { POST: blotatoHandler } = await import('./blotato/route');
                    const blotatoRequest = new NextRequest(`${process.env.BASE_URL}/api/posting/blotato`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(blotatoPayload),
                    });
                    const blotatoResponse = await blotatoHandler(blotatoRequest);

                    if (blotatoResponse.ok) {
                        results.push(`Blotato (${file.name}): Success`);
                        console.log(`Blotato success for ${file.name} with URL: ${publicUrl}`);

                        // Collect Blotato result
                        try {
                            const blotatoData = await blotatoResponse.json();
                            console.log(`Blotato response data for ${file.name}:`, blotatoData);

                            blotatoResults.push({
                                fileName: file.name,
                                success: true,
                                result: blotatoData,
                                publicUrl: publicUrl
                            });
                        } catch (parseError) {
                            console.error(`Error parsing Blotato response for ${file.name}:`, parseError);
                            blotatoResults.push({
                                fileName: file.name,
                                success: false,
                                error: 'Failed to parse Blotato response',
                                publicUrl: publicUrl
                            });
                        }
                    } else {
                        results.push(`Blotato (${file.name}): Failed`);
                        console.error(`Blotato error for ${file.name}:`, blotatoResponse.status, blotatoResponse.statusText);

                        blotatoResults.push({
                            fileName: file.name,
                            success: false,
                            error: `Blotato API error: ${blotatoResponse.status} ${blotatoResponse.statusText}`,
                            publicUrl: publicUrl
                        });
                    }

                } catch (error) {
                    results.push(`Blotato (${file.name}): Error`);
                    console.error(`Blotato request error for ${file.name}:`, error);

                    blotatoResults.push({
                        fileName: file.name,
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        publicUrl: null
                    });
                }
            }
        }

        // Send all results to N8N webhook
        if (postizResults.length > 0 || blotatoResults.length > 0) {
            console.log(`Sending all results to N8N webhook...`);
            console.log(`Total Postiz results: ${postizResults.length}`);
            console.log(`Total Blotato results: ${blotatoResults.length}`);

            const n8nWebhookUrl = process.env.N8N_SUBMIT_FORM_WEBHOOK;
            if (n8nWebhookUrl) {
                try {
                    const n8nPayload = {
                        metadata: metadataObj,
                        postizResults: postizResults,
                        blotatoResults: blotatoResults,
                        timestamp: new Date().toISOString()
                    };

                    console.log(`N8N payload:`, {
                        postizTargetsCount: postizTargets.length,
                        blotatoTargetsCount: blotatoTargets.length,
                        postizResultsCount: postizResults.length,
                        blotatoResultsCount: blotatoResults.length,
                        successfulPostizResults: postizResults.filter(r => r.success).length,
                        failedPostizResults: postizResults.filter(r => !r.success).length,
                        successfulBlotatoResults: blotatoResults.filter(r => r.success).length,
                        failedBlotatoResults: blotatoResults.filter(r => !r.success).length
                    });

                    const n8nResponse = await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'csm-api-key': process.env.CSM_API_KEY || '',
                        },
                        body: JSON.stringify(n8nPayload),
                    });

                    if (n8nResponse.ok) {
                        console.log(`All results sent to N8N webhook successfully`);
                        results.push(`N8N: All results sent successfully`);
                    } else {
                        console.error(`N8N webhook error:`, n8nResponse.status, n8nResponse.statusText);
                        results.push(`N8N: Failed to send results`);
                    }
                } catch (n8nError) {
                    console.error(`N8N webhook error:`, n8nError);
                    results.push(`N8N: Error sending results`);
                }
            } else {
                console.log(`N8N webhook URL not configured, skipping results`);
            }
        }

        // Return results
        const successCount = results.filter(r => r.includes('Success')).length;
        const totalCount = results.length;

        if (successCount === totalCount && totalCount > 0) {
            return NextResponse.json({
                success: true,
                message: 'All requests successful',
                results
            });
        } else if (totalCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Partial success',
                results
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'No targets found'
            });
        }

    } catch (error) {
        console.error('Error in posting API route:', error);
        return NextResponse.json(
            { error: 'Failed to process posting request' },
            { status: 500 }
        );
    }
}


