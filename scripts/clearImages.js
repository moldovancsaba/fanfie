import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uri = "mongodb+srv://moldovancsaba:gbR86EK0bxumEpxq@mosaic-cluster.nm3s5dj.mongodb.net/?retryWrites=true&w=majority&appName=mosaic-cluster";
if (!uri) {
    console.error('Please provide MONGODB_URI environment variable');
    process.exit(1);
}

async function clearImages() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected successfully');
        
        const db = client.db();
        const result = await db.collection('images').deleteMany({});
        
        console.log(`Deleted ${result.deletedCount} images from the database`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

clearImages();
