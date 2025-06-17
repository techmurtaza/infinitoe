/*
 * High-performance bitboard-based Tic-Tac-Toe board
 * O(1) win checking, efficient state management
 */

export type Player = 'X' | 'O';

export class Board {
  private static readonly WIN_PATTERNS: number[] = [
    0b111000000, 0b000111000, 0b000000111, // rows
    0b100100100, 0b010010010, 0b001001001, // cols  
    0b100010001, 0b001010100                // diags
  ];

  private xBits = 0;
  private oBits = 0;

  /** Combined occupied mask */
  get occupied(): number {
    return this.xBits | this.oBits;
  }

  /** Get bitboard for specific player */
  getBits(player: Player): number {
    return player === 'X' ? this.xBits : this.oBits;
  }

  makeMove(pos: number, player: Player): void {
    if (pos < 0 || pos > 8) {
      throw new Error(`Invalid position: ${pos}`);
    }
    const mask = 1 << pos;
    if (this.isCellOccupied(pos)) {
      throw new Error(`Cell ${pos} already occupied`);
    }
    if (player === 'X') this.xBits |= mask;
    else this.oBits |= mask;
  }

  removeMove(pos: number, player: Player): void {
    const mask = ~(1 << pos);
    if (player === 'X') this.xBits &= mask;
    else this.oBits &= mask;
  }

  hasWin(player: Player): boolean {
    const bits = player === 'X' ? this.xBits : this.oBits;
    return Board.WIN_PATTERNS.some(pat => (bits & pat) === pat);
  }

  getLegalMoves(): number[] {
    const empty = ~this.occupied & 0x1FF;
    const moves: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (empty & (1 << i)) moves.push(i);
    }
    return moves;
  }

  isCellOccupied(pos: number): boolean {
    return (this.occupied & (1 << pos)) !== 0;
  }

  getCell(pos: number): Player | null {
    if (this.xBits & (1 << pos)) return 'X';
    if (this.oBits & (1 << pos)) return 'O';
    return null;
  }

  /** Convert bitboards to 9-element array for UI */
  toArray(): (Player | null)[] {
    const result: (Player | null)[] = [];
    for (let i = 0; i < 9; i++) {
      result.push(this.getCell(i));
    }
    return result;
  }

  /** Clone the board for AI simulation */
  clone(): Board {
    const clone = new Board();
    clone.xBits = this.xBits;
    clone.oBits = this.oBits;
    return clone;
  }

  reset(): void {
    this.xBits = 0;
    this.oBits = 0;
  }
} 