import { SearchResult, SearchProvider } from './types';

export async function serperSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  
  console.log('[Serper] API Key check:', apiKey ? 'Present' : 'MISSING');

  if (!apiKey) {
    console.error('[Serper] SERPER_API_KEY environment variable is not set!');
    throw new Error('SERPER_API_KEY is not configured. Please add it to your .env.local file.');
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper API error (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Serper response:', text.substring(0, 200));
      throw new Error('Invalid JSON response from search API');
    }

    if (!data.organic || !Array.isArray(data.organic)) {
      console.log('[Serper] No organic results found');
      return [];
    }

    const results = data.organic
      .filter((item: any) => item && item.link && item.title)
      .map((item: any) => {
        let domain = item.domain || '';
        if (!domain && item.link) {
          try {
            domain = new URL(item.link).hostname.replace('www.', '');
          } catch (e) {
            domain = item.link;
          }
        }

        return {
          title: item.title || 'Untitled',
          url: item.link,
          snippet: item.snippet || item.description || '',
          source: domain,
        };
      });

    console.log('[Serper] Processed results:', results.length);
    return results;
  } catch (error) {
    console.error('[Serper] Error:', error);
    throw error;
  }
}

export async function serpApiSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  
  console.log('[SerpApi] API Key check:', apiKey ? 'Present' : 'MISSING');

  if (!apiKey) {
    console.error('[SerpApi] SERPAPI_API_KEY environment variable is not set!');
    throw new Error('SERPAPI_API_KEY is not configured. Please add it to your .env.local file.');
  }

  const url = new URL('https://serpapi.com/search');
  url.searchParams.append('q', query);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('engine', 'google');
  url.searchParams.append('num', '10');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SerpApi error: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.organic_results || []).map((item: any) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet || '',
    source: item.displayed_link || new URL(item.link).hostname,
  }));
}

export async function searchWeb(
  query: string,
  provider: SearchProvider = 'serper'
): Promise<SearchResult[]> {
  if (!query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  try {
    if (provider === 'serpapi') {
      return await serpApiSearch(query);
    }
    return await serperSearch(query);
  } catch (error) {
    if (provider === 'serpapi' && error instanceof Error && error.message.includes('not configured')) {
      return await serperSearch(query);
    }
    throw error;
  }
}
