import { NextRequest, NextResponse } from 'next/server';
import { analyzeTweet } from '@/lib/llm';
import { AnalysisRequest, TweetFormat } from '@/lib/types';

const VALID_FORMATS: TweetFormat[] = ['text', 'image', 'video', 'article', 'poll', 'gif', 'thread'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const analysisRequest: AnalysisRequest = {
      tweet_text: body.tweet_text,
      mode: body.mode,
      format: VALID_FORMATS.includes(body.format) ? body.format : 'text',
    };

    const result = await analyzeTweet(analysisRequest);
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
