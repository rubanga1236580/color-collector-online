import GachaAnimation from './GachaAnimation';
import type { Color } from '../types/color';
import type { GachaRarity } from '../types/gacha';
import type { PlayerData } from '../types/player';

type DebugScreenProps = {
  onResetAllPlayers: () => void;
  player: PlayerData | null;
  debugEditPlayer: PlayerData | null;
  gachaAnimation: {
    color: string;
    rarity: GachaRarity;
    isNew: boolean;
  } | null;
  onPlayerReset: () => void;
  onUpdateDebugField: (field: 'coins' | 'energy' | 'energyMax' | 'gachaTicket', value: number) => void;
  onUpdateDebugColorField: (
    group: 'stocks' | 'tapCounts' | 'constellation',
    color: Color,
    value: number,
  ) => void;
  onUpdateDebugUnlocked: (color: Color, checked: boolean) => void;
  onApplyDebugEditPlayer: () => void;
  onStartDebugGachaAnimation: (rarity: GachaRarity) => void;
  onClearGachaAnimation: () => void;
};

export default function DebugScreen({
  player,
  debugEditPlayer,
  gachaAnimation,
  onPlayerReset,
  onUpdateDebugField,
  onUpdateDebugColorField,
  onUpdateDebugUnlocked,
  onApplyDebugEditPlayer,
  onStartDebugGachaAnimation,
  onClearGachaAnimation,
  onResetAllPlayers,
}: DebugScreenProps) {
  return (
    <div
      style={{
        maxWidth:420,
        margin:'0 auto 16px',
        padding:16,
        borderRadius:12,
        border:'2px solid #1f2937',
        background:'#f8fafc'
      }}
    >

      <div style={{fontSize:20, fontWeight:700, textAlign:'center', marginBottom:8}}>
        🔧 Debug
      </div>

      {player && debugEditPlayer ? (
        <>
          <div
            style={{
              border:'1px solid #cbd5e1',
              borderRadius:10,
              padding:12,
              background:'#ffffff',
              marginBottom:10,
              display:'grid',
              gap:6
            }}
          >
            <div><strong>Player ID:</strong> {player.id}</div>
            <div><strong>Coins:</strong> {player.coins}</div>
            <div><strong>Energy:</strong> {player.energy} / {player.energyMax}</div>
            <div><strong>Gacha Ticket:</strong> {player.gachaTicket}</div>
          </div>

          <div
            style={{
              border:'1px solid #cbd5e1',
              borderRadius:10,
              padding:10,
              background:'#ffffff',
              marginBottom:10,
              display:'grid',
              gap:10
            }}
          >
            <div style={{fontWeight:700}}>Debug Edit Form</div>

            <div style={{display:'flex', justifyContent:'center'}}>
              <button
                onClick={onPlayerReset}
                style={{
                  padding:'8px 16px',
                  border:'1px solid #7f1d1d',
                  borderRadius:8,
                  background:'#fee2e2',
                  color:'#7f1d1d',
                  fontWeight:700,
                  cursor:'pointer'
                }}
              >
                🔄 プレイヤーリセット
              </button>
            </div>

<div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
  <button
    onClick={onResetAllPlayers}
    style={{
      padding: '8px 16px',
      border: '1px solid #991b1b',
      borderRadius: 8,
      background: '#fecaca',
      color: '#7f1d1d',
      fontWeight: 700,
      cursor: 'pointer',
    }}
  >
    🗑 全プレイヤー削除
  </button>
</div>

            <label style={{display:'grid', gap:4}}>
              <span>Coins</span>
              <input
                type='number'
                value={debugEditPlayer.coins}
                onChange={(event) => onUpdateDebugField('coins', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Energy</span>
              <input
                type='number'
                value={debugEditPlayer.energy}
                onChange={(event) => onUpdateDebugField('energy', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Energy Max</span>
              <input
                type='number'
                value={debugEditPlayer.energyMax}
                onChange={(event) => onUpdateDebugField('energyMax', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Gacha Ticket</span>
              <input
                type='number'
                value={debugEditPlayer.gachaTicket}
                onChange={(event) => onUpdateDebugField('gachaTicket', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Red Stock</span>
              <input
                type='number'
                value={debugEditPlayer.stocks.red}
                onChange={(event) => onUpdateDebugColorField('stocks', 'red', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Blue Stock</span>
              <input
                type='number'
                value={debugEditPlayer.stocks.blue}
                onChange={(event) => onUpdateDebugColorField('stocks', 'blue', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Yellow Stock</span>
              <input
                type='number'
                value={debugEditPlayer.stocks.yellow}
                onChange={(event) => onUpdateDebugColorField('stocks', 'yellow', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Red TapCount</span>
              <input
                type='number'
                value={debugEditPlayer.tapCounts.red}
                onChange={(event) => onUpdateDebugColorField('tapCounts', 'red', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Blue TapCount</span>
              <input
                type='number'
                value={debugEditPlayer.tapCounts.blue}
                onChange={(event) => onUpdateDebugColorField('tapCounts', 'blue', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Yellow TapCount</span>
              <input
                type='number'
                value={debugEditPlayer.tapCounts.yellow}
                onChange={(event) => onUpdateDebugColorField('tapCounts', 'yellow', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Red Constellation</span>
              <input
                type='number'
                value={debugEditPlayer.constellation.red}
                onChange={(event) => onUpdateDebugColorField('constellation', 'red', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Blue Constellation</span>
              <input
                type='number'
                value={debugEditPlayer.constellation.blue}
                onChange={(event) => onUpdateDebugColorField('constellation', 'blue', Number(event.target.value))}
              />
            </label>

            <label style={{display:'grid', gap:4}}>
              <span>Yellow Constellation</span>
              <input
                type='number'
                value={debugEditPlayer.constellation.yellow}
                onChange={(event) => onUpdateDebugColorField('constellation', 'yellow', Number(event.target.value))}
              />
            </label>

            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input
                type='checkbox'
                checked={debugEditPlayer.unlocked.red}
                onChange={(event) => onUpdateDebugUnlocked('red', event.target.checked)}
              />
              <span>Red Unlocked</span>
            </label>

            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input
                type='checkbox'
                checked={debugEditPlayer.unlocked.blue}
                onChange={(event) => onUpdateDebugUnlocked('blue', event.target.checked)}
              />
              <span>Blue Unlocked</span>
            </label>

            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input
                type='checkbox'
                checked={debugEditPlayer.unlocked.yellow}
                onChange={(event) => onUpdateDebugUnlocked('yellow', event.target.checked)}
              />
              <span>Yellow Unlocked</span>
            </label>

            <div style={{display:'flex', justifyContent:'center', marginTop:8}}>
              <button
                onClick={onApplyDebugEditPlayer}
                style={{
                  padding:'8px 16px',
                  border:'1px solid #0f172a',
                  borderRadius:8,
                  background:'#bfdbfe',
                  color:'#111827',
                  fontWeight:700,
                  cursor:'pointer'
                }}
              >
                適用
              </button>
            </div>
          </div>

          <div
            style={{
              border:'1px solid #cbd5e1',
              borderRadius:10,
              padding:10,
              background:'#ffffff',
              marginBottom:10,
              display:'grid',
              gap:8
            }}
          >
            <div style={{fontWeight:700}}>🎁 Gacha Animation Test</div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:8}}>
              <button
                onClick={() => onStartDebugGachaAnimation('normal')}
                style={{padding:'8px 10px', border:'1px solid #0f172a', borderRadius:8, background:'#f8fafc', cursor:'pointer'}}
              >
                Normal
              </button>

              <button
                onClick={() => onStartDebugGachaAnimation('rare')}
                style={{padding:'8px 10px', border:'1px solid #0f172a', borderRadius:8, background:'#ecfdf5', cursor:'pointer'}}
              >
                Rare
              </button>

              <button
                onClick={() => onStartDebugGachaAnimation('superRare')}
                style={{padding:'8px 10px', border:'1px solid #0f172a', borderRadius:8, background:'#eff6ff', cursor:'pointer'}}
              >
                Super Rare
              </button>

              <button
                onClick={() => onStartDebugGachaAnimation('legendRare')}
                style={{padding:'8px 10px', border:'1px solid #0f172a', borderRadius:8, background:'#fef9c3', cursor:'pointer'}}
              >
                Legend Rare
              </button>

              <button
                onClick={() => onStartDebugGachaAnimation('specialRare')}
                style={{padding:'8px 10px', border:'1px solid #0f172a', borderRadius:8, background:'#fdf2f8', cursor:'pointer', gridColumn:'1 / -1'}}
              >
                Special Rare
              </button>
            </div>

            {gachaAnimation && (
              <GachaAnimation
                color={gachaAnimation.color}
                rarity={gachaAnimation.rarity}
                isNew={gachaAnimation.isNew}
                onComplete={onClearGachaAnimation}
              />
            )}
          </div>
        </>
      ) : (
        <div style={{textAlign:'center', color:'#334155'}}>
          Player not loaded
        </div>
      )}

    </div>
  );
}
