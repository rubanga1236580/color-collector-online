import { useEffect, useState } from 'react';
import { buildApiUrl } from '../api/config';
import { getActiveGachas, type GachaData } from '../api/gachaApi';
import { withServerIdHeader } from '../api/serverApi';
import { getSelectedGachaId, setSelectedGacha } from '../state/selectedGacha';
import type { GachaRarity } from '../types/gacha';
import type { PlayerData } from '../types/player';
import GachaAnimation from './GachaAnimation';

type DrawResult = {
  color: string;
  rarity: GachaRarity;
  isNew: boolean;
};

type GachaScreenProps = {
  onDrawSuccess?: (player: PlayerData) => void;
};

const titleStyle = {
  textAlign: 'center' as const,
  margin: '0 0 12px',
  fontSize: 24,
  fontWeight: 700,
};

const cardStyle = {
  border: '2px solid #1f2937',
  borderRadius: 12,
  background: '#ffffff',
  padding: 16,
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
};

export default function GachaScreen({ onDrawSuccess }: GachaScreenProps) {
  const [gachas, setGachas] = useState<GachaData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(getSelectedGachaId());
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [animationOpen, setAnimationOpen] = useState(false);

  const isDrawDisabled = !selectedId || !gachas.some((gacha) => gacha.id === selectedId);

  const handleSelectGacha = (id: string) => {
    setSelectedGacha(id);
    setSelectedId(getSelectedGachaId());
  };

  const handleDrawGacha = async () => {
    const response = await fetch(buildApiUrl('/api/gacha/draw'), withServerIdHeader({
      method: 'POST',
    }));

    const result = await response.json();

    if (!response.ok) {
      setError(result?.error ?? 'ガチャの実行に失敗しました');
      return;
    }

    setDrawResult({
      color: result.color,
      rarity: result.rarity,
      isNew: result.isNew,
    });
    if (result?.player) {
      onDrawSuccess?.(result.player as PlayerData);
    }
    setAnimationOpen(true);

    console.log(result);
  };

  const handleAnimationComplete = () => {
    setAnimationOpen(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadActiveGachas() {
      try {
        const data = await getActiveGachas();
        if (isMounted) {
          setGachas(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '開催中ガチャの取得に失敗しました');
        }
      }
    }

    void loadActiveGachas();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setError(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [error]);

  return (
    <div style={{ maxWidth: 520, margin: '0 auto 16px' }}>
      {error && (
        <div style={{ color: '#dc2626', marginBottom: 8, textAlign: 'center' }}>
          {error}
        </div>
      )}
      <div
        style={cardStyle}
      >
      <h2 style={titleStyle}>🎁 ガチャ</h2>
      <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
        {gachas.map((gacha) => (
          <div
            key={gacha.id}
            style={{
              border: selectedId === gacha.id ? '2px solid #2563eb' : '1px solid #d1d5db',
              borderRadius: 12,
              padding: 16,
              marginBottom: 0,
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ marginBottom: 12, color: '#475569', fontSize: 14 }}>
              基本のカラーが手に入るガチャ
            </div>

            <button
              onClick={() => handleSelectGacha(gacha.id)}
              disabled={selectedId === gacha.id}
              style={{ ...buttonStyle, background: '#f8fafc' }}
            >
              選択する
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleDrawGacha}
          disabled={isDrawDisabled}
          style={{ ...buttonStyle, background: '#ffedd5' }}
        >
          ガチャを引く
        </button>
      </div>
      </div>

      {drawResult && animationOpen && (
        <GachaAnimation
          color={drawResult.color}
          rarity={drawResult.rarity}
          isNew={drawResult.isNew}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
