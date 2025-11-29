import { NextRequest, NextResponse } from 'next/server';

// Proxy route to call Google Calendar API securely
export async function POST(request: NextRequest) {
  try {
    const { action, accessToken, params } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'list_events': {
        const limit = params?.limit || 10;
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ahead
        
        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        url.searchParams.set('maxResults', String(limit));
        url.searchParams.set('timeMin', timeMin);
        url.searchParams.set('timeMax', timeMax);
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');

        const response = await fetch(url.toString(), { headers });
        const data = await response.json();

        if (data.error) {
          return NextResponse.json(
            { error: data.error.message },
            { status: data.error.code }
          );
        }

        const events = (data.items || []).map((event: any) => ({
          id: event.id,
          summary: event.summary || '(No title)',
          description: event.description || '',
          location: event.location || '',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          status: event.status,
          htmlLink: event.htmlLink,
          attendees: event.attendees?.map((a: any) => ({
            email: a.email,
            responseStatus: a.responseStatus,
          })) || [],
        }));

        result = { events, count: events.length };
        break;
      }

      case 'create_event': {
        const { summary, description, location, startTime, endTime, attendees } = params;

        if (!summary || !startTime || !endTime) {
          return NextResponse.json(
            { error: 'Missing required fields: summary, startTime, endTime' },
            { status: 400 }
          );
        }

        const eventBody: any = {
          summary,
          description: description || '',
          location: location || '',
          start: {
            dateTime: startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        if (attendees && Array.isArray(attendees)) {
          eventBody.attendees = attendees.map((email: string) => ({ email }));
        }

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers,
            body: JSON.stringify(eventBody),
          }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json(
            { error: data.error.message },
            { status: data.error.code }
          );
        }

        result = {
          success: true,
          eventId: data.id,
          htmlLink: data.htmlLink,
          message: `Event "${summary}" created successfully`,
          start: data.start?.dateTime || data.start?.date,
          end: data.end?.dateTime || data.end?.date,
        };
        break;
      }

      case 'get_event': {
        const { eventId } = params;

        if (!eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId' },
            { status: 400 }
          );
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          { headers }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json(
            { error: data.error.message },
            { status: data.error.code }
          );
        }

        result = {
          id: data.id,
          summary: data.summary || '(No title)',
          description: data.description || '',
          location: data.location || '',
          start: data.start?.dateTime || data.start?.date,
          end: data.end?.dateTime || data.end?.date,
          status: data.status,
          htmlLink: data.htmlLink,
          attendees: data.attendees?.map((a: any) => ({
            email: a.email,
            responseStatus: a.responseStatus,
          })) || [],
        };
        break;
      }

      case 'delete_event': {
        const { eventId } = params;

        if (!eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId' },
            { status: 400 }
          );
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          { method: 'DELETE', headers }
        );

        if (!response.ok && response.status !== 204) {
          const data = await response.json();
          return NextResponse.json(
            { error: data.error?.message || 'Failed to delete event' },
            { status: response.status }
          );
        }

        result = {
          success: true,
          message: `Event ${eventId} deleted successfully`,
        };
        break;
      }

      case 'update_event': {
        const { eventId, summary, description, location, startTime, endTime } = params;

        if (!eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId' },
            { status: 400 }
          );
        }

        // First get the existing event
        const getResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          { headers }
        );
        const existingEvent = await getResponse.json();

        if (existingEvent.error) {
          return NextResponse.json(
            { error: existingEvent.error.message },
            { status: existingEvent.error.code }
          );
        }

        // Update only provided fields
        const eventBody: any = {
          ...existingEvent,
          summary: summary || existingEvent.summary,
          description: description !== undefined ? description : existingEvent.description,
          location: location !== undefined ? location : existingEvent.location,
        };

        if (startTime) {
          eventBody.start = {
            dateTime: startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
        }

        if (endTime) {
          eventBody.end = {
            dateTime: endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify(eventBody),
          }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json(
            { error: data.error.message },
            { status: data.error.code }
          );
        }

        result = {
          success: true,
          eventId: data.id,
          message: `Event "${data.summary}" updated successfully`,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Calendar proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calendar API error' },
      { status: 500 }
    );
  }
}

