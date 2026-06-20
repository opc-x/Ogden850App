import {
  MAX_SPEC_ELEMENTS,
  SPEC_EXAMPLE_BULB,
  type WordSvgSpec,
} from '../../src/lib/wordSvgSpec';

export interface WordSvgSpecPromptInput {
  word: string;
  translation: string;
  category: string;
  repairIssues?: string[];
}

export function buildWordSvgSpecPrompt(input: WordSvgSpecPromptInput): string {
  const repair = input.repairIssues?.length
    ? `\nFAILED CHECKS:\n${input.repairIssues.map((i) => `- ${i}`).join('\n')}`
    : '';

  return `Design a vocabulary icon as JSON shape spec (NOT raw SVG).

Word: ${input.word} (${input.translation})
Category: ${input.category}

RULES:
- Maximum ${MAX_SPEC_ELEMENTS} elements in "elements" array
- ONE clear object — readable at 68×54px thumbnail
- NO faces/eyes unless word is a feeling
- NO dashed strokes, NO text, NO gradients
- Colors: fill/stroke use only: main | accent | warm | soft | faint | none
- Animation on at most 1 element: cv-pulse | cv-bob | cv-flow
- Coordinates 0–100 viewBox

GOOD example for "bulb" (电灯泡):
${JSON.stringify(SPEC_EXAMPLE_BULB, null, 2)}

Return JSON: { "spec": { "elements": [...] }, "rationale": "..." }${repair}`;
}
