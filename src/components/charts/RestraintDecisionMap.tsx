import { ExportableChart } from '../ui/ExportableChart';
import { type ProteinRecord } from '../../forge-engine';

export function RestraintDecisionMap({ protein }: { protein: ProteinRecord }) {
  const catColors: Record<string, string> = {
    'strong': '#0D47A1', 'moderate': '#42A5F5', 'weak': '#FBC02D',
    'idr-free': '#E65100', 'none': '#ccc',
  };
  const n = protein.restraintProfile.length;
  if (!n) return null;
  const strong = protein.restraintProfile.filter(r => r.category === 'strong').length;
  const moderate = protein.restraintProfile.filter(r => r.category === 'moderate').length;
  const weak = protein.restraintProfile.filter(r => r.category === 'weak').length;
  const idrFree = protein.restraintProfile.filter(r => r.category === 'idr-free').length;
  return (
    <ExportableChart w={660} h={80} label="restraint_decision_map"
      deps={[protein.restraintProfile]} style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, _h) => {
        void _h;
        const barH = 30, barY = 5, legendY = barH + 15;
        ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, barY, w, barH);
        for (let i = 0; i < n; i++) {
          const r = protein.restraintProfile[i];
          ctx.fillStyle = catColors[r.category] || '#ccc';
          ctx.fillRect((i / n) * w, barY, Math.ceil(w / n) + 1, barH);
        }
        ctx.font = '10px sans-serif'; ctx.textBaseline = 'middle';
        const items = [
          { label: `Strong (${strong})`, color: '#0D47A1' },
          { label: `Moderate (${moderate})`, color: '#42A5F5' },
          { label: `Weak (${weak})`, color: '#FBC02D' },
          { label: `IDR-Free (${idrFree})`, color: '#E65100' },
        ];
        let lx = 5;
        for (const item of items) {
          ctx.fillStyle = item.color;
          ctx.fillRect(lx, legendY, 10, 10);
          ctx.fillStyle = '#333'; ctx.textAlign = 'left';
          ctx.fillText(item.label, lx + 13, legendY + 5);
          lx += ctx.measureText(item.label).width + 25;
        }
      }}
    />
  );
}