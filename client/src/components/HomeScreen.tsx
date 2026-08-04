import Advertisement from './Advertisement';

type HomeScreenProps = {
  debugMode: boolean;
  dailyTicketMessage: string | null;
  onDailyTicketClaim: () => void;
  onMapClick: () => void;
  onShopClick: () => void;
  onGachaClick: () => void;
  onEncyclopediaClick: () => void;
  onProfileClick: () => void;
  onDebugClick: () => void;
  onDebugGachaClick: () => void;
};

const titleStyle = {
  textAlign: 'center' as const,
  fontSize: 24,
  fontWeight: 700,
  margin: '0 0 12px',
};

const cardStyle = {
  maxWidth: 420,
  margin: '0 auto 16px',
  padding: 16,
  borderRadius: 12,
  border: '2px solid #1f2937',
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  display: 'grid',
  gap: 10,
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
};

export default function HomeScreen({
  debugMode,
  dailyTicketMessage,
  onDailyTicketClaim,
  onMapClick,
  onShopClick,
  onGachaClick,
  onEncyclopediaClick,
  onProfileClick,
  onDebugClick,
  onDebugGachaClick,
}: HomeScreenProps) {
  return (
    <>
      <h1 style={titleStyle}>
        🏠 ホーム
      </h1>

      <div style={cardStyle}>
        <button
          onClick={onDailyTicketClaim}
          style={{
            ...buttonStyle,
            background: '#fde68a',
          }}
        >
          🎟 デイリーチケット受け取り
        </button>

        {dailyTicketMessage && (
          <div style={{ textAlign: 'center', color: '#334155' }}>
            {dailyTicketMessage}
          </div>
        )}

        <button
          onClick={onMapClick}
          style={{
            ...buttonStyle,
            background: '#fef3c7',
          }}
        >
          🎨 マップ
        </button>

        <button
          onClick={onShopClick}
          style={{
            ...buttonStyle,
            background: '#dbeafe',
          }}
        >
          🛒 ショップ
        </button>

        <button
          onClick={onGachaClick}
          style={{
            ...buttonStyle,
            background: '#ffedd5',
          }}
        >
          🎁 ガチャ
        </button>

        <button
          onClick={onEncyclopediaClick}
          style={{
            ...buttonStyle,
            background: '#e2e8f0',
          }}
        >
          📚 色図鑑
        </button>

        <button
          onClick={onProfileClick}
          style={{
            ...buttonStyle,
            background: '#dcfce7',
          }}
        >
          👤 プロフィール
        </button>

        {debugMode && (
          <button
            onClick={onDebugClick}
            style={{
              ...buttonStyle,
              background: '#fee2e2',
            }}
          >
            🔧 Debug
          </button>
        )}

        {debugMode && (
          <button
            onClick={onDebugGachaClick}
            style={{
              ...buttonStyle,
              background: '#dbeafe',
            }}
          >
            🎬 Debug Gacha
          </button>
        )}
      </div>

      <Advertisement />
    </>
  );
}