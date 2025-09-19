import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple metrics for web server
    const metrics = `# HELP web_http_requests_total Total number of HTTP requests
# TYPE web_http_requests_total counter
web_http_requests_total{method="GET",route="/api/metrics",status_code="200"} 1

# HELP web_server_info Server information
# TYPE web_server_info gauge
web_server_info{version="1.0.0"} 1
`;

    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
