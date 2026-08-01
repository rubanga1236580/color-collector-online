const titleStyle = {
  textAlign: 'center' as const,
  fontSize: 24,
  fontWeight: 700,
  margin: '0 0 12px',
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

export default function ShopScreen() {
  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>🛒 ショップ</h2>

      <div
        style={{
          border: '2px dashed #f59e0b',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          background: '#fffbeb',
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          🚧 準備中
        </div>

        <div
          style={{
            color: '#374151',
            lineHeight: 1.8,
          }}
        >
          ショップは現在準備中です。
          <br />
          広告削除・開発応援パックは
          <br />
          今後のアップデートで追加予定です。
        </div>
      </div>
    </div>
  );
}