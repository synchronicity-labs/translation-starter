import { S3 } from 'aws-sdk';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 instance
const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION
});

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }
  const key = `uploads/${Date.now()}-${req.query.fileName}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: 60 // The URL will expire in 60 seconds
  };
}
