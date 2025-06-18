/**
 * @fileoverview This is the main entry point for the game engine. It exports all the necessary
 * classes and types for the game to run. If you're looking to use the engine in your own project,
 * this is the file you want to import from.
 */

export { Board, type Player } from './Board';
export { InfinitoeGame, type GameStatus } from './Game';
export { type AI, EasyAI, MediumAI, HardAI } from './AI';
