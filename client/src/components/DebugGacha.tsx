import { useState } from 'react';
import GachaAnimation from './GachaAnimation';

type GachaRarity = 'normal' | 'rare' | 'superRare' | 'legendRare' | 'specialRare';

type DebugPreset = {
  label: string;
  rarity: GachaRarity;
  color: string;
};

const presets: DebugPreset[] = [
  {
    label: 'Normal',
    rarity: 'normal',
    color: '#ffffff',
  },
  {
    label: 'Rare',
    rarity: 'rare',
    color: '#22c55e',
  },
  {
    label: 'Super Rare',
    rarity: 'superRare',
    color: '#2563eb',
  },
  {
    label: 'Legend Rare',
    rarity: 'legendRare',
    color: '#facc15',
  },
  {
    label: 'Special Rare',
    rarity: 'specialRare',
    color: '#f9a8d4',
  },
];

export default function DebugGacha() {
  const [activePreset, setActivePreset] = useState<DebugPreset | null>(null);

  return (
    <section
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 24,
        display: 'grid',
        gap: 16,
      }}
    >
      <div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>Debug Gacha</h1>
        <p style={{ margin: 0, color: '#475569' }}>
          GachaAnimationの本番演出をそのまま使って、5種類のレア度演出を確認します。
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {presets.map((preset) => (
          <button
            key={preset.rarity}
            onClick={() => setActivePreset(preset)}
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #0f172a',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'grid',
              gap: 6,
              justifyItems: 'center',
            }}
          >
            <span>{preset.label}</span>
            <span
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: preset.color,
                border: '1px solid rgba(15, 23, 42, 0.24)',
              }}
            />
          </button>
        ))}
      </div>

      {activePreset && (
        <GachaAnimation
          color={activePreset.color}
          rarity={activePreset.rarity}
          isNew={true}
          onComplete={() => setActivePreset(null)}
        />
      )}
    </section>
  );
}