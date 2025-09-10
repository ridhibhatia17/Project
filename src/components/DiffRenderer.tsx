import { DiffSegment } from '../types';

interface DiffRendererProps {
  differences: DiffSegment[];
  viewType: 'original' | 'updated';
}

export function DiffRenderer({ differences, viewType }: DiffRendererProps) {
  return (
    <div className="font-mono text-sm leading-relaxed">
      {differences.map((diff, index) => {
        const shouldShow = 
          diff.type === 'unchanged' ||
          (viewType === 'original' && diff.type === 'deletion') ||
          (viewType === 'updated' && diff.type === 'addition');

        if (!shouldShow) {
          return null;
        }

        return (
          <span
            key={index}
            className={`${getHighlightClass(diff.type)} ${
              diff.type === 'deletion' ? 'line-through' : ''
            }`}
          >
            {diff.text}
          </span>
        );
      })}
    </div>
  );
}

function getHighlightClass(type: string): string {
  switch (type) {
    case 'addition':
      return 'bg-green-200 border-l-4 border-green-500 pl-1';
    case 'deletion':
      return 'bg-red-200 border-l-4 border-red-500 pl-1';
    case 'modification':
      return 'bg-yellow-200 border-l-4 border-yellow-500 pl-1';
    default:
      return '';
  }
}