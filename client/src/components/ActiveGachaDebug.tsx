import { useEffect, useState } from 'react';
import { getActiveGachas, type GachaData } from '../api/gachaApi';
import { getSelectedGachaId, setSelectedGacha } from '../state/selectedGacha';

export default function ActiveGachaDebug() {
  const [gachas, setGachas] = useState<GachaData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(getSelectedGachaId());

  const handleSelectGacha = (id: string) => {
    setSelectedGacha(id);
    setSelectedId(getSelectedGachaId());
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

    loadActiveGachas();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Active Gachas</h2>
      <div>選択中ガチャ: {selectedId}</div>
      <ul>
        {gachas.map((gacha) => (
          <li key={gacha.id}>
            {selectedId === gacha.id && <div>選択中: ⭐ {gacha.name}</div>}
            <div>ガチャ名: {gacha.name}</div>
            <div>ID: {gacha.id}</div>
            <div>colorIds: {gacha.colorIds.join(', ')}</div>
            <div>specialRareEnabled: {gacha.specialRareEnabled ? 'true' : 'false'}</div>
            <button
              onClick={() => handleSelectGacha(gacha.id)}
              disabled={selectedId === gacha.id}
            >
              選択する
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
