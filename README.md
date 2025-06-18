# 🔥 Infinitoe: A Cinematic Tic-Tac-Toe Experience

This isn't just a game; it's a vibe. A relentless, cyberpunk-inspired battle of wits set in a world of neon glows, particle explosions, and immersive sound. Forget everything you know about tic-tac-toe. This is a high-octane, visually stunning duel where draws are impossible and every move feels epic.

## 📜 Table of Contents

- [A New Philosophy: The Experience is Everything](#-a-new-philosophy-the-experience-is-everything)
- [Core Gameplay Mechanics](#-core-gameplay-mechanics)
- [The Cinematic Transformation](#-the-cinematic-transformation)
  - [Visuals: A Cyberpunk Dreamscape](#-visuals-a-cyberpunk-dreamscape)
  - [Sound: Immersive Audio Feedback](#-sound-immersive-audio-feedback)
  - [Animations: Dynamic & Satisfying](#-animations-dynamic--satisfying)
- [Technical Architecture](#-technical-architecture)
- [Developer Experience (DX) First](#-developer-experience-dx-first)
- [Getting Started](#-getting-started)
- [How to Contribute](#-how-to-contribute)

## 🔮 A New Philosophy: The Experience is Everything

We started with a simple goal: to create a tic-tac-toe game that never ends in a draw. We achieved that with a simple, elegant rule—the 3-move rolling window.

But a great mechanic is nothing without a great experience. This project's new philosophy is that **presentation matters**. We've transformed a simple logic game into a polished, experience-driven product that's as much fun to watch and hear as it is to play.

## ✨ Core Gameplay Mechanics

- **Draws Are Impossible:** The game logic fundamentally prevents ties.
- **Max 3 Moves Per Player:** The board has limited space, forcing strategic trade-offs.
- **FIFO Moves:** On your 4th move, your 1st move is automatically removed. This "First-In, First-Out" system creates a constantly evolving battlefield.
- **Three AI Difficulties:** From a casual opponent to a ruthless, strategic AI.

## 🎬 The Cinematic Transformation

This isn't just a facelift; it's a complete reimagining of the game's sensory experience.

### 🌃 Visuals: A Cyberpunk Dreamscape
- **Dark, Neon-Infused Theme:** A beautiful, easy-on-the-eyes dark mode with glowing neon accents.
- **Glass Morphism UI:** A modern, layered interface with blurred, semi-transparent surfaces.
- **Dynamic Background:** An animated cyberpunk grid and floating, glowing orbs create a sense of depth and atmosphere.
- **High-Performance Particle System:** Explosions for wins and piece removals are rendered on a `<canvas>` for buttery-smooth performance.

### 🔊 Sound: Immersive Audio Feedback
- **Robust Sound Engine:** A custom `useSoundSystem` hook manages all in-game audio.
- **Context-Aware Effects:** Unique sounds for clicks, piece placements, removals, wins, and losses.
- **Synthetic Fallback:** If audio files fail to load, the system **automatically generates synthetic sounds** using the Web Audio API, ensuring the game never feels broken.

### 🎞️ Animations: Dynamic & Satisfying
- **Anime.js & Framer Motion:** A powerful combination for fluid, physics-based animations.
- **Screen Shake:** Epic wins are punctuated with a satisfying screen shake effect.
- **Interactive UI:** Every button and cell responds to user interaction with subtle, delightful animations.

## 🛠️ Technical Architecture

The project is built on a modern, professional-grade stack designed for performance, scalability, and an excellent developer experience.

- **Engine:** Pure, dependency-free TypeScript for the core game logic.
- **UI:** React, Vite, and Tailwind CSS.
- **Animation:** Framer Motion for React-based animations and Anime.js for targeted, high-performance DOM manipulation.
- **Audio:** Howler.js with a custom hook for a robust, fallback-first audio system.
- **Particles:** A custom, performant `<canvas>`-based particle engine.

### Directory Structure
```
src/
├── components/
│   ├── Infinitoe.tsx      # Main cinematic game component
│   └── ParticleSystem.tsx # High-performance canvas particle engine
├── engine/                # Core game logic (TypeScript)
├── hooks/
│   └── useSoundSystem.ts  # Centralized audio management
├── public/
│   └── sounds/            # Location for game audio assets
└── index.css              # Cyberpunk theme foundation & CSS variables
```

## 👨‍💻 Developer Experience (DX) First

A great product is built with great tools. We've invested heavily in the DX to make this codebase a joy to work in.

- **TypeScript:** Strict type safety across the entire codebase.
- **ESLint:** Enforces code quality and best practices.
- **Prettier:** Provides automatic, consistent code formatting.
- **Automated Scripts:** `lint`, `format`, `build`, and `dev` scripts are pre-configured for a seamless workflow.

## 🏁 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open http://localhost:5173 (or the port shown in your terminal)
```

### Useful Scripts
- `npm run lint`: Check for code quality issues.
- `npm run format`: Automatically format all code.
- `npm run build`: Create a production-ready build.

## 🤝 How to Contribute

Ideas and contributions are welcome!

1.  **Fork the repo.**
2.  **Create a new branch:** `git checkout -b feature/your-amazing-idea`
3.  **Make your changes.**
4.  **Commit your changes:** `git commit -m 'feat: Add some amazing feature'`
5.  **Push to the branch:** `git push origin feature/your-amazing-idea`
6.  **Open a new Pull Request.**

---

_Built with 💜 for the dopamine generation._
