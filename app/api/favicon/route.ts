import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy favicon requests
 * This avoids CORS issues and provides a reliable way to fetch favicons
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
  }

  try {
    // Try multiple favicon sources
    const sources = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://${domain}/favicon.ico`,
      `https://icon.horse/icon/${domain}`,
    ];

    // Try each source until one works
    for (const source of sources) {
      try {
        const response = await fetch(source, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'image/x-icon',
              'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
            },
          });
        }
      } catch (e) {
        // Try next source
        continue;
      }
    }

    // All sources failed
    return NextResponse.json({ error: 'Failed to fetch favicon' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

