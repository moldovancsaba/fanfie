import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

/**
 * GET /api/images
 * Fetches all images from the database
 * Returns a paginated list of images with proper error handling
 */
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const images = await db.collection('images').find({}).toArray();
        
        return NextResponse.json({
            success: true,
            data: images,
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch images',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * POST /api/images
 * Adds new images to the database
 * Expects a JSON body with image data
 * Returns the newly created image entry
 */
export async function POST(request) {
    try {
        const body = await request.json();
        
        // Validate urls array
        if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'URLs array is required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const imageDataArray = body.urls.map(url => ({
            url,
            title: url.split('/').pop() || 'Untitled',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        const result = await db.collection('images').insertMany(imageDataArray);
        
        return NextResponse.json({
            success: true,
            data: imageDataArray.map((img, idx) => ({ ...img, _id: Object.values(result.insertedIds)[idx] })),
            timestamp: new Date().toISOString()
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating image:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create image',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
