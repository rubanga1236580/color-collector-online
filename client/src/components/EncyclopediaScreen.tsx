import { COLORS } from '../data/colors';
import type { EncyclopediaData } from '../types/encyclopedia';

type EncyclopediaScreenProps = {
  encyclopedia: EncyclopediaData;
  colorMap: Record<string, string>;
};

const titleStyle = {
  fontSize: 24,
  fontWeight: 700,
  textAlign: 'center' as const,
  marginBottom: 12,
};

const cardStyle = {
  maxWidth: 420,
  margin: '0 auto 16px',
  padding: 16,
  borderRadius: 12,
  border: '2px solid #1f2937',
  background: '#f8fafc',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
};

export default function EncyclopediaScreen({ encyclopedia, colorMap }: EncyclopediaScreenProps) {
  const encyclopediaColorMap = new Map(encyclopedia.colors.map((color) => [color.id, color]));

  return (
    <div
      style={cardStyle}
    >

      <div style={titleStyle}>
        📚 Encyclopedia
      </div>

      <div style={{textAlign:'center', color:'#334155', marginBottom:12, fontSize:14}}>
        {encyclopedia.collectedCount} / {encyclopedia.totalCount}
      </div>

      <div
        style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, 1fr)',
          gap:10
        }}
      >
        {COLORS.map((baseColor) => {
          const color = encyclopediaColorMap.get(baseColor.id);
          const owned = color?.owned ?? false;
          const stock = color?.stock ?? 0;
          const constellation = color?.constellation ?? 0;
          const displayColor = baseColor.displayColor ?? colorMap[baseColor.id] ?? '#9ca3af';
          const code = baseColor.code;

          return (
          <div
            key={baseColor.id}
            style={{
              aspectRatio:'1 / 1',
              border:'1px solid #cbd5e1',
              borderRadius:12,
              padding:10,
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              alignItems:'center',
              background:owned ? displayColor : '#9ca3af',
              color:owned ? '#111827' : '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{fontWeight:700, marginBottom:4, fontSize:14}}>
              {owned ? code : '？'}
            </div>
            <div style={{fontSize:14}}>
              {owned ? '在庫: ' + String(stock) : '未発見'}
            </div>
            <div style={{fontSize:14}}>
              {owned ? '凸: ' + String(constellation) : ''}
            </div>
          </div>
          );
        })}
      </div>

    </div>
  );
}
