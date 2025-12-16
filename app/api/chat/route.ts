import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // First, try to get web search results
    let searchContext = '';
    if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(prompt)}&num=3`;
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.items && searchData.items.length > 0) {
            searchContext = '\n\nWeb search results:\n' + 
              searchData.items.map((item: any, index: number) => 
                `${index + 1}. ${item.title}\n${item.snippet}\nSource: ${item.link}`
              ).join('\n\n');
          }
        }
      } catch (searchError) {
        console.error('Search error:', searchError);
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
            content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
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
