/**
 * @fileoverview This is the main UI component for the game. It's responsible for rendering the
 * game board, handling user input, and displaying the game state. It's a beast of a component,
 * but it's what makes the game look and feel so good.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle, Zap, Sparkles, RotateCcw, Settings } from 'lucide-react';
import { InfinitoeGame, Player, EasyAI, MediumAI, HardAI, AI } from '../engine';

type GameMode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * The main UI component for the game. It's a functional component that uses React hooks to manage
 * its state. It's also responsible for rendering the game board, handling user input, and
 * displaying the game state.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function Infinitoe() {
  /**
   * The game state. We use the `useState` hook to manage the game state, and we initialize it with
   * a new instance of the `InfinitoeGame` class.
   *
   * @private
   * @type {[InfinitoeGame, React.Dispatch<React.SetStateAction<InfinitoeGame>>]}
   */
  const [game] = useState(() => new InfinitoeGame());

  /**
   * The game board. We use the `useState` hook to manage the board state, and we initialize it with
   * an array of 9 nulls.
   *
   * @private
   * @type {[<(Player | null)[]>, React.Dispatch<React.SetStateAction<(Player | null)[]>>]}
   */
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));

  /**
   * The game mode. We use the `useState` hook to manage the game mode, and we initialize it to 'pvp'.
   *
   * @private
   * @type {[GameMode, React.Dispatch<React.SetStateAction<GameMode>>]}
   */
  const [gameMode, setGameMode] = useState<GameMode>('pvp');

  /**
   * The AI difficulty. We use the `useState` hook to manage the AI difficulty, and we initialize it
   * to 'medium'.
   *
   * @private
   * @type {[Difficulty, React.Dispatch<React.SetStateAction<Difficulty>>]}
   */
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  /**
   * The AI instance. We use the `useState` hook to manage the AI instance, and we initialize it to
   * a new instance of the `MediumAI` class.
   *
   * @private
   * @type {[AI, React.Dispatch<React.SetStateAction<AI>>]}
   */
  const [ai, setAi] = useState<AI>(() => new MediumAI());

  /**
   * Whether the AI is thinking. We use this to disable the board while the AI is making its move.
   *
   * @private
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isAiThinking, setIsAiThinking] = useState(false);

  /**
   * The index of the last move made. We use this to highlight the last move on the board.
   *
   * @private
   * @type {[number | null, React.Dispatch<React.SetStateAction<number | null>>]}
   */
  const [lastMove, setLastMove] = useState<number | null>(null);

  /**
   * An array of cells that have been removed from the board. We use this to highlight the removed
   * cells on the board.
   *
   * @private
   * @type {[number[], React.Dispatch<React.SetStateAction<number[]>>]}
   */
  const [removedCells, setRemovedCells] = useState<number[]>([]);

  /**
   * The current win streak. We use this to display the win streak to the user.
   *
   * @private
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [streak, setStreak] = useState(0);

  /**
   * Whether the settings are shown.
   *
   * @private
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showSettings, setShowSettings] = useState(false);

  /**
   * The number of moves made in the game.
   *
   * @private
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [moveCount, setMoveCount] = useState(0);

  const updateBoard = useCallback(() => {
    setBoard(game.getBoard().toArray());
    setMoveCount(9 - game.getBoard().getLegalMoves().length);
  }, [game]);

  useEffect(() => {
    updateBoard();
  }, [updateBoard]);

  /**
   * Handles a click on a cell. If it's the AI's turn, this function does nothing. Otherwise, it
   * makes a move for the current player and updates the board.
   *
   * @param {number} index The index of the cell that was clicked.
   */
  const handleCellClick = (index: number) => {
    if (game.isGameOver() || (gameMode === 'ai' && game.getCurrentPlayer() === 'O') || board[index]) return;

    const { removed } = game.makeMove(index);
    setLastMove(index);

    if (removed !== null) {
      setRemovedCells(prev => [...prev.filter(c => c !== removed), removed]);
      setTimeout(() => setRemovedCells(prev => prev.filter(c => c !== removed)), 500);
    }

    if (game.isGameOver()) {
      setStreak(prev => (game.getGameStatus() === 'X_WIN' ? prev + 1 : 0));
    }
    
    updateBoard();
  };

  /**
   * The AI's turn. This function is called when it's the AI's turn to make a move. It uses a
   * `setTimeout` to simulate a thinking delay, then it chooses a move and updates the board.
   */
  useEffect(() => {
    if (gameMode === 'ai' && !game.isGameOver() && game.getCurrentPlayer() === 'O') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const move = ai.chooseMove(game);
        const { removed } = game.makeMove(move);
        setLastMove(move);
        if (removed !== null) {
          setRemovedCells(prev => [...prev, removed]);
          setTimeout(() => setRemovedCells(prev => prev.filter(c => c !== removed)), 500);
        }
        if (game.isGameOver()) {
          setStreak(0); // Player's streak is broken by AI win
        }
        setIsAiThinking(false);
        updateBoard();
      }, 500 + Math.random() * 500); // Realistic delay

      return () => clearTimeout(timer);
    }
  }, [board, game, gameMode, ai, updateBoard]);

  /**
   * Resets the game to its initial state.
   */
  const resetGame = () => {
    game.reset();
    updateBoard();
    setLastMove(null);
    setRemovedCells([]);
  };

  /**
   * Changes the AI difficulty.
   *
   * @param {Difficulty} newDifficulty The new difficulty.
   */
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    switch (newDifficulty) {
      case 'easy':
        setAi(new EasyAI());
        break;
      case 'medium':
        setAi(new MediumAI());
        break;
      case 'hard':
        setAi(new HardAI());
        break;
    }
    resetGame();
  };

  /**
   * Gets the status message to display to the user.
   *
   * @returns {string} The status message.
   */
  const getStatusMessage = () => {
    const status = game.getGameStatus();
    if (status === 'X_WIN') return 'Player X Wins! 🏆';
    if (status === 'O_WIN') return gameMode === 'ai' ? 'AI Wins! 🤖' : 'Player O Wins! 🏆';

    if (isAiThinking) {
      return '🤖 AI is thinking...';
    }

    return `Player ${game.getCurrentPlayer()}'s Turn`;
  };

  /**
   * The animation variants for the game board.
   */
  const boardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  /**
   * The animation variants for the cells.
   */
  const cellVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    removed: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-2"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Infinitoe
        </motion.h1>
        <p className="text-gray-300 text-lg">No draws, pure vibes ✨</p>
        
        {streak > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{streak} Win Streak!</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Game Mode Toggle */}
      <motion.div 
        className="flex gap-4 mb-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => {setGameMode('pvp'); resetGame();}}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            gameMode === 'pvp' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          👥 Player vs Player
        </button>
        <button
          onClick={() => {setGameMode('ai'); resetGame();}}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            gameMode === 'ai' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          🤖 vs AI
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-3 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all duration-300"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      {/* AI Difficulty Settings */}
      <AnimatePresence>
        {showSettings && gameMode === 'ai' && (
          <motion.div
            className="flex gap-3 mb-6 relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => changeDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${
                  difficulty === diff
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {diff}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <motion.div 
        className="text-center mb-6 relative z-10"
        key={getStatusMessage()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-2xl font-bold text-white">{getStatusMessage()}</p>
        <p className="text-gray-400 text-sm mt-1">Moves: {moveCount}</p>
      </motion.div>

      {/* Game Board */}
      <motion.div 
        className="grid grid-cols-3 gap-3 mb-8 relative z-10"
        variants={boardVariants}
        initial="hidden"
        animate="visible"
      >
        {board.map((cell, index) => (
          <motion.button
            key={`cell-${index}`}
            onClick={() => handleCellClick(index)}
            className={`
              w-20 h-20 sm:w-28 sm:h-28 rounded-2xl shadow-xl
              flex items-center justify-center relative overflow-hidden
              transition-all duration-300 transform
              ${cell ? 'bg-white/95' : 'bg-white/80 hover:bg-white/95 hover:scale-105'}
              ${lastMove === index ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
              ${removedCells.includes(index) ? 'ring-4 ring-red-400 ring-opacity-75' : ''}
              ${isAiThinking && gameMode === 'ai' && game.getCurrentPlayer() === 'O' && !cell ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            `}
            whileHover={{ scale: cell ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!!cell || game.isGameOver() || (isAiThinking && gameMode === 'ai' && game.getCurrentPlayer() === 'O')}
          >
            <AnimatePresence mode="wait">
              {cell === 'X' && (
                <motion.div
                  variants={cellVariants}
                  initial="hidden"
                  animate="visible"
                  exit="removed"
                  className="text-red-500"
                >
                  <X className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                </motion.div>
              )}
              {cell === 'O' && (
                <motion.div
                  variants={cellVariants}
                  initial="hidden"
                  animate="visible"
                  exit="removed"
                  className="text-blue-500"
                >
                  <Circle className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                </motion.div>
              )}
              {!cell && isAiThinking && gameMode === 'ai' && game.getCurrentPlayer() === 'O' && (
                <motion.div
                  className="text-gray-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cell glow effect */}
            {lastMove === index && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: 2 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="flex gap-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold shadow-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </motion.button>
      </motion.div>

      {/* Win celebration */}
      <AnimatePresence>
        {game.isGameOver() && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-8xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 360, 720]
              }}
              transition={{ duration: 1, type: "spring", stiffness: 200 }}
            >
              {game.getGameStatus() === 'X_WIN' ? '🔥' : '🤖'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 