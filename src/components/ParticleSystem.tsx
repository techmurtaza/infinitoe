/**
 * @fileoverview Particle system for creating epic celebration effects.
 * This component creates particles that explode outward from a central point,
 * perfect for winner/loser celebrations and other dramatic moments.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
}

interface ParticleSystemProps {
    isActive: boolean;
    type: 'win' | 'lose' | 'celebration';
    intensity?: number;
    duration?: number;
    colors?: string[];
}

const PARTICLE_CONFIGS = {
    win: {
        colors: ['#00ff41', '#00f5ff', '#ffff00', '#ff4500'],
        particleCount: 50,
        speed: 8,
        gravity: 0.2,
        life: 60,
    },
    lose: {
        colors: ['#ff0080', '#8000ff', '#ff4500'],
        particleCount: 30,
        speed: 6,
        gravity: 0.3,
        life: 45,
    },
    celebration: {
        colors: ['#00f5ff', '#ff0080', '#8000ff', '#00ff41', '#ffff00'],
        particleCount: 80,
        speed: 10,
        gravity: 0.15,
        life: 80,
    },
};

export default function ParticleSystem({
    isActive,
    type,
    intensity = 1,
    duration = 3000,
    colors,
}: ParticleSystemProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const [_particles, setParticles] = useState<Particle[]>([]);

    const config = PARTICLE_CONFIGS[type];
    const particleColors = colors || config.colors;

    const createParticle = (centerX: number, centerY: number): Particle => {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * config.speed + 2) * intensity;
        const life = config.life * intensity;

        return {
            id: Math.random(),
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: life,
            maxLife: life,
            color: particleColors[Math.floor(Math.random() * particleColors.length)],
            size: Math.random() * 6 + 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
        };
    };

    const updateParticles = (particleList: Particle[]): Particle[] => {
        return particleList
            .map(particle => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vy: particle.vy + config.gravity,
                vx: particle.vx * 0.99, // Air resistance
                life: particle.life - 1,
                rotation: particle.rotation + particle.rotationSpeed,
            }))
            .filter(particle => particle.life > 0);
    };

    const drawParticles = (canvas: HTMLCanvasElement, particleList: Particle[]) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particleList.forEach(particle => {
            const alpha = particle.life / particle.maxLife;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            // Create gradient for each particle
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, particle.color + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();

            // Add sparkle effect for celebration
            if (type === 'celebration' && Math.random() < 0.3) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.globalAlpha = alpha * 0.8;
                ctx.beginPath();
                ctx.moveTo(-particle.size * 0.8, 0);
                ctx.lineTo(particle.size * 0.8, 0);
                ctx.moveTo(0, -particle.size * 0.8);
                ctx.lineTo(0, particle.size * 0.8);
                ctx.stroke();
            }

            ctx.restore();
        });
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setParticles(prevParticles => {
            const updated = updateParticles(prevParticles);
            drawParticles(canvas, updated);
            return updated;
        });

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        const updateCanvasSize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Create initial burst of particles
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const particleCount = config.particleCount * intensity;

            const newParticles = Array.from({ length: particleCount }, () =>
                createParticle(centerX, centerY)
            );

            setParticles(newParticles);

            // Start animation
            animationRef.current = requestAnimationFrame(animate);

            // Stop after duration
            const timer = setTimeout(() => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                setParticles([]);
            }, duration);

            return () => {
                clearTimeout(timer);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }
    }, [isActive, type, intensity, duration]);

    if (!isActive) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 pointer-events-none z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ mixBlendMode: 'screen' }}
                />
            </motion.div>
        </AnimatePresence>
    );
}

// Utility component for creating particle bursts at specific positions
export function ParticleBurst({
    x,
    y,
    isActive,
    type = 'celebration',
    colors,
}: {
    x: number;
    y: number;
    isActive: boolean;
    type?: 'win' | 'lose' | 'celebration';
    size?: number;
    colors?: string[];
}) {
    const [particles, setParticles] = useState<JSX.Element[]>([]);

    useEffect(() => {
        if (isActive) {
            const config = PARTICLE_CONFIGS[type];
            const particleColors = colors || config.colors;
            const particleCount = Math.floor(config.particleCount * 0.3); // Smaller burst

            const newParticles = Array.from({ length: particleCount }, (_, i) => {
                const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
                const distance = Math.random() * 100 + 50;
                const duration = Math.random() * 1 + 0.5;
                const color = particleColors[Math.floor(Math.random() * particleColors.length)];

                return (
                    <motion.div
                        key={`particle-${i}-${Date.now()}`}
                        className="absolute w-2 h-2 rounded-full pointer-events-none"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}`,
                            left: x,
                            top: y,
                        }}
                        initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            opacity: 1,
                        }}
                        animate={{
                            x: Math.cos(angle) * distance,
                            y: Math.sin(angle) * distance,
                            scale: [0, 1, 0],
                            opacity: [1, 1, 0],
                        }}
                        transition={{
                            duration: duration,
                            ease: 'easeOut',
                        }}
                    />
                );
            });

            setParticles(newParticles);

            // Clear particles after animation
            const timer = setTimeout(() => {
                setParticles([]);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isActive, x, y, type, colors]);

    return <div className="fixed inset-0 pointer-events-none z-40">{particles}</div>;
}
