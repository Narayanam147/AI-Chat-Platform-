import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '::1';
    
    // For localhost/development, use a sample IP from India
    const testIP = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') ? '49.36.83.154' : ip;
    
    // Get timezone info from IP
    const response = await fetch(`http://ip-api.com/json/${testIP}?fields=status,timezone,country,countryCode,region,city,lat,lon`);
    const geoData = await response.json();
    
    // Always prioritize IST first, then user's timezone if different
    const istTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: true
    });

    const utcTime = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: true
    });

    // Common timezone times
    const commonTimezones = {
      'IST (India)': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'long', hour12: true }),
      'UTC': new Date().toLocaleString('en-US', { timeZone: 'UTC', timeStyle: 'long', hour12: true }),
      'EST (US East)': new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeStyle: 'long', hour12: true }),
      'PST (US West)': new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeStyle: 'long', hour12: true }),
      'GMT (London)': new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', timeStyle: 'long', hour12: true }),
      'JST (Japan)': new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo', timeStyle: 'long', hour12: true }),
      'CST (China)': new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai', timeStyle: 'long', hour12: true }),
    };

    let userTime = istTime;
    let userTimezone = 'Asia/Kolkata';
    let userLocation = { country: 'India', region: 'Unknown', city: 'Unknown' };

    if (geoData.status === 'success' && geoData.timezone && geoData.timezone !== 'Asia/Kolkata') {
      // Get current time in user's timezone if different from IST
      userTime = new Date().toLocaleString('en-IN', {
        timeZone: geoData.timezone,
        dateStyle: 'full',
        timeStyle: 'long',
        hour12: true
      });
      userTimezone = geoData.timezone;
      userLocation = {
        country: geoData.country,
        region: geoData.region,
        city: geoData.city
      };
    }

    return NextResponse.json({
      success: true,
      primary: {
        time: istTime,
        timezone: 'Asia/Kolkata',
        location: 'India (IST - Indian Standard Time)',
        utcOffset: '+05:30'
      },
      user: userTimezone !== 'Asia/Kolkata' ? {
        time: userTime,
        timezone: userTimezone,
        location: userLocation,
      } : null,
      timezones: commonTimezones,
      utc: {
        time: utcTime,
        timezone: 'UTC',
        offset: '+00:00'
      },
      resources: {
        timeGov: 'https://www.time.gov/',
        timeIs: 'https://time.is/',
        worldClock: 'https://www.timeanddate.com/worldclock/',
        timeZoneConverter: 'https://everytimezone.com/',
        globalTimes: 'https://24timezones.com/'
      },
      ip: testIP
    });
  } catch (error) {
    console.error('Timezone API error:', error);
    
    // Emergency fallback to IST
    const fallbackTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: true
    });

    const commonTimezones = {
      'IST (India)': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'long', hour12: true }),
      'UTC': new Date().toLocaleString('en-US', { timeZone: 'UTC', timeStyle: 'long', hour12: true }),
      'EST (US East)': new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeStyle: 'long', hour12: true }),
      'PST (US West)': new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeStyle: 'long', hour12: true }),
    };
    
    return NextResponse.json({
      success: true,
      primary: {
        time: fallbackTime,
        timezone: 'Asia/Kolkata',
        location: 'India (IST - Indian Standard Time)',
        utcOffset: '+05:30'
      },
      timezones: commonTimezones,
      resources: {
        timeGov: 'https://www.time.gov/',
        timeIs: 'https://time.is/',
        worldClock: 'https://www.timeanddate.com/worldclock/',
        timeZoneConverter: 'https://everytimezone.com/',
        globalTimes: 'https://24timezones.com/'
      },
      fallback: true
    });
  }
}