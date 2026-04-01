export function generateBingoCard(size: number): number[][] {
    const maxNumber = size * 15;
    const columnRange = Math.floor(maxNumber / size);

    const grid: number[][] = [];

    for (let col = 0; col < size; col++) {
        const start = col * columnRange + 1;
        const end = start + columnRange - 1;

        const numbers = shuffle(
            Array.from({ length: end - start + 1 }, (_, i) => i + start),
        ).slice(0, size);

        grid.push(numbers);
    }

    // transpose columns → rows
    return grid[0].map((_, rowIndex) =>
        grid.map((col) => col[rowIndex]),
    );
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