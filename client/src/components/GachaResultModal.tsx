import { COLORS } from '../data/colors';

type GachaResultModalProps = {
  open: boolean;
  color: string;
  rarity: 'normal' | 'rare' | 'superRare' | 'legendRare' | 'specialRare';
  isNew: boolean;
  onClose: () => void;
};

const rarityLabelMap: Record<GachaResultModalProps['rarity'], string> = {
  normal: 'Normal',
  rare: 'Rare',
  superRare: 'Super Rare',
  legendRare: 'Legend Rare',
  specialRare: 'Special Rare',
};

export default function GachaResultModal({
  open,
  color,
  rarity,
  isNew,
  onClose,
}: GachaResultModalProps) {
  if (!open) {
    return null;
  }

  const colorData = COLORS.find((item) => item.id === color);
  const displayColor = colorData?.code ?? color;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'min(360px, calc(100vw - 32px))',
          borderRadius: 12,
          background: '#ffffff',
          padding: 20,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          ガチャ結果
        </div>

        <div style={{ marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
          {displayColor}
        </div>
        <div style={{ marginBottom: 8 }}>{rarityLabelMap[rarity]}</div>

        {isNew ? (
          <div style={{ marginBottom: 8, fontWeight: 700 }}>NEW!</div>
        ) : (
          <div style={{ marginBottom: 8 }}>すでに所持しています</div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
