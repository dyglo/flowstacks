import { NextRequest, NextResponse } from 'next/server';
import { searchWeb } from '@/lib/search-providers';
import { SearchProvider } from '@/lib/types';

// Ensure this route runs on Node.js runtime to access environment variables
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const provider = (searchParams.get('provider') as SearchProvider) || 'serper';

  // Log environment variable status for debugging
  const serperKeyExists = !!process.env.SERPER_API_KEY;
  const serpApiKeyExists = !!process.env.SERPAPI_API_KEY;
  
  console.log('[API] Discover request:', { 
    query, 
    provider,
    envCheck: {
      SERPER_API_KEY: serperKeyExists ? 'SET' : 'MISSING',
      SERPAPI_API_KEY: serpApiKeyExists ? 'SET' : 'MISSING'
    }
  });

  if (!query || query.trim() === '') {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('[API] Calling searchWeb with:', query);
    const results = await searchWeb(query, provider);
    console.log('[API] Search results count:', results.length);
    return NextResponse.json({ results, query, provider });
  } catch (error) {
    console.error('[API] Search error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('[API] Error details:', { errorMessage, errorStack });

    if (errorMessage.includes('not configured')) {
      return NextResponse.json(
        {
          error: 'Search API is not configured. Please set up your API keys in environment variables.',
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, provider = 'serper' } = body;

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query is required in request body' },
        { status: 400 }
      );
    }

    const results = await searchWeb(query, provider);
    return NextResponse.json({ results, query, provider });
  } catch (error) {
    console.error('Search API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (errorMessage.includes('not configured')) {
      return NextResponse.json(
        {
          error: 'Search API is not configured. Please set up your API keys in environment variables.',
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
