import { RealtimeAgent, tool } from '@openai/agents/realtime';

// Tier 1 Support Agent
const tier1SupportAgent = new RealtimeAgent({
  name: 'Support Agent',
  voice: 'alloy',
  handoffDescription: 'First-line customer support for general inquiries, account questions, and basic troubleshooting.',
  instructions: `# Customer Support Agent (Tier 1)

You are a friendly first-line support agent for a tech company.

## Personality
- Warm and empathetic
- Patient with frustrated customers
- Solution-oriented
- Professional but personable

## Your Responsibilities
1. Greet customers warmly
2. Listen to their issues carefully
3. Handle common questions and basic troubleshooting
4. Look up account information when needed
5. Escalate complex issues to the specialist

## When to Escalate
Transfer to the Technical Specialist when:
- The issue requires technical debugging
- You cannot resolve the issue with basic steps
- The customer requests a specialist
- The issue involves billing disputes or refunds

## Example Responses
- "Hi! Thanks for reaching out. How can I help you today?"
- "I understand that's frustrating. Let me look into this for you."
- "I'll connect you with our technical specialist who can help with this."
`,
  tools: [
    tool({
      name: 'lookup_account',
      description: 'Look up customer account information by email or account ID',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Customer email address' },
          account_id: { type: 'string', description: 'Customer account ID' }
        },
        required: [],
        additionalProperties: false
      },
      execute: async (input: any) => {
        // Simulated account lookup
        return {
          account_id: input.account_id || 'ACC-12345',
          name: 'Demo Customer',
          email: input.email || 'customer@example.com',
          plan: 'Premium',
          status: 'Active',
          created: '2024-01-15'
        };
      }
    }),
    tool({
      name: 'check_service_status',
      description: 'Check if there are any ongoing service issues or outages',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      },
      execute: async () => {
        return {
          status: 'operational',
          message: 'All systems are running normally.',
          last_incident: '2024-10-15'
        };
      }
    })
  ],
  handoffs: [] // Will be set below
});

// Technical Specialist Agent
const technicalSpecialistAgent = new RealtimeAgent({
  name: 'Technical Specialist',
  voice: 'onyx',
  handoffDescription: 'Advanced technical support for complex issues, debugging, and escalated problems.',
  instructions: `# Technical Specialist

You are a senior technical specialist handling escalated support issues.

## Personality
- Highly knowledgeable
- Methodical and thorough
- Calm under pressure
- Clear in explanations

## Your Responsibilities
1. Handle complex technical issues
2. Debug problems systematically
3. Process refunds and billing adjustments
4. Provide detailed technical explanations
5. Document solutions for future reference

## Approach
1. Review the issue context from the previous agent
2. Ask clarifying technical questions
3. Walk through debugging steps
4. Provide a clear resolution or next steps
5. Offer to transfer back to support for follow-up

## Example Responses
- "I've reviewed your case. Let's dig into the technical details."
- "Can you tell me exactly what error message you're seeing?"
- "I've processed a refund of $X to your account."
`,
  tools: [
    tool({
      name: 'run_diagnostics',
      description: 'Run diagnostic tests on the customer account or service',
      parameters: {
        type: 'object',
        properties: {
          account_id: { type: 'string', description: 'Customer account ID' },
          test_type: { type: 'string', description: 'Type of diagnostic: connectivity, performance, security' }
        },
        required: ['account_id'],
        additionalProperties: false
      },
      execute: async (input: any) => {
        return {
          account_id: input.account_id,
          test_type: input.test_type || 'full',
          results: {
            connectivity: 'OK',
            performance: 'OK',
            security: 'OK',
            last_login: '2024-11-28',
            api_calls_today: 142
          },
          recommendation: 'No issues detected. Account is functioning normally.'
        };
      }
    }),
    tool({
      name: 'process_refund',
      description: 'Process a refund for the customer',
      parameters: {
        type: 'object',
        properties: {
          account_id: { type: 'string', description: 'Customer account ID' },
          amount: { type: 'number', description: 'Refund amount in dollars' },
          reason: { type: 'string', description: 'Reason for refund' }
        },
        required: ['account_id', 'amount', 'reason'],
        additionalProperties: false
      },
      execute: async (input: any) => {
        return {
          success: true,
          refund_id: 'REF-' + Math.random().toString(36).substring(7).toUpperCase(),
          amount: input.amount,
          message: `Refund of $${input.amount} has been processed. It will appear in 3-5 business days.`
        };
      }
    })
  ],
  handoffs: [] // Will be set below
});

// Set up handoffs
(tier1SupportAgent.handoffs as any).push(technicalSpecialistAgent);
(technicalSpecialistAgent.handoffs as any).push(tier1SupportAgent);

export const customerSupportScenario = [tier1SupportAgent, technicalSpecialistAgent];

