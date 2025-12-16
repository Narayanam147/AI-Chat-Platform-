import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Feedback {
  id?: string;
  feedback: string;
  user_email: string;
  timestamp?: string;
  status?: string;
  created_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { feedback, userEmail, timestamp } = body;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: "Feedback text is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        feedback: feedback.trim(),
        user_email: userEmail || session.user.email,
        timestamp: timestamp || new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error("❌ Feedback save error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    console.log("✅ Feedback saved to database:", data.id);

    return NextResponse.json(
      { 
        success: true, 
        message: "Feedback submitted successfully",
        id: data.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET endpoint for admins to retrieve feedback (optional)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error("❌ Feedback retrieval error:", error);
      return NextResponse.json(
        { error: "Failed to retrieve feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedbacks }, { status: 200 });

  } catch (error) {
    console.error("❌ Feedback retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback" },
      { status: 500 }
    );
  }
}
