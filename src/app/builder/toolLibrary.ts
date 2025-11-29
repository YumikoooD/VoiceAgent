import { ToolConfig } from './types';

export const GMAIL_TOOLS: ToolConfig[] = [
  {
    id: 'gmail_list_unread',
    name: 'gmail_list_unread',
    description: 'List the latest unread emails from the user\'s inbox. Returns sender, subject, and snippet.',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'The maximum number of emails to retrieve (default: 5)',
        required: false
      }
    ]
  },
  {
    id: 'gmail_read_email',
    name: 'gmail_read_email',
    description: 'Read the full content of a specific email by its ID.',
    parameters: [
      {
        name: 'email_id',
        type: 'string',
        description: 'The unique ID of the email to read',
        required: true
      }
    ]
  },
  {
    id: 'gmail_send_email',
    name: 'gmail_send_email',
    description: 'Send a new email to a recipient.',
    parameters: [
      {
        name: 'to',
        type: 'string',
        description: 'The email address of the recipient',
        required: true
      },
      {
        name: 'subject',
        type: 'string',
        description: 'The subject line of the email',
        required: true
      },
      {
        name: 'body',
        type: 'string',
        description: 'The body content of the email',
        required: true
      }
    ]
  },
  {
    id: 'gmail_delete_email',
    name: 'gmail_delete_email',
    description: 'Move an email to the trash.',
    parameters: [
      {
        name: 'email_id',
        type: 'string',
        description: 'The unique ID of the email to delete',
        required: true
      }
    ]
  },
  {
    id: 'gmail_create_draft',
    name: 'gmail_create_draft',
    description: 'Create a draft email without sending it.',
    parameters: [
      {
        name: 'to',
        type: 'string',
        description: 'The email address of the recipient',
        required: false
      },
      {
        name: 'subject',
        type: 'string',
        description: 'The subject line of the email',
        required: false
      },
      {
        name: 'body',
        type: 'string',
        description: 'The body content of the email',
        required: true
      }
    ]
  }
];

export const CALENDAR_TOOLS: ToolConfig[] = [
  {
    id: 'calendar_list_events',
    name: 'calendar_list_events',
    description: 'List upcoming calendar events from the user\'s Google Calendar. Returns event title, time, location, and attendees.',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of events to fetch (default: 10)',
        required: false
      }
    ]
  },
  {
    id: 'calendar_create_event',
    name: 'calendar_create_event',
    description: 'Schedule a new event on the user\'s Google Calendar.',
    parameters: [
      {
        name: 'summary',
        type: 'string',
        description: 'Title of the event',
        required: true
      },
      {
        name: 'startTime',
        type: 'string',
        description: 'Start time in ISO format (e.g., 2025-12-01T14:00:00)',
        required: true
      },
      {
        name: 'endTime',
        type: 'string',
        description: 'End time in ISO format (e.g., 2025-12-01T15:00:00)',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description or notes for the event',
        required: false
      },
      {
        name: 'location',
        type: 'string',
        description: 'Location of the event',
        required: false
      }
    ]
  },
  {
    id: 'calendar_delete_event',
    name: 'calendar_delete_event',
    description: 'Delete an event from the calendar by its ID.',
    parameters: [
      {
        name: 'eventId',
        type: 'string',
        description: 'The unique ID of the event to delete',
        required: true
      }
    ]
  },
  {
    id: 'calendar_update_event',
    name: 'calendar_update_event',
    description: 'Update an existing calendar event.',
    parameters: [
      {
        name: 'eventId',
        type: 'string',
        description: 'The unique ID of the event to update',
        required: true
      },
      {
        name: 'summary',
        type: 'string',
        description: 'New title for the event',
        required: false
      },
      {
        name: 'startTime',
        type: 'string',
        description: 'New start time in ISO format',
        required: false
      },
      {
        name: 'endTime',
        type: 'string',
        description: 'New end time in ISO format',
        required: false
      },
      {
        name: 'description',
        type: 'string',
        description: 'New description for the event',
        required: false
      },
      {
        name: 'location',
        type: 'string',
        description: 'New location for the event',
        required: false
      }
    ]
  }
];

export interface ToolLibrary {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools: ToolConfig[];
}

// Example webhook tool templates
export const WEBHOOK_TOOLS: ToolConfig[] = [
  {
    id: 'webhook_get_data',
    name: 'webhook_get_data',
    description: 'Fetch data from an external API endpoint.',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query or identifier',
        required: false
      }
    ],
    webhookUrl: '', // User needs to configure this
    webhookMethod: 'GET'
  },
  {
    id: 'webhook_post_data',
    name: 'webhook_post_data',
    description: 'Send data to an external API endpoint.',
    parameters: [
      {
        name: 'data',
        type: 'object',
        description: 'Data to send to the webhook',
        required: true
      }
    ],
    webhookUrl: '', // User needs to configure this
    webhookMethod: 'POST'
  }
];

export const TOOL_LIBRARIES: ToolLibrary[] = [
  {
    id: 'gmail',
    name: 'Gmail Integration',
    description: 'Read, send, and manage emails via Gmail',
    icon: '✉️',
    tools: GMAIL_TOOLS
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Manage events and check availability',
    icon: '📅',
    tools: CALENDAR_TOOLS
  },
  {
    id: 'webhook',
    name: 'Webhook Tools',
    description: 'Connect to external APIs via webhooks',
    icon: '🔗',
    tools: WEBHOOK_TOOLS
  }
];

