import { fetchAccessToken } from 'hume';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get API keys from environment variables
    const apiKey = process.env.HUME_API_KEY;
    const secretKey = process.env.HUME_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'Hume API keys not configured' },
        { status: 500 }
      );
    }

    // Generate access token
    const accessToken = await fetchAccessToken({
      apiKey,
      secretKey,
    });

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      );
    }

    // Return the token
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error generating Hume access token:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
} 