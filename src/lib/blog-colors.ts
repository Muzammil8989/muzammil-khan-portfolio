/**
 * Blog Type and Difficulty Color Mappings
 * Using Design Tokens
 */

export const blogTypeColors = {
  Article: {
    light: "bg-blue-500/10 text-blue-600 border-blue-200",
    dark: "dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
  },
  "Case Study": {
    light: "bg-purple-500/10 text-purple-600 border-purple-200",
    dark: "dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800",
  },
  Tutorial: {
    light: "bg-green-500/10 text-green-600 border-green-200",
    dark: "dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
  },
  "Deep Dive": {
    light: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    dark: "dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-800",
  },
  "Quick Tip": {
    light: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    dark: "dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  Guide: {
    light: "bg-teal-500/10 text-teal-600 border-teal-200",
    dark: "dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-800",
  },
} as const;

export const difficultyColors = {
  beginner: {
    light: "bg-green-500/10 text-green-600 border-green-200",
    dark: "dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
  },
  intermediate: {
    light: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    dark: "dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  advanced: {
    light: "bg-red-500/10 text-red-600 border-red-200",
    dark: "dark:bg-red-500/20 dark:text-red-400 dark:border-red-800",
  },
} as const;

export const publishStatusColors = {
  published: {
    light: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dark: "dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  draft: {
    light: "bg-gray-500/10 text-gray-600 border-gray-200",
    dark: "dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800",
  },
} as const;

// Helper function to get combined classes
export function getTypeColorClasses(type: string): string {
  const colorSet = blogTypeColors[type as keyof typeof blogTypeColors];
  if (!colorSet) return "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400";
  return `${colorSet.light} ${colorSet.dark}`;
}

export function getDifficultyColorClasses(difficulty: string): string {
  const colorSet = difficultyColors[difficulty as keyof typeof difficultyColors];
  if (!colorSet) return "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400";
  return `${colorSet.light} ${colorSet.dark}`;
}

export function getPublishStatusColorClasses(isPublished: boolean): string {
  const status = isPublished ? "published" : "draft";
  const colorSet = publishStatusColors[status];
  return `${colorSet.light} ${colorSet.dark}`;
}
