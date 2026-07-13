// ─── Transport Agent ──────────────────────────────────────────────────────────
// AI Agent Layer: Uses Groq LLM to generate natural-language route explanations.
// Falls back to template-based explanations if Groq is unavailable.

import axios from 'axios';
import { JourneyPlan, PlanRequest } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a natural-language explanation of the journey options.
 * Example: "There is no direct train from Hyderabad to Gokarna on 25 July.
 * Best option: 1. Train Hyderabad -> Hubballi 2. Bus Hubballi -> Gokarna.
 * Total duration: 11h 20m. Book through MakeMyTrip."
 */
export async function generateRouteExplanation(
  request: PlanRequest,
  directOptions: JourneyPlan[],
  alternativeJourneys: JourneyPlan[],
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return buildTemplateExplanation(request, directOptions, alternativeJourneys);
  }

  try {
    const hasDirect = directOptions.length > 0;
    const hasAlternatives = alternativeJourneys.length > 0;

    const journeyDescriptions = [
      ...directOptions.map((j, i) => formatJourneyForAI(j, i + 1, true)),
      ...alternativeJourneys.map((j, i) => formatJourneyForAI(j, i + 1, false)),
    ].join('\n');

    const systemPrompt = `You are TripSage's Transport Agent. Your job is to explain transport routes clearly and concisely.
Given a travel request and available journey options, write a 2-4 sentence explanation.
- If no direct transport exists, say so and recommend the best alternative.
- Mention the route steps (e.g., "Train Hyderabad -> Hubballi, then Bus Hubballi -> Gokarna").
- Include total duration and approximate cost.
- End with "Book through MakeMyTrip."
- Be factual. Never invent routes or prices not in the data.`;

    const userPrompt = `Travel request: ${request.origin} to ${request.destination} on ${request.date}, ${request.passengers || 1} passenger(s).

Available journeys:
${journeyDescriptions || 'No journeys found.'}

Write a clear explanation for the user.`;

    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const content = response.data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Groq returned an empty response.');
    return content;
  } catch (err: any) {
    console.warn('[TransportAgent] Groq API failed, using template:', err.message);
    return buildTemplateExplanation(request, directOptions, alternativeJourneys);
  }
}

/**
 * Format a journey plan for the AI prompt.
 */
function formatJourneyForAI(journey: JourneyPlan, index: number, isDirect: boolean): string {
  const steps = journey.legs.map((leg, i) => {
    const modeLabel = leg.mode === 'train' ? 'Train' : leg.mode === 'bus' ? 'Bus' : leg.mode === 'taxi' ? 'Taxi' : leg.mode;
    return `${i + 1}. ${modeLabel} ${leg.origin} -> ${leg.destination} (${leg.duration}, Rs.${leg.price})`;
  }).join('\n');

  return `Option ${index} (${isDirect ? 'Direct' : 'Alternative'}):
${steps}
Total: ${journey.totalDurationLabel}, Rs.${journey.totalCost}, ${journey.transfers} transfer(s)`;
}

/**
 * Template-based fallback explanation when Groq is unavailable.
 */
function buildTemplateExplanation(
  request: PlanRequest,
  directOptions: JourneyPlan[],
  alternativeJourneys: JourneyPlan[],
): string {
  const origin = request.origin.split(',')[0].trim();
  const destination = request.destination.split(',')[0].trim();
  const date = request.date;
  const hasDirect = directOptions.length > 0;
  const allJourneys = [...directOptions, ...alternativeJourneys];

  if (allJourneys.length === 0) {
    return `No transport options found from ${origin} to ${destination} on ${date}. Try searching for nearby cities or alternative dates. Book through MakeMyTrip.`;
  }

  const best = allJourneys[0];

  if (hasDirect) {
    const steps = best.legs.map((leg, i) => {
      const modeLabel = leg.mode.charAt(0).toUpperCase() + leg.mode.slice(1);
      return `${i + 1}. ${modeLabel} ${leg.origin} -> ${leg.destination} (${leg.duration})`;
    }).join('\n');
    return `Direct transport available from ${origin} to ${destination} on ${date}.\n\n${steps}\n\nTotal: ${best.totalDurationLabel}, approx Rs.${best.totalCost}. Book through MakeMyTrip.`;
  }

  // No direct — explain alternative
  const steps = best.legs.map((leg, i) => {
    const modeLabel = leg.mode.charAt(0).toUpperCase() + leg.mode.slice(1);
    return `${i + 1}. ${modeLabel} ${leg.origin} -> ${leg.destination} (${leg.duration})`;
  }).join('\n');

  return `There is no direct train or bus from ${origin} to ${destination} on ${date}. Best option:\n\n${steps}\n\nTotal duration: ${best.totalDurationLabel}, approx Rs.${best.totalCost}. Book through MakeMyTrip.`;
}
