import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const personalCoachAgent = new RealtimeAgent({
  name: 'Personal Coach',
  voice: 'fable',
  handoffDescription: 'A supportive personal coach for motivation, goal-setting, productivity tips, and personal development.',
  instructions: `# Personal Coach

You are an encouraging personal coach focused on helping people achieve their goals.

## Personality
- Warm and supportive
- Enthusiastic but not overwhelming
- Empathetic listener
- Motivating without being pushy
- Uses positive reinforcement

## Areas of Expertise
1. **Goal Setting** - Help define SMART goals
2. **Productivity** - Time management and focus techniques
3. **Motivation** - Overcome procrastination and self-doubt
4. **Habits** - Build positive routines
5. **Work-Life Balance** - Manage stress and priorities

## Coaching Style
- Ask open-ended questions to understand the person
- Celebrate small wins
- Provide actionable advice, not just platitudes
- Use the user's name when you know it
- Follow up on previous goals

## Example Interactions

**Goal Setting:**
"What's one thing you'd love to accomplish this month? Let's break it down into smaller steps."

**Motivation:**
"I hear you - it's tough when motivation dips. What originally excited you about this goal?"

**Productivity:**
"Have you tried the Pomodoro technique? 25 minutes of focus, then a 5-minute break. Want to try it together?"

## Guidelines
- Never be judgmental
- Acknowledge struggles before offering solutions
- Make the person feel heard
- Keep advice practical and actionable
- End conversations on a positive, forward-looking note
`,
  tools: [
    tool({
      name: 'set_goal',
      description: 'Help the user set and track a goal',
      parameters: {
        type: 'object',
        properties: {
          goal: { type: 'string', description: 'The goal description' },
          deadline: { type: 'string', description: 'Target completion date' },
          category: { type: 'string', description: 'Category: health, career, learning, personal, finance' }
        },
        required: ['goal'],
        additionalProperties: false
      },
      execute: async (input: any) => {
        return {
          success: true,
          goal_id: 'GOAL-' + Date.now(),
          goal: input.goal,
          deadline: input.deadline || 'Not set',
          category: input.category || 'personal',
          message: `Great! I've noted your goal: "${input.goal}". Let's make it happen!`
        };
      }
    }),
    tool({
      name: 'get_motivation_quote',
      description: 'Get an inspirational quote for motivation',
      parameters: {
        type: 'object',
        properties: {
          theme: { type: 'string', description: 'Theme: perseverance, success, growth, courage, focus' }
        },
        required: [],
        additionalProperties: false
      },
      execute: async (input: any) => {
        const quotes: Record<string, string[]> = {
          perseverance: [
            "It does not matter how slowly you go as long as you do not stop. - Confucius",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
          ],
          success: [
            "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
            "The only way to do great work is to love what you do. - Steve Jobs"
          ],
          growth: [
            "Be not afraid of growing slowly, be afraid only of standing still. - Chinese Proverb",
            "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson"
          ],
          courage: [
            "Courage is not the absence of fear, but rather the judgment that something else is more important than fear. - Ambrose Redmoon",
            "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face. - Eleanor Roosevelt"
          ],
          focus: [
            "The successful warrior is the average man, with laser-like focus. - Bruce Lee",
            "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus. - Alexander Graham Bell"
          ]
        };
        
        const theme = input.theme || 'success';
        const themeQuotes = quotes[theme] || quotes.success;
        const quote = themeQuotes[Math.floor(Math.random() * themeQuotes.length)];
        
        return { quote, theme };
      }
    }),
    tool({
      name: 'start_focus_session',
      description: 'Start a Pomodoro-style focus session',
      parameters: {
        type: 'object',
        properties: {
          duration: { type: 'number', description: 'Focus duration in minutes (default: 25)' },
          task: { type: 'string', description: 'What to focus on' }
        },
        required: [],
        additionalProperties: false
      },
      execute: async (input: any) => {
        const duration = input.duration || 25;
        return {
          session_started: true,
          duration_minutes: duration,
          task: input.task || 'Deep work',
          message: `Focus session started! ${duration} minutes of focused work on "${input.task || 'your task'}". I believe in you! 💪`
        };
      }
    })
  ],
  handoffs: []
});

export const personalCoachScenario = [personalCoachAgent];

