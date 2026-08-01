type ProfileScreenProps = {
  playerName: string;
  playerId: string;
  totalGachaCount: number;
  totalPaintCount: number;
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

const labelStyle = {
  textAlign: 'center' as const,
  color: '#334155',
  fontSize: 14,
};

export default function ProfileScreen({
  playerName,
  playerId,
  totalGachaCount,
  totalPaintCount,
}: ProfileScreenProps) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>
        👤 Profile
      </div>

      <div style={labelStyle}>
        プレイヤー名：{playerName}
      </div>

      <div style={{ ...labelStyle, marginTop: 8 }}>
        プレイヤーID：{playerId}
      </div>

      <div style={{ ...labelStyle, marginTop: 8 }}>
        総ガチャ回数：{totalGachaCount}回
      </div>

      <div style={{ ...labelStyle, marginTop: 8 }}>
        総塗り回数：{totalPaintCount}回
      </div>
    </div>
  );
}