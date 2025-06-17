/*
 * AI Strategies for different difficulty levels
 * Easy: Random moves
 * Medium: Heuristic-based strategic play
 * Hard: Minimax with alpha-beta pruning
 */

import { TicTacToeGame } from './Game';
import { Board, Player } from './Board';

export interface AI {
  chooseMove(game: TicTacToeGame): number;
}

// Easy AI: Random valid moves - perfect for beginners
export class EasyAI implements AI {
  chooseMove(game: TicTacToeGame): number {
    const moves = game.getBoard().getLegalMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

// Medium AI: Strategic heuristic-based play
export class MediumAI implements AI {
  chooseMove(game: TicTacToeGame): number {
    const board = game.getBoard();
    const me = game.getCurrentPlayer();
    const opponent: Player = me === 'X' ? 'O' : 'X';

    // 1. Win if possible
    for (const move of board.getLegalMoves()) {
      const testBoard = board.clone();
      testBoard.makeMove(move, me);
      if (testBoard.hasWin(me)) return move;
    }

    // 2. Block opponent's win
    for (const move of board.getLegalMoves()) {
      const testBoard = board.clone();
      testBoard.makeMove(move, opponent);
      if (testBoard.hasWin(opponent)) return move;
    }

    // 3. Create fork (two winning opportunities)
    const forkMove = this.findForkMove(board, me);
    if (forkMove !== null) return forkMove;

    // 4. Block opponent's fork
    const blockFork = this.findForkMove(board, opponent);
    if (blockFork !== null) return blockFork;

    // 5. Take center if available
    if (!board.isCellOccupied(4)) return 4;

    // 6. Opposite corner strategy
    const oppositeCorners = [[0, 8], [2, 6], [6, 2], [8, 0]];
    for (const [corner, opposite] of oppositeCorners) {
      if (board.getCell(corner) === opponent && !board.isCellOccupied(opposite)) {
        return opposite;
      }
    }

    // 7. Any empty corner
    const corners = [0, 2, 6, 8];
    for (const corner of corners) {
      if (!board.isCellOccupied(corner)) return corner;
    }

    // 8. Any empty side
    const sides = [1, 3, 5, 7];
    for (const side of sides) {
      if (!board.isCellOccupied(side)) return side;
    }

    // Fallback (should not happen)
    return board.getLegalMoves()[0];
  }

  private findForkMove(board: Board, player: Player): number | null {
    const legalMoves = board.getLegalMoves();
    
    for (const move of legalMoves) {
      const testBoard = board.clone();
      testBoard.makeMove(move, player);
      
      // Count how many ways this player can win after this move
      let winningMoves = 0;
      for (const followUp of testBoard.getLegalMoves()) {
        const testBoard2 = testBoard.clone();
        testBoard2.makeMove(followUp, player);
        if (testBoard2.hasWin(player)) {
          winningMoves++;
        }
      }
      
      // If more than one way to win, it's a fork
      if (winningMoves >= 2) {
        return move;
      }
    }
    
    return null;
  }
}

// Hard AI: Minimax with alpha-beta pruning
export class HardAI implements AI {
  private maxDepth = 8; // Reasonable depth for performance

  chooseMove(game: TicTacToeGame): number {
    const result = this.minimax(
      game.getBoard().clone(),
      game.getCurrentPlayer(),
      game.getCurrentPlayer(), // The AI player
      0,
      -Infinity,
      Infinity
    );
    return result.move!;
  }

  private minimax(
    board: Board,
    currentPlayer: Player,
    aiPlayer: Player,
    depth: number,
    alpha: number,
    beta: number
  ): { move: number | null; score: number } {
    
    // Depth limit
    if (depth >= this.maxDepth) {
      return { move: null, score: 0 };
    }

    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';

    // Terminal states
    if (board.hasWin(aiPlayer)) {
      return { move: null, score: 10 - depth }; // Prefer faster wins
    }
    if (board.hasWin(opponent)) {
      return { move: null, score: -10 + depth }; // Delay losses
    }

    const legalMoves = board.getLegalMoves();
    
    // No special draw handling needed - rolling window prevents board from filling
    if (legalMoves.length === 0) {
      return { move: null, score: 0 }; // Shouldn't happen with rolling window
    }

    // Minimax search
    let bestMove: number | null = null;
    let bestScore = currentPlayer === aiPlayer ? -Infinity : Infinity;

    for (const move of legalMoves) {
      // Make the move
      board.makeMove(move, currentPlayer);

      // Recursive call
      const result = this.minimax(
        board,
        opponent,
        aiPlayer,
        depth + 1,
        alpha,
        beta
      );

      // Undo the move
      board.removeMove(move, currentPlayer);

      // Update best score
      if (currentPlayer === aiPlayer) {
        // Maximizing player (AI)
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        // Minimizing player (opponent)
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, bestScore);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    return { move: bestMove, score: bestScore };
  }
} 