import { customerSupportScenario } from './demoAgents/customerSupport';
import { personalCoachScenario } from './demoAgents/personalCoach';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  customerSupport: customerSupportScenario,
  personalCoach: personalCoachScenario,
};

export const defaultAgentSetKey = 'personalCoach';
