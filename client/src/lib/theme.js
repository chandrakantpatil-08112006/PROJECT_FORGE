import { BarChart3, BrainCircuit, Cloud, Cpu, Gamepad2, Globe, Shapes, ShieldCheck, Smartphone, Terminal } from 'lucide-react';

/**
 * Visual identity per project category. Presentation only: the category values come from the API,
 * this map just decides which colour and icon represent them.
 */
export const CATEGORY_THEME = {
  web: { icon: Globe, from: '#4f46e5', to: '#2563eb', tint: '#eef2ff', ink: '#3730a3' },
  mobile: { icon: Smartphone, from: '#0284c7', to: '#06b6d4', tint: '#ecfeff', ink: '#0e7490' },
  ai_ml: { icon: BrainCircuit, from: '#7c3aed', to: '#c026d3', tint: '#f5f3ff', ink: '#6d28d9' },
  data: { icon: BarChart3, from: '#0891b2', to: '#10b981', tint: '#ecfdf5', ink: '#047857' },
  game: { icon: Gamepad2, from: '#e11d48', to: '#f97316', tint: '#fff1f2', ink: '#be123c' },
  devtools: { icon: Terminal, from: '#334155', to: '#6366f1', tint: '#f1f5f9', ink: '#334155' },
  cloud: { icon: Cloud, from: '#2563eb', to: '#38bdf8', tint: '#eff6ff', ink: '#1d4ed8' },
  security: { icon: ShieldCheck, from: '#d97706', to: '#ef4444', tint: '#fffbeb', ink: '#b45309' },
  embedded: { icon: Cpu, from: '#ea580c', to: '#f59e0b', tint: '#fff7ed', ink: '#c2410c' },
  other: { icon: Shapes, from: '#64748b', to: '#8b5cf6', tint: '#f8fafc', ink: '#475569' },
};

export const categoryTheme = (category) => CATEGORY_THEME[category] ?? CATEGORY_THEME.other;

/** Skill chips are tinted by their skill category so a skill list reads at a glance. */
export const SKILL_TONES = {
  language: { bg: '#eef2ff', fg: '#3730a3', bd: '#c7d2fe' },
  frontend: { bg: '#fdf2f8', fg: '#9d174d', bd: '#fbcfe8' },
  backend: { bg: '#ecfdf5', fg: '#047857', bd: '#a7f3d0' },
  mobile: { bg: '#ecfeff', fg: '#0e7490', bd: '#a5f3fc' },
  database: { bg: '#fffbeb', fg: '#b45309', bd: '#fde68a' },
  devops: { bg: '#eff6ff', fg: '#1d4ed8', bd: '#bfdbfe' },
  data_ai: { bg: '#f5f3ff', fg: '#6d28d9', bd: '#ddd6fe' },
  design: { bg: '#fff1f2', fg: '#be123c', bd: '#fecdd3' },
  testing: { bg: '#f0fdfa', fg: '#0f766e', bd: '#99f6e4' },
  other: { bg: '#f1f5f9', fg: '#475569', bd: '#e2e8f0' },
};

export const skillTone = (category) => SKILL_TONES[category] ?? SKILL_TONES.other;
