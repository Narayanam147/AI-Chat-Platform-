import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

// Basic in-memory rate limiting to prevent brute force
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fix Long Password DoS: bcrypt becomes exponentially slower with longer inputs
    if (password.length > 64) {
      return NextResponse.json(
        { error: 'Password must be less than 64 characters' },
        { status: 400 }
      );
    }

    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userRate = rateLimit.get(ip) || { count: 0, lastReset: now };

    if (now - userRate.lastReset > RATE_LIMIT_WINDOW_MS) {
      userRate.count = 1;
      userRate.lastReset = now;
    } else {
      userRate.count += 1;
    }
    rateLimit.set(ip, userRate);

    if (userRate.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      provider: 'credentials',
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
