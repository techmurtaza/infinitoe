# 🔥 Tic-Tac-Toe XL - The Never-Ending Game

This isn't your grandma's tic-tac-toe. We've eliminated draws forever with a dead-simple, brutally effective **rolling move window**. The game never stops.

## 🚀 What Makes This Special

### ⚡ The 6-Move-Max Rule
- **Draws are impossible.** The game literally cannot end in a tie.
- **Max 3 moves per player.** Each player can only have three pieces on the board at a time.
- **On your 4th move, your 1st move is removed.** It's a simple First-In, First-Out (FIFO) queue. This forces constant action and creates a dynamic, ever-changing board.
- **No complex rules.** No impact scoring, no draw prediction. The game's core mechanic is as simple as it is ruthless.

### 🎨 Gen-Z UI/UX
- **Buttery smooth animations** with Framer Motion.
- **Dopamine-hitting effects** for every action.
- **Modern, responsive design** that's built for vibes.

### 🎮 Smart AI Opponents
- Three difficulties, from random-moving `Easy` to a `Hard` AI using a minimax solver that understands the rolling-window mechanic.

## 🏗️ Technical Architecture

- **Engine:** TypeScript, focused on performance and clean separation of concerns.
- **State:** Bitboard representation for the board state, allowing for O(1) win checking.
- **UI:** React with Framer Motion, Tailwind CSS, and Lucide Icons.
- **Build:** Vite for a lightning-fast development environment.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 The Core Mechanic: FIFO Moves

The entire no-draw system is powered by this simple logic in the game engine:

```typescript
// src/engine/Game.ts
const MAX_MOVES_PER_PLAYER = 3;

// After a player makes a move...
if (this.history[player].length > MAX_MOVES_PER_PLAYER) {
  // Remove the oldest move from history and the board
  const oldestMove = this.history[player].shift()!;
  this.board.removeMove(oldestMove, player);
}
```

This elegant solution is all that's needed to prevent draws and create a perpetually evolving game state.

---

*Built with 💜 for the dopamine generation.* 