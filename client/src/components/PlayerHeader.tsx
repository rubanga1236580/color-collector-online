import type { GachaData } from '../types/gacha';
import type { PlayerData } from '../types/player';

type PlayerHeaderProps = {
  player?: PlayerData;
  gacha?: Pick<GachaData, 'gachaTicket'>;
  onHomeClick?: () => void;
  onCollectEnergy?: () => void;
  playerName?: string;
  coins?: number;
  energy?: number;
  energyMax?: number;
  gachaTicket?: number;
};

export default function PlayerHeader({
  player,
  gacha,
  coins = 100,
  energy = 0,
  energyMax = 5,
  gachaTicket = 0,
}: PlayerHeaderProps) {
  const resolvedCoins = player?.coins ?? coins;
  const resolvedEnergy = player?.energy ?? energy;
  const resolvedEnergyMax = player?.energyMax ?? energyMax;
  const resolvedGachaTicket = gacha?.gachaTicket ?? gachaTicket;

  const labelStyle = {
    fontWeight: 700,
    fontSize: 14,
    color: '#111827',
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto 16px',
        padding: 16,
        borderRadius: 12,
        border: '2px solid #1f2937',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={labelStyle}>チケット：{resolvedGachaTicket}</div>

        <div style={labelStyle}>コイン：{resolvedCoins}</div>

        <div style={labelStyle}>
          エナジー：{resolvedEnergy} / {resolvedEnergyMax}
        </div>
      </div>
    </div>
  );
}
