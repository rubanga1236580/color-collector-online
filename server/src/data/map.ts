export type MapData = {
  width: number;
  height: number;
  cells: string[];
};

export const mapData: MapData = {
  width: 16,
  height: 16,
  cells: Array(256).fill('')
};
