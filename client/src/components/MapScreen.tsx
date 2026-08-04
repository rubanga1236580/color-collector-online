import { useEffect, useState } from 'react';
import { API_BASE_URL, buildApiUrl } from '../api/config';
import { COLORS } from '../data/colors';
import type { MapData } from '../types/map';
import type { PlayerData } from '../types/player';

type MapScreenProps = {
  onlineCount: number;
  player: PlayerData | null;
  map: MapData | null;
  selectedColor: string;
  selectedColorDetail: string | null;
  error: string | null;
  getRequiredTapCount: (constellation: number) => number;
  onHomeClick: () => void;
  onSelectedColorClick: () => void;
  onOtherColorClick: (color: string) => void;
  onCellClick: (index: number) => void;
};

const colorIdSet = new Set(COLORS.map((color) => color.id));

const isColorId = (value: string): boolean => colorIdSet.has(value);

const titleStyle = {
  textAlign: 'center' as const,
  margin: '0 0 12px',
  fontSize: 24,
  fontWeight: 700,
};

const panelStyle = {
  border: '2px solid #1f2937',
  borderRadius: 12,
  background: '#ffffff',
  padding: 14,
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

export default function MapScreen({
  player,
  map,
  selectedColor,
  selectedColorDetail,
  error,
  getRequiredTapCount,
  onHomeClick,
  onSelectedColorClick,
  onOtherColorClick,
  onCellClick,
  onlineCount,
  
}: MapScreenProps) {
  const [isOtherColorsExpanded, setIsOtherColorsExpanded] = useState(false);

  useEffect(() => {
  const sendPing = async () => {
    const url = buildApiUrl('/api/map/ping');

    console.log('API_BASE_URL =', API_BASE_URL);
    console.log('PING URL =', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
      });

      console.log('PING STATUS =', response.status);
    } catch (error) {
      console.error('PING ERROR =', error);
    }
  };

  // マップを開いた直後
  void sendPing();

  // 10秒ごと
  const timer = window.setInterval(() => {
    void sendPing();
  }, 10000);

  return () => {
    clearInterval(timer);
  };
}, []);

  const selectedColorData = COLORS.find((color) => color.id === selectedColor);
  const stocksMap = player?.stocks as Record<string, number> | undefined;
  const unlockedMap = player?.unlocked as Record<string, boolean> | undefined;
  const tapCountsMap = player?.tapCounts as Record<string, number> | undefined;
  const constellationMap = player?.constellation as Record<string, number> | undefined;
  const otherColors = COLORS.filter(
    (color) => color.id !== selectedColor && Boolean(unlockedMap?.[color.id]),
  );
  const visibleOtherColors = isOtherColorsExpanded ? otherColors : otherColors.slice(0, 6);
  const remainingOtherColorCount = Math.max(0, otherColors.length - 6);
  const shouldShowOtherColorsToggle = otherColors.length > 6;

  return (
    <>
      <div
        style={{
          maxWidth:520,
          margin:'0 auto 8px',
          display:'flex',
          alignItems:'center',
          justifyContent:'flex-start',
        }}
      >
        <button
          type='button'
          onClick={onHomeClick}
          style={{
            ...buttonStyle,
            background:'#e2e8f0',
          }}
        >
          🏠 Home
        </button>
      </div>

      <div style={{maxWidth:520, margin:'0 auto 10px'}}>
        <div
          style={panelStyle}
        >
          <h2 style={titleStyle}>
            🎨 Map
          </h2>

          <div
  style={{
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: 12,
  }}
>
  👥 参加人数：{onlineCount}人
</div>


          <div style={{display:'grid', gap:10}}>
            <div style={{fontWeight:700}}>選択中の色</div>

            <div
              style={{
                border:'1px solid #cbd5e1',
                borderRadius:12,
                padding:'12px 14px',
                background:'#f8fafc',
                display:'grid',
                justifyItems:'center',
                gap:4,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              }}
            >
              {(() => {
                const isUnlocked = unlockedMap?.[selectedColor] ?? false;
                const selectedColorDisplay = selectedColorData?.displayColor ?? '#ffffff';
                const selectedColorCode = selectedColorData?.code ?? selectedColor;

                return (
                  <>
                    <button
                      onClick={onSelectedColorClick}
                      aria-label={selectedColor}
                      style={{
                        width:56,
                        height:56,
                        border:'3px solid ' + (selectedColorDetail===selectedColor ? '#0f172a' : '#cbd5e1'),
                        borderRadius:8,
                        background:selectedColorDisplay,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        boxShadow:selectedColorDetail===selectedColor ? '0 0 0 3px rgba(15,23,42,0.15)' : 'none',
                        cursor:isUnlocked ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {!isUnlocked && <span style={{fontSize:18}}>🔒</span>}
                    </button>

                    <div style={{fontWeight:700, fontSize:14}}>{selectedColorCode}</div>
                  </>
                );
              })()}

              <div style={{fontSize:14, fontWeight:700, lineHeight: 1.2}}>在庫: {stocksMap?.[selectedColor] ?? 0}</div>
              {player && (
                <div style={{fontSize:14, lineHeight: 1.2}}>
                  タップ数: {tapCountsMap?.[selectedColor] ?? 0} / {getRequiredTapCount(constellationMap?.[selectedColor] ?? 0)}
                </div>
              )}
            </div>

            <div style={{fontWeight:700}}>その他の色</div>

            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {visibleOtherColors.map((color) => {
                const isUnlocked = unlockedMap?.[color.id] ?? false;

                return (
                  <button
                    key={color.id}
                    onClick={() => onOtherColorClick(color.id)}
                    aria-label={color.id}
                    style={{
                      minWidth:136,
                      border:'1px solid #cbd5e1',
                      borderRadius:12,
                      background:'#ffffff',
                      padding:'8px 10px',
                      display:'flex',
                      alignItems:'center',
                      gap:6,
                      textAlign:'left',
                      cursor:isUnlocked ? 'pointer' : 'not-allowed',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <span
                      style={{
                        width:16,
                        height:16,
                        border:'1px solid #94a3b8',
                        borderRadius:3,
                        background:color.displayColor,
                        display:'inline-block',
                        flexShrink:0,
                      }}
                    />

                    <span style={{fontWeight:700, flexGrow:1, fontSize:14}}>{color.code}</span>

                    <span style={{fontWeight:700, fontSize:14}}>在庫: {stocksMap?.[color.id] ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {shouldShowOtherColorsToggle && (
              <div>
                <button
                  type='button'
                  onClick={() => setIsOtherColorsExpanded((prev) => !prev)}
                  style={{
                    ...buttonStyle,
                    background:'#f8fafc',
                  }}
                >
                  {isOtherColorsExpanded
                    ? '▲ 閉じる'
                    : '▼ その他（残り' + String(remainingOtherColorCount) + '色）'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {error && (

        <p
          style={{
            textAlign:'center',
            color:'red'
          }}
        >

          {error}

        </p>

      )}

      {map && (

        <div
          style={{
            display:'grid',
            gridTemplateColumns:
              'repeat(' + String(map.width) + ',28px)',
            gap:2,
            justifyContent:'center',
            margin:'0 auto',
            width:'fit-content'
          }}
        >

          {map.cells.map((cell,index)=>(

            <div
              key={index}
              onClick={()=>onCellClick(index)}
              style={{
                width:28,
                height:28,
                border:'1px solid #ddd',
                cursor:'pointer',
                background:
                  isColorId(cell)
                  ? (COLORS.find((color) => color.id === cell)?.displayColor ?? '#fff')
                  : '#fff'
              }}
            />

          ))}

        </div>

      )}
    </>
  );
}
