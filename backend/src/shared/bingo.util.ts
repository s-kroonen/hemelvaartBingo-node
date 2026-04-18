import { randomUUID } from 'crypto';
import { BingoCell } from '../cards/card.schema';

export function generateBingoCells(size: number): BingoCell[] {
  const maxNumber = size * 15;
  const columnRange = Math.floor(maxNumber / size);

  const columns: number[][] = [];

  for (let col = 0; col < size; col++) {
    const start = col * columnRange + 1;
    const end = start + columnRange - 1;

    const numbers = shuffle(
      Array.from({ length: end - start + 1 }, (_, i) => i + start),
    ).slice(0, size);

    columns.push(numbers);
  }

  // transpose → rows
  const rows = columns[0].map((_, rowIndex) =>
    columns.map((col) => col[rowIndex]),
  );

  const cells: BingoCell[] = [];

  let position = 0;
  const mid = Math.floor(size / 2);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isFree = row === mid && col === mid;

      cells.push({
        id: randomUUID(),
        value: isFree ? 'FREE' : String(rows[row][col]),
        isChecked: isFree,
        position: position++,
      });
    }
  }

  return cells;
}

function shuffle(arr: number[]) {
  return arr.sort(() => Math.random() - 0.5);
}

export function createMarkedGrid(size: number): boolean[][] {
    const grid = Array.from({ length: size }, () =>
        Array(size).fill(false),
    );

    const mid = Math.floor(size / 2);
    grid[mid][mid] = true; // free space

    return grid;
}