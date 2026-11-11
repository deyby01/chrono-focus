import React from 'react';
import {
  GraduationCap,
  Code2,
  Palette,
  Briefcase,
  BookOpen,
  HeartPulse,
  Folder,
  Rocket,
  Terminal,
  Music,
  Dumbbell,
  Globe,
  Sparkles,
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const CATEGORY_ICONS = [
  { id: 'graduation-cap', label: 'Course / Study' },
  { id: 'code', label: 'Engineering / Code' },
  { id: 'palette', label: 'Hobby / Creative' },
  { id: 'briefcase', label: 'Deep Work / Career' },
  { id: 'book-open', label: 'Reading / Notes' },
  { id: 'heart-pulse', label: 'Health / Routine' },
  { id: 'rocket', label: 'Side Project' },
  { id: 'terminal', label: 'DevOps / Lab' },
  { id: 'music', label: 'Music / Art' },
  { id: 'dumbbell', label: 'Fitness / Sport' },
  { id: 'globe', label: 'Languages' },
  { id: 'folder', label: 'General' },
];

export const CATEGORY_COLORS = [
  '#3B82F6',
  '#10B981',
  '#A855F7',
  '#F59E0B',
  '#06B6D4',
  '#F43F5E',
  '#6366F1',
  '#EC4899',
  '#14B8A6',
  '#84CC16',
];

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  size = 16,
  className = '',
  color,
}) => {
  const props = { size, className, style: color ? { color } : undefined };

  switch (name) {
    case 'graduation-cap':
      return <GraduationCap {...props} />;
    case 'code':
      return <Code2 {...props} />;
    case 'palette':
      return <Palette {...props} />;
    case 'briefcase':
      return <Briefcase {...props} />;
    case 'book-open':
      return <BookOpen {...props} />;
    case 'heart-pulse':
      return <HeartPulse {...props} />;
    case 'rocket':
      return <Rocket {...props} />;
    case 'terminal':
      return <Terminal {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'dumbbell':
      return <Dumbbell {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    default:
      return <Folder {...props} />;
  }
};

