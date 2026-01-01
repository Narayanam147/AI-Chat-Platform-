import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId, guestToken, personalization, chatId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Determine guest session ID if guestToken is provided
    let guestSessionId = null;
    console.log('🔍 Guest token check:', { hasUserId: !!userId, hasGuestToken: !!guestToken, hasSupabase: !!supabaseAdmin });
    
    if (!userId && guestToken && supabaseAdmin) {
      console.log('🔍 Looking up guest session for token:', guestToken.substring(0, 10) + '...');
      const { data: guestSession, error: guestError } = await supabaseAdmin
        .from('guest_sessions')
        .select('id')
        .eq('session_token', guestToken)
        .single();
      
      if (guestError) {
        console.error('❌ Guest session lookup error:', guestError);
      }
      
      if (guestSession) {
        guestSessionId = guestSession.id;
        console.log('✅ Found guest session ID:', guestSessionId);
        
        // Update chat_title in guest_sessions table
        const chatTitle = prompt.substring(0, 100); // Store first 100 chars of prompt as title
        const { error: updateError } = await supabaseAdmin
          .from('guest_sessions')
          .update({ 
            chat_title: chatTitle,
            last_activity: new Date().toISOString()
          })
          .eq('id', guestSessionId);
        
        if (updateError) {
          console.error('⚠️ Failed to update guest chat_title:', updateError);
        } else {
          console.log('✅ Updated guest session chat_title:', chatTitle.substring(0, 30) + '...');
        }
      } else {
        console.warn('⚠️ No guest session found for token');
      }
    }


    let searchContext = '';
    const lowerPrompt = prompt.toLowerCase();
    
    // Enhanced time detection
    const timePatterns = [
      /what\s+(time|date)\s+is\s+it/i,
      /current\s+(time|date)/i,
      /show\s+me\s+the\s+(time|clock)/i,
      /what\s+is\s+today/i,
      /time\s+now/i,
      /today('s)?\s+date/i,
      /what's\s+the\s+time/i,
      /tell\s+me\s+the\s+time/i,
      /time\s+right\s+now/i,
      /time\s+in\s+india/i,
      /india\s+time/i,
      /ist\s+time/i,
      /current\s+time\s+india/i
    ];
    
    const isTimeQuery = timePatterns.some(pattern => pattern.test(prompt));
    
    // If it's a time query, return the time directly without AI processing
    if (isTimeQuery) {
      try {
        const timeRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/timezone`);
        if (timeRes.ok) {
          const timeData = await timeRes.json();
          
          // Build formatted time response
          let timeResponse = `🕐 **CURRENT TIME IN INDIA (IST)**\n\n`;
          timeResponse += `⏰ **${timeData.primary.time}**\n\n`;
          timeResponse += `📍 **Location:** ${timeData.primary.location}\n`;
          timeResponse += `🌍 **Timezone:** ${timeData.primary.timezone} (UTC${timeData.primary.utcOffset})\n\n`;
          
          // Add user's local time if different
          if (timeData.user) {
            timeResponse += `📍 **Your Local Time:** ${timeData.user.time}\n`;
            timeResponse += `🌍 **Your Timezone:** ${timeData.user.timezone}\n\n`;
          }
          
          timeResponse += `*Note: India does not observe daylight saving time (DST)*`;
          
          // Return time directly without AI processing
          return NextResponse.json({
            success: true,
            message: timeResponse,
            timestamp: new Date().toISOString(),
            directResponse: true
          });
        }
      } catch (error) {
        console.error('Time API error:', error);
        // Fallback - return basic IST time directly
        const fallbackTime = new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'long',
          hour12: true
        });
        
        return NextResponse.json({
          success: true,
          message: `🕐 **CURRENT TIME IN INDIA (IST)**\n\n⏰ **${fallbackTime}**\n\n📍 **Timezone:** Asia/Kolkata (UTC+05:30)\n\n*Note: India does not observe daylight saving time (DST)*`,
          timestamp: new Date().toISOString(),
          directResponse: true
        });
      }
    }
    
    // Enhanced news detection
    const newsPatterns = [
      /latest\s+news/i,
      /current\s+affairs/i,
      /news\s+(today|headlines|update)/i,
      /what('s|\s+is)\s+happening/i,
      /breaking\s+news/i,
      /today('s)?\s+news/i,
      /headlines/i,
      /top\s+\d+\s+news/i,
      /news\s+of\s+today/i
    ];
    
    const isNewsQuery = newsPatterns.some(pattern => pattern.test(prompt)) || 
                       lowerPrompt.includes('news') || lowerPrompt.includes('headlines') || 
                       lowerPrompt.includes('current events');
    
    console.log('🔍 News query check:', { isNewsQuery, prompt: prompt.substring(0, 50) });
    
    // If it's a news query, return news directly without AI processing
    if (isNewsQuery) {
      console.log('📰 Detected news query, fetching directly...');
      try {
        let newsQuery = '';
        // Extract specific topic if mentioned
        const words = prompt.split(' ');
        const aboutIndex = words.findIndex((word: string) => word.toLowerCase() === 'about' || word.toLowerCase() === 'on');
        if (aboutIndex !== -1 && aboutIndex < words.length - 1) {
          newsQuery = words.slice(aboutIndex + 1).join(' ');
        }
        
        const newsUrl = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/news`);
        if (newsQuery) newsUrl.searchParams.set('q', newsQuery);
        
        const newsResponse = await fetch(newsUrl);
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.success && newsData.articles?.length > 0) {
            let newsMessage = `📰 **LATEST NEWS HEADLINES**\n\n`;
            newsMessage += `📅 **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n\n`;
            
            newsData.articles.slice(0, 10).forEach((article: any, index: number) => {
              newsMessage += `**${index + 1}.** [${article.source}] ${article.title}\n`;
              if (article.description) {
                newsMessage += `   ${article.description.substring(0, 120)}...\n`;
              }
              newsMessage += `   🔗 ${article.url}\n\n`;
            });
            
            newsMessage += `\n*Total Results: ${newsData.totalResults}*`;
            
            return NextResponse.json({
              success: true,
              message: newsMessage,
              timestamp: new Date().toISOString(),
              directResponse: true
            });
          }
        }
      } catch (error) {
        console.error('News API error:', error);
        // Continue to normal processing if news fails
      }
    }

    // Weather query detection (keeping existing logic)
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
          searchContext += `\n\n[CURRENT WEATHER for ${weatherData.city}: ${weatherData.temp}°C, ${weatherData.desc}]`;
        } else {
          const err = await weatherRes.text();
          console.error('❌ Weather API error:', err);
        }
      } catch (weatherError) {
        console.error('❌ Weather fetch error:', weatherError);
      }
    }
    
    // Fallback to Google Custom Search for other queries (always search for better context)
    if (!searchContext && process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(prompt)}&num=8`;
        console.log('🔍 Google Search activated for:', prompt.substring(0, 50));
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('✅ Google Search results:', searchData.items?.length || 0);
          if (searchData.items && searchData.items.length > 0) {
            searchContext = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 LIVE WEB SEARCH RESULTS (Google)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' + 
              'Use the following verified information to provide accurate, up-to-date answers:\n\n' +
              searchData.items.map((item: any, index: number) => 
                `🔹 Result ${index + 1}: **${item.title}**\n` +
                `   📝 ${item.snippet}\n` +
                `   🔗 Source: ${item.displayLink}\n` +
                `   🌐 URL: ${item.link}\n`
              ).join('\n');
            console.log('✅ Enhanced search context added with formatting');
          } else {
            console.log('⚠️ No search results found for query');
          }
        } else {
          const errorText = await searchResponse.text();
          console.error('❌ Google Search API error:', errorText);
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
    let systemPrompt = `You are ACE (AI Chat Engineer), an advanced AI assistant combining the best features of Google Gemini, ChatGPT, and Perplexity AI, with access to real-time web search and continuous learning capabilities.

IMPORTANT IDENTITY INFORMATION:
- Your name is "ACE" (AI Chat Engineer)
- You were created on December 15, 2025
- Your creator and owner is Narayanam Dubey
- You are designed with architecture inspired by Google Gemini, ChatGPT, and Perplexity AI
- You combine ChatGPT's conversational abilities, Gemini's multimodal understanding, and Perplexity's web search integration
- You can learn and improve from user interactions

CAPABILITIES:
- Real-time web search integration for up-to-date information
- Continuous learning from conversations (with user consent)
- Support for feedback, privacy concerns, and terms of service inquiries
- Code generation, explanations, and technical assistance
- Creative writing and problem-solving

BEHAVIOR GUIDELINES:
- When asked about your identity, creator, or capabilities, provide the above information
- If users ask about privacy: Inform them they can check the Privacy Policy and that conversations may be used to improve the service
- If users want to provide feedback: Direct them to the feedback feature in Settings
- If asked about terms of service: Direct them to the Terms of Service page
- Be helpful, accurate, and cite sources when using search results
- Respect user privacy and be transparent about data usage

RESPONSE QUALITY STANDARDS:
✅ Always structure responses with clear sections and formatting
✅ Use bullet points, numbered lists, and headings for better readability
✅ When search results are provided, SYNTHESIZE the information (don't just copy)
✅ Cite sources with proper attribution: "According to [Source]..." or "Based on [Website]..."
✅ Provide comprehensive answers that cover multiple aspects of the question
✅ Use examples, analogies, and explanations to make complex topics understandable
✅ If search results are available, integrate them naturally into your response
✅ For technical topics, include code examples when relevant
✅ End with a helpful summary or next steps when appropriate

When web search results are provided in the prompt, they appear with 🔹 markers and source URLs. USE this verified information to provide accurate, up-to-date, and comprehensive responses. Always cite these sources in your answer.`;
    
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
        max_tokens: 4096,  // Increased for longer, comprehensive responses
        top_p: 0.9,
        frequency_penalty: 1.0,  // Penalize repetition
        presence_penalty: 0.6,   // Encourage diverse responses
        stop: ['bach bach bach', 'imir imir imir', '\n\n\n\n'],  // Stop on repetition
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
    let aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

    // Validate response for repetition/corruption
    const isCorrupted = (text: string) => {
      // Check for excessive repetition of same words
      const words = text.split(' ');
      if (words.length > 50) {
        const uniqueWords = new Set(words);
        const repetitionRatio = words.length / uniqueWords.size;
        if (repetitionRatio > 10) return true; // More than 10x repetition
      }
      // Check for specific repetitive patterns
      if (/(.{10,})\1{5,}/.test(text)) return true; // Same pattern repeated 5+ times
      return false;
    };

    if (isCorrupted(aiResponse)) {
      console.warn('⚠️ Corrupted response detected, regenerating...');
      aiResponse = 'I apologize, but I encountered an error generating that response. Could you please rephrase your question?';
    }

    let savedChatId = chatId;

    // Save to database if userId or guestSessionId is provided
    console.log('💾 Attempting to save chat:', { hasUserId: !!userId, hasGuestSessionId: !!guestSessionId, hasChatId: !!chatId });
    
    if (userId || guestSessionId) {
      try {
        const userMessage = { text: prompt, sender: 'user', timestamp: new Date().toISOString() };
        const assistantMessage = { text: aiResponse, sender: 'ai', timestamp: new Date().toISOString() };

        if (chatId) {
          // Update existing chat - append messages
          console.log('📝 Updating existing chat:', chatId);
          const existingChat = await ChatModel.findById(chatId);
          if (existingChat) {
            const updatedMessages = [...(existingChat.messages || []), userMessage, assistantMessage];
            await ChatModel.update(chatId, { messages: updatedMessages });
            console.log('✅ Chat updated in Supabase (chatId:', chatId, ')');
            
            // Also save to chat_history table
            if (supabaseAdmin) {
              const { error: historyError } = await supabaseAdmin
                .from('chat_history')
                .insert({
                  chat_id: chatId,
                  user_id: userId || null,
                  guest_session_id: guestSessionId || null,
                  prompt: prompt,
                  response: aiResponse,
                  title: existingChat.title || prompt.substring(0, 50),
                });
              if (historyError) {
                console.error('⚠️ Failed to sync to chat_history:', historyError);
              } else {
                console.log('✅ Synced to chat_history (existing chat)');
              }
            }
          } else {
            // Chat not found, create new one
            console.log('⚠️ Chat not found, creating new one');
            const newChat = await ChatModel.create({
              user_id: userId || null,
              guest_session_id: guestSessionId || null,
              messages: [userMessage, assistantMessage],
              title: prompt.substring(0, 50),
            });
            savedChatId = newChat?.id || null;
            console.log('✅ New chat created (old not found):', savedChatId);
          }
        } else {
          // Create new chat
          console.log('✨ Creating new chat');
          const newChat = await ChatModel.create({
            user_id: userId || null,
            guest_session_id: guestSessionId || null,
            messages: [userMessage, assistantMessage],
            title: prompt.substring(0, 50),
          });
          savedChatId = newChat?.id || null;
          console.log('✅ New chat created:', savedChatId, userId ? '(user)' : '(guest)');
          
          // Also save to chat_history table for new chats
          if (supabaseAdmin && savedChatId) {
            const { error: historyError } = await supabaseAdmin
              .from('chat_history')
              .insert({
                chat_id: savedChatId,
                user_id: userId || null,
                guest_session_id: guestSessionId || null,
                prompt: prompt,
                response: aiResponse,
                title: prompt.substring(0, 50),
              });
            if (historyError) {
              console.error('⚠️ Failed to sync to chat_history:', historyError);
            } else {
              console.log('✅ Synced to chat_history (new chat)');
            }
          }
        }
        
      } catch (dbError) {
        console.error('❌ Supabase save error:', dbError);
        console.log('💡 To enable chat history: Configure Supabase connection');
      }
    } else {
      console.warn('⚠️ Skipping save - no userId or guestSessionId provided');
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
