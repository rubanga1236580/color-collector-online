export type GachaData = {
  id: string;
  name: string;
  colorIds: string[];
  specialRareEnabled: boolean;
};

export const GACHAS: GachaData[] = [
  {
    id: 'basic',
    name: '基本カラーガチャ',
    colorIds: ['red', 'blue', 'yellow'],
    specialRareEnabled: false,
  },
];