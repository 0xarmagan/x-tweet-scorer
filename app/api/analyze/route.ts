import { NextRequest, NextResponse } from 'next/server';
import { analyzeTweet } from '@/lib/llm';
import { AnalysisRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    if (!body.tweet_text || !body.mode) {
      return NextResponse.json(
        { error: 'Missing required fields: tweet_text, mode' },
        { status: 400 }
      );
    }

    if (body.tweet_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet text cannot be empty' },
        { status: 400 }
      );
    }

    if (!['simple', 'detailed'].includes(body.mode)) {
      return NextResponse.json(
        { error: 'Mode must be "simple" or "detailed"' },
        { status: 400 }
      );
    }

    const result = await analyzeTweet(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API')) {
        return NextResponse.json(
          { error: 'Claude API error. Please check your API key and quota.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
