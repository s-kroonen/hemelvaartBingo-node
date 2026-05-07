import { randomUUID } from 'crypto';
import { BingoCell } from '../cards/card.schema';
import { BINGO_CONFIGS, BingoMode } from './BingoConfig';

export function generateBingoCells(mode: BingoMode): BingoCell[] {
    const config = BINGO_CONFIGS[mode];

    if (!config) {
        throw new Error(`Unsupported Bingo Mode: ${mode}`);
    }

    // Bingo 75 Logic (Square Grid)
    if (mode === BingoMode.BINGO_75) {
        const { rows, cols, maxNumber } = config;
        const columnRange = maxNumber / cols; // e.g., 15 numbers per column
        const columns: number[][] = [];

        for (let col = 0; col < cols; col++) {
            const start = col * columnRange + 1;
            const end = start + columnRange;

            const numbers = shuffle(
                Array.from({ length: end - start + 1 }, (_, i) => i + start),
            ).slice(0, rows);

            columns.push(numbers);
        }

        // Transpose to rows
        const gridRows = columns[0].map((_, rowIndex) =>
            columns.map((col) => col[rowIndex]),
        );

        const cells: BingoCell[] = [];
        let position = 0;
        const mid = Math.floor(rows / 2);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const isFree = config.hasFreeSpace && r === mid && c === mid;
                cells.push({
                    value: isFree ? 'FREE' : String(gridRows[r][c]),
                    isChecked: isFree,
                    position: position++,
                });
            }
        }
        return cells;
    }

    // Placeholder for Bingo 90 Logic (Non-square grid)
    if (mode === BingoMode.BINGO_90) {
        // Implement 3x9 logic here when ready
        throw new Error("Bingo 90 generation is not yet implemented.");
    }

    throw new Error("Invalid Mode");
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