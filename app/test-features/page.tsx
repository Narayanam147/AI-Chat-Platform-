'use client';

import { useState } from 'react';
import { Clock, Globe, Calendar, RefreshCw, Loader } from 'lucide-react';

interface TimeData {
  success: boolean;
  time: string;
  timezone: string;
  location: {
    country: string;
    region: string;
    city: string;
    coordinates: number[] | null;
  };
  ip: string;
  fallback?: boolean;
}

interface NewsData {
  success: boolean;
  articles: {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    urlToImage: string | null;
  }[];
  totalResults: number;
  query: string;
  timestamp: string;
}

export default function TestFeaturesPage() {
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState({ time: false, news: false });
  const [error, setError] = useState<string | null>(null);

  const testTimeAPI = async () => {
    setLoading({ ...loading, time: true });
    setError(null);
    try {
      const response = await fetch('/api/timezone');
      const data = await response.json();
      setTimeData(data);
    } catch (err) {
      setError('Failed to fetch time data');
      console.error('Time API error:', err);
    } finally {
      setLoading({ ...loading, time: false });
    }
  };

  const testNewsAPI = async (query?: string) => {
    setLoading({ ...loading, news: true });
    setError(null);
    try {
      const url = new URL('/api/news', window.location.origin);
      if (query) url.searchParams.set('q', query);
      
      const response = await fetch(url);
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      setError('Failed to fetch news data');
      console.error('News API error:', err);
    } finally {
      setLoading({ ...loading, news: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ⚡ New Features Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test the enhanced time detection and news features with beautiful UI components
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
            <p className="font-medium">❌ Error: {error}</p>
          </div>
        )}

        {/* Time Feature */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-6 h-6" />
              <h2 className="text-xl font-semibold">🕐 Time Detection Feature</h2>
            </div>
            <p className="text-blue-100 mt-2">IP-based timezone detection with India as default</p>
          </div>
          
          <div className="p-6 space-y-4">
            <button
              onClick={testTimeAPI}
              disabled={loading.time}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {loading.time ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {loading.time ? 'Getting Time...' : 'Test Time API'}
            </button>

            {timeData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Current Time
                    </h3>
                    <p className="text-lg font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                      {timeData.time}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Location
                    </h3>
                    <div className="text-sm space-y-1">
                      <p><strong>City:</strong> {timeData.location.city}</p>
                      <p><strong>Region:</strong> {timeData.location.region}</p>
                      <p><strong>Country:</strong> {timeData.location.country}</p>
                      <p><strong>Timezone:</strong> {timeData.timezone}</p>
                      {timeData.fallback && (
                        <p className="text-orange-600 dark:text-orange-400">
                          ⚠️ Using fallback (India timezone)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* News Feature */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <Globe className="w-6 h-6" />
              <h2 className="text-xl font-semibold">📰 News & Current Affairs</h2>
            </div>
            <p className="text-green-100 mt-2">Latest headlines and current affairs from India</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => testNewsAPI()}
                disabled={loading.news}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {loading.news ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Top Headlines
              </button>
              
              <button
                onClick={() => testNewsAPI('technology')}
                disabled={loading.news}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Technology News
              </button>
              
              <button
                onClick={() => testNewsAPI('cricket')}
                disabled={loading.news}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cricket News
              </button>
            </div>

            {newsData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    📊 {newsData.query} ({newsData.totalResults} results)
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(newsData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="grid gap-4">
                  {newsData.articles.slice(0, 5).map((article, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          {article.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                              {article.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {article.source}
                            </span>
                            <span>
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {article.urlToImage && (
                          <img
                            src={article.urlToImage}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      
                      {article.url !== '#' && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Read Full Article →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Integration Info */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-3">🤖 Chat Integration</h2>
          <p className="text-purple-100 mb-4">
            These features are automatically integrated into the main chat interface. Try these queries:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">⏰ Time Queries:</h3>
              <ul className="text-sm space-y-1 text-purple-100">
                <li>• &quot;What time is it?&quot;</li>
                <li>• &quot;Show me the current time&quot;</li>
                <li>• &quot;What&apos;s today&apos;s date?&quot;</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">📰 News Queries:</h3>
              <ul className="text-sm space-y-1 text-purple-100">
                <li>• &quot;Latest news&quot;</li>
                <li>• &quot;What&apos;s happening today?&quot;</li>
                <li>• &quot;News about technology&quot;</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-400">
            <a 
              href="/chat" 
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors inline-block"
            >
              🚀 Try in Main Chat →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}