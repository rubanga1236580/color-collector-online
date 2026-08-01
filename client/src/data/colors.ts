export type ColorRarity = 'normal' | 'rare' | 'superRare' | 'legendRare' | 'specialRare';

export type ColorData = {
  id: string;
  name: string;
  rarity: ColorRarity;
  displayColor: string;
  code: string;
};

export const COLORS: ColorData[] = [
  {
    id: 'red',
    name: '#FF0000',
    rarity: 'normal',
    displayColor: '#FF0000',
    code: '#FF0000',
  },
  {
    id: 'blue',
    name: '#0000FF',
    rarity: 'normal',
    displayColor: '#0000FF',
    code: '#0000FF',
  },
  {
    id: 'yellow',
    name: '#FFFF00',
    rarity: 'normal',
    displayColor: '#FFFF00',
    code: '#FFFF00',
  },
  {
    id: 'green',
    name: '#00FF00',
    rarity: 'rare',
    displayColor: '#00FF00',
    code: '#00FF00',
  },
  {
    id: 'orange',
    name: '#FF8C00',
    rarity: 'rare',
    displayColor: '#FF8C00',
    code: '#FF8C00',
  },
  {
    id: 'cyan',
    name: '#00FFFF',
    rarity: 'rare',
    displayColor: '#00FFFF',
    code: '#00FFFF',
  },
  {
    id: 'purple',
    name: '#800080',
    rarity: 'rare',
    displayColor: '#800080',
    code: '#800080',
  },
  {
    id: 'brown',
    name: '#8B4513',
    rarity: 'rare',
    displayColor: '#8B4513',
    code: '#8B4513',
  },
  {
    id: 'ochre',
    name: '#DAA520',
    rarity: 'rare',
    displayColor: '#DAA520',
    code: '#DAA520',
  },
  {
    id: 'black',
    name: '#000000',
    rarity: 'superRare',
    displayColor: '#000000',
    code: '#000000',
  },
  {
    id: 'white',
    name: '#FFFFFF',
    rarity: 'superRare',
    displayColor: '#FFFFFF',
    code: '#FFFFFF',
  },
  {
    id: 'gray',
    name: '#808080',
    rarity: 'superRare',
    displayColor: '#808080',
    code: '#808080',
  },
  {
    id: 'pink',
    name: '#FF69B4',
    rarity: 'superRare',
    displayColor: '#FF69B4',
    code: '#FF69B4',
  },
  {
    id: 'silver',
    name: '#C0C0C0',
    rarity: 'legendRare',
    displayColor: '#C0C0C0',
    code: '#C0C0C0',
  },
  {
    id: 'gold',
    name: '#FFD700',
    rarity: 'legendRare',
    displayColor: '#FFD700',
    code: '#FFD700',
  },
];
