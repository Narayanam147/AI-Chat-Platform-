import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city');
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!city || !apiKey) {
    return NextResponse.json({ error: 'City or API key missing' }, { status: 400 });
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'Weather not found' }, { status: 404 });
  }
  const data = await res.json();
  return NextResponse.json({
    city: data.name,
    temp: data.main.temp,
    desc: data.weather[0].description,
    icon: data.weather[0].icon,
  });
}
