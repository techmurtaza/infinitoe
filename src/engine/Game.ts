/*
 * Main game engine with rolling 6-move window
 * Maximum 6 moves per player - oldest gets removed automatically
 */

import { Board, Player } from './Board';

export type GameStatus = 'ONGOING' | 'X_WIN' | 'O_WIN';

export class TicTacToeGame {
  private board = new Board();
  private current: Player = 'X';
  private history: Record<Player, number[]> = { X: [], O: [] };
  private status: GameStatus = 'ONGOING';
  private moveCount = 0;
  private onStateChange?: () => void;
  private static readonly MAX_MOVES_PER_PLAYER = 3;

  constructor(onStateChange?: () => void) {
    this.onStateChange = onStateChange;
  }

  getCurrentPlayer(): Player {
    return this.current;
  }

  getStatus(): GameStatus {
    return this.status;
  }

  getBoard(): Board {
    return this.board;
  }

  getMoveCount(): number {
    return this.moveCount;
  }

  getHistory(): Record<Player, number[]> {
    return this.history;
  }

  makeMove(pos: number): boolean {
    if (this.status !== 'ONGOING') return false;
    if (this.board.isCellOccupied(pos)) return false;

    // Make the move
    this.board.makeMove(pos, this.current);
    this.history[this.current].push(pos);
    this.moveCount++;

    // Check for immediate win
    if (this.board.hasWin(this.current)) {
      this.status = `${this.current}_WIN` as GameStatus;
      this.notifyStateChange();
      return true;
    }

    // Rolling window: if player has > 3 moves, remove the oldest
    if (this.history[this.current].length > TicTacToeGame.MAX_MOVES_PER_PLAYER) {
      const oldestMove = this.history[this.current].shift()!; // Remove first element
      this.board.removeMove(oldestMove, this.current);
      this.moveCount--;
    }

    // Switch turns
    this.current = this.current === 'X' ? 'O' : 'X';
    this.notifyStateChange();
    return true;
  }

  reset(): void {
    this.board.reset();
    this.current = 'X';
    this.history = { X: [], O: [] };
    this.status = 'ONGOING';
    this.moveCount = 0;
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  /**
   * Get board state as array for React rendering
   */
  getBoardArray(): (Player | null)[] {
    return this.board.toArray();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.status !== 'ONGOING';
  }

  /**
   * Get winner if game is over
   */
  getWinner(): Player | null {
    if (this.status === 'X_WIN') return 'X';
    if (this.status === 'O_WIN') return 'O';
    return null;
  }
} 