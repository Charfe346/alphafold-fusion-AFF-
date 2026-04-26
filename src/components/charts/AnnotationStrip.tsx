import { type Annotation, ANNOTATION_PALETTE } from '../../forge-engine';
import { exportAnnotationLegend } from '../../helpers/exportHelpers';

export function AnnotationStrip({ items, seqLen, showDownload }: {
  items: Annotation[]; seqLen: number; showDownload?: boolean;
}) {
  if (!items.length || !seqLen) return null;
  return (
    <div className="mt-2">
      <div className="relative h-8 bg-gray-200 rounded" style={{ minWidth: 200 }}>
        {items.map((d, i) => (
          <div key={i} title={`${d.name} (${d.from}–${d.to})`}
            className="absolute h-full rounded text-xs flex items-center justify-center text-white overflow-hidden"
            style={{
              left: `${(d.from / seqLen) * 100}%`,
              width: `${Math.max(1, ((d.to - d.from + 1) / seqLen) * 100)}%`,
              backgroundColor: ANNOTATION_PALETTE[i % ANNOTATION_PALETTE.length],
            }}>
            {(d.to - d.from) > seqLen * 0.05 ? d.name.slice(0, 20) : ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-1 items-center">
        {items.map((d, i) => (
          <span key={i} className="text-xs flex items-center gap-1">
            <span className="w-3 h-3 rounded"
              style={{ backgroundColor: ANNOTATION_PALETTE[i % ANNOTATION_PALETTE.length] }} />
            {d.name} ({d.from}–{d.to})
          </span>
        ))}
        {showDownload !== false && (
          <button
            onClick={() => exportAnnotationLegend(items, 'Annotations')}
            className="ml-2 px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
            title="Download legend as PNG"
          >📥 Legend</button>
        )}
      </div>
    </div>
  );
}