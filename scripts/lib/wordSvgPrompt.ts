/** LLM prompt — 单词语义 SVG（与 conceptVisualTokens 风格对齐） */
export interface WordSvgPromptInput {
  word: string;
  translation: string;
  category: string;
  definition?: string;
  repairIssues?: string[];
}

const STYLE_SPEC = `
Design system (MUST follow):
- viewBox="0 0 100 100", xmlns="http://www.w3.org/2000/svg", width="100%" height="100%"
- Root <svg> MUST have class="vector-svg" and aria-hidden="true"
- Flat minimal line-art icon — NO photorealism, NO gradients, NO box-shadow, NO filters
- Palette (use these hex literals only): ink #1e293b, accent #0891b2, accent-warm #d97706, soft #ecfeff, faint #e2e8f0
- Stroke width 2–3.5, round caps/joins where appropriate
- The drawing MUST instantly read as the English word's concrete meaning for learners — NEVER a generic circle/line/box unless the word IS that shape
- NO English/Chinese text inside the SVG — pure pictogram
- REQUIRED animation: include <style> with @keyframes (cv-pulse | cv-bob | cv-flow) AND apply animation to at least one element
- Animation must reinforce meaning (e.g. bulb glows, bell swings, water flows, animal bobs)
- NO <script>, NO external URLs, NO embedded images, NO <foreignObject>
- Output compact SVG under 4KB
`.trim();

export function buildWordSvgPrompt(input: WordSvgPromptInput): string {
  const repair = input.repairIssues?.length
    ? `\n\nPREVIOUS ATTEMPT FAILED:\n${input.repairIssues.map((i) => `- ${i}`).join('\n')}\nFix these issues.`
    : '';

  return `Generate a single semantic SVG icon for an English vocabulary flashcard.

Word: ${input.word}
Chinese: ${input.translation}
Category: ${input.category}
${input.definition ? `Hint: ${input.definition.slice(0, 200)}` : ''}

${STYLE_SPEC}

Return JSON: { "svg": "<svg ...>...</svg>", "rationale": "one sentence why this depicts the word" }
The svg field must be a complete root <svg> element only.${repair}`;
}

export function buildWordSvgRepairPrompt(input: WordSvgPromptInput, badSvg: string, issues: string[]): string {
  return `${buildWordSvgPrompt({ ...input, repairIssues: issues })}

Broken SVG to fix:
${badSvg.slice(0, 2000)}`;
}
