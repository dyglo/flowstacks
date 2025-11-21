import { Tool,  PricingModel } from './types';

export type Persona = 'founder' | 'developer' | 'student' | 'creator' | 'other';
export type BudgetPreference = 'free' | 'freemium-ok' | 'paid-ok';

interface ScoredTool {
  tool: Tool;
  score: number;
  matchReasons: string[];
}

export function recommendTools(
  tools: Tool[],
  persona: Persona,
  focusAreas: string[],
  budgetPreference: BudgetPreference
): Tool[] {
  const scoredTools: ScoredTool[] = tools.map((tool) => {
    let score = 0;
    const matchReasons: string[] = [];

    const personaMatch = tool.bestFor.some((bf) =>
      bf.toLowerCase().includes(persona)
    );
    if (personaMatch) {
      score += 2;
      matchReasons.push(`Perfect for ${persona}s`);
    }

    if (focusAreas.includes(tool.category)) {
      score += 2;
      matchReasons.push(`Matches ${tool.category} focus`);
    }

    if (tool.featured) {
      score += 1;
      matchReasons.push('Featured tool');
    }

    return { tool, score, matchReasons };
  });

  let filteredTools = scoredTools;

  if (budgetPreference === 'free') {
    filteredTools = scoredTools.filter((st) => st.tool.pricing === 'free');
  } else if (budgetPreference === 'freemium-ok') {
    filteredTools = scoredTools.filter(
      (st) => st.tool.pricing === 'free' || st.tool.pricing === 'freemium'
    );
  }

  filteredTools.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.tool.name.localeCompare(b.tool.name);
  });

  const topTools = filteredTools.slice(0, 7).map((st) => st.tool);

  if (topTools.length < 3) {
    const additionalTools = scoredTools
      .filter((st) => !topTools.find((t) => t.id === st.tool.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3 - topTools.length)
      .map((st) => st.tool);

    return [...topTools, ...additionalTools];
  }

  return topTools;
}

export function generateStackMarkdown(tools: Tool[]): string {
  if (tools.length === 0) {
    return 'No tools selected.';
  }

  let markdown = '# My AI Productivity Stack\n\n';
  markdown += `Generated from FlowStacks\n\n`;

  const groupedByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  Object.entries(groupedByCategory).forEach(([category, categoryTools]) => {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    categoryTools.forEach((tool) => {
      markdown += `- **[${tool.name}](${tool.websiteUrl})** - ${tool.tagline}\n`;
    });
    markdown += '\n';
  });

  return markdown;
}
