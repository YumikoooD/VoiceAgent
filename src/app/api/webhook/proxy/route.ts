import { NextRequest, NextResponse } from 'next/server';

// Proxy route to call external webhooks for custom tools
export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, method = 'POST', headers: customHeaders, params } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'No webhook URL provided' },
        { status: 400 }
      );
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'VoiceAgent-Webhook/1.0',
      ...customHeaders,
    };

    // Make the request
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    // Add body for non-GET requests
    if (method.toUpperCase() !== 'GET' && params) {
      fetchOptions.body = JSON.stringify(params);
    }

    // For GET requests, append params as query string
    if (method.toUpperCase() === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    console.log(`[Webhook Proxy] Calling ${method.toUpperCase()} ${url.toString()}`);

    const response = await fetch(url.toString(), fetchOptions);
    
    // Try to parse as JSON, fall back to text
    let result;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { response: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: result.error || result.message || `Webhook returned status ${response.status}`,
          status: response.status,
          response: result
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      data: result,
    });
  } catch (error) {
    console.error('Webhook proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook call failed' },
      { status: 500 }
    );
  }
}

