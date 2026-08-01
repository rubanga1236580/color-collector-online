export type EncyclopediaColor = {
  id: string;
  name: string;
  owned: boolean;
  stock: number;
  constellation: number;
};

export type EncyclopediaData = {
  colors: EncyclopediaColor[];
  collectedCount: number;
  totalCount: number;
};
