/**
 * @fileoverview Sound system hook for managing all game audio.
 * This hook provides a centralized way to play sounds with volume control,
 * muting, and different sound categories.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { Howl } from 'howler';

interface SoundConfig {
    src: string[];
    volume?: number;
    loop?: boolean;
    sprite?: Record<string, [number, number]>;
}

interface SoundSystem {
    playClick: () => void;
    playPlace: () => void;
    playRemove: () => void;
    playWin: () => void;
    playLose: () => void;
    playHover: () => void;
    playReset: () => void;
    playAIThinking: () => void;
    stopAIThinking: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    volume: number;
    setVolume: (volume: number) => void;
}

// Sound URLs - in a real app, these would be actual audio files
const SOUND_CONFIGS: Record<string, SoundConfig> = {
    ui: {
        src: ['/sounds/ui-sounds.webm', '/sounds/ui-sounds.mp3'],
        volume: 0.6,
        sprite: {
            click: [0, 100],
            hover: [200, 80],
            reset: [400, 150],
        },
    },
    game: {
        src: ['/sounds/game-sounds.webm', '/sounds/game-sounds.mp3'],
        volume: 0.7,
        sprite: {
            place: [0, 200],
            remove: [300, 250],
            win: [600, 800],
            lose: [1500, 600],
        },
    },
    ai: {
        src: ['/sounds/ai-thinking.webm', '/sounds/ai-thinking.mp3'],
        volume: 0.4,
        loop: true,
    },
};

// Fallback: Generate synthetic sounds using Web Audio API
const createSyntheticSound = (
    frequency: number,
    duration: number,
    type: 'sine' | 'square' | 'sawtooth' = 'sine'
) => {
    return () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    };
};

// Synthetic sound generators
const SYNTHETIC_SOUNDS = {
    click: createSyntheticSound(800, 0.1, 'square'),
    hover: createSyntheticSound(600, 0.05, 'sine'),
    place: createSyntheticSound(400, 0.2, 'sine'),
    remove: createSyntheticSound(300, 0.3, 'sawtooth'),
    win: () => {
        // Play a ascending arpeggio for win
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
            setTimeout(() => createSyntheticSound(freq, 0.3, 'sine')(), index * 100);
        });
    },
    lose: () => {
        // Play a descending tone for lose
        const frequencies = [400, 350, 300, 250];
        frequencies.forEach((freq, index) => {
            setTimeout(() => createSyntheticSound(freq, 0.2, 'sawtooth')(), index * 80);
        });
    },
    reset: createSyntheticSound(500, 0.15, 'square'),
};

export function useSoundSystem(): SoundSystem {
    const [isMuted, setIsMuted] = useState(() => {
        // Check localStorage for mute preference
        const saved = localStorage.getItem('infinitoe-muted');
        return saved ? JSON.parse(saved) : false;
    });

    const [volume, setVolumeState] = useState(() => {
        // Check localStorage for volume preference
        const saved = localStorage.getItem('infinitoe-volume');
        return saved ? parseFloat(saved) : 0.7;
    });

    const soundsRef = useRef<Record<string, Howl>>({});
    const aiThinkingRef = useRef<number | null>(null);
    const [useSynthetic, setUseSynthetic] = useState(false);

    // Initialize sound objects
    useEffect(() => {
        const loadSounds = async () => {
            try {
                // Try to load actual sound files
                Object.entries(SOUND_CONFIGS).forEach(([key, config]) => {
                    soundsRef.current[key] = new Howl({
                        ...config,
                        volume: config.volume! * volume,
                        onloaderror: () => {
                            console.warn(
                                `Failed to load sound: ${key}, falling back to synthetic sounds`
                            );
                            setUseSynthetic(true);
                        },
                    });
                });
            } catch (error) {
                console.warn('Howler not available, using synthetic sounds');
                setUseSynthetic(true);
            }
        };

        loadSounds();

        return () => {
            // Cleanup
            Object.values(soundsRef.current).forEach(sound => {
                if (sound) sound.unload();
            });
        };
    }, []);

    // Update volume when changed
    useEffect(() => {
        Object.values(soundsRef.current).forEach(sound => {
            if (sound) sound.volume(volume);
        });
        localStorage.setItem('infinitoe-volume', volume.toString());
    }, [volume]);

    // Update mute preference
    useEffect(() => {
        localStorage.setItem('infinitoe-muted', JSON.stringify(isMuted));
    }, [isMuted]);

    const playSound = useCallback(
        (soundKey: string, spriteKey?: string) => {
            if (isMuted) return;

            if (useSynthetic) {
                // Use synthetic sounds
                const key = (spriteKey || soundKey) as keyof typeof SYNTHETIC_SOUNDS;
                const syntheticSound = SYNTHETIC_SOUNDS[key];
                if (syntheticSound) {
                    syntheticSound();
                }
                return;
            }

            const sound = soundsRef.current[soundKey];
            if (sound) {
                if (spriteKey && (sound as any)._sprite) {
                    sound.play(spriteKey);
                } else {
                    sound.play();
                }
            }
        },
        [isMuted, useSynthetic]
    );

    const playClick = useCallback(() => playSound('ui', 'click'), [playSound]);
    const playHover = useCallback(() => playSound('ui', 'hover'), [playSound]);
    const playReset = useCallback(() => playSound('ui', 'reset'), [playSound]);
    const playPlace = useCallback(() => playSound('game', 'place'), [playSound]);
    const playRemove = useCallback(() => playSound('game', 'remove'), [playSound]);
    const playWin = useCallback(() => playSound('game', 'win'), [playSound]);
    const playLose = useCallback(() => playSound('game', 'lose'), [playSound]);

    const playAIThinking = useCallback(() => {
        if (isMuted) return;

        if (useSynthetic) {
            // Create a subtle thinking sound loop
            const thinkingLoop = () => {
                createSyntheticSound(200, 0.1, 'sine')();
                aiThinkingRef.current = window.setTimeout(thinkingLoop, 800);
            };
            thinkingLoop();
        } else {
            const sound = soundsRef.current.ai;
            if (sound) {
                aiThinkingRef.current = sound.play() as number;
            }
        }
    }, [isMuted, useSynthetic]);

    const stopAIThinking = useCallback(() => {
        if (aiThinkingRef.current !== null) {
            if (useSynthetic) {
                clearTimeout(aiThinkingRef.current);
            } else {
                const sound = soundsRef.current.ai;
                if (sound) {
                    sound.stop(aiThinkingRef.current);
                }
            }
            aiThinkingRef.current = null;
        }
    }, [useSynthetic]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev: boolean) => !prev);
        // Stop any currently playing AI thinking sound when muting
        if (!isMuted) {
            stopAIThinking();
        }
    }, [isMuted, stopAIThinking]);

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(Math.max(0, Math.min(1, newVolume)));
    }, []);

    return {
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
    };
}
