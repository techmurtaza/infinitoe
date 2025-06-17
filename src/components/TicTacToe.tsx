/*
 * Gen-Z Addictive Tic-Tac-Toe UI
 * Smooth animations, dopamine-hitting effects, modern design
 */

import { useState,  useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle, Zap, Sparkles, RotateCcw, Settings } from 'lucide-react';
import { TicTacToeGame, Player, EasyAI, MediumAI, HardAI, AI } from '../engine';

type GameMode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function TicTacToe() {
  const [game] = useState(() => new TicTacToeGame());
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [ai, setAi] = useState<AI>(new MediumAI());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [removedCells, setRemovedCells] = useState<number[]>([]);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [streak, setStreak] = useState(0);

  // Update board state
  const updateBoard = useCallback(() => {
    setBoard(game.getBoardArray());
    setMoveCount(game.getMoveCount());
  }, [game]);

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || game.isGameOver()) return;
    if (gameMode === 'ai' && game.getCurrentPlayer() === 'O' && isAiThinking) return;

    const prevBoard = [...board];
    const success = game.makeMove(index);
    
    if (success) {
      setLastMove(index);
      updateBoard();
      
      // Check for silent removals (now potentially 2 cells)
      const newBoard = game.getBoardArray();
      const removed: number[] = [];
      for (let i = 0; i < 9; i++) {
        if (prevBoard[i] && !newBoard[i]) {
          removed.push(i);
        }
      }
      
      if (removed.length > 0) {
        setRemovedCells(removed);
        setTimeout(() => setRemovedCells([]), 1500); // Longer timeout for 2 removals
      }

      // Handle AI move if in AI mode
      if (gameMode === 'ai' && !game.isGameOver() && game.getCurrentPlayer() === 'O') {
        setIsAiThinking(true);
        
        // Add delay for better UX
        setTimeout(() => {
          const aiMove = ai.chooseMove(game);
          const aiSuccess = game.makeMove(aiMove);
          if (aiSuccess) {
            setLastMove(aiMove);
            updateBoard();
          }
          setIsAiThinking(false);
        }, 500 + Math.random() * 1000); // 0.5-1.5s delay
      }

      // Update win streak
      if (game.isGameOver()) {
        const winner = game.getWinner();
        if (gameMode === 'pvp' || (gameMode === 'ai' && winner === 'X')) {
          setStreak(prev => prev + 1);
        } else {
          setStreak(0);
        }
      }
    }
  };

  // Reset game
  const resetGame = () => {
    game.reset();
    updateBoard();
    setLastMove(null);
    setRemovedCells([]);
    setIsAiThinking(false);
  };

  // Change AI difficulty
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const aiMap = {
      easy: new EasyAI(),
      medium: new MediumAI(),
      hard: new HardAI()
    };
    setAi(aiMap[newDifficulty]);
  };

  // Get status message
  const getStatusMessage = () => {
    const winner = game.getWinner();
    const currentPlayer = game.getCurrentPlayer();
    
    if (winner) {
      if (gameMode === 'ai') {
        return winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!';
      }
      return `🏆 Player ${winner} Wins!`;
    }
    
    if (isAiThinking) return '🤖 AI is thinking...';
    
    if (gameMode === 'ai') {
      return currentPlayer === 'X' ? 'Your turn' : "AI's turn";
    }
    
    return `Player ${currentPlayer}'s turn`;
  };

  const cellVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    removed: {
      scale: 0,
      opacity: 0,
      rotate: 180,
      transition: { duration: 0.3 }
    }
  };

  const boardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        staggerChildren: 0.1
      }
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
          Tic-Tac-Toe XL
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
              {game.getWinner() === 'X' ? '🔥' : '🤖'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 