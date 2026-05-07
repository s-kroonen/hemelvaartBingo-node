export enum BingoMode {
  BINGO_75 = 'BINGO_75',
  BINGO_90 = 'BINGO_90',
}

interface BingoConfig {
  rows: number;
  cols: number;
  maxNumber: number;
  hasFreeSpace: boolean;
}

export const BINGO_CONFIGS: Record<BingoMode, BingoConfig> = {
  [BingoMode.BINGO_75]: {
    rows: 5,
    cols: 5,
    maxNumber: 75,
    hasFreeSpace: true,
  },
  [BingoMode.BINGO_90]: {
    rows: 3,
    cols: 9,
    maxNumber: 90,
    hasFreeSpace: false,
  },
};