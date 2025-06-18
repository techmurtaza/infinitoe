/**
 * @fileoverview CINEMATIC INFINITOE - The ultimate tic-tac-toe experience.
 * This is the main UI component for the game with dark cyberpunk theme,
 * particle effects, immersive sound design, and responsive animations.
 * Prepare for visual ecstasy! 🔥
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { X, Circle, Zap, RotateCcw, Settings, Volume2, VolumeX, Crown } from 'lucide-react';
// @ts-ignore - animejs doesn't have proper types
import anime from 'animejs';
import { InfinitoeGame, Player, EasyAI, MediumAI, HardAI, AI } from '../engine';
import { useSoundSystem } from '../hooks/useSoundSystem';
import ParticleSystem, { ParticleBurst } from './ParticleSystem';

type GameMode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * THE ULTIMATE INFINITOE COMPONENT 🚀
 * Now with 100% more visual dopamine and audio satisfaction!
 */
export default function Infinitoe() {
    // Game State
    const [game] = useState(() => new InfinitoeGame());
    const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
    const [gameMode, setGameMode] = useState<GameMode>('pvp');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [ai, setAi] = useState<AI>(() => new MediumAI());
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [lastMove, setLastMove] = useState<number | null>(null);
    const [removedCells, setRemovedCells] = useState<number[]>([]);
    const [streak, setStreak] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [moveCount, setMoveCount] = useState(0);

    // Cinematic State
    const [showParticles, setShowParticles] = useState(false);
    const [particleType, setParticleType] = useState<'win' | 'lose' | 'celebration'>('celebration');
    const [screenShake, setScreenShake] = useState(false);
    const [cellBursts, setCellBursts] = useState<
        Array<{ id: string; x: number; y: number; type: 'win' | 'lose' | 'celebration' }>
    >([]);

    // Refs for animations
    const boardRef = useRef<HTMLDivElement>(null);
    const titleControls = useAnimation();

    // Sound System
    const {
        playClick,
        playPlace,
        playRemove,
        playWin,
        playLose,
        playHover,
        playReset,
        playAIThinking,
        stopAIThinking,
        isMuted,
        toggleMute,
        volume,
        setVolume,
    } = useSoundSystem();

    const updateBoard = useCallback(() => {
        setBoard(game.getBoard().toArray());
        setMoveCount(9 - game.getBoard().getLegalMoves().length);
    }, [game]);

    useEffect(() => {
        updateBoard();
    }, [updateBoard]);

    /**
     * Enhanced cell click with EPIC animations and sound
     */
    const handleCellClick = (index: number) => {
        if (
            game.isGameOver() ||
            (gameMode === 'ai' && game.getCurrentPlayer() === 'O') ||
            board[index]
        )
            return;

        // Play satisfying click sound
        playClick();

        // Anime.js piece drop animation
        const cellElement = document.querySelector(`[data-cell="${index}"]`);
        if (cellElement) {
            anime({
                targets: cellElement,
                scale: [0.8, 1.1, 1],
                rotate: [0, 5, 0],
                duration: 400,
                easing: 'easeOutElastic(1, .8)',
            });
        }

        const { removed } = game.makeMove(index);
        setLastMove(index);
        playPlace();

        // Handle piece removal with dramatic effect
        if (removed !== null) {
            setRemovedCells(prev => [...prev.filter(c => c !== removed), removed]);
            playRemove();

            // Create particle burst at removed cell
            const removedElement = document.querySelector(`[data-cell="${removed}"]`);
            if (removedElement) {
                const rect = removedElement.getBoundingClientRect();
                setCellBursts(prev => [
                    ...prev,
                    {
                        id: `burst-${Date.now()}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                        type: 'lose',
                    },
                ]);
            }

            setTimeout(() => setRemovedCells(prev => prev.filter(c => c !== removed)), 500);
        }

        // Handle game end with CELEBRATION
        if (game.isGameOver()) {
            const status = game.getGameStatus();
            if (status === 'X_WIN') {
                setStreak(prev => prev + 1);
                playWin();
                setParticleType('win');
                setShowParticles(true);
                triggerScreenShake();

                // Epic title animation for win
                titleControls.start({
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, 0],
                    transition: { duration: 0.6, ease: 'easeOut' },
                });
            } else {
                setStreak(0);
                playLose();
                setParticleType('lose');
                setShowParticles(true);
            }

            // Stop particles after celebration
            setTimeout(() => setShowParticles(false), 3000);
        }

        updateBoard();
    };

    /**
     * Screen shake effect for epic moments
     */
    const triggerScreenShake = () => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
    };

    /**
     * AI Turn with enhanced thinking effects
     */
    useEffect(() => {
        if (gameMode === 'ai' && !game.isGameOver() && game.getCurrentPlayer() === 'O') {
            setIsAiThinking(true);
            playAIThinking();

            const timer = setTimeout(
                () => {
                    const move = ai.chooseMove(game);
                    const { removed } = game.makeMove(move);
                    setLastMove(move);
                    playPlace();

                    // AI move animation
                    const cellElement = document.querySelector(`[data-cell="${move}"]`);
                    if (cellElement) {
                        anime({
                            targets: cellElement,
                            scale: [0, 1.2, 1],
                            rotate: [180, 0],
                            duration: 600,
                            easing: 'easeOutBounce',
                        });
                    }

                    if (removed !== null) {
                        setRemovedCells(prev => [...prev, removed]);
                        playRemove();
                        setTimeout(
                            () => setRemovedCells(prev => prev.filter(c => c !== removed)),
                            500
                        );
                    }

                    if (game.isGameOver()) {
                        setStreak(0);
                        playLose();
                        setParticleType('lose');
                        setShowParticles(true);
                        setTimeout(() => setShowParticles(false), 3000);
                    }

                    setIsAiThinking(false);
                    stopAIThinking();
                    updateBoard();
                },
                800 + Math.random() * 700
            ); // Realistic AI thinking time

            return () => {
                clearTimeout(timer);
                stopAIThinking();
            };
        }
    }, [
        board,
        game,
        gameMode,
        ai,
        updateBoard,
        playAIThinking,
        stopAIThinking,
        playPlace,
        playRemove,
        playLose,
    ]);

    /**
     * Clean up cell bursts periodically
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setCellBursts(prev => prev.slice(-5)); // Keep only last 5 bursts
        }, 2000);
        return () => clearTimeout(timer);
    }, [cellBursts]);

    /**
     * Reset with style
     */
    const resetGame = () => {
        playReset();
        game.reset();
        updateBoard();
        setLastMove(null);
        setRemovedCells([]);
        setShowParticles(false);
        setCellBursts([]);

        // Animate board reset
        if (boardRef.current) {
            anime({
                targets: boardRef.current.children,
                scale: [1, 0.8, 1],
                rotate: [0, 360],
                delay: anime.stagger(50),
                duration: 400,
                easing: 'easeOutElastic(1, .8)',
            });
        }
    };

    /**
     * Change difficulty with sound feedback
     */
    const changeDifficulty = (newDifficulty: Difficulty) => {
        playClick();
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
     * Get status message with personality
     */
    const getStatusMessage = () => {
        const status = game.getGameStatus();
        if (status === 'X_WIN') return '🔥 LEGENDARY VICTORY! 🔥';
        if (status === 'O_WIN')
            return gameMode === 'ai' ? '🤖 AI DOMINATION 🤖' : '💎 PLAYER O WINS! 💎';

        if (isAiThinking) {
            return '🧠 AI CALCULATING SUPREMACY...';
        }

        return `⚡ PLAYER ${game.getCurrentPlayer()}'S TURN ⚡`;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 },
        },
    };

    const cellVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
        removed: {
            scale: 0,
            opacity: 0,
            rotate: 180,
            transition: { duration: 0.3 },
        },
    };

    return (
        <motion.div
            className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden ${screenShake ? 'animate-pulse' : ''}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                animation: screenShake ? 'screen-shake 0.6s ease-in-out' : undefined,
            }}
        >
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 cyberpunk-grid opacity-20" />

            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -40, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Header Section */}
            <motion.div
                className="text-center mb-8 relative z-10"
                variants={itemVariants}
                animate={titleControls}
            >
                <motion.h1
                    className="game-title text-4xl sm:text-6xl lg:text-7xl mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    INFINITOE
                </motion.h1>
                <motion.p
                    className="text-neon-cyan text-lg sm:text-xl font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    ⚡ NO DRAWS, PURE VIBES ⚡
                </motion.p>

                {/* Epic Streak Display */}
                <AnimatePresence>
                    {streak > 0 && (
                        <motion.div
                            className="flex items-center justify-center gap-3 mt-4 bg-glass rounded-2xl px-6 py-3"
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, y: -20 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Crown className="w-6 h-6 text-neon-yellow" />
                            <span className="text-neon-yellow font-bold text-lg">
                                {streak} WIN STREAK!
                            </span>
                            <Crown className="w-6 h-6 text-neon-yellow" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Game Mode & Settings */}
            <motion.div
                className="flex flex-wrap gap-3 mb-6 relative z-10 justify-center"
                variants={itemVariants}
            >
                <motion.button
                    onClick={() => {
                        setGameMode('pvp');
                        resetGame();
                        playClick();
                    }}
                    className={`px-4 sm:px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        gameMode === 'pvp'
                            ? 'neon-border-cyan bg-glass-hover text-neon-cyan'
                            : 'bg-glass text-gray-300 hover:bg-glass-hover'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={playHover}
                >
                    👥 PvP
                </motion.button>

                <motion.button
                    onClick={() => {
                        setGameMode('ai');
                        resetGame();
                        playClick();
                    }}
                    className={`px-4 sm:px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        gameMode === 'ai'
                            ? 'neon-border-pink bg-glass-hover text-neon-pink'
                            : 'bg-glass text-gray-300 hover:bg-glass-hover'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={playHover}
                >
                    🤖 vs AI
                </motion.button>

                <motion.button
                    onClick={() => {
                        setShowSettings(!showSettings);
                        playClick();
                    }}
                    className="px-4 py-3 rounded-xl bg-glass text-gray-300 hover:bg-glass-hover transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={playHover}
                >
                    <Settings className="w-5 h-5" />
                </motion.button>

                <motion.button
                    onClick={() => {
                        toggleMute();
                        playClick();
                    }}
                    className="px-4 py-3 rounded-xl bg-glass text-gray-300 hover:bg-glass-hover transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={playHover}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
            </motion.div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="mb-6 relative z-10"
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {gameMode === 'ai' && (
                            <div className="flex gap-3 mb-4 justify-center flex-wrap">
                                {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                                    <motion.button
                                        key={diff}
                                        onClick={() => changeDifficulty(diff)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${
                                            difficulty === diff
                                                ? 'neon-border-green bg-glass-hover text-neon-green'
                                                : 'bg-glass text-gray-400 hover:bg-glass-hover'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onMouseEnter={playHover}
                                    >
                                        {diff}
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Volume Control */}
                        <div className="bg-glass rounded-xl p-4 max-w-xs mx-auto">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-4 h-4 text-gray-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={e => setVolume(parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`,
                                    }}
                                />
                                <span className="text-sm text-gray-400 w-8">
                                    {Math.round(volume * 100)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Display */}
            <motion.div
                className="text-center mb-6 relative z-10"
                variants={itemVariants}
                key={getStatusMessage()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.p
                    className="text-xl sm:text-2xl font-bold text-white mb-2"
                    animate={isAiThinking ? { opacity: [1, 0.7, 1] } : {}}
                    transition={isAiThinking ? { duration: 1, repeat: Infinity } : {}}
                >
                    {getStatusMessage()}
                </motion.p>
                <p className="text-gray-400 text-sm">
                    Moves: {moveCount} | Mode: {gameMode.toUpperCase()}
                </p>
            </motion.div>

            {/* EPIC GAME BOARD */}
            <motion.div
                ref={boardRef}
                className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 relative z-10 p-4"
                variants={itemVariants}
            >
                {board.map((cell, index) => (
                    <motion.button
                        key={`cell-${index}`}
                        data-cell={index}
                        onClick={() => handleCellClick(index)}
                        className={`
              cell-neon w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl
              flex items-center justify-center relative overflow-hidden
              ${lastMove === index ? 'active' : ''}
              ${removedCells.includes(index) ? 'removed' : ''}
              ${isAiThinking && gameMode === 'ai' && game.getCurrentPlayer() === 'O' && !cell ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            `}
                        whileHover={!cell ? { scale: 1.05, y: -2 } : {}}
                        whileTap={{ scale: 0.95 }}
                        disabled={
                            !!cell ||
                            game.isGameOver() ||
                            (isAiThinking && gameMode === 'ai' && game.getCurrentPlayer() === 'O')
                        }
                        onMouseEnter={() => !cell && playHover()}
                        variants={cellVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="wait">
                            {cell === 'X' && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit="removed"
                                    className="text-neon-pink"
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <X className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 stroke-[3]" />
                                </motion.div>
                            )}
                            {cell === 'O' && (
                                <motion.div
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit="removed"
                                    className="text-neon-cyan"
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Circle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 stroke-[3]" />
                                </motion.div>
                            )}
                            {!cell &&
                                isAiThinking &&
                                gameMode === 'ai' &&
                                game.getCurrentPlayer() === 'O' && (
                                    <motion.div
                                        className="text-neon-purple"
                                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </motion.div>
                                )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </motion.div>

            {/* Controls */}
            <motion.div className="flex gap-4 relative z-10" variants={itemVariants}>
                <motion.button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-glass hover:bg-glass-hover text-white rounded-xl font-bold transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={playHover}
                >
                    <RotateCcw className="w-5 h-5" />
                    <span className="hidden sm:inline">New Game</span>
                </motion.button>
            </motion.div>

            {/* PARTICLE SYSTEMS */}
            <ParticleSystem
                isActive={showParticles}
                type={particleType}
                intensity={1.2}
                duration={3000}
            />

            {/* Cell Burst Effects */}
            {cellBursts.map(burst => (
                <ParticleBurst
                    key={burst.id}
                    x={burst.x}
                    y={burst.y}
                    isActive={true}
                    type={burst.type}
                />
            ))}

            {/* Win Celebration Overlay */}
            <AnimatePresence>
                {game.isGameOver() && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="text-6xl sm:text-8xl lg:text-9xl"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{
                                scale: [0, 1.3, 1],
                                rotate: [0, 360, 720],
                            }}
                            transition={{ duration: 1.2, type: 'spring', stiffness: 200 }}
                        >
                            {game.getGameStatus() === 'X_WIN'
                                ? '👑'
                                : game.getGameStatus() === 'O_WIN' && gameMode === 'ai'
                                  ? '🤖'
                                  : '💎'}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
