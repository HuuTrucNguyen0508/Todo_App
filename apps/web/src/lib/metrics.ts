// Client-side metrics tracking
let metrics: Record<string, number> = {};

export function incrementCounter(
  name: string,
  labels?: Record<string, string>
) {
  // Only track on client side, send to server
  if (typeof window !== 'undefined') {
    const key = `${name}_${JSON.stringify(labels || {})}`;
    metrics[key] = (metrics[key] || 0) + 1;
  }
}

export function recordHistogram(
  name: string,
  value: number,
  labels?: Record<string, string>
) {
  // Only track on client side, send to server
  if (typeof window !== 'undefined') {
    const key = `${name}_${JSON.stringify(labels || {})}`;
    if (!metrics[key]) metrics[key] = 0;
    metrics[key] += value;
  }
}

export function getMetrics(): string {
  // Return empty string for client side
  return '';
}

export async function trackEvent(
  event: string,
  properties?: Record<string, any>
) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, properties }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
