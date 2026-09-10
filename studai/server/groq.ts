import Groq from 'groq-sdk';

/**
 * Server-side model configuration constant.
 * Allows easy override via GROQ_MODEL environment variable, defaulting to openai/gpt-oss-120b.
 */
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

let groqClient: Groq | null = null;

/**
 * Returns a lazily initialized Groq client instance if GROQ_API_KEY is available.
 */
export function getGroqClient(): Groq | null {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    groqClient = new Groq({ apiKey: apiKey.trim() });
    return groqClient;
  } catch (err) {
    console.warn('Failed to initialize Groq client:', err);
    return null;
  }
}

/**
 * Check if the Groq provider is configured with an API key.
 */
export function isGroqConfigured(): boolean {
  const key = process.env.GROQ_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Utility to parse and clean JSON output returned by LLMs.
 * Safely strips markdown code fences or preamble if present.
 */
export function extractAndParseJSON<T>(raw: string): T | null {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue to fallback cleaners
  }

  // 2. Extract content from markdown code fences (```json ... ``` or ``` ...)
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // Continue to next heuristic
    }
  }

  // 3. Extract from first { to last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate) as T;
    } catch {
      // Continue to next heuristic
    }
  }

  return null;
}

/**
 * Executes a structured JSON chat completion with Groq.
 * Configured with response_format: { type: 'json_object' }.
 * Gracefully returns null on error or malformed response so the caller falls back.
 */
export async function generateGroqJSON<T>(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
}): Promise<T | null> {
  const client = getGroqClient();
  if (!client) {
    return null;
  }

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `${params.systemInstruction}\n\nIMPORTANT: You must output strictly valid JSON matching the requested schema.`,
        },
        {
          role: 'user',
          content: params.userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: params.temperature ?? 0.2,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('Groq returned empty response content');
      return null;
    }

    const parsed = extractAndParseJSON<T>(content);
    if (!parsed) {
      console.warn('Groq response could not be parsed into valid JSON:', content.slice(0, 200));
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Groq API completion error:', error);
    return null;
  }
}
