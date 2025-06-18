/**
 * @fileoverview This file contains the AI for the game. We have three levels of difficulty: Easy,
 * Medium, and Hard. Easy is a random-move generator, Medium is a heuristic-based AI, and Hard is a
 * minimax-powered beast. Choose your poison.
 */

import { InfinitoeGame } from './Game';
import { Board, Player } from './Board';

export interface AI {
    /**
     * Chooses a move for the AI to make.
     *
     * @param {InfinitoeGame} game The current game state.
     * @returns {number} The index of the cell to move to.
     */
    chooseMove(game: InfinitoeGame): number;
}

/**
 * The Easy AI. It's not very smart, but it's trying its best. It chooses a random legal move,
 * which is about as effective as you'd expect.
 */
export class EasyAI implements AI {
    chooseMove(game: InfinitoeGame): number {
        const moves = game.getBoard().getLegalMoves();
        return moves[Math.floor(Math.random() * moves.length)];
    }
}

/**
 * The Medium AI. It's a bit smarter than the Easy AI, but it's still no genius. It uses a
 * heuristic-based approach to choose its moves, which is a fancy way of saying it follows a
 * set of rules. It's not perfect, but it'll put up a fight.
 */
export class MediumAI implements AI {
    chooseMove(game: InfinitoeGame): number {
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
        const oppositeCorners = [
            [0, 8],
            [2, 6],
            [6, 2],
            [8, 0],
        ];
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

    /**
     * Finds a fork move for the given player. A fork is a move that creates two ways to win on the
     * next turn. It's a classic tic-tac-toe strategy, and it's just as effective here.
     *
     * @private
     * @param {Board} board The current board state.
     * @param {Player} player The player to find a fork for.
     * @returns {number | null} The index of the fork move, or null if none is found.
     */
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

/**
 * The Hard AI. This is where things get serious. It uses a minimax algorithm with alpha-beta
 * pruning to find the optimal move. It's not unbeatable, but it's close. Good luck.
 */
export class HardAI implements AI {
    private maxDepth = 8; // Reasonable depth for performance

    chooseMove(game: InfinitoeGame): number {
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

    /**
     * The minimax algorithm. It's a recursive function that explores the game tree, looking for the
     * best possible move. It's a bit of a beast, but it's what makes the Hard AI so hard.
     *
     * @private
     * @param {Board} board The current board state.
     * @param {Player} currentPlayer The player whose turn it is.
     * @param {Player} aiPlayer The AI player.
     * @param {number} depth The current depth of the search.
     * @param {number} alpha The alpha value for alpha-beta pruning.
     * @param {number} beta The beta value for alpha-beta pruning.
     * @returns {{ move: number | null; score: number }} The best move and its score.
     */
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
            const result = this.minimax(board, opponent, aiPlayer, depth + 1, alpha, beta);

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
