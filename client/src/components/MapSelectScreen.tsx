type MapSelectScreenProps = {
  onSelectBasicMap: () => void;
};

const titleStyle = {
  textAlign: 'center' as const,
  margin: '0 0 12px',
  fontSize: 24,
  fontWeight: 700,
};

const panelStyle = {
  maxWidth: 420,
  margin: '0 auto 16px',
  padding: 16,
  borderRadius: 12,
  border: '2px solid #1f2937',
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
};

const cardStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: 16,
  background: '#f8fafc',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
};

const buttonStyle = {
  minHeight: 42,
  padding: '0 14px',
  border: '1px solid #0f172a',
  borderRadius: 10,
  color: '#111827',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  background: '#fef3c7',
};

export default function MapSelectScreen({ onSelectBasicMap }: MapSelectScreenProps) {
  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🗺 マップ選択</h2>

      <div style={cardStyle}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          基本マップ
        </div>
        <div style={{ color: '#334155', fontSize: 14, marginBottom: 12 }}>
          通常のマップです
        </div>
        <button
          type="button"
          onClick={onSelectBasicMap}
          style={buttonStyle}
        >
          選択する
        </button>
      </div>
    </div>
  );
}
