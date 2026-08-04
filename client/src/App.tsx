import React, { useEffect, useState } from 'react';
import DebugGacha from './components/DebugGacha';
import DebugScreen from './components/DebugScreen.tsx';
import EncyclopediaScreen from './components/EncyclopediaScreen';
import GachaScreen from './components/GachaScreen';
import HomeScreen from './components/HomeScreen.tsx';
import MapSelectScreen from './components/MapSelectScreen';
import ServerSelectScreen from './components/ServerSelectScreen.tsx';
import MapScreen from './components/MapScreen.tsx';
import PlayerRegisterScreen from './components/PlayerRegisterScreen';
import PlayerHeader from './components/PlayerHeader';
import ProfileScreen from './components/ProfileScreen.tsx';
import ShopScreen from './components/ShopScreen';
import { buildApiUrl } from './api/config';
import { registerPlayer } from './api/playerApi';
import { withServerIdHeader } from './api/serverApi';
import { getStoredPlayerId, setStoredPlayerId } from './state/playerIdentity';
import type { Color } from './types/color';
import type { EncyclopediaData } from './types/encyclopedia';
import type { GachaData, GachaRarity } from './types/gacha';
import type { MapData } from './types/map';
import type { PlayerData } from './types/player';

type Screen =
  | 'playerRegister'
  | 'home'
  | 'mapSelect'
  | 'serverSelect'
  | 'map'
  | 'shop'
  | 'gacha'
  | 'encyclopedia'
  | 'profile'
  | 'debug'
  | 'debugGacha';

const colorMap: Record<string, string> = {
  red: '#FF0000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  green: '#00FF00',
  orange: '#FF8C00',
  cyan: '#00FFFF',
  purple: '#800080',
  brown: '#8B4513',
  ochre: '#DAA520',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  pink: '#FF69B4',
  silver: '#C0C0C0',
  gold: '#FFD700',
};

const DEFAULT_RECOVERY_INTERVAL_MS = 60 * 1000;
const ENERGY_INTERVAL_HEADER = 'x-energy-interval-ms';

const getEnergyIntervalMsFromResponse = (response: Response): number | null => {
  const rawValue = response.headers.get(ENERGY_INTERVAL_HEADER);
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getNextEnergyRecoveryLabel = (player: PlayerData, nowMs: number, recoveryIntervalMs: number): string => {
  if (player.energy >= player.energyMax) {
    return '満タン';
  }

  const lastUpdateMs = new Date(player.lastEnergyUpdate).getTime();

  if (Number.isNaN(lastUpdateMs)) {
    return '-';
  }

  const elapsedMs = Math.max(0, nowMs - lastUpdateMs);
  const remainingMs = recoveryIntervalMs - (elapsedMs % recoveryIntervalMs);
  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

  return String(remainingMinutes) + '分';
};

const getRequiredTapCount = (constellation: number): number => {
  switch (constellation) {
    case 0:
      return 100;
    case 1:
      return 95;
    case 2:
      return 90;
    case 3:
      return 85;
    case 4:
      return 80;
    default:
      return 70;
  }
};


const App: React.FC = () => {
  const debugMode =
    new URLSearchParams(window.location.search)
      .get('debug') === 'true';

  const [onlineCount, setOnlineCount] = useState(0);
  const [map, setMap] = useState<MapData | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [gacha, setGacha] = useState<GachaData | null>(null);
  const [encyclopedia, setEncyclopedia] = useState<EncyclopediaData | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [gachaAnimation, setGachaAnimation] = useState<{
    color: string;
    rarity: GachaRarity;
    isNew: boolean;
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('red');
  const [selectedColorDetail, setSelectedColorDetail] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [dailyTicketMessage, setDailyTicketMessage] = useState<string | null>(null);

useEffect(() => {
  if (!error) {
    return;
  }

  const timer = window.setTimeout(() => {
    setError(null);
  }, 2500);

  return () => {
    window.clearTimeout(timer);
  };
}, [error]);

const [nowMs, setNowMs] = useState<number>(Date.now());
  const [energyIntervalMs, setEnergyIntervalMs] = useState<number>(DEFAULT_RECOVERY_INTERVAL_MS);
  const [debugEditPlayer, setDebugEditPlayer] = useState<PlayerData | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  const handleRegisterPlayer = async (name: string): Promise<void> => {
    const createdPlayer = await registerPlayer(name);
    setStoredPlayerId(createdPlayer.id);
    setIsPlayerReady(true);

    const loaded = await loadGameData();
    if (loaded) {
      setScreen('home');
    }
  };

  const loadGameData = async (): Promise<boolean> => {
    try {
      const [mapRes, playerRes, gachaRes, encyclopediaRes] = await Promise.all([
        fetch(buildApiUrl('/api/map'), withServerIdHeader()),
        fetch(buildApiUrl('/api/player'), withServerIdHeader()),
        fetch(buildApiUrl('/api/gacha'), withServerIdHeader()),
        fetch(buildApiUrl('/api/encyclopedia'), withServerIdHeader())
      ]);

      if (!mapRes.ok || !playerRes.ok || !gachaRes.ok || !encyclopediaRes.ok) {
        throw new Error();
      }

      const [mapData, playerData, gachaData, encyclopediaData] = await Promise.all([
        mapRes.json(),
        playerRes.json(),
        gachaRes.json(),
        encyclopediaRes.json(),
      ]);

      const configuredIntervalMs = getEnergyIntervalMsFromResponse(playerRes);
      if (configuredIntervalMs) {
        setEnergyIntervalMs(configuredIntervalMs);
      }

      setMap(mapData);
      setPlayer(playerData);
      setGacha(gachaData);
      setEncyclopedia(encyclopediaData);
      return true;
    } catch {
      setError('サーバーに接続できませんでした');
      return false;
    }
  };

  const startDebugGachaAnimation = (rarity: GachaRarity)=>{
    if (rarity === 'normal') {
      setGachaAnimation({
        color:'#ffffff',
        rarity:'normal',
        isNew:true
      });
      return;
    }

    if (rarity === 'rare') {
      setGachaAnimation({
        color:'#22c55e',
        rarity:'rare',
        isNew:true
      });
      return;
    }

    if (rarity === 'superRare') {
      setGachaAnimation({
        color:'#2563eb',
        rarity:'superRare',
        isNew:true
      });
      return;
    }

    if (rarity === 'legendRare') {
      setGachaAnimation({
        color:'#facc15',
        rarity:'legendRare',
        isNew:true
      });
      return;
    }

    setGachaAnimation({
      color:'#f9a8d4',
      rarity:'specialRare',
      isNew:true
    });
  };

  const clonePlayer = (value: PlayerData): PlayerData => ({
    ...value,
    stocks: {
      ...value.stocks,
    },
    unlocked: {
      ...value.unlocked,
    },
    tapCounts: {
      ...value.tapCounts,
    },
    constellation: {
      ...value.constellation,
    },
  });

  useEffect(() => {
  const fetchOnlineCount = async () => {
    try {
      const response = await fetch(
        buildApiUrl('/api/players/online-count')
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      console.log("ONLINE API =", data);

      setOnlineCount(data.onlineCount ?? 0);
    } catch (error) {
      console.error(error);
    }
  };

  fetchOnlineCount();

  const timer = setInterval(fetchOnlineCount, 10000);

  return () => {
  clearInterval(timer);

  void fetch(
    buildApiUrl('/api/map/leave'),
    withServerIdHeader({
      method: 'POST',
    }),
  );
};

}, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 10 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    console.log("isPlayerReady =", isPlayerReady);
    if (!isPlayerReady) {
      return;
    }

    let mounted = true;


const fetchPlayer = async () => {
  try {
    console.log("マップ更新", new Date().toLocaleTimeString());
    const [playerResponse, mapResponse] = await Promise.all([
      fetch(buildApiUrl('/api/player'), withServerIdHeader()),
      fetch(buildApiUrl('/api/map'), withServerIdHeader()),
    ]);

    if (!playerResponse.ok || !mapResponse.ok) {
      return;
    }

    const playerData = await playerResponse.json();
    const mapData = await mapResponse.json();

    const configuredIntervalMs =
      getEnergyIntervalMsFromResponse(playerResponse);

    if (mounted) {
      if (configuredIntervalMs) {
        setEnergyIntervalMs(configuredIntervalMs);
      }

      setPlayer(playerData);
      setMap(mapData);
    }
  } catch {
    // 通信失敗時は何もしない
  }
};

    const pollId = window.setInterval(() => {
      void fetchPlayer();
    }, 10 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
    };
  }, [isPlayerReady]);

  useEffect(() => {
    if (screen !== 'debug') {
      if (debugEditPlayer) {
        setDebugEditPlayer(null);
      }
      return;
    }

    if (!player) {
      setDebugEditPlayer(null);
      return;
    }

    if (!debugEditPlayer || debugEditPlayer.id !== player.id) {
      setDebugEditPlayer(clonePlayer(player));
    }
  }, [screen, player, debugEditPlayer]);


  // 初期読み込み
  useEffect(() => {
    const existingPlayerId = getStoredPlayerId();

    if (!existingPlayerId) {
      setScreen('playerRegister');
      setIsPlayerReady(false);
      return;
    }

    setIsPlayerReady(true);
    void loadGameData();
  }, []);



  // マスを塗る
  const handleCellClick = async (index:number)=>{
    const unlockedMap = player?.unlocked as Record<string, boolean> | undefined;

    if (!unlockedMap?.[selectedColor]) {
      setError('この色はまだ取得していません');
      return;
    }

    try{
      const response = await fetch(
        buildApiUrl('/api/map'),
        withServerIdHeader({
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            index,
            color:selectedColor
          })
        })
      );


      const data = await response.json();


      if(!response.ok){

        setError(data.error);
        return;

      }


      if(data.map){
        setMap(data.map);
      }


      if(data.player){
        setPlayer(data.player);
      }


    }catch{

      setError('サーバーに接続できませんでした');

    }

  };



  // エナジー回収
  const collectEnergy = async()=>{

    try{

      const response = await fetch(
        buildApiUrl('/api/player/collect-energy'),
        withServerIdHeader({
          method:'POST'
        })
      );


      const data = await response.json();


      if(!response.ok){

        setError(data.error);
        return;

      }


      if(data.player){

        setPlayer(data.player);
        setError(
          '+' + String(data.reward) + ' コイン'
        );

      }


    }catch{

      setError('サーバーに接続できませんでした');

    }

  };


  const claimDailyTicket = async()=>{

    try{

      const response = await fetch(
        buildApiUrl('/api/player/claim-daily-ticket'),
        withServerIdHeader({
          method:'POST'
        })
      );


      const data = await response.json();


      if(!response.ok){

        setError(data.error);
        return;

      }


if (data.player) {
  console.log("受け取り後", data.player);

  setPlayer(data.player);

  setGacha({
    gachaTicket: data.player.gachaTicket,
    canDraw: data.player.gachaTicket > 0,
  });
}

setDailyTicketMessage(data.message ?? null);   

    }catch{

      setError('サーバーに接続できませんでした');

    }

  };


  const handleColorTap = async(color: string)=>{

    try{

      const response = await fetch(
        buildApiUrl('/api/player/tap-color'),
        withServerIdHeader({
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            color
          })
        })
      );


      const data = await response.json();


      if(!response.ok){

        setError(data.error);
        return;

      }


      if(data.player){
        setPlayer(data.player);
      }

    }catch{

      setError('サーバーに接続できませんでした');

    }

  };


  const handleSelectedColorClick = ()=>{
    const unlockedMap = player?.unlocked as Record<string, boolean> | undefined;

    if (!unlockedMap?.[selectedColor]) {
      setError('この色はまだ取得していません');
      return;
    }

    if (selectedColorDetail === selectedColor) {
      void handleColorTap(selectedColor);
      return;
    }

    setError(null);
    setSelectedColorDetail(selectedColor);
  };


  const handleOtherColorClick = (color: string)=>{
    const unlockedMap = player?.unlocked as Record<string, boolean> | undefined;

    if (!unlockedMap?.[color]) {
      setError('この色はまだ取得していません');
      return;
    }

    if (selectedColor === color && selectedColorDetail === color) {
      void handleColorTap(color);
      return;
    }

    setError(null);
    setSelectedColor(color);
    setSelectedColorDetail(color);
  };


  const saveDebugPlayer = async (updatedPlayer: PlayerData)=>{
    try {
      const response = await fetch(
        buildApiUrl('/api/player'),
        withServerIdHeader({
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify(updatedPlayer)
        })
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? 'デバッグデータの保存に失敗しました');
        return;
      }

      if (data?.player) {
        setPlayer(data.player);
        setGacha({
          gachaTicket: data.player.gachaTicket,
          canDraw: data.player.gachaTicket > 0,
        });
      }
    } catch {
      setError('サーバーに接続できませんでした');
    }
  };


  const updateDebugField = (field: 'coins' | 'energy' | 'energyMax' | 'gachaTicket', value: number)=>{
    setDebugEditPlayer((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };


  const updateDebugColorField = (
    group: 'stocks' | 'tapCounts' | 'constellation',
    color: Color,
    value: number,
  )=>{
    setDebugEditPlayer((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [group]: {
          ...prev[group],
          [color]: value,
        },
      };
    });
  };


  const updateDebugUnlocked = (color: Color, checked: boolean)=>{
    setDebugEditPlayer((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        unlocked: {
          ...prev.unlocked,
          [color]: checked,
        },
      };
    });
  };


  const applyDebugEditPlayer = async ()=>{
    if (!player || !debugEditPlayer) {
      return;
    }

    const debugColorIds = [
      'red',
      'blue',
      'yellow',
      'green',
      'orange',
      'cyan',
      'purple',
      'brown',
      'ochre',
      'black',
      'white',
      'gray',
      'pink',
      'silver',
      'gold',
    ];

    const stocksSource = debugEditPlayer.stocks as Record<string, number>;
    const tapCountsSource = debugEditPlayer.tapCounts as Record<string, number>;
    const constellationSource = debugEditPlayer.constellation as Record<string, number>;
    const unlockedSource = debugEditPlayer.unlocked as Record<string, boolean>;

    const sanitizedStocks = Object.fromEntries(
      debugColorIds.map((colorId) => [
        colorId,
        Math.max(0, Math.floor(stocksSource[colorId])),
      ]),
    ) as PlayerData['stocks'];

    const sanitizedTapCounts = Object.fromEntries(
      debugColorIds.map((colorId) => [
        colorId,
        Math.max(0, Math.floor(tapCountsSource[colorId])),
      ]),
    ) as PlayerData['tapCounts'];

    const sanitizedConstellation = Object.fromEntries(
      debugColorIds.map((colorId) => [
        colorId,
        Math.min(5, Math.max(0, Math.floor(constellationSource[colorId]))),
      ]),
    ) as PlayerData['constellation'];

    const sanitizedUnlocked = Object.fromEntries(
      debugColorIds.map((colorId) => [
        colorId,
        Boolean(unlockedSource[colorId]),
      ]),
    ) as PlayerData['unlocked'];

    const nextEnergyMax = Math.max(1, Math.floor(debugEditPlayer.energyMax));
    const updatedPlayer: PlayerData = {
      ...player,
      ...debugEditPlayer,
      coins: Math.max(0, Math.floor(debugEditPlayer.coins)),
      energyMax: nextEnergyMax,
      energy: Math.max(0, Math.floor(debugEditPlayer.energy)),
      gachaTicket: Math.max(0, Math.floor(debugEditPlayer.gachaTicket)),
      stocks: sanitizedStocks,
      tapCounts: sanitizedTapCounts,
      constellation: sanitizedConstellation,
      unlocked: sanitizedUnlocked,
    };

    setPlayer(updatedPlayer);
    setGacha({
      gachaTicket: updatedPlayer.gachaTicket,
      canDraw: updatedPlayer.gachaTicket > 0,
    });
    setDebugEditPlayer(clonePlayer(updatedPlayer));
    await saveDebugPlayer(updatedPlayer);
  };


  const handlePlayerReset = async ()=>{

    const confirmed = window.confirm('プレイヤーデータを初期状態に戻しますか？');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/player/reset'), withServerIdHeader({
        method: 'POST'
      }));

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? 'リセットに失敗しました');
        return;
      }

      if (data?.player) {
        setPlayer(data.player);
        setDebugEditPlayer(clonePlayer(data.player));
      }

      setError(null);
    } catch {
      setError('サーバーに接続できませんでした');
    }
  };

  const handleResetAllPlayers = async () => {
  const confirmed = window.confirm(
    '本当に全プレイヤーを削除しますか？'
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      buildApiUrl('/api/players/reset-all'),
      withServerIdHeader({
        method: 'POST',
      }),
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? '削除に失敗しました');
      return;
    }

    alert(data.message);
  } catch {
    setError('サーバーに接続できませんでした');
  }
};

  const refreshPlayerAndGacha = async ()=>{
    try {
      const [playerRes, gachaRes] = await Promise.all([
        fetch(buildApiUrl('/api/player'), withServerIdHeader()),
        fetch(buildApiUrl('/api/gacha'), withServerIdHeader())
      ]);

      if (!playerRes.ok || !gachaRes.ok) {
        return;
      }

      const [playerData, gachaData] = await Promise.all([
        playerRes.json(),
        gachaRes.json()
      ]);

      setPlayer(playerData);
      setGacha(gachaData);
    } catch {
    }
  };


  return (

    <div style={{padding:16}}>

      {screen === 'playerRegister' && (
        <PlayerRegisterScreen
          onRegister={handleRegisterPlayer}
        />
      )}

      {screen !== 'playerRegister' && player && (
        <PlayerHeader
          player={player}
          gacha={gacha ?? { gachaTicket: player.gachaTicket }}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          debugMode={debugMode}
          dailyTicketMessage={dailyTicketMessage}
          onDailyTicketClaim={() => { void claimDailyTicket(); }}
          onMapClick={() => setScreen('mapSelect')}
          onShopClick={() => setScreen('shop')}
          onGachaClick={() => setScreen('gacha')}
          onEncyclopediaClick={() => setScreen('encyclopedia')}
          onProfileClick={() => setScreen('profile')}
          onDebugClick={() => setScreen('debug')}
          onDebugGachaClick={() => setScreen('debugGacha')}
        />
      )}

      {screen !== 'playerRegister' && screen !== 'home' && screen !== 'map' && screen !== 'mapSelect' && screen !== 'serverSelect' && (
        <div style={{textAlign:'center', marginBottom:12}}>
          <button
            onClick={() => setScreen('home')}
            style={{
              padding:'8px 14px',
              border:'1px solid #0f172a',
              borderRadius:8,
              background:'#e2e8f0',
              color:'#111827',
              fontWeight:700,
              cursor:'pointer'
            }}
          >
            🏠 ホームに戻る
          </button>
        </div>
      )}



      {player && screen === 'profile' && (

        <div
          style={{
            maxWidth:420,
            margin:'0 auto 16px',
            padding:16,
            borderRadius:12,
            border:'2px solid #1f2937',
            background:'linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%)',
            boxShadow:'0 8px 20px rgba(15,23,42,0.15)'
          }}
        >

          <div
            style={{
              fontSize:20,
              fontWeight:700,
              marginBottom:14,
              textAlign:'center'
            }}
          >
            👤 Player
          </div>

          <div
            style={{
              border:'1px solid #cbd5e1',
              borderRadius:10,
              padding:12,
              background:'#ffffff',
              marginBottom:10
            }}
          >
            <div style={{fontWeight:700, marginBottom:6}}>
              💰 Coins
            </div>
            <div style={{fontSize:18, fontWeight:700}}>
              {player.coins}
            </div>
          </div>

          <div
            style={{
              border:'1px solid #cbd5e1',
              borderRadius:10,
              padding:12,
              background:'#ffffff',
              marginBottom:10
            }}
          >
            <div style={{fontWeight:700, marginBottom:6}}>
              ⚡ Energy
            </div>

            <div style={{fontSize:18, fontWeight:700, marginBottom:4}}>
              {player.energy} / {player.energyMax}
            </div>

            <div style={{color:'#334155', fontSize:14}}>
              {player.energy >= player.energyMax
                ? '満タン'
                : '次回回復まで: ' + getNextEnergyRecoveryLabel(player, nowMs, energyIntervalMs)}
            </div>
          </div>

          <div
            style={{
              textAlign:'center',
              marginBottom:10
            }}
          >

            <button
              onClick={collectEnergy}
              style={{
                padding:'8px 14px',
                border:'1px solid #0f172a',
                borderRadius:8,
                background:'#facc15',
                color:'#111827',
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              エナジー回収
            </button>

          </div>

        </div>

      )}


      {encyclopedia && screen === 'encyclopedia' && (
        <EncyclopediaScreen
          encyclopedia={encyclopedia}
          colorMap={colorMap}
        />
      )}


      {screen === 'gacha' && (
        <GachaScreen
          onDrawSuccess={(updatedPlayer) => {
            setPlayer(updatedPlayer);
            setGacha({
              gachaTicket: updatedPlayer.gachaTicket,
              canDraw: updatedPlayer.gachaTicket > 0,
            });
            void refreshPlayerAndGacha();
          }}
        />
      )}


      {screen === 'profile' && (
<ProfileScreen
  playerName={player?.name ?? ''}
  playerId={player?.id ?? ''}
  totalGachaCount={player?.totalGachaCount ?? 0}
  totalPaintCount={player?.totalPaintCount ?? 0}
/>
      )}


      {screen === 'shop' && (
        <ShopScreen />
      )}


      {screen === 'debugGacha' && (
        <DebugGacha />
      )}


      {screen === 'debug' && (
        <DebugScreen
          onResetAllPlayers={() => {
             void handleResetAllPlayers();
         }}
          player={player}
          debugEditPlayer={debugEditPlayer}
          gachaAnimation={gachaAnimation}
          onPlayerReset={() => { void handlePlayerReset(); }}
          onUpdateDebugField={updateDebugField}
          onUpdateDebugColorField={updateDebugColorField}
          onUpdateDebugUnlocked={updateDebugUnlocked}
          onApplyDebugEditPlayer={() => { void applyDebugEditPlayer(); }}
          onStartDebugGachaAnimation={startDebugGachaAnimation}
          onClearGachaAnimation={() => setGachaAnimation(null)}
        />
      )}


      {screen === 'mapSelect' && (
        <MapSelectScreen
          onSelectBasicMap={() => setScreen('serverSelect')}
        />
      )}


      {screen === 'serverSelect' && (
        <ServerSelectScreen
          onSelectServer={async () => {
            const loaded = await loadGameData();
            if (loaded) {
              setScreen('map');
            }
          }}
        />
      )}



      {screen === 'map' && (
        <MapScreen
          player={player}
          map={map}
          onlineCount={onlineCount}
          selectedColor={selectedColor}
          selectedColorDetail={selectedColorDetail}
          error={error}
          getRequiredTapCount={getRequiredTapCount}
          onHomeClick={() => setScreen('home')}
          onSelectedColorClick={handleSelectedColorClick}
          onOtherColorClick={handleOtherColorClick}
          onCellClick={handleCellClick}
        />
      )}



      {error && screen !== 'map' && (

        <p
          style={{
            textAlign:'center',
            color:'red'
          }}
        >

          {error}

        </p>

      )}

    </div>

  );

};


export default App;