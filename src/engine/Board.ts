/**
 * @fileoverview This file contains the Board class, which represents the game board. It uses a
 * bitboard implementation for O(1) win checking, which is a fancy way of saying it's really, really
 * fast. If you're into that kind of thing, you'll love this file.
 */

export type Player = 'X' | 'O';

/**
 * A bitmask for each of the 8 possible winning combinations.
 *
 * @private
 * @static
 * @type {number[]}
 */
const WINNING_MASKS = [
    // Rows
    0b111000000, 0b000111000, 0b000000111,
    // Columns
    0b100100100, 0b010010010, 0b001001001,
    // Diagonals
    0b100010001, 0b001010100,
];

export class Board {
    /**
     * A bitboard for each player, representing their moves on the board.
     *
     * @private
     * @type {Record<Player, number>}
     */
    private bitboards: Record<Player, number> = { X: 0, O: 0 };

    /**
     * Makes a move on the board for the given player.
     *
     * @param {number} pos The position to move to (0-8).
     * @param {Player} player The player making the move.
     */
    makeMove(pos: number, player: Player): void {
        if (pos < 0 || pos > 8) {
            throw new Error(`Invalid position: ${pos}`);
        }
        const mask = 1 << pos;
        if (this.isCellOccupied(pos)) {
            throw new Error(`Cell ${pos} already occupied`);
        }
        this.bitboards[player] |= mask;
    }

    /**
     * Removes a move from the board for the given player.
     *
     * @param {number} pos The position to remove the move from (0-8).
     * @param {Player} player The player whose move is being removed.
     */
    removeMove(pos: number, player: Player): void {
        const mask = ~(1 << pos);
        this.bitboards[player] &= mask;
    }

    /**
     * Checks if a cell is occupied by either player.
     *
     * @param {number} pos The position to check (0-8).
     * @returns {boolean} True if the cell is occupied, false otherwise.
     */
    isCellOccupied(pos: number): boolean {
        return (this.bitboards.X & (1 << pos)) !== 0 || (this.bitboards.O & (1 << pos)) !== 0;
    }

    /**
     * Checks if the given player has won the game. This is where the magic of bitboards happens.
     *
     * @param {Player} player The player to check for a win.
     * @returns {boolean} True if the player has won, false otherwise.
     */
    hasWin(player: Player): boolean {
        const board = this.bitboards[player];
        for (const mask of WINNING_MASKS) {
            if ((board & mask) === mask) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets an array of all legal moves (i.e., all unoccupied cells).
     *
     * @returns {number[]} An array of legal moves.
     */
    getLegalMoves(): number[] {
        const moves: number[] = [];
        for (let i = 0; i < 9; i++) {
            if (!this.isCellOccupied(i)) {
                moves.push(i);
            }
        }
        return moves;
    }

    /**
     * Gets the player occupying the given cell.
     *
     * @param {number} pos The position to check (0-8).
     * @returns {Player | null} The player occupying the cell, or null if it's unoccupied.
     */
    getCell(pos: number): Player | null {
        if ((this.bitboards.X & (1 << pos)) !== 0) return 'X';
        if ((this.bitboards.O & (1 << pos)) !== 0) return 'O';
        return null;
    }

    /**
     * Converts the board to an array of players, for rendering purposes.
     *
     * @returns {(Player | null)[]} An array of players, where the index corresponds to the cell.
     */
    toArray(): (Player | null)[] {
        const result: (Player | null)[] = [];
        for (let i = 0; i < 9; i++) {
            result.push(this.getCell(i));
        }
        return result;
    }

    /**
     * Clones the board, creating a new instance with the same state.
     *
     * @returns {Board} A new instance of the Board class.
     */
    clone(): Board {
        const clone = new Board();
        clone.bitboards = { ...this.bitboards };
        return clone;
    }

    /**
     * Resets the board to its initial state.
     */
    reset(): void {
        this.bitboards = { X: 0, O: 0 };
    }
}
