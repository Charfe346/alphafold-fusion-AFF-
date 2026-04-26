// AlphaFold Fusion Engine v4.1 — Scientifically Corrected + Long Sequence Support
// Key fixes:
//   1. IDR-aware restraints: low pLDDT + high disorder → k=0 (not high k)
//   2. Physics-based k from equipartition theorem: k = 3kBT / σ²
//   3. Kabsch-aligned RMSD (SVD) in generated MD scripts
//   4. Disorder propensity from amino acid composition (Campen et al. 2008)
//   5. NEW: Chunked ESMFold for sequences >400 aa (up to ~2000 aa)
//   6. NEW: ESM Atlas API integration for metagenomic proteins

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface ProteinRecord {
  label: string;
  uniprotId: string;
  chain: string;
  pdbText: string;
  paeMatrix: number[][] | null;
  uniprotMeta: UniProtMeta | null;
  annotations: Annotation[];
  confidenceScores: number[];
  meanConfidence: number;
  origin: 'alphafold-db' | 'esmfold-predict' | 'esmfold-chunked' | 'esm-atlas' | 'user-upload';
  alignmentResult: AlignmentResult | null;
  disorderProfile: number[];
  restraintProfile: RestraintInfo[];
  createdAt: number;
  chunkInfo?: ChunkInfo;
}

export interface ChunkInfo {
  totalChunks: number;
  chunkSize: number;
  overlap: number;
  originalLength: number;
  chunkBoundaries: { start: number; end: number }[];
}

export interface UniProtMeta {
  proteinName: string;
  geneName: string;
  species: string;
  seqLength: number;
  accession: string;
}

export interface Annotation {
  from: number;
  to: number;
  name: string;
  category: string;
  provider: string;
}

export interface AlignmentResult {
  totalSeqs: number;
  querySeq: string;
  homologs: HomologHit[];
}

export interface HomologHit {
  id: string;
  seqIdentity: number;
  expectValue?: number;
  queryCoverage?: number;
}

export interface FlexibleRegion {
  begin: number;
  end: number;
  span: number;
  avgScore: number;
  worstScore: number;
}

export interface FlexibilityReport {
  segments: FlexibleRegion[];
  flexibleFraction: number;
  totalResidues: number;
}

export interface PrecisionMetrics {
  avgPositionalError: number;
  medianPositionalError: number;
  avgDisplacement: number;
  effectiveResolution: number;
  perResidueErrors: number[];
}

export interface PaeDomainSegment {
  domainId: number;
  startRes: number;
  endRes: number;
  residueCount: number;
  internalPae: number;
}

export type RestraintCategory = 'strong' | 'moderate' | 'weak' | 'idr-free' | 'none';

export interface RestraintInfo {
  residueIndex: number;
  plddt: number;
  disorderScore: number;
  isIDR: boolean;
  category: RestraintCategory;
  kValue: number;
  physicalBasis: string;
}

export interface MDConfig {
  forceField: string;
  waterModel: string;
  boxGeometry: 'dodecahedron' | 'octahedron' | 'cube';
  boxPadding: number;
  saltConcentration: number;
  targetpH: number;
  temperature: number;
  pressure: number;
  integrationStep: number;
  equilibrationDuration: number;
  productionDuration: number;
  snapshotFrequency: number;
  logPrintEvery: number;
  restraintStrategy: 'physics-idr-aware' | 'physics-basic' | 'uniform' | 'none';
  excludeResidues: string[];
  numRelaxationStages: number;
  gapHandling: 'skip-terminal' | 'model-all' | 'skip-all';
  gpuPrecision: 'single' | 'mixed' | 'double';
  computeRMSD: boolean;
  computeRMSF: boolean;
  checkpointInterval: number;
  idrThreshold: number;
}

export interface MDReadinessCheck {
  overallStatus: 'ready' | 'caution' | 'unsuitable';
  confidenceGrade: { status: string; detail: string };
  disorderCheck: { status: string; detail: string };
  sizeCheck: { status: string; detail: string };
  domainCheck: { status: string; detail: string };
  idrCheck: { status: string; detail: string };
  recommendations: string[];
  estimatedAtoms: number;
  estimatedGpuHours: number;
}

export interface ScriptSection {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'innovation';
}

export type NavigationTab = '🏠 Dashboard' | '🧬 Input' | '📊 Quality' | '🔬 Viewer' | '🧪 MD Lab' | '📐 Deep Analysis' | '⚙️ About';
export type RenderMode = 'Cartoon' | 'Stick' | 'Sphere' | 'Line';
export type Palette = 'Confidence (4-tier)' | 'Blue-Orange' | 'B-factor gradient' | 'Rainbow' | 'Per-chain';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const NAV_TABS: NavigationTab[] = [
  '🏠 Dashboard', '🧬 Input', '📊 Quality', '🔬 Viewer', '🧪 MD Lab', '📐 Deep Analysis', '⚙️ About'
];

export const CONFIDENCE_TIERS = {
  'Excellent (≥90)': { lo: 90, hi: 100, hex: '#0D47A1' },
  'Good (70–89)':    { lo: 70, hi: 90,  hex: '#42A5F5' },
  'Fair (50–69)':    { lo: 50, hi: 70,  hex: '#FBC02D' },
  'Poor (<50)':      { lo: 0,  hi: 50,  hex: '#E65100' },
} as const;

export const ANNOTATION_PALETTE = [
  '#1565C0', '#E65100', '#2E7D32', '#C62828', '#6A1B9A',
  '#4E342E', '#AD1457', '#546E7A', '#827717', '#00838F',
];

export const SHOWCASE_PROTEINS = [
  { label: 'Hemoglobin β', id: 'P68871', residues: 147 },
  { label: 'Hemoglobin α', id: 'P69905', residues: 142 },
  { label: 'Insulin',      id: 'P01308', residues: 110 },
  { label: 'Myoglobin',    id: 'P02144', residues: 154 },
  { label: 'Lysozyme C',   id: 'P61626', residues: 148 },
  { label: 'Ubiquitin',    id: 'P0CG48', residues: 76  },
  { label: 'GFP',          id: 'P42212', residues: 238 },
  { label: 'p53',          id: 'P04637', residues: 393 },
];

// ESMFold limits
export const ESMFOLD_DIRECT_LIMIT = 400;    // Direct API limit per request
export const ESMFOLD_CHUNK_SIZE = 380;       // Size of each chunk
export const ESMFOLD_CHUNK_OVERLAP = 50;     // Overlap between chunks
export const ESMFOLD_MAX_LENGTH = 2500;      // Maximum total sequence length for chunked folding

export const FORCEFIELD_OPTIONS: Record<string, { xml: string; compatibleWater: string[]; description: string }> = {
  'AMBER ff14SB':     { xml: 'amber14-all.xml',   compatibleWater: ['TIP3P', 'TIP4P-Ew', 'SPC/E'], description: 'Modern AMBER for proteins' },
  'AMBER ff99SBildn': { xml: 'amber99sbildn.xml',  compatibleWater: ['TIP3P', 'SPC/E'],              description: 'Classic AMBER with improved dihedrals' },
  'CHARMM36m':        { xml: 'charmm36.xml',        compatibleWater: ['CHARMM-TIP3P', 'SPC/E'],      description: 'CHARMM with enhanced sampling' },
};

export const WATER_MODELS: Record<string, { xmlSuffix: string; geometry: string }> = {
  'TIP3P':        { xmlSuffix: 'tip3p',   geometry: 'tip3p'   },
  'TIP4P-Ew':     { xmlSuffix: 'tip4pew', geometry: 'tip4pew' },
  'SPC/E':        { xmlSuffix: 'spce',    geometry: 'spce'    },
  'CHARMM-TIP3P': { xmlSuffix: 'water',   geometry: 'tip3p'   },
};

// ═══════════════════════════════════════════════════════════════
// DISORDER PROPENSITY — Campen et al. 2008 J Mol Biol 382:956
// ═══════════════════════════════════════════════════════════════

const DISORDER_PROPENSITY: Record<string, number> = {
  A: 0.06, R: 0.18, N: 0.17, D: 0.19, C: -0.20,
  E: 0.30, Q: 0.22, G: 0.17, H: 0.05, I: -0.49,
  L: -0.34, K: 0.26, M: -0.20, F: -0.42, P: 0.34,
  S: 0.14, T: 0.04, W: -0.51, Y: -0.31, V: -0.38,
};

export function predictDisorder(sequence: string, windowSize = 21): number[] {
  const n = sequence.length;
  if (n === 0) return [];
  const raw = Array.from(sequence).map(aa => DISORDER_PROPENSITY[aa] ?? 0.0);
  const half = Math.floor(windowSize / 2);
  const smoothed: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0, cnt = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) {
      sum += raw[j]; cnt++;
    }
    smoothed.push(sum / cnt);
  }
  const mn = Math.min(...smoothed);
  const mx = Math.max(...smoothed);
  const range = mx - mn || 1;
  return smoothed.map(v => Math.max(0, Math.min(1, (v - mn) / range)));
}

// ═══════════════════════════════════════════════════════════════
// PHYSICS-BASED RESTRAINT CALCULATION
// ═══════════════════════════════════════════════════════════════

const PLDDT_TO_ERROR: [number, number][] = [
  [0, 15], [10, 13.5], [20, 12], [30, 8], [40, 5.5],
  [50, 3.5], [60, 2.2], [70, 1.5], [80, 1.0], [90, 0.6], [100, 0.3],
];

export function plddtToError(plddt: number): number {
  const c = Math.max(0, Math.min(100, plddt));
  for (let i = 0; i < PLDDT_TO_ERROR.length - 1; i++) {
    const [x0, y0] = PLDDT_TO_ERROR[i], [x1, y1] = PLDDT_TO_ERROR[i + 1];
    if (c >= x0 && c <= x1) return y0 + (y1 - y0) * (c - x0) / (x1 - x0);
  }
  return PLDDT_TO_ERROR[PLDDT_TO_ERROR.length - 1][1];
}

export function physicsBasedK(plddt: number, tempK = 310): number {
  const kBT = 0.00831446 * tempK;
  const sigmaA = plddtToError(plddt);
  const sigmaNm = sigmaA / 10;
  if (sigmaNm < 0.01) return 5000;
  const k = (3 * kBT) / (sigmaNm * sigmaNm);
  return Math.min(5000, k);
}

export function classifyResidues(
  scores: number[],
  disorderProfile: number[],
  idrThreshold: number,
  tempK: number
): RestraintInfo[] {
  return scores.map((plddt, i) => {
    const ds = i < disorderProfile.length ? disorderProfile[i] : 0;
    const isIDR = ds >= idrThreshold;
    let category: RestraintCategory;
    let kValue: number;
    let physicalBasis: string;
    if (isIDR) {
      category = 'idr-free';
      kValue = 0;
      physicalBasis = `IDR (disorder=${ds.toFixed(2)}≥${idrThreshold}): no restraint`;
    } else if (plddt >= 90) {
      kValue = physicsBasedK(plddt, tempK);
      category = 'strong';
      physicalBasis = `σ=${plddtToError(plddt).toFixed(2)}Å → k=${kValue.toFixed(0)} (equipartition)`;
    } else if (plddt >= 70) {
      kValue = physicsBasedK(plddt, tempK);
      category = 'moderate';
      physicalBasis = `σ=${plddtToError(plddt).toFixed(2)}Å → k=${kValue.toFixed(0)} (equipartition)`;
    } else if (plddt >= 50) {
      kValue = physicsBasedK(plddt, tempK);
      category = 'weak';
      physicalBasis = `σ=${plddtToError(plddt).toFixed(2)}Å → k=${kValue.toFixed(0)} (low confidence)`;
    } else {
      kValue = physicsBasedK(plddt, tempK) * 0.5;
      category = 'weak';
      physicalBasis = `σ=${plddtToError(plddt).toFixed(2)}Å → k=${kValue.toFixed(0)} (very low, halved)`;
    }
    return { residueIndex: i, plddt, disorderScore: ds, isIDR, category, kValue, physicalBasis };
  });
}

// ═══════════════════════════════════════════════════════════════
// SEQUENCE ANALYSIS TOOLS
// ═══════════════════════════════════════════════════════════════

export function sequenceEntropy(sequence: string, windowSize = 15): number[] {
  const n = sequence.length;
  if (n === 0) return [];
  const half = Math.floor(windowSize / 2);
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n, i + half + 1);
    const window = sequence.slice(lo, hi);
    const freq = new Map<string, number>();
    for (const ch of window) freq.set(ch, (freq.get(ch) || 0) + 1);
    let entropy = 0;
    for (const count of freq.values()) {
      const p = count / window.length;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    result.push(entropy / 4.32);
  }
  return result;
}

export function contactDensityFromPAE(pae: number[][], threshold = 8): number[] {
  const n = pae.length;
  if (n === 0) return [];
  // Validate that PAE is a proper 2D matrix
  if (!Array.isArray(pae[0])) {
    // PAE might be a flat 1D array — try to reshape
    const flat = pae as unknown as number[];
    const side = Math.round(Math.sqrt(flat.length));
    if (side * side === flat.length && side > 0) {
      const matrix: number[][] = [];
      for (let i = 0; i < side; i++) {
        matrix.push(flat.slice(i * side, (i + 1) * side));
      }
      return contactDensityFromPAE(matrix, threshold);
    }
    return [];
  }
  // Determine actual matrix dimension (some rows may be shorter)
  const colLen = Array.isArray(pae[0]) ? pae[0].length : 0;
  const dim = Math.min(n, colLen);
  if (dim === 0) return [];
  const density: number[] = [];
  for (let i = 0; i < dim; i++) {
    const row_i = pae[i];
    if (!Array.isArray(row_i)) { density.push(0); continue; }
    let count = 0;
    for (let j = 0; j < dim; j++) {
      if (i === j) continue;
      // Use single-direction PAE[i][j] for robustness
      // (avoids issues with asymmetric/ragged matrices)
      const v = (j < row_i.length && typeof row_i[j] === 'number') ? row_i[j] : 999;
      if (v < threshold) count++;
    }
    density.push(count);
  }
  return density;
}

// ═══════════════════════════════════════════════════════════════
// SEQUENCE PARSING
// ═══════════════════════════════════════════════════════════════

export function readFasta(raw: string): { header: string; residues: string }[] {
  const result: { header: string; residues: string }[] = [];
  let currentHeader: string | null = null;
  const seqParts: string[] = [];
  for (const line of (raw || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentHeader && seqParts.length) {
        result.push({ header: currentHeader, residues: seqParts.join('') });
        currentHeader = null; seqParts.length = 0;
      }
      continue;
    }
    if (trimmed.startsWith('>')) {
      if (currentHeader && seqParts.length) result.push({ header: currentHeader, residues: seqParts.join('') });
      currentHeader = trimmed.slice(1).trim(); seqParts.length = 0;
    } else {
      if (currentHeader === null) currentHeader = 'unnamed';
      seqParts.push(trimmed);
    }
  }
  if (currentHeader && seqParts.length) result.push({ header: currentHeader, residues: seqParts.join('') });
  return result
    .map(e => ({ header: e.header, residues: e.residues.replace(/[^ACDEFGHIKLMNPQRSTVWY]/gi, '').toUpperCase() }))
    .filter(e => e.residues.length > 0);
}

export function findAccession(text: string): string | null {
  if (!text) return null;
  const sw = text.match(/(?:sp|tr)\|([A-Z0-9]{6,10}(?:-\d+)?)\|/i);
  if (sw) return sw[1].toUpperCase();
  for (const tok of text.split(/[|\s,;/]+/)) {
    if (/^[A-Z0-9]{6,10}(?:-\d+)?$/i.test(tok.trim())) return tok.trim().toUpperCase();
  }
  return null;
}

export function looksLikeAccession(s: string): boolean {
  return /^[A-Z0-9]{6,10}$/i.test(s);
}

// ═══════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export async function queryAlphaFoldDB(accession: string): Promise<{ pdbUrl: string; paeUrl: string; accession: string } | null> {
  try {
    const resp = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`);
    if (!resp.ok) return null;
    const payload = await resp.json();
    if (!Array.isArray(payload) || !payload[0]) return null;
    const e = payload[0];
    return { pdbUrl: e.pdbUrl || '', paeUrl: e.paeDocUrl || '', accession: e.uniprotAccession || accession };
  } catch { return null; }
}

export async function downloadCoordinates(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: HTTP ${resp.status}`);
  const text = await resp.text();
  if (!text || text.length < 100) throw new Error('Empty coordinate file');
  return text;
}

export async function downloadPAE(url: string): Promise<number[][] | null> {
  try {
    if (!url) return null;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const entry = Array.isArray(data) ? data[0] : data;
    if (!entry) return null;

    // Format 1: 2D matrix directly as predicted_aligned_error or pae
    const raw2d = entry.predicted_aligned_error || entry.pae;
    if (raw2d && Array.isArray(raw2d)) {
      // Check if it's actually a 2D array (first element is an array)
      if (Array.isArray(raw2d[0])) {
        return raw2d as number[][];
      }
      // It's a flat 1D array — reshape to 2D
      const flat = raw2d as number[];
      const side = Math.round(Math.sqrt(flat.length));
      if (side > 0 && side * side === flat.length) {
        const matrix: number[][] = [];
        for (let i = 0; i < side; i++) {
          matrix.push(flat.slice(i * side, (i + 1) * side));
        }
        return matrix;
      }
      // Not a perfect square — check if max_predicted_aligned_error gives us a hint
      const maxPae = entry.max_predicted_aligned_error;
      if (typeof maxPae === 'number') {
        // Try with the sequence length derived from sqrt
        const approxSide = Math.floor(Math.sqrt(flat.length));
        if (approxSide > 0) {
          const matrix: number[][] = [];
          for (let i = 0; i < approxSide; i++) {
            matrix.push(flat.slice(i * approxSide, (i + 1) * approxSide));
          }
          return matrix;
        }
      }
    }

    // Format 2: residue1/residue2/distance arrays (newer AlphaFold DB format)
    if (entry.residue1 && entry.residue2 && entry.distance) {
      const r1: number[] = entry.residue1;
      const r2: number[] = entry.residue2;
      const dist: number[] = entry.distance;
      const n = Math.max(...r1, ...r2) + 1;
      if (n > 0 && n < 10000) {
        const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(30));
        for (let k = 0; k < r1.length; k++) {
          matrix[r1[k]][r2[k]] = dist[k];
        }
        return matrix;
      }
    }

    return null;
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// ESMFold API — Direct folding (≤400 aa)
// ═══════════════════════════════════════════════════════════════

export async function runESMFoldDirect(sequence: string, onStatus?: (msg: string) => void): Promise<string> {
  onStatus?.(`Submitting ${sequence.length} residues to ESMFold…`);
  const resp = await fetch('https://api.esmatlas.com/foldSequence/v1/pdb/', {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: sequence,
  });
  if (!resp.ok) throw new Error(`ESMFold error (HTTP ${resp.status})`);
  const pdb = await resp.text();
  if (!pdb || pdb.length < 100) throw new Error('ESMFold returned empty result');
  return pdb;
}

// ═══════════════════════════════════════════════════════════════
// ESMFold CHUNKED FOLDING — For sequences >400 aa
// Splits the sequence into overlapping chunks, folds each,
// then merges the PDB files with proper residue numbering.
// In overlap regions, takes the residue with higher pLDDT.
// ═══════════════════════════════════════════════════════════════

interface ChunkResult {
  chunkIndex: number;
  seqStart: number;    // 0-indexed start in full sequence
  seqEnd: number;      // 0-indexed end (exclusive)
  pdbText: string;
  confidenceScores: number[];
}

function computeChunkBoundaries(seqLen: number, chunkSize: number, overlap: number): { start: number; end: number }[] {
  const chunks: { start: number; end: number }[] = [];
  let pos = 0;
  while (pos < seqLen) {
    const end = Math.min(pos + chunkSize, seqLen);
    chunks.push({ start: pos, end });
    if (end >= seqLen) break;
    pos = end - overlap;
  }
  return chunks;
}

function parsePdbAtoms(pdbText: string): {
  atoms: { line: string; resSeq: number; bFactor: number; atomName: string }[];
} {
  const atoms: { line: string; resSeq: number; bFactor: number; atomName: string }[] = [];
  for (const ln of pdbText.split('\n')) {
    if (!ln.startsWith('ATOM') || ln.length < 66) continue;
    const resSeq = parseInt(ln.substring(22, 26).trim());
    const bFactor = parseFloat(ln.substring(60, 66).trim());
    const atomName = ln.substring(12, 16).trim();
    atoms.push({ line: ln, resSeq, bFactor, atomName });
  }
  return { atoms };
}

function renumberPdbLine(line: string, newResSeq: number, newAtomSerial: number): string {
  // Renumber atom serial (columns 7-11) and residue sequence (columns 23-26)
  const serialStr = String(newAtomSerial).padStart(5, ' ');
  const resSeqStr = String(newResSeq).padStart(4, ' ');
  return line.substring(0, 6) + serialStr + line.substring(11, 22) + resSeqStr + line.substring(26);
}

function mergeChunkPdbs(chunks: ChunkResult[]): { pdbText: string; confidenceScores: number[] } {
  if (chunks.length === 0) return { pdbText: '', confidenceScores: [] };
  if (chunks.length === 1) return { pdbText: chunks[0].pdbText, confidenceScores: chunks[0].confidenceScores };

  // For each global residue position, determine which chunk provides the best (highest pLDDT) data
  const totalLen = Math.max(...chunks.map(c => c.seqEnd));
  const bestChunkForResidue: number[] = new Array(totalLen).fill(-1);
  const bestScoreForResidue: number[] = new Array(totalLen).fill(-1);

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    for (let localIdx = 0; localIdx < chunk.confidenceScores.length; localIdx++) {
      const globalIdx = chunk.seqStart + localIdx;
      if (globalIdx < totalLen) {
        const score = chunk.confidenceScores[localIdx];
        if (score > bestScoreForResidue[globalIdx]) {
          bestScoreForResidue[globalIdx] = score;
          bestChunkForResidue[globalIdx] = ci;
        }
      }
    }
  }

  // Build merged PDB
  const mergedLines: string[] = [];
  const mergedScores: number[] = [];
  let atomSerial = 1;

  mergedLines.push('TITLE     ESMFOLD CHUNKED PREDICTION - MERGED FROM OVERLAPPING FRAGMENTS');
  mergedLines.push('REMARK   Merged from ' + chunks.length + ' overlapping chunks');
  mergedLines.push('REMARK   Overlap regions use highest pLDDT residues');

  for (let globalRes = 0; globalRes < totalLen; globalRes++) {
    const chunkIdx = bestChunkForResidue[globalRes];
    if (chunkIdx < 0) continue;

    const chunk = chunks[chunkIdx];
    const localResSeq = globalRes - chunk.seqStart + 1; // 1-indexed in PDB
    const parsed = parsePdbAtoms(chunk.pdbText);

    // Find all atoms for this local residue
    const resAtoms = parsed.atoms.filter(a => a.resSeq === localResSeq);
    for (const atom of resAtoms) {
      const newLine = renumberPdbLine(atom.line, globalRes + 1, atomSerial);
      mergedLines.push(newLine);
      atomSerial++;
    }

    mergedScores.push(bestScoreForResidue[globalRes]);
  }

  mergedLines.push('END');
  return { pdbText: mergedLines.join('\n'), confidenceScores: mergedScores };
}

export async function runESMFoldChunked(
  sequence: string,
  onStatus?: (msg: string) => void
): Promise<{ pdbText: string; confidenceScores: number[]; chunkInfo: ChunkInfo }> {
  const seqLen = sequence.length;
  const boundaries = computeChunkBoundaries(seqLen, ESMFOLD_CHUNK_SIZE, ESMFOLD_CHUNK_OVERLAP);
  const totalChunks = boundaries.length;

  onStatus?.(`Chunked folding: ${totalChunks} fragments for ${seqLen} aa sequence`);

  const chunkResults: ChunkResult[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const { start, end } = boundaries[i];
    const chunkSeq = sequence.substring(start, end);
    onStatus?.(`Folding chunk ${i + 1}/${totalChunks} (residues ${start + 1}–${end}, ${chunkSeq.length} aa)…`);

    try {
      const pdbText = await runESMFoldDirect(chunkSeq);
      const scores = extractConfidenceScores(pdbText);

      chunkResults.push({
        chunkIndex: i,
        seqStart: start,
        seqEnd: end,
        pdbText,
        confidenceScores: scores,
      });

      // Rate limiting: wait between API calls
      if (i < totalChunks - 1) {
        onStatus?.(`Waiting before next chunk (rate limiting)…`);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      onStatus?.(`⚠️ Chunk ${i + 1} failed: ${err instanceof Error ? err.message : 'unknown'}, continuing…`);
      // For failed chunks, create a placeholder with low confidence
      const placeholderScores = new Array(end - start).fill(20);
      chunkResults.push({
        chunkIndex: i,
        seqStart: start,
        seqEnd: end,
        pdbText: '',
        confidenceScores: placeholderScores,
      });
    }
  }

  // Filter out empty chunks
  const validChunks = chunkResults.filter(c => c.pdbText.length > 0);
  if (validChunks.length === 0) {
    throw new Error('All chunks failed to fold');
  }

  onStatus?.(`Merging ${validChunks.length} chunks into unified structure…`);
  const merged = mergeChunkPdbs(validChunks);

  const chunkInfo: ChunkInfo = {
    totalChunks,
    chunkSize: ESMFOLD_CHUNK_SIZE,
    overlap: ESMFOLD_CHUNK_OVERLAP,
    originalLength: seqLen,
    chunkBoundaries: boundaries,
  };

  return { ...merged, chunkInfo };
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED ESMFold — Automatically selects direct or chunked
// ═══════════════════════════════════════════════════════════════

export async function runESMFold(
  sequence: string,
  onStatus?: (msg: string) => void
): Promise<{ pdbText: string; confidenceScores?: number[]; chunkInfo?: ChunkInfo; origin: 'esmfold-predict' | 'esmfold-chunked' }> {
  if (sequence.length > ESMFOLD_MAX_LENGTH) {
    throw new Error(`Sequence too long (${sequence.length} aa). Maximum: ${ESMFOLD_MAX_LENGTH} aa. Consider trimming or using domain predictions.`);
  }

  if (sequence.length <= ESMFOLD_DIRECT_LIMIT) {
    // Direct folding
    onStatus?.(`Direct ESMFold (${sequence.length} aa ≤ ${ESMFOLD_DIRECT_LIMIT} limit)…`);
    const pdbText = await runESMFoldDirect(sequence, onStatus);
    return { pdbText, origin: 'esmfold-predict' };
  }

  // Try direct first for sequences up to ~600 (API sometimes accepts longer)
  if (sequence.length <= 600) {
    onStatus?.(`Attempting direct ESMFold for ${sequence.length} aa…`);
    try {
      const pdbText = await runESMFoldDirect(sequence, onStatus);
      if (pdbText && pdbText.length > 100) {
        return { pdbText, origin: 'esmfold-predict' };
      }
    } catch {
      onStatus?.(`Direct ESMFold failed for ${sequence.length} aa, switching to chunked folding…`);
    }
  }

  // Chunked folding for longer sequences
  onStatus?.(`Using chunked folding strategy for ${sequence.length} aa sequence…`);
  const result = await runESMFoldChunked(sequence, onStatus);
  return {
    pdbText: result.pdbText,
    confidenceScores: result.confidenceScores,
    chunkInfo: result.chunkInfo,
    origin: 'esmfold-chunked',
  };
}

// ═══════════════════════════════════════════════════════════════
// ESM Atlas API — Fetch pre-computed metagenomic structures
// ═══════════════════════════════════════════════════════════════

export async function fetchESMAtlasStructure(mgypId: string, onStatus?: (msg: string) => void): Promise<{
  pdbText: string;
  paeMatrix: number[][] | null;
  plddt: number[] | null;
  ptm: number | null;
} | null> {
  onStatus?.(`Fetching ESM Atlas structure for ${mgypId}…`);
  try {
    const pdbResp = await fetch(`https://api.esmatlas.com/fetchPredictedStructure/${mgypId}`);
    if (!pdbResp.ok) return null;
    const pdbText = await pdbResp.text();
    if (!pdbText || pdbText.length < 100) return null;

    // Also fetch confidence prediction
    let paeMatrix: number[][] | null = null;
    let plddt: number[] | null = null;
    let ptm: number | null = null;
    try {
      onStatus?.(`Fetching confidence data for ${mgypId}…`);
      const confResp = await fetch(`https://api.esmatlas.com/fetchConfidencePrediction/${mgypId}`);
      if (confResp.ok) {
        const confData = await confResp.json();
        if (confData.pae) paeMatrix = confData.pae;
        if (confData.plddt) plddt = confData.plddt;
        if (confData.ptm != null) ptm = confData.ptm;
      }
    } catch { /* ok, confidence is optional */ }

    return { pdbText, paeMatrix, plddt, ptm };
  } catch {
    return null;
  }
}

export async function fetchESMAtlasSequence(mgypId: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.esmatlas.com/fetchSequence/${mgypId}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.sequence || null;
  } catch { return null; }
}

export function looksLikeMGYP(s: string): boolean {
  return /^MGYP\d{9,15}$/i.test(s.trim());
}

// ═══════════════════════════════════════════════════════════════

export async function fetchUniProtMeta(accession: string): Promise<UniProtMeta | null> {
  try {
    const resp = await fetch(`https://rest.uniprot.org/uniprotkb/${accession}.json`);
    if (!resp.ok) return null;
    const d = await resp.json();
    return {
      proteinName: d.proteinDescription?.recommendedName?.fullName?.value || d.proteinDescription?.submittedName?.[0]?.fullName?.value || accession,
      geneName: d.genes?.[0]?.geneName?.value || '',
      species: d.organism?.scientificName || '',
      seqLength: d.sequence?.length || 0,
      accession,
    };
  } catch { return null; }
}

export function parseUniProtAnnotations(data: { features?: { type: string; location?: { start?: { value: string }; end?: { value: string } }; description?: string }[] }): Annotation[] {
  if (!data?.features) return [];
  const keep = new Set(['Domain', 'Repeat', 'Region', 'Coiled coil', 'Zinc finger']);
  const result: Annotation[] = [];
  for (const f of data.features) {
    if (!keep.has(f.type)) continue;
    try {
      const s = parseInt(f.location?.start?.value || '');
      const e = parseInt(f.location?.end?.value || '');
      if (!isNaN(s) && !isNaN(e) && s <= e) {
        result.push({ from: s, to: e, name: f.description || f.type || 'Domain', category: f.type, provider: 'UniProt' });
      }
    } catch { continue; }
  }
  return result.sort((a, b) => a.from - b.from);
}

export async function fetchInterProAnnotations(accession: string): Promise<Annotation[]> {
  const urls = [
    `https://www.ebi.ac.uk/interpro/api/entry/interpro/protein/uniprot/${accession}?page_size=200`,
    `https://www.ebi.ac.uk/interpro/api/entry/all/protein/uniprot/${accession}?page_size=200`,
  ];
  for (const url of urls) {
    try {
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) continue;
      const j = await resp.json();
      const results = j.results || (Array.isArray(j) ? j : []);
      if (!results.length) continue;
      const segments: Annotation[] = [];
      const dedupe = new Set<string>();
      for (const res of results) {
        const meta = res.metadata || res.entry || res;
        const accId = meta.accession || '';
        const name = meta.name || meta.short_name || '';
        const label = `${accId} ${name}`.trim() || 'InterPro entry';
        const sources = [
          ...(res.proteins || []).flatMap((p: { entry_protein_locations?: { fragments?: { start: string; end: string }[] }[] }) => p.entry_protein_locations || []),
          ...(res.locations || []), ...(res.entry_protein_locations || []),
        ];
        for (const loc of sources) {
          for (const fr of (loc.fragments || [])) {
            try {
              const s = parseInt(fr.start), e = parseInt(fr.end);
              if (!isNaN(s) && !isNaN(e) && s <= e) {
                const key = `${s}-${e}-${label}`;
                if (!dedupe.has(key)) { dedupe.add(key); segments.push({ from: s, to: e, name: label, category: 'Domain', provider: 'InterPro' }); }
              }
            } catch { continue; }
          }
        }
      }
      if (segments.length) return segments.sort((a, b) => a.from - b.from);
    } catch { continue; }
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════
// MSA SEARCH (ColabFold MMseqs2)
// ═══════════════════════════════════════════════════════════════

function decodeTarEntries(buffer: Uint8Array): Map<string, string> {
  const files = new Map<string, string>();
  const dec = new TextDecoder('utf-8', { fatal: false });
  let pos = 0;
  while (pos + 512 <= buffer.length) {
    const hdr = buffer.slice(pos, pos + 512);
    let empty = true;
    for (let i = 0; i < 512; i++) { if (hdr[i] !== 0) { empty = false; break; } }
    if (empty) break;
    let nameEnd = 0;
    while (nameEnd < 100 && hdr[nameEnd] !== 0) nameEnd++;
    const filename = dec.decode(hdr.slice(0, nameEnd)).trim();
    let sizeOct = '';
    for (let i = 124; i < 136; i++) { const ch = hdr[i]; if (ch === 0 || ch === 32) break; sizeOct += String.fromCharCode(ch); }
    const size = parseInt(sizeOct, 8) || 0;
    const typeFlag = hdr[156];
    pos += 512;
    if (size > 0 && filename && (typeFlag === 48 || typeFlag === 0)) {
      files.set(filename.split('/').pop() || filename, dec.decode(buffer.slice(pos, pos + size)));
    }
    pos += Math.ceil(size / 512) * 512;
  }
  return files;
}

function computeA3mIdentity(querySeq: string, targetSeq: string): number {
  let matches = 0, aligned = 0, qi = 0, ti = 0;
  while (qi < querySeq.length && ti < targetSeq.length) {
    const qc = querySeq[qi], tc = targetSeq[ti];
    if (qc === '-') { qi++; continue; }
    if (tc === '-') { qi++; ti++; aligned++; continue; }
    if (tc >= 'a' && tc <= 'z') { ti++; continue; }
    aligned++;
    if (qc.toUpperCase() === tc.toUpperCase()) matches++;
    qi++; ti++;
  }
  return aligned > 0 ? Math.round(100 * matches / aligned) : 0;
}

function computeA3mCoverage(querySeq: string, targetSeq: string): number {
  const queryLen = querySeq.replace(/[a-z\-]/g, '').length;
  if (queryLen === 0) return 0;
  let covered = 0;
  for (const ch of targetSeq) {
    if (ch >= 'A' && ch <= 'Z') covered++;
  }
  return Math.min(100, Math.round(100 * covered / queryLen));
}

function estimateExpectValue(queryLen: number, targetSeq: string, identity: number): number {
  let alignedLen = 0;
  for (const ch of targetSeq) {
    if ((ch >= 'A' && ch <= 'Z') || ch === '-') alignedLen++;
  }
  if (alignedLen === 0 || identity <= 0) return 999;
  const bitScore = alignedLen * (identity / 100) * 2.0 - 5;
  return Math.min(999, queryLen * 1e8 * Math.pow(2, -Math.max(0, bitScore)));
}

export async function searchMSA(sequence: string, onStatus?: (msg: string) => void): Promise<AlignmentResult | null> {
  try {
    onStatus?.('Submitting to ColabFold MMseqs2…');
    const body = `q=${encodeURIComponent(`>query\n${sequence}\n`)}&mode=env`;
    const ticketResp = await fetch('https://api.colabfold.com/ticket/msa', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    });
    if (!ticketResp.ok) return null;
    const ticket = await ticketResp.json();
    const ticketId = ticket?.id;
    if (!ticketId) return null;
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 6000));
      onStatus?.(`Searching… (~${i * 6}s)`);
      try {
        const sr = await fetch(`https://api.colabfold.com/ticket/${ticketId}`);
        if (!sr.ok) continue;
        const st = await sr.json();
        if (st.status === 'COMPLETE') {
          const dr = await fetch(`https://api.colabfold.com/result/download/${ticketId}`);
          if (!dr.ok) return null;
          const blob = await dr.blob();
          let a3mText = '', m8Text = '';
          try {
            const ds = new DecompressionStream('gzip');
            const reader = blob.stream().pipeThrough(ds).getReader();
            const chunks: Uint8Array[] = [];
            // eslint-disable-next-line no-constant-condition
            while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
            const totalLen = chunks.reduce((a, c) => a + c.length, 0);
            const combined = new Uint8Array(totalLen);
            let off = 0;
            for (const c of chunks) { combined.set(c, off); off += c.length; }
            const tarFiles = decodeTarEntries(combined);
            for (const [name, content] of tarFiles) {
              if (name.endsWith('.a3m') && content.includes('>')) a3mText = content;
              if (name.endsWith('.m8')) m8Text = content;
            }
          } catch {
            try { const text = await blob.text(); if (text.includes('>')) a3mText = text; } catch { /* skip */ }
          }
          if (!a3mText || !a3mText.includes('>')) return null;
          const m8Hits = new Map<string, { identity: number; evalue: number; coverage: number }>();
          if (m8Text) {
            for (const line of m8Text.split('\n')) {
              const t = line.trim();
              if (!t || t.startsWith('#')) continue;
              const cols = t.split('\t');
              if (cols.length < 12) continue;
              const target = cols[1], identity = parseFloat(cols[2]) || 0;
              const alnLen = parseInt(cols[3]) || 0, evalue = parseFloat(cols[10]) || 0;
              const coverage = sequence.length > 0 ? Math.round(100 * alnLen / sequence.length) : 0;
              if (!m8Hits.has(target) || (m8Hits.get(target)!.identity < identity)) {
                m8Hits.set(target, { identity: Math.round(identity), evalue, coverage: Math.min(100, coverage) });
              }
            }
          }
          const entries: { name: string; seq: string }[] = [];
          let head: string | null = null; const buf: string[] = [];
          for (const ln of a3mText.split('\n')) {
            if (ln.startsWith('>')) { if (head !== null) entries.push({ name: head, seq: buf.join('') }); head = ln.slice(1).trim(); buf.length = 0; }
            else if (!ln.startsWith('#')) buf.push(ln.trim());
          }
          if (head !== null) entries.push({ name: head, seq: buf.join('') });
          if (entries.length < 2) return null;
          const queryEntry = entries[0];
          const homologs = entries.slice(1).map(e => {
            const rawAcc = e.name.split(/\s+/)[0];
            const ur = rawAcc.match(/UniRef\d+_([A-Z0-9]{6,10})/i);
            const cleanAcc = ur ? ur[1].toUpperCase() : rawAcc.split(/[|]/)[0];
            const m8 = m8Hits.get(rawAcc) || m8Hits.get(cleanAcc);
            const identity = m8?.identity ?? computeA3mIdentity(queryEntry.seq, e.seq);
            const coverage = m8?.coverage ?? computeA3mCoverage(queryEntry.seq, e.seq);
            const evalue = m8?.evalue ?? estimateExpectValue(sequence.length, e.seq, identity);
            return { id: cleanAcc, seqIdentity: identity, expectValue: evalue, queryCoverage: coverage };
          }).sort((a, b) => b.seqIdentity - a.seqIdentity);
          const seen = new Set<string>();
          const unique = homologs.filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; });
          return { totalSeqs: entries.length, querySeq: queryEntry.seq, homologs: unique };
        }
        if (st.status === 'ERROR') return null;
      } catch { continue; }
    }
    return null;
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// PDB ANALYSIS
// ═══════════════════════════════════════════════════════════════

export function extractConfidenceScores(pdbText: string): number[] {
  const vals: number[] = [];
  const seen = new Set<string>();
  for (const ln of pdbText.split('\n')) {
    if (!ln.startsWith('ATOM') || ln.length < 66) continue;
    if (ln.substring(12, 16).trim() !== 'CA') continue;
    const key = ln.substring(21, 27);
    if (seen.has(key)) continue;
    seen.add(key);
    const b = parseFloat(ln.substring(60, 66));
    if (!isNaN(b) && b >= 0 && b <= 100) vals.push(b);
  }
  return vals;
}

function extractSequenceFromPDB(pdbText: string): string {
  const aa3to1: Record<string, string> = {
    ALA:'A',ARG:'R',ASN:'N',ASP:'D',CYS:'C',GLN:'Q',GLU:'E',GLY:'G',
    HIS:'H',ILE:'I',LEU:'L',LYS:'K',MET:'M',PHE:'F',PRO:'P',SER:'S',
    THR:'T',TRP:'W',TYR:'Y',VAL:'V',
  };
  const seen = new Set<string>();
  const buf: string[] = [];
  for (const ln of pdbText.split('\n')) {
    if (!ln.startsWith('ATOM') || ln.length < 66) continue;
    if (ln.substring(12, 16).trim() !== 'CA') continue;
    const key = ln.substring(21, 27);
    if (seen.has(key)) continue;
    seen.add(key);
    buf.push(aa3to1[ln.substring(17, 20).trim()] || 'X');
  }
  return buf.join('');
}

export function binConfidence(scores: number[]) {
  const b = { 'Excellent (≥90)': 0, 'Good (70–89)': 0, 'Fair (50–69)': 0, 'Poor (<50)': 0 };
  for (const v of scores) {
    if (v >= 90) b['Excellent (≥90)']++;
    else if (v >= 70) b['Good (70–89)']++;
    else if (v >= 50) b['Fair (50–69)']++;
    else b['Poor (<50)']++;
  }
  return b;
}

// ═══════════════════════════════════════════════════════════════
// PRECISION ESTIMATION
// ═══════════════════════════════════════════════════════════════

export function computePrecisionMetrics(scores: number[]): PrecisionMetrics {
  const errors = scores.map(plddtToError);
  const mean = errors.reduce((a, b) => a + b, 0) / (errors.length || 1);
  const sorted = [...errors].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const bfactors = errors.map(e => 8 * Math.PI * Math.PI / 3 * e * e);
  const meanB = bfactors.reduce((a, b) => a + b, 0) / (bfactors.length || 1);
  return { avgPositionalError: mean, medianPositionalError: median, avgDisplacement: meanB, effectiveResolution: Math.sqrt(Math.max(0, meanB / 1.5)), perResidueErrors: errors };
}

// ═══════════════════════════════════════════════════════════════
// FLEXIBILITY / DISORDER
// ═══════════════════════════════════════════════════════════════

export function detectFlexibleRegions(scores: number[], threshold = 50, minLen = 5): FlexibilityReport {
  const n = scores.length;
  if (n === 0) return { segments: [], flexibleFraction: 0, totalResidues: 0 };
  const flags = scores.map(v => v < threshold ? 1 : 0);
  const segments: FlexibleRegion[] = [];
  let start: number | null = null;
  for (let i = 0; i <= n; i++) {
    if (i < n && flags[i] === 1) { if (start === null) start = i; }
    else if (start !== null) {
      const span = i - start;
      if (span >= minLen) {
        const seg = scores.slice(start, i);
        segments.push({ begin: start + 1, end: i, span, avgScore: seg.reduce((a, b) => a + b, 0) / seg.length, worstScore: Math.min(...seg) });
      }
      start = null;
    }
  }
  const flexCount = flags.reduce((a: number, b: number) => a + b, 0);
  return { segments, flexibleFraction: flexCount / n, totalResidues: n };
}

// ═══════════════════════════════════════════════════════════════
// PAE DOMAIN DECOMPOSITION
// ═══════════════════════════════════════════════════════════════

export function decomposePaeDomains(pae: number[][], minSize = 25): { domains: PaeDomainSegment[]; labels: number[] } {
  const n = pae.length;
  if (n < 2 * minSize) {
    return { domains: [{ domainId: 0, startRes: 1, endRes: n, residueCount: n, internalPae: matrixMean(pae) }], labels: Array(n).fill(0) };
  }
  const d0 = Math.max(0.5, 1.24 * Math.pow(Math.max(0, n - 15), 1 / 3) - 1.8);
  const affinity: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    const row_i = Array.isArray(pae[i]) ? pae[i] : [];
    for (let j = 0; j < n; j++) {
      const row_j = Array.isArray(pae[j]) ? pae[j] : [];
      const vij = typeof row_i[j] === 'number' ? row_i[j] : 30;
      const vji = typeof row_j[i] === 'number' ? row_j[i] : 30;
      const p = (vij + vji) / 2;
      affinity[i][j] = 1 / (1 + (p / d0) ** 2);
    }
    affinity[i][i] = 1;
  }
  const maxDom = Math.min(8, Math.floor(n / minSize));
  let bestLabels = Array(n).fill(0);
  let bestScore = -Infinity;
  for (let k = 2; k <= maxDom; k++) {
    const halfW = Math.max(5, Math.floor(minSize / 3));
    const bScores: number[] = [];
    for (let pos = minSize; pos < n - minSize; pos++) {
      let cross = 0, cnt = 0;
      for (let i = Math.max(0, pos - halfW); i < pos; i++) {
        for (let j = pos; j < Math.min(n, pos + halfW); j++) { cross += affinity[i][j]; cnt++; }
      }
      bScores.push(cnt > 0 ? cross / cnt : 1);
    }
    const ranked = bScores.map((s, i) => ({ pos: i + minSize, score: s })).sort((a, b) => a.score - b.score);
    const boundaries: number[] = [];
    for (const { pos } of ranked) {
      if (boundaries.length >= k - 1) break;
      if (boundaries.every(b => Math.abs(b - pos) >= minSize)) boundaries.push(pos);
    }
    boundaries.sort((a, b) => a - b);
    if (boundaries.length < k - 1) continue;
    const labels = Array(n).fill(0);
    for (let i = 0; i < n; i++) { let dom = 0; for (const b of boundaries) { if (i >= b) dom++; } labels[i] = dom; }
    let intraS = 0, interS = 0, intraC = 0, interC = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (labels[i] === labels[j]) { intraS += affinity[i][j]; intraC++; }
      else { interS += affinity[i][j]; interC++; }
    }
    const score = (intraC > 0 ? intraS / intraC : 0) - (interC > 0 ? interS / interC : 0);
    if (score > bestScore) { bestScore = score; bestLabels = [...labels]; }
  }
  const domMap = new Map<number, number[]>();
  bestLabels.forEach((l, i) => { if (!domMap.has(l)) domMap.set(l, []); domMap.get(l)!.push(i); });
  const domains: PaeDomainSegment[] = [];
  for (const [id, residues] of domMap) {
    if (residues.length < 2) continue;
    const rs = residues.sort((a, b) => a - b);
    let paeSum = 0, cnt = 0;
    for (const i of rs) for (const j of rs) { paeSum += pae[i][j]; cnt++; }
    domains.push({ domainId: id, startRes: rs[0] + 1, endRes: rs[rs.length - 1] + 1, residueCount: rs.length, internalPae: cnt > 0 ? paeSum / cnt : 0 });
  }
  domains.sort((a, b) => a.startRes - b.startRes);
  return { domains, labels: bestLabels };
}

function matrixMean(m: number[][]): number {
  let s = 0, c = 0;
  for (const row of m) {
    if (!Array.isArray(row)) continue;
    for (const v of row) {
      if (typeof v === 'number' && !isNaN(v)) { s += v; c++; }
    }
  }
  return c > 0 ? s / c : 0;
}

// ═══════════════════════════════════════════════════════════════
// PROTEIN LOADING PIPELINE (Enhanced with chunked folding)
// ═══════════════════════════════════════════════════════════════

export async function loadProteinRecord(
  input: { accession?: string; sequence?: string; label: string; mgypId?: string },
  onStatus?: (msg: string) => void
): Promise<ProteinRecord> {
  let pdbText = '', paeMatrix: number[][] | null = null, uniprotMeta: UniProtMeta | null = null;
  let accession = input.accession || '', chain = input.sequence || '';
  let origin: ProteinRecord['origin'] = 'user-upload';
  let chunkInfo: ChunkInfo | undefined;
  let precomputedScores: number[] | undefined;

  // 1. Try ESM Atlas for MGYP IDs
  if (input.mgypId && looksLikeMGYP(input.mgypId)) {
    onStatus?.(`Fetching from ESM Metagenomic Atlas: ${input.mgypId}…`);
    const atlasResult = await fetchESMAtlasStructure(input.mgypId, onStatus);
    if (atlasResult) {
      pdbText = atlasResult.pdbText;
      paeMatrix = atlasResult.paeMatrix;
      origin = 'esm-atlas';
      if (atlasResult.plddt) precomputedScores = atlasResult.plddt;
      // Try to get the sequence
      const seq = await fetchESMAtlasSequence(input.mgypId);
      if (seq) chain = seq;
    }
  }

  // 2. Try AlphaFold DB for UniProt accessions
  if (!pdbText && accession) {
    onStatus?.(`Querying AlphaFold DB for ${accession}…`);
    const afdb = await queryAlphaFoldDB(accession);
    if (afdb?.pdbUrl) {
      onStatus?.('Downloading structure…');
      try {
        pdbText = await downloadCoordinates(afdb.pdbUrl);
        origin = 'alphafold-db';
        paeMatrix = await downloadPAE(afdb.paeUrl);
      } catch { /* fall through */ }
    }
  }

  // 3. ESMFold (direct or chunked) as fallback
  if (!pdbText && chain) {
    const result = await runESMFold(chain, onStatus);
    pdbText = result.pdbText;
    origin = result.origin;
    if (result.chunkInfo) chunkInfo = result.chunkInfo;
    if (result.confidenceScores) precomputedScores = result.confidenceScores;
  }

  if (!pdbText) throw new Error('No structure available.');

  // Extract confidence scores
  let confidenceScores = precomputedScores || extractConfidenceScores(pdbText);
  // Scale pLDDT if they're in [0,1] range (ESM Atlas sometimes returns normalized values)
  if (confidenceScores.length > 0 && confidenceScores.every(s => s <= 1)) {
    confidenceScores = confidenceScores.map(s => s * 100);
  }
  const meanConfidence = confidenceScores.length > 0 ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length : 0;

  if (!chain) chain = extractSequenceFromPDB(pdbText);

  if (accession) {
    onStatus?.('Fetching metadata…');
    uniprotMeta = await fetchUniProtMeta(accession);
  }

  let annotations: Annotation[] = [];
  if (accession) {
    try {
      const r = await fetch(`https://rest.uniprot.org/uniprotkb/${accession}.json`);
      if (r.ok) annotations = parseUniProtAnnotations(await r.json());
    } catch { /* skip */ }
    if (!annotations.length) {
      try { annotations = await fetchInterProAnnotations(accession); } catch { /* skip */ }
    }
  }

  onStatus?.('Computing disorder profile…');
  const disorderProfile = predictDisorder(chain);
  const restraintProfile = classifyResidues(confidenceScores, disorderProfile, 0.6, 310);

  return {
    label: input.label,
    uniprotId: accession || input.mgypId || '',
    chain, pdbText, paeMatrix, uniprotMeta, annotations,
    confidenceScores, meanConfidence, origin,
    alignmentResult: null,
    disorderProfile, restraintProfile,
    createdAt: Date.now(),
    chunkInfo,
  };
}

// ═══════════════════════════════════════════════════════════════
// MD READINESS ASSESSMENT
// ═══════════════════════════════════════════════════════════════

export function assessMDReadiness(protein: ProteinRecord): MDReadinessCheck {
  const mean = protein.meanConfidence;
  const seqLen = protein.chain.length;
  const flexibility = detectFlexibleRegions(protein.confidenceScores);
  const idrCount = protein.restraintProfile.filter(r => r.isIDR).length;
  const idrFraction = seqLen > 0 ? idrCount / seqLen : 0;

  const confStatus = mean >= 80 ? '✅ Excellent' : mean >= 65 ? '⚠️ Moderate' : '❌ Low';
  const confDetail = `pLDDT ${mean.toFixed(1)}`;
  const disorderStatus = flexibility.flexibleFraction < 0.1 ? '✅ Minimal' : flexibility.flexibleFraction < 0.3 ? '⚠️ Moderate' : '❌ Significant';
  const disorderDetail = `${(flexibility.flexibleFraction * 100).toFixed(1)}% low-confidence`;

  const estimatedAtoms = seqLen * 16 * 8;
  const sizeStatus = seqLen <= 300 ? '✅ Compact' : seqLen <= 800 ? '⚠️ Medium' : '❌ Large';
  const sizeDetail = `${seqLen} residues (~${(estimatedAtoms / 1000).toFixed(0)}k atoms with solvent)`;

  let domainStatus = '❓ Unknown', domainDetail = 'No PAE data';
  if (protein.paeMatrix) {
    const { domains } = decomposePaeDomains(protein.paeMatrix);
    domainStatus = domains.length <= 1 ? '✅ Single domain' : '⚠️ Multi-domain';
    domainDetail = `${domains.length} domain(s)`;
  }

  const idrStatus = idrFraction < 0.1 ? '✅ Ordered' : idrFraction < 0.3 ? '⚠️ Partial IDR' : '🔬 Mostly IDR';
  const idrDetail = `${(idrFraction * 100).toFixed(1)}% predicted intrinsically disordered`;

  const recommendations: string[] = [];
  if (protein.chunkInfo) recommendations.push(`⚠️ Structure was assembled from ${protein.chunkInfo.totalChunks} overlapping chunks — junction regions may be less accurate`);
  if (idrFraction > 0.3) recommendations.push('High IDR content: consider enhanced sampling (REMD) or coarse-grained MD');
  if (idrFraction > 0.1) recommendations.push('IDR regions detected: restraints automatically set to zero for these regions');
  if (mean < 65) recommendations.push('Low average confidence: physics-based restraints will be weak, allowing exploration');
  if (seqLen > 500) recommendations.push('Large system: use ≥500 ps equilibration');
  if (mean >= 80 && idrFraction < 0.1) recommendations.push('Well-suited for standard atomistic MD');
  recommendations.push('Use ≥10 ns production for publishable results');

  const nsPerDay = seqLen < 200 ? 150 : seqLen < 500 ? 80 : 30;
  const estimatedGpuHours = 24 / nsPerDay;

  const overallStatus: MDReadinessCheck['overallStatus'] =
    mean >= 70 && flexibility.flexibleFraction < 0.3 && seqLen <= 1000 ? 'ready' : mean >= 50 ? 'caution' : 'unsuitable';

  return {
    overallStatus,
    confidenceGrade: { status: confStatus, detail: confDetail },
    disorderCheck: { status: disorderStatus, detail: disorderDetail },
    sizeCheck: { status: sizeStatus, detail: sizeDetail },
    domainCheck: { status: domainStatus, detail: domainDetail },
    idrCheck: { status: idrStatus, detail: idrDetail },
    recommendations, estimatedAtoms, estimatedGpuHours,
  };
}

// ═══════════════════════════════════════════════════════════════
// MD SCRIPT GENERATOR v4.1
// ═══════════════════════════════════════════════════════════════

export function getDefaultMDConfig(): MDConfig {
  return {
    forceField: 'AMBER ff14SB', waterModel: 'TIP3P', boxGeometry: 'dodecahedron',
    boxPadding: 1.0, saltConcentration: 0.15, targetpH: 7.0,
    temperature: 310, pressure: 1.0, integrationStep: 0.002,
    equilibrationDuration: 500, productionDuration: 10000,
    snapshotFrequency: 5000, logPrintEvery: 5,
    restraintStrategy: 'physics-idr-aware', excludeResidues: ['SO4', 'HOH', 'EDO', 'GOL'],
    numRelaxationStages: 10, gapHandling: 'skip-terminal', gpuPrecision: 'mixed',
    computeRMSD: true, computeRMSF: true, checkpointInterval: 50000,
    idrThreshold: 0.6,
  };
}

export function generateMDScript(config: MDConfig, protein: ProteinRecord): string {
  const ffInfo = FORCEFIELD_OPTIONS[config.forceField];
  const waterInfo = WATER_MODELS[config.waterModel];
  const usePhysics = config.restraintStrategy === 'physics-idr-aware' || config.restraintStrategy === 'physics-basic';
  const useIDR = config.restraintStrategy === 'physics-idr-aware';

  let waterXmlPath: string;
  if (config.forceField.startsWith('CHARMM')) {
    waterXmlPath = `charmm36/${waterInfo?.xmlSuffix || 'water'}.xml`;
  } else {
    const pfx = config.forceField.includes('14') ? 'amber14' : config.forceField.includes('99') ? 'amber99sb' : 'amber14';
    waterXmlPath = `${pfx}/${waterInfo?.xmlSuffix || 'tip3p'}.xml`;
  }

  const kValues = protein.restraintProfile.map(r => r.kValue);
  const chunkedNote = protein.chunkInfo ? `\n# ⚠️ CHUNKED STRUCTURE: Assembled from ${protein.chunkInfo.totalChunks} overlapping fragments\n# Junction regions may have lower accuracy. Consider visual inspection.\n` : '';

  return `#!/usr/bin/env python3
"""
AlphaFold Fusion — Dynamics Engine v4.1 (Physics-Based, IDR-Aware)
${'═'.repeat(60)}
Protein:        ${protein.label}
Origin:         ${protein.origin}
Length:         ${protein.chain.length} residues
Mean pLDDT:     ${protein.meanConfidence.toFixed(1)}
Force field:    ${config.forceField}
Water model:    ${config.waterModel}
Temperature:    ${config.temperature} K
Production:     ${(config.productionDuration / 1000).toFixed(1)} ns
Restraints:     ${config.restraintStrategy}
IDR residues:   ${protein.restraintProfile.filter(r => r.isIDR).length} (k=0)
${chunkedNote}
References:
  - Jumper et al. 2021 Nature 596:583 (pLDDT calibration)
  - Campen et al. 2008 J Mol Biol 382:956 (disorder propensity)
  - Kabsch 1976 Acta Cryst A32:922 (RMSD alignment)
  - Lin et al. 2023 Science 379:1123 (ESMFold)

Requirements:
  pip install openmm pdbfixer numpy${config.computeRMSF ? ' mdtraj' : ''}
"""

import os, sys, glob, time, math
import numpy as np
from openmm.app import *
from openmm import *
from openmm.unit import *
from pdbfixer import PDBFixer


class ForgeConfig:
    INPUT_PDB = sys.argv[1] if len(sys.argv) > 1 else "structure.pdb"
    OUTPUT_TRAJECTORY = "forge_production.nc"
    SOLVATED_PDB = "forge_solvated.pdb"
    FF_PROTEIN = "${ffInfo?.xml || 'amber14-all.xml'}"
    FF_WATER = "${waterXmlPath}"
    WATER_GEOMETRY = "${waterInfo?.geometry || 'tip3p'}"
    BOX_SHAPE = "${config.boxGeometry}"
    BOX_PADDING = ${config.boxPadding}
    IONIC_STRENGTH = ${config.saltConcentration}
    PH = ${config.targetpH}
    TEMPERATURE = ${config.temperature}
    PRESSURE = ${config.pressure}
    TIMESTEP = ${config.integrationStep}
    EQUILIBRATION_PS = ${config.equilibrationDuration}
    PRODUCTION_PS = ${config.productionDuration}
    SNAPSHOT_EVERY = ${config.snapshotFrequency}
    LOG_EVERY = ${config.logPrintEvery}
    RESTRAINT_STRATEGY = "${config.restraintStrategy}"
    NUM_RELAXATION_STAGES = ${config.numRelaxationStages}
    GAP_HANDLING = "${config.gapHandling}"
    GPU_PRECISION = "${config.gpuPrecision}"
    COMPUTE_RMSD = ${config.computeRMSD ? 'True' : 'False'}
    COMPUTE_RMSF = ${config.computeRMSF ? 'True' : 'False'}
    CHECKPOINT_INTERVAL = ${config.checkpointInterval}
    STRIP_RESIDUES = ${JSON.stringify(config.excludeResidues)}
${usePhysics ? `
    RESTRAINT_K_VALUES = [${kValues.map(v => v.toFixed(1)).join(', ')}]
    IDR_FLAGS = [${protein.restraintProfile.map(r => r.isIDR ? '1' : '0').join(', ')}]
` : ''}


class FusionEngine:
    def __init__(self, cfg):
        self.cfg = cfg
        self.fixer = None
        self.modeller = None
        self.forcefield = None
        self.simulation = None
        self.system = None
        self.initial_ca_positions = None
        self._log("AlphaFold Fusion Engine v4.1 initialized")

    def _log(self, msg, icon="⚙️"):
        print(f"{icon} {msg}")

    @staticmethod
    def _kabsch_rmsd(P, Q):
        cP = np.mean(P, axis=0)
        cQ = np.mean(Q, axis=0)
        p = P - cP
        q = Q - cQ
        H = p.T @ q
        U, S, Vt = np.linalg.svd(H)
        d = np.linalg.det(Vt.T @ U.T)
        sign = np.eye(3)
        sign[2, 2] = np.sign(d)
        R = Vt.T @ sign @ U.T
        p_rot = p @ R.T
        return np.sqrt(np.mean(np.sum((p_rot - q)**2, axis=1)))

    def prepare_structure(self):
        self._log("Phase 1: Structure Preparation", "🔧")
        self.fixer = PDBFixer(filename=self.cfg.INPUT_PDB)
        modeller = Modeller(self.fixer.topology, self.fixer.positions)
        to_remove = [r for r in modeller.topology.residues() if r.name in self.cfg.STRIP_RESIDUES]
        if to_remove:
            modeller.delete(to_remove)
            self.fixer.topology = modeller.topology
            self.fixer.positions = modeller.positions
            self.fixer.missingResidues = {}
        self.fixer.findMissingResidues()
        if self.fixer.missingResidues:
            if self.cfg.GAP_HANDLING == 'skip-all':
                self.fixer.missingResidues = {}
            elif self.cfg.GAP_HANDLING == 'skip-terminal':
                chains = list(self.fixer.topology.chains())
                to_del = []
                for key in self.fixer.missingResidues:
                    ci, ri = key
                    if ci < len(chains):
                        nr = len(list(chains[ci].residues()))
                        tz = max(3, int(nr * 0.05))
                        if ri < tz or ri > nr - tz:
                            to_del.append(key)
                for k in to_del:
                    del self.fixer.missingResidues[k]
        self.fixer.findMissingAtoms()
        self.fixer.addMissingAtoms()
        self.fixer.addMissingHydrogens(self.cfg.PH)
        self._log("Structure preparation complete", "✅")

    def solvate(self):
        self._log("Phase 2: Solvation", "💧")
        self.modeller = Modeller(self.fixer.topology, self.fixer.positions)
        ff_args = [self.cfg.FF_PROTEIN, self.cfg.FF_WATER]
        try:
            self.forcefield = ForceField(*ff_args)
        except Exception:
            alt = self.cfg.FF_WATER.split("/")[-1]
            self.forcefield = ForceField(self.cfg.FF_PROTEIN, alt)
        self.modeller.addSolvent(
            self.forcefield, padding=self.cfg.BOX_PADDING * nanometer,
            model=self.cfg.WATER_GEOMETRY, boxShape=self.cfg.BOX_SHAPE,
            ionicStrength=self.cfg.IONIC_STRENGTH * molar
        )
        self._log(f"System: {self.modeller.topology.getNumAtoms():,} atoms", "📦")
        with open(self.cfg.SOLVATED_PDB, 'w') as f:
            PDBFile.writeFile(self.modeller.topology, self.modeller.positions, f)

    def minimize(self):
        self._log("Phase 3: System Setup", "⚡")
        self.system = self.forcefield.createSystem(
            self.modeller.topology, nonbondedMethod=PME,
            nonbondedCutoff=1.0*nanometer, constraints=HBonds, rigidWater=True
        )
        self.system.addForce(MonteCarloBarostat(self.cfg.PRESSURE*bar, self.cfg.TEMPERATURE*kelvin))
        formula = "0.5 * k_scale * k_res * periodicdistance(x,y,z,x0,y0,z0)^2"
        rf = CustomExternalForce(formula)
        rf.addGlobalParameter("k_scale", 1.0)
        rf.addPerParticleParameter("k_res")
        rf.addPerParticleParameter("x0")
        rf.addPerParticleParameter("y0")
        rf.addPerParticleParameter("z0")
        protein_bb = {'CA', 'C', 'N'}
        positions_nm = self.modeller.positions.value_in_unit(nanometer)
        restrained_count = 0
        idr_skipped = 0
        ca_indices = []
${usePhysics ? `
        k_values = self.cfg.RESTRAINT_K_VALUES
        idr_flags = self.cfg.IDR_FLAGS if hasattr(self.cfg, 'IDR_FLAGS') else []
` : `
        UNIFORM_K = 1000.0
`}
        for atom in self.modeller.topology.atoms():
            if atom.name == 'CA':
                ca_indices.append(atom.index)
            if atom.name not in protein_bb:
                continue
            pos = positions_nm[atom.index]
            ri = atom.residue.index
${usePhysics ? `            k_val = k_values[ri] if ri < len(k_values) else 0.0
${useIDR ? `            if ri < len(idr_flags) and idr_flags[ri]:
                k_val = 0.0
                idr_skipped += 1
                continue
` : ''}` : `            k_val = UNIFORM_K
`}
            if k_val > 0:
                rf.addParticle(atom.index, [k_val, pos[0], pos[1], pos[2]])
                restrained_count += 1
        self.system.addForce(rf)
        self._log(f"Restrained {restrained_count} backbone atoms", "🎯")
${useIDR ? `        self._log(f"IDR atoms skipped (k=0): {idr_skipped}", "🔬")
` : ''}
        self.initial_ca_positions = np.array([positions_nm[i] for i in ca_indices])
        platform = None
        properties = {}
        for pname in ['CUDA', 'OpenCL', 'CPU']:
            try:
                platform = Platform.getPlatformByName(pname)
                if pname in ['CUDA', 'OpenCL']:
                    properties = {'Precision': self.cfg.GPU_PRECISION}
                break
            except Exception:
                continue
        integrator = LangevinMiddleIntegrator(
            self.cfg.TEMPERATURE*kelvin, 2/picosecond, self.cfg.TIMESTEP*picoseconds
        )
        if platform and properties:
            self.simulation = Simulation(self.modeller.topology, self.system, integrator, platform, properties)
        else:
            self.simulation = Simulation(self.modeller.topology, self.system, integrator)
        self.simulation.context.setPositions(self.modeller.positions)
        self._log(f"Platform: {self.simulation.context.getPlatform().getName()}", "💻")
        for stage, (ks, tol) in enumerate([(1.0, 20.0), (0.1, 10.0), (0.0, 2.0)], 1):
            self.simulation.context.setParameter("k_scale", ks)
            self.simulation.minimizeEnergy(tolerance=tol*kilojoule_per_mole/nanometer)
            self._log(f"  Min stage {stage}/3: k_scale={ks}", "  ")
        state = self.simulation.context.getState(getPositions=True, enforcePeriodicBox=False)
        with open('forge_minimized.cif', 'w') as f:
            PDBxFile.writeFile(self.simulation.topology, state.getPositions(), f)
        self._log("Minimization complete", "✅")

    def equilibrate(self):
        self._log("Phase 4: Equilibration", "🌡️")
        self.simulation.context.setVelocitiesToTemperature(self.cfg.TEMPERATURE*kelvin)
        for i in range(self.system.getNumForces()):
            f = self.system.getForce(i)
            if isinstance(f, MonteCarloBarostat):
                f.setFrequency(0); break
        self.simulation.context.reinitialize(preserveState=True)
        self.simulation.context.setParameter("k_scale", 1.0)
        nvt_steps = int(100 / self.cfg.TIMESTEP)
        self.simulation.step(nvt_steps)
        self._log("NVT heating complete (100 ps)", "🔥")
        for i in range(self.system.getNumForces()):
            f = self.system.getForce(i)
            if isinstance(f, MonteCarloBarostat):
                f.setFrequency(25); break
        self.simulation.context.reinitialize(preserveState=True)
        n_stages = self.cfg.NUM_RELAXATION_STAGES
        steps_per = int((self.cfg.EQUILIBRATION_PS / self.cfg.TIMESTEP) / n_stages)
        for stage in range(n_stages):
            ks = 1.0 - (stage / max(1, n_stages - 1))
            self.simulation.context.setParameter("k_scale", ks)
            self.simulation.step(steps_per)
            self._log(f"  Stage {stage+1}/{n_stages}: k_scale={ks:.2f}", "  ")
        state = self.simulation.context.getState(getPositions=True, enforcePeriodicBox=False)
        with open('forge_equilibrated.cif', 'w') as f:
            PDBxFile.writeFile(self.simulation.topology, state.getPositions(), f)
        self._log("Equilibration complete", "✅")

    def produce(self):
        self._log("Phase 5: Production", "🚀")
        self.simulation.context.setParameter("k_scale", 0.0)
        self.simulation.reporters.clear()
        try:
            from mdtraj.reporters import NetCDFReporter
            self.simulation.reporters.append(NetCDFReporter(self.cfg.OUTPUT_TRAJECTORY, self.cfg.SNAPSHOT_EVERY))
        except ImportError:
            self.simulation.reporters.append(DCDReporter('forge_production.dcd', self.cfg.SNAPSHOT_EVERY))
        total_steps = int(self.cfg.PRODUCTION_PS / self.cfg.TIMESTEP)
        chunk = max(1, total_steps // 100)
        ca_indices = [a.index for a in self.modeller.topology.atoms() if a.name == 'CA']
        rmsd_values = []
        energy_log = []
        t_start = time.time()
        for pct in range(1, 101):
            self.simulation.step(chunk)
            if pct % 10 == 0:
                self.simulation.saveCheckpoint('forge_checkpoint.chk')
            if pct % self.cfg.LOG_EVERY == 0:
                state = self.simulation.context.getState(getEnergy=True, getPositions=True)
                pe = state.getPotentialEnergy().value_in_unit(kilojoules_per_mole)
                energy_log.append(pe)
                rmsd_str = "N/A"
                if self.cfg.COMPUTE_RMSD and self.initial_ca_positions is not None:
                    pos = state.getPositions(asNumpy=True).value_in_unit(nanometer)
                    ca_pos = np.array(pos[ca_indices])
                    rmsd_A = self._kabsch_rmsd(ca_pos, self.initial_ca_positions) * 10
                    rmsd_str = f"{rmsd_A:.2f}"
                    rmsd_values.append(rmsd_A)
                print(f"{pct:>3}% step={self.simulation.currentStep:>10} E={pe:>12.1f} RMSD={rmsd_str}")
        elapsed = time.time() - t_start
        self._log(f"Done in {elapsed/60:.1f} min", "🏁")
        if rmsd_values:
            np.savetxt('forge_rmsd.csv', rmsd_values, header='RMSD_Angstrom', comments='')
        if energy_log:
            np.savetxt('forge_energy.csv', energy_log, header='E_pot_kJ_per_mol', comments='')

    def analyze(self):
        self._log("Phase 6: Analysis", "📊")
        if self.cfg.COMPUTE_RMSF:
            try:
                import mdtraj as md
                traj_file = self.cfg.OUTPUT_TRAJECTORY
                if not os.path.exists(traj_file):
                    traj_file = 'forge_production.dcd'
                if os.path.exists(traj_file) and os.path.exists('forge_equilibrated.cif'):
                    traj = md.load(traj_file, top='forge_equilibrated.cif')
                    ca = traj.topology.select('name CA')
                    if len(ca) > 0:
                        t = traj.atom_slice(ca)
                        t.superpose(t, frame=0)
                        rmsf = md.rmsf(t, t, frame=0) * 10
                        np.savetxt('forge_rmsf.csv', rmsf, header='RMSF_Angstrom', comments='')
                        self._log(f"RMSF: mean={np.mean(rmsf):.2f} max={np.max(rmsf):.2f} Å", "📏")
            except ImportError:
                self._log("Install mdtraj for RMSF: pip install mdtraj", "ℹ️")
            except Exception as e:
                self._log(f"RMSF failed: {e}", "⚠️")

    def run(self):
        print("\\n" + "━" * 55)
        print("  AlphaFold Fusion — Dynamics Engine v4.1")
        print("━" * 55 + "\\n")
        for p in ["forge_*.nc","forge_*.dcd","forge_*.cif","forge_*.csv","forge_*.chk"]:
            for f in glob.glob(p):
                try: os.remove(f)
                except: pass
        self.prepare_structure()
        self.solvate()
        self.minimize()
        self.equilibrate()
        self.produce()
        self.analyze()
        print("\\n━━━ Simulation complete! ━━━")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python forge_dynamics.py structure.pdb")
        sys.exit(1)
    FusionEngine(ForgeConfig).run()
`;
}

export function getScriptAnnotations(config: MDConfig): ScriptSection[] {
  const sections: ScriptSection[] = [
    { id: 'physics-k', title: 'Physics-based force constants (equipartition theorem)', description: 'k = 3kBT/σ² where σ is the expected positional error from the AlphaFold pLDDT calibration curve (Jumper et al. 2021). At 310K, kBT ≈ 2.577 kJ/mol. High pLDDT → small σ → strong k. Low pLDDT → large σ → weak k.', severity: 'innovation' },
    { id: 'idr-fix', title: 'IDR-aware restraints: disordered regions are FREE', description: 'CRITICAL FIX: Low pLDDT often indicates intrinsically disordered regions (IDRs), not just poor predictions. These regions MUST remain flexible. The engine detects IDRs using amino acid propensity (Campen et al. 2008) and sets k=0 for them.', severity: 'critical' },
    { id: 'kabsch', title: 'Kabsch-aligned RMSD (SVD superposition)', description: 'RMSD is computed after optimal rigid-body alignment using SVD decomposition (Kabsch 1976).', severity: 'innovation' },
    { id: 'single-force', title: 'Single restraint force (no double-counting)', description: 'One CustomExternalForce with per-particle k_res × global k_scale. k_scale ramps 1.0→0.0 during equilibration.', severity: 'info' },
    { id: 'gap-handling', title: `Gap handling: ${config.gapHandling}`, description: config.gapHandling === 'skip-terminal' ? 'Terminal gaps skipped. Internal gaps modeled.' : 'All gaps handled per configuration.', severity: 'info' },
    { id: 'gpu', title: `GPU: ${config.gpuPrecision} precision`, description: 'Auto-selects CUDA > OpenCL > CPU.', severity: 'info' },
  ];
  return sections;
}

// ═══════════════════════════════════════════════════════════════
// REPORT & SESSION
// ═══════════════════════════════════════════════════════════════

export function generateAnalysisReport(protein: ProteinRecord) {
  const flexibility = detectFlexibleRegions(protein.confidenceScores);
  const precision = computePrecisionMetrics(protein.confidenceScores);
  const idrCount = protein.restraintProfile.filter(r => r.isIDR).length;
  return {
    _format: 'AlphaFoldFusion_Report_v4.1',
    _generated: new Date().toISOString(),
    protein: protein.label, accession: protein.uniprotId,
    sequenceLength: protein.chain.length, origin: protein.origin,
    meanConfidence: protein.meanConfidence,
    confidenceDistribution: binConfidence(protein.confidenceScores),
    precision: { avgError_A: precision.avgPositionalError, avgBfactor: precision.avgDisplacement, effectiveResolution: precision.effectiveResolution },
    flexibility: { fraction: flexibility.flexibleFraction, regionCount: flexibility.segments.length, regions: flexibility.segments },
    disorder: { idrResidueCount: idrCount, idrFraction: protein.chain.length > 0 ? idrCount / protein.chain.length : 0 },
    annotations: protein.annotations, metadata: protein.uniprotMeta, hasPAE: !!protein.paeMatrix,
    chunkInfo: protein.chunkInfo || null,
  };
}

export function persistSession(proteins: ProteinRecord[]) {
  try {
    const summary = proteins.map(p => ({ label: p.label, acc: p.uniprotId, conf: p.meanConfidence, origin: p.origin, ts: p.createdAt }));
    localStorage.setItem('af_fusion_session', JSON.stringify(summary));
  } catch { /* quota */ }
}

/**
 * Determine the folding strategy description for a given sequence length
 */
export function getFoldingStrategy(seqLen: number): { strategy: string; description: string; color: string } {
  if (seqLen <= ESMFOLD_DIRECT_LIMIT) {
    return { strategy: 'Direct ESMFold', description: `≤${ESMFOLD_DIRECT_LIMIT} aa — single API call`, color: 'text-green-600' };
  }
  if (seqLen <= 600) {
    return { strategy: 'ESMFold (try direct, fallback chunked)', description: `${seqLen} aa — will attempt direct, auto-fallback to chunks`, color: 'text-blue-600' };
  }
  if (seqLen <= ESMFOLD_MAX_LENGTH) {
    const chunks = computeChunkBoundaries(seqLen, ESMFOLD_CHUNK_SIZE, ESMFOLD_CHUNK_OVERLAP);
    return { strategy: `Chunked ESMFold (${chunks.length} fragments)`, description: `${seqLen} aa → ${chunks.length} overlapping chunks of ~${ESMFOLD_CHUNK_SIZE} aa`, color: 'text-amber-600' };
  }
  return { strategy: 'Too long', description: `${seqLen} aa exceeds maximum (${ESMFOLD_MAX_LENGTH})`, color: 'text-red-600' };
}
