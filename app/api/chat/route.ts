import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId, personalization } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let searchContext = '';
    const lowerPrompt = prompt.toLowerCase();
    const isNewsQuery = lowerPrompt.includes('news') || lowerPrompt.includes('headlines') || lowerPrompt.includes('today') || lowerPrompt.includes('latest') || lowerPrompt.includes('current events');

    // For news queries, try NewsAPI first (free tier: 100 requests/day)
    if (isNewsQuery && process.env.NEWS_API_KEY) {
      try {
        const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
        console.log('📰 Fetching top headlines...');
        const newsResponse = await fetch(newsUrl);
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.articles && newsData.articles.length > 0) {
            searchContext = '\n\n[TODAY\'S TOP NEWS HEADLINES - December 16, 2025:]\n' + 
              newsData.articles.slice(0, 10).map((article: any, index: number) => 
                `${index + 1}. **${article.title}**\n${article.description || ''}\nSource: ${article.source?.name} - ${article.url}`
              ).join('\n\n');
            console.log('✅ News headlines added:', newsData.articles.length);
          }
        } else {
          console.error('❌ News API error:', await newsResponse.text());
        }
      } catch (newsError) {
        console.error('❌ News fetch error:', newsError);
      }
    }
    
    // Fallback to Google Custom Search for other queries
    if (!searchContext && process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(prompt)}&num=5`;
        console.log('🔍 Searching for:', prompt);
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('🔍 Search results count:', searchData.items?.length || 0);
          if (searchData.items && searchData.items.length > 0) {
            searchContext = '\n\n[LIVE WEB SEARCH RESULTS - Use this information to answer:]\n' + 
              searchData.items.map((item: any, index: number) => 
                `${index + 1}. **${item.title}**\n${item.snippet}\nSource: ${item.link}`
              ).join('\n\n');
            console.log('✅ Search context added');
          }
        } else {
          const errorText = await searchResponse.text();
          console.error('❌ Search API error:', errorText);
        }
      } catch (searchError) {
        console.error('❌ Search error:', searchError);
      }
    }

    // Call Groq API
    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const enhancedPrompt = prompt + searchContext;

    // Build system prompt with personalization if enabled
    let systemPrompt = 'You are a helpful AI assistant with access to real-time web search. When web search results are provided, USE them to give accurate, up-to-date information. Always cite sources when using search results. Provide clear, accurate, and helpful responses.';
    
    if (personalization?.enabled) {
      const personalizationContext = [];
      
      if (personalization.topics?.length > 0) {
        personalizationContext.push(`The user has shown interest in these topics: ${personalization.topics.slice(0, 10).join(', ')}.`);
      }
      
      if (personalization.interactionCount > 0) {
        if (personalization.interactionCount > 50) {
          personalizationContext.push('This is an experienced user who has had many conversations with you. Be more concise and technical when appropriate.');
        } else if (personalization.interactionCount > 10) {
          personalizationContext.push('This user has had several conversations with you. Feel free to build on previous context.');
        }
      }
      
      if (personalization.recentQueries?.length > 0) {
        personalizationContext.push(`Recent topics discussed: ${personalization.recentQueries.join('; ')}`);
      }
      
      if (personalizationContext.length > 0) {
        systemPrompt += '\n\nUser Context (use to personalize responses):\n' + personalizationContext.join('\n');
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

    // Save to database if userId is provided
    if (userId) {
      try {
        await ChatModel.create({
          user_id: userId,
          messages: [
            { text: prompt, sender: 'user', timestamp: new Date().toISOString() },
            { text: aiResponse, sender: 'ai', timestamp: new Date().toISOString() },
          ],
          title: prompt.substring(0, 50),
        });
        console.log('✅ Chat saved to Supabase');
        
      } catch (dbError) {
        console.error('❌ Supabase save error:', dbError);
        console.log('💡 To enable chat history: Configure Supabase connection');
      }
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
