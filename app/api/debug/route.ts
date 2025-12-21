import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;

    console.log('🔍 DEBUG ENDPOINT - User:', userId);

    // Check ALL possible table names
    const tableNames = ['chat_history', 'chats', 'conversations', 'messages'];
    const tableResults: any = {};

    for (const tableName of tableNames) {
      try {
        // Try to get count and sample data
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        const { data: sampleData } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);

        tableResults[tableName] = {
          exists: true,
          totalRecords: count || 0,
          sampleData: sampleData || [],
          columns: sampleData?.[0] ? Object.keys(sampleData[0]) : []
        };
      } catch (error: any) {
        tableResults[tableName] = {
          exists: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({
      success: true,
      currentUser: userId,
      tables: tableResults,
      message: 'Check which table has your data!'
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) }, 
      { status: 500 }
    );
  }
}
