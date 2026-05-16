import { BingoCell } from '../cards/card.schema';
import { BINGO_CONFIGS, BingoMode } from './BingoConfig';

export function generateBingoCells(mode: BingoMode): BingoCell[] {
    const config = BINGO_CONFIGS[mode];
    if (!config) throw new Error(`Unsupported Bingo Mode: ${mode}`);

    if (mode === BingoMode.BINGO_75) {
        const { rows, cols, maxNumber } = config;

        // Each column owns an exclusive range of `rangeSize` numbers.
        // Col 0: 1–15, Col 1: 16–30, Col 2: 31–45, Col 3: 46–60, Col 4: 61–75
        const rangeSize = maxNumber / cols; // 15 for 75-ball

        const columns: number[][] = [];

        for (let col = 0; col < cols; col++) {
            const start = col * rangeSize + 1;           // 1, 16, 31, 46, 61
            const end   = col * rangeSize + rangeSize;   // 15, 30, 45, 60, 75

            // Build the full range [start, end] — exactly `rangeSize` numbers
            const pool = Array.from({ length: end - start + 1 }, (_, i) => i + start);

            // Pick `rows` unique numbers from this column's pool
            columns.push(shuffle(pool).slice(0, rows));
        }

        // columns[c][r] → transpose to gridRows[r][c]
        const gridRows: number[][] = Array.from({ length: rows }, (_, r) =>
            columns.map((col) => col[r]),
        );

        const mid = Math.floor(rows / 2);
        const cells: BingoCell[] = [];
        let position = 0;

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

    if (mode === BingoMode.BINGO_90) {
        throw new Error('Bingo 90 generation is not yet implemented.');
    }

    throw new Error('Invalid Mode');
}

function shuffle<T>(arr: T[]): T[] {
    // Fisher-Yates — avoids the sort() bias of the original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function createMarkedGrid(size: number): boolean[][] {
    const grid = Array.from({ length: size }, () => Array(size).fill(false));
    const mid = Math.floor(size / 2);
    grid[mid][mid] = true;
    return grid;
}