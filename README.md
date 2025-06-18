# 🔥 Infinitoe: The Tic-Tac-Toe That Never Ends

A game of tic-tac-toe so addictive, your dopamine receptors will file for a union. Built for the vibes of Gen-Z, this isn't your grandpa's tic-tac-toe. It's a relentless, no-draw, high-octane battle of wits where the board is always in flux.

## 📜 Table of Contents

- [Project Philosophy](#-project-philosophy)
- [What Makes This Special](#-what-makes-this-special)
- [Technical Architecture](#-technical-architecture)
- [Code Deep Dive](#-code-deep-dive)
- [Getting Started](#-getting-started)
- [How to Contribute](#-how-to-contribute)
- [Final Words](#-final-words)

## 🤔 Project Philosophy

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci

We started with a complex system of draw prevention, heuristics, and all sorts of fancy algorithms. But then we realized: the best ideas are often the simplest. The core of Infinitoe is a single, elegant rule: a 3-move rolling window. It's a ruthless, yet beautiful, constraint that forces players to think on their feet and adapt to an ever-changing board.

## ✨ What Makes This Special

- **Draws are impossible.** The game literally cannot end in a tie.
- **Max 3 moves per player.** Each player can only have three pieces on the board at a time.
- **On your 4th move, your 1st move is removed.** It's a simple First-In, First-Out (FIFO) queue. This forces constant action and creates a dynamic, ever-changing board.
- **Buttery smooth animations** with Framer Motion.
- **Dopamine-hitting effects** for every action.
- **Three levels of AI** to test your skills, from a "lol, random" Easy mode to a "good luck, buddy" Hard mode.

## 🛠️ Technical Architecture

- **Engine:** TypeScript, with a focus on performance and a clean separation of concerns.
- **State:** A bitboard representation for the board state, allowing for O(1) win checking.
- **UI:** React with Framer Motion, Tailwind CSS, and Lucide Icons.
- **Build:** Vite for a lightning-fast development environment.

## 🚀 Code Deep Dive

### The Engine

The `src/engine` directory is the heart of the game. It's where the magic happens.

- **`Game.ts`**: The main game logic, including the rolling window mechanic.
- **`Board.ts`**: A high-performance bitboard implementation for O(1) win checking.
- **`AI.ts`**: Three levels of AI, from a random-move generator to a minimax-powered beast.
- **`index.ts`**: A clean, simple export of the engine's public API.

### The UI

The `src/components` directory is where the pretty stuff lives.

- **`Infinitoe.tsx`**: The main React component, with all the UI logic, state management, and Framer Motion animations.

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🤝 How to Contribute

Got an idea? A bug fix? A feature request? We're all ears. Here's how you can contribute:

1. **Fork the repo.**
2. **Create a new branch.** (`git checkout -b feature/your-feature`)
3. **Make your changes.**
4. **Commit your changes.** (`git commit -am 'Add some feature'`)
5. **Push to the branch.** (`git push origin feature/your-feature`)
6. **Create a new Pull Request.**

## 🎤 Final Words

This was a journey of discovery, from a complex, over-engineered solution to a simple, elegant one. It's a testament to the power of "less is more." We hope you enjoy playing it as much as we enjoyed building it. Now go get your dopamine hit. You've earned it.

---

_Built with 💜 for the dopamine generation._
