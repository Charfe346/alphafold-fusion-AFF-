import { type ProteinRecord, ESMFOLD_DIRECT_LIMIT } from '../../forge-engine';

export function ChunkInfoBanner({ protein }: { protein: ProteinRecord }) {
  if (!protein.chunkInfo) return null;
  const ci = protein.chunkInfo;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-amber-800 flex items-center gap-2">
        🧩 Chunked Structure — {ci.totalChunks} Overlapping Fragments
      </h3>
      <p className="text-xs text-amber-700">
        This {ci.originalLength} aa sequence exceeded the ESMFold direct limit ({ESMFOLD_DIRECT_LIMIT} aa).
        It was split into {ci.totalChunks} overlapping fragments of ~{ci.chunkSize} aa with {ci.overlap} aa overlap.
        In overlap regions, the residue with the highest pLDDT score was selected.
      </p>
      <div className="flex flex-wrap gap-2">
        {ci.chunkBoundaries.map((b, i) => (
          <span key={i} className="text-xs px-2 py-1 bg-amber-100 rounded-full border border-amber-300">
            Chunk {i + 1}: {b.start + 1}–{b.end}
          </span>
        ))}
      </div>
      <p className="text-xs text-amber-600 italic">
        ⚠️ Junction regions between chunks may have lower structural accuracy.
      </p>
    </div>
  );
}