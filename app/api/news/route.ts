import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: NextRequest) {
  if (!NEWS_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'News API key not configured'
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'general';
  const country = searchParams.get('country') || 'in'; // Default to India
  const from = searchParams.get('from');

  try {
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=10&apiKey=${NEWS_API_KEY}`;
    
    // If specific query provided, use everything endpoint
    if (query) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${NEWS_API_KEY}`;
      if (from) {
        url += `&from=${from}`;
      }
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      const articles = data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage
      }));

      return NextResponse.json({
        success: true,
        articles,
        totalResults: data.totalResults,
        query: query || `Top ${category} headlines from ${country.toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(data.message || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news',
      fallback: true,
      articles: [
        {
          title: "Stay Updated with Latest News",
          description: "News service temporarily unavailable. Please check your API configuration.",
          url: "#",
          source: "System",
          publishedAt: new Date().toISOString(),
          urlToImage: null
        }
      ]
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!NEWS_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'News API key not configured'
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { query, from, to, sources, language = 'en', sortBy = 'publishedAt', pageSize = 20 } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required'
      }, { status: 400 });
    }

    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&pageSize=${pageSize}&language=${language}&apiKey=${NEWS_API_KEY}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    if (sources) url += `&sources=${sources}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      const articles = data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage
      }));

      return NextResponse.json({
        success: true,
        articles,
        totalResults: data.totalResults,
        query,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(data.message || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news'
    }, { status: 500 });
  }
}