import { useState, useEffect } from 'react';
import {
  type ProteinRecord, type MDConfig, type MDReadinessCheck, type ScriptSection,
  SHOWCASE_PROTEINS, FORCEFIELD_OPTIONS,
  assessMDReadiness, getDefaultMDConfig, generateMDScript, getScriptAnnotations,
  physicsBasedK, plddtToError,
} from '../../forge-engine';
import { PhysicsRestraintProfile } from '../charts/PhysicsRestraintProfile';
import { ChunkInfoBanner } from '../ui/ChunkInfoBanner';

export function MDLabPage({ protein, onDemo }: {
  protein: ProteinRecord | null; onDemo: (id: string, label: string) => void;
}) {
  const [config, setConfig] = useState<MDConfig>(getDefaultMDConfig());
  const [showScript, setShowScript] = useState(false);
  const [readiness, setReadiness] = useState<MDReadinessCheck | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  useEffect(() => {
    protein ? setReadiness(assessMDReadiness(protein)) : setReadiness(null);
  }, [protein]);

  const updateConfig = (partial: Partial<MDConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const compatWater = FORCEFIELD_OPTIONS[config.forceField]?.compatibleWater || [];
  useEffect(() => {
    if (!compatWater.includes(config.waterModel))
      updateConfig({ waterModel: compatWater[0] || 'TIP3P' });
  }, [config.forceField, compatWater, config.waterModel]);

  if (!protein) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        🧪 MD Simulation Lab
      </h2>
      <p className="text-gray-500">Load a protein first.</p>
      <div className="flex flex-wrap gap-2">
        {SHOWCASE_PROTEINS.slice(0, 4).map(p => (
          <button key={p.id} onClick={() => onDemo(p.id, p.label)}
            className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );

  const script = generateMDScript(config, protein);
  const annotations: ScriptSection[] = getScriptAnnotations(config);
  const idrCount = protein.restraintProfile.filter(r => r.isIDR).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        🧪 MD Lab — {protein.label}
      </h2>

      {protein.chunkInfo && <ChunkInfoBanner protein={protein} />}

      {idrCount > 0 && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h3 className="font-bold text-orange-800">
            🔬 IDR Detection: {idrCount} residues identified as intrinsically disordered
          </h3>
          <p className="text-xs text-orange-700 mt-1">
            These residues receive <strong>zero restraint</strong> during equilibration.
          </p>
        </div>
      )}

      {readiness && (
        <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${
          readiness.overallStatus === 'ready' ? 'border-green-500' :
          readiness.overallStatus === 'caution' ? 'border-amber-500' : 'border-red-500'
        }`}>
          <h3 className="font-bold text-lg mb-3">
            {readiness.overallStatus === 'ready' ? '✅' :
             readiness.overallStatus === 'caution' ? '⚠️' : '❌'} MD Readiness
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Confidence', data: readiness.confidenceGrade },
              { label: 'Disorder', data: readiness.disorderCheck },
              { label: 'System Size', data: readiness.sizeCheck },
              { label: 'Domains', data: readiness.domainCheck },
              { label: 'IDR Content', data: readiness.idrCheck },
            ].map(({ label, data }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-500">{label}</div>
                <div className="text-sm font-bold">{data.status}</div>
                <div className="text-xs text-gray-500">{data.detail}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="bg-teal-50 rounded-lg p-3 text-center flex-1">
              <div className="text-xs text-gray-500">Est. Atoms</div>
              <div className="text-lg font-bold text-teal-700">
                {(readiness.estimatedAtoms / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="bg-teal-50 rounded-lg p-3 text-center flex-1">
              <div className="text-xs text-gray-500">GPU h/ns</div>
              <div className="text-lg font-bold text-teal-700">
                {readiness.estimatedGpuHours.toFixed(1)}
              </div>
            </div>
          </div>
          {readiness.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              {readiness.recommendations.map((r, i) => (
                <div key={i} className="text-xs text-gray-600">💡 {r}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-sm text-emerald-700">Physics-Based Restraint Profile</h3>
        <PhysicsRestraintProfile protein={protein} />
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <div><strong>pLDDT 95:</strong> σ≈{plddtToError(95).toFixed(2)}Å → k≈{physicsBasedK(95).toFixed(0)} (strong)</div>
          <div><strong>pLDDT 70:</strong> σ≈{plddtToError(70).toFixed(2)}Å → k≈{physicsBasedK(70).toFixed(0)} (moderate)</div>
          <div><strong>pLDDT 50:</strong> σ≈{plddtToError(50).toFixed(2)}Å → k≈{physicsBasedK(50).toFixed(0)} (weak)</div>
          <div><strong>IDR residue:</strong> k=0 regardless of pLDDT</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="font-bold text-emerald-700">⚙️ Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Force Field</span>
            <select value={config.forceField} onChange={e => updateConfig({ forceField: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
              {Object.keys(FORCEFIELD_OPTIONS).map(ff => <option key={ff}>{ff}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Water Model</span>
            <select value={config.waterModel} onChange={e => updateConfig({ waterModel: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
              {compatWater.map(w => <option key={w}>{w}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Temperature (K)</span>
            <input type="number" value={config.temperature}
              onChange={e => updateConfig({ temperature: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm" min={200} max={500} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Production (ps)</span>
            <input type="number" value={config.productionDuration}
              onChange={e => updateConfig({ productionDuration: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm"
              min={1000} max={1000000} step={1000} />
            <span className="text-xs text-gray-400">{(config.productionDuration / 1000).toFixed(1)} ns</span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Restraints</span>
            <select value={config.restraintStrategy}
              onChange={e => updateConfig({ restraintStrategy: e.target.value as MDConfig['restraintStrategy'] })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
              <option value="physics-idr-aware">🎯 Physics + IDR-Aware</option>
              <option value="physics-basic">Physics (no IDR)</option>
              <option value="uniform">Uniform</option>
              <option value="none">None</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">IDR Threshold</span>
            <input type="number" value={config.idrThreshold}
              onChange={e => updateConfig({ idrThreshold: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border rounded text-sm"
              min={0.3} max={0.9} step={0.05} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-sm text-emerald-700">📝 Scientific Notes</h3>
        <div className="space-y-2">
          {annotations.map((a: ScriptSection) => (
            <div key={a.id}
              onClick={() => setActiveAnnotation(activeAnnotation === a.id ? null : a.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                a.severity === 'critical' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                a.severity === 'innovation' ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' :
                'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{a.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  a.severity === 'critical' ? 'bg-red-200 text-red-800' :
                  a.severity === 'innovation' ? 'bg-emerald-200 text-emerald-800' :
                  'bg-gray-200 text-gray-800'
                }`}>{a.severity}</span>
              </div>
              {activeAnnotation === a.id && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{a.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-emerald-700">📜 Generated Python Script</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowScript(!showScript)}
              className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 hover:bg-gray-50">
              {showScript ? '🔽 Hide' : '🔼 Preview'}
            </button>
            <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(script)}`}
              download={`forge_dynamics_${protein.label.replace(/\s+/g, '_')}.py`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700">
              📥 Download .py
            </a>
          </div>
        </div>
        {showScript && (
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[500px] font-mono leading-relaxed">
            {script}
          </pre>
        )}
      </div>
    </div>
  );
}