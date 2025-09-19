import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const trackEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties = {} } = trackEventSchema.parse(body);

    // Log the event
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Client event tracked',
        event,
        properties,
        userAgent: request.headers.get('user-agent'),
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 400 }
    );
  }
}
