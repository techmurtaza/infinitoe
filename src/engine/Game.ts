/**
 * @fileoverview This is the main game engine for Infinitoe. It's responsible for managing the game state,
 * handling player moves, and enforcing the rules of the game. It's the brains of the operation, the
 * puppet master pulling the strings. If you're looking for the core logic, you've come to the right
 * place.
 */

import { Board, Player } from './Board';

export type GameStatus = 'ONGOING' | 'X_WIN' | 'O_WIN';

export class InfinitoeGame {
    /**
     * The maximum number of moves a player can have on the board at any given time. This is the secret
     * sauce that makes Infinitoe, well, Infinitoe.
     *
     * @private
     * @static
     * @type {number}
     */
    private static readonly MAX_MOVES_PER_PLAYER = 3;

    /**
     * The game board. It's a bitboard, so it's fast. Like, really fast.
     *
     * @private
     * @type {Board}
     */
    private board = new Board();

    /**
     * The current player. 'X' goes first, as is tradition.
     *
     * @private
     * @type {Player}
     */
    private current: Player = 'X';

    /**
     * A history of each player's moves, in the order they were made. This is used to enforce the
     * rolling window mechanic.
     *
     * @private
     * @type {Record<Player, number[]>}
     */
    private history: Record<Player, number[]> = { X: [], O: [] };

    /**
     * The current status of the game. 'ONGOING' until someone wins.
     *
     * @private
     * @type {GameStatus}
     */
    private status: GameStatus = 'ONGOING';

    constructor() {}

    /**
     * Gets the current player.
     *
     * @returns {Player} The current player.
     */
    getCurrentPlayer(): Player {
        return this.current;
    }

    /**
     * Gets the game board.
     *
     * @returns {Board} The game board.
     */
    getBoard(): Board {
        return this.board;
    }

    /**
     * Makes a move on the board for the current player. This is where the magic happens.
     *
     * @param {number} index The index of the cell to move to.
     * @returns {{ status: GameStatus; removed: number | null }} The new game status and the index of
     * the cell that was removed, if any.
     */
    makeMove(index: number): { status: GameStatus; removed: number | null } {
        if (this.status !== 'ONGOING' || this.board.isCellOccupied(index)) {
            return { status: this.status, removed: null };
        }

        this.board.makeMove(index, this.current);
        this.history[this.current].push(index);

        let removed: number | null = null;
        if (this.history[this.current].length > InfinitoeGame.MAX_MOVES_PER_PLAYER) {
            removed = this.history[this.current].shift()!;
            this.board.removeMove(removed, this.current);
        }

        if (this.board.hasWin(this.current)) {
            this.status = `${this.current}_WIN`;
        } else {
            this.current = this.current === 'X' ? 'O' : 'X';
        }

        return { status: this.status, removed };
    }

    /**
     * Resets the game to its initial state. Because sometimes you just need a fresh start.
     */
    reset(): void {
        this.board.reset();
        this.current = 'X';
        this.history = { X: [], O: [] };
        this.status = 'ONGOING';
    }

    /**
     * Checks if the game is over.
     *
     * @returns {boolean} True if the game is over, false otherwise.
     */
    isGameOver(): boolean {
        return this.status !== 'ONGOING';
    }

    /**
     * Gets the current status of the game.
     *
     * @returns {GameStatus} The current status of the game.
     */
    getGameStatus(): GameStatus {
        return this.status;
    }
}
