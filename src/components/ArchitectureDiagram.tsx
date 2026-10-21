import { Eye } from 'lucide-react';

export interface DiagramItem {
  id: string;
  title: string;
  subtitle: string;
  svgPath: string;
}

interface ArchitectureDiagramProps extends DiagramItem {
  onSelect?: (diagram: DiagramItem) => void;
}

export function ArchitectureDiagram({ id, title, subtitle, svgPath, onSelect }: ArchitectureDiagramProps) {
  const currentDiagram: DiagramItem = { id, title, subtitle, svgPath };

  return (
    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between hover:shadow-md transition-shadow gap-6">
      <div className="space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Architecture Blueprint
        </span>
        <h3 className="font-bold text-lg leading-snug">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-normal">{subtitle}</p>

        {/* Clickable Image Preview */}
        <div 
          onClick={() => onSelect?.(currentDiagram)}
          className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 overflow-hidden cursor-pointer aspect-video flex items-center justify-center group"
        >
          <img 
            src={svgPath} 
            alt={title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" 
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="button"
          onClick={() => onSelect?.(currentDiagram)}
          className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <Eye size={15} className="text-teal-600 dark:text-teal-400" /> View Architecture Blueprint
        </button>
      </div>
    </div>
  );
}