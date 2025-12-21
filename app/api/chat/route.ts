import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId, personalization, chatId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }


    let searchContext = '';
    const lowerPrompt = prompt.toLowerCase();
    const isNewsQuery = lowerPrompt.includes('news') || lowerPrompt.includes('headlines') || lowerPrompt.includes('today') || lowerPrompt.includes('latest') || lowerPrompt.includes('current events');

    // Weather query detection
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'humidity', 'rain', 'snow', 'wind'];
    const isWeatherQuery = weatherKeywords.some(word => lowerPrompt.includes(word));
    // Simple city extraction: look for 'in [city]' or 'at [city]'
    let weatherCity = null;
    const cityMatch = lowerPrompt.match(/(?:in|at)\s+([a-zA-Z\s]+)/);
    if (isWeatherQuery && cityMatch && cityMatch[1]) {
      weatherCity = cityMatch[1].trim().replace(/\?$/, '');
    } else if (isWeatherQuery) {
      // fallback: try to extract last word if it looks like a city
      const words = lowerPrompt.split(' ');
      if (words.length > 1) {
        weatherCity = words[words.length - 1].replace(/\?$/, '');
      }
    }

    // For weather queries, call weather API first
    if (isWeatherQuery && weatherCity) {
      try {
        const weatherRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/weather?city=${encodeURIComponent(weatherCity)}`);
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          searchContext = `\n\n[CURRENT WEATHER for ${weatherData.city}: ${weatherData.temp}°C, ${weatherData.desc}]`;
        } else {
          const err = await weatherRes.text();
          console.error('❌ Weather API error:', err);
        }
      } catch (weatherError) {
        console.error('❌ Weather fetch error:', weatherError);
      }
    } else {
      // For news queries, try NewsAPI first (free tier: 100 requests/day)
      if (isNewsQuery && process.env.NEWS_API_KEY) {
        try {
          const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
          console.log('📰 Fetching top headlines...');
          const newsResponse = await fetch(newsUrl);
          
          if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            if (newsData.articles && newsData.articles.length > 0) {
              searchContext = "\n\n[TODAY'S TOP NEWS HEADLINES - December 16, 2025:]\n" + 
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
      
      // Expertise-based adaptation
      if (personalization.expertise && Object.keys(personalization.expertise).length > 0) {
        const topExpertise = Object.entries(personalization.expertise)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 3)
          .map(([area]) => area);
        if (topExpertise.length > 0) {
          personalizationContext.push(`User has expertise/interest in: ${topExpertise.join(', ')}. Adjust technical depth accordingly.`);
        }
      }
      
      // Writing style adaptation
      if (personalization.writingStyle) {
        const styleInstructions: { [key: string]: string } = {
          'concise': 'User prefers brief, to-the-point responses. Be concise.',
          'detailed': 'User enjoys detailed explanations. Feel free to elaborate.',
          'conversational': 'Use a friendly, conversational tone.'
        };
        personalizationContext.push(styleInstructions[personalization.writingStyle] || '');
      }
      
      // Response length preference
      if (personalization.preferredLength) {
        const lengthInstructions: { [key: string]: string } = {
          'short': 'Keep responses brief (2-3 paragraphs max).',
          'medium': 'Use moderate length responses.',
          'detailed': 'Provide comprehensive, detailed responses.'
        };
        personalizationContext.push(lengthInstructions[personalization.preferredLength] || '');
      }
      
      // Conversation patterns
      if (personalization.conversationPatterns?.length > 0) {
        const patternInstructions: { [key: string]: string } = {
          'tutorial_seeker': 'User often asks how-to questions. Provide step-by-step guidance.',
          'explanation_seeker': 'User likes explanations. Break down concepts clearly.',
          'coder': 'User is interested in coding. Include code examples when relevant.',
          'creator': 'User is creative. Be innovative in suggestions.',
        };
        const relevantPatterns = personalization.conversationPatterns
          .filter((p: string) => patternInstructions[p])
          .map((p: string) => patternInstructions[p]);
        if (relevantPatterns.length > 0) {
          personalizationContext.push(relevantPatterns.join(' '));
        }
      }
      
      // Topics of interest
      if (personalization.topics?.length > 0) {
        personalizationContext.push(`User has shown interest in: ${personalization.topics.slice(0, 10).join(', ')}.`);
      }
      
      // Experience level
      if (personalization.interactionCount > 0) {
        if (personalization.interactionCount > 100) {
          personalizationContext.push('Power user with extensive chat history. Be efficient and skip basic explanations unless asked.');
        } else if (personalization.interactionCount > 50) {
          personalizationContext.push('Experienced user. Can handle more advanced concepts.');
        } else if (personalization.interactionCount > 10) {
          personalizationContext.push('Regular user. Build on established rapport.');
        }
      }
      
      // Recent context for continuity
      if (personalization.recentQueries?.length > 0) {
        personalizationContext.push(`Recent topics discussed: ${personalization.recentQueries.slice(0, 3).join('; ')}`);
      }
      
      // Current chat context for better continuity
      if (personalization.currentChatContext?.length > 0) {
        const contextSummary = personalization.currentChatContext
          .map((m: any) => `${m.role}: ${m.content}`)
          .join('\n');
        personalizationContext.push(`\nRecent conversation context:\n${contextSummary}`);
      }
      
      if (personalizationContext.length > 0) {
        systemPrompt += '\n\n📊 USER PROFILE (Adaptive Learning - use to personalize responses):\n' + personalizationContext.join('\n');
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

    let savedChatId = chatId;

    // Save to database for all users (logged in or guest)
    try {
      // Use email for logged-in users, or generate guest ID from request
      const guestId = request.headers.get('x-guest-id') || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const effectiveUserId = userId || guestId;
      
      // Create a new chat entry with messages array for each prompt/response pair
      const newChat = await ChatModel.create({
        user_id: effectiveUserId,
        messages: [
          { text: prompt, sender: 'user', timestamp: new Date().toISOString() },
          { text: aiResponse, sender: 'ai', timestamp: new Date().toISOString() }
        ],
        title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      });
      savedChatId = newChat?.id || null;
      console.log('✅ Chat history saved:', savedChatId, 'for user:', effectiveUserId);
        
    } catch (dbError) {
      console.error('❌ Supabase save error:', dbError);
      console.log('💡 To enable chat history: Configure Supabase connection');
    }

    return NextResponse.json({ response: aiResponse, chatId: savedChatId });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
