import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useM3Theme } from '../context/M3ThemeContext';

interface AudioVisualizerProps {
    barColor?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ barColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { isPlaying } = useMusicContext();
    const { colorScheme } = useM3Theme();

    const color = barColor || colorScheme.primary;

    const initAudio = useCallback(() => {
        if (isInitialized) return;

        // Find the audio element
        const audioElement = document.querySelector('audio');
        if (!audioElement) {
            console.log('No audio element found');
            return;
        }

        try {
            // Create audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const audioContext = audioContextRef.current;

            // Create analyser
            if (!analyserRef.current) {
                analyserRef.current = audioContext.createAnalyser();
                analyserRef.current.fftSize = 256;
                analyserRef.current.smoothingTimeConstant = 0.8;
            }

            // Create source (only once per audio element)
            if (!sourceRef.current) {
                try {
                    sourceRef.current = audioContext.createMediaElementSource(audioElement);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContext.destination);
                } catch (e) {
                    // Source might already be connected
                    console.log('Audio source already connected');
                }
            }

            setIsInitialized(true);
        } catch (error) {
            console.error('Error initializing audio analyzer:', error);
        }
    }, [isInitialized]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;

        if (!canvas || !analyser) {
            animationRef.current = requestAnimationFrame(draw);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const barCount = 32;
        const barWidth = width / barCount - 4;
        const gap = 4;

        for (let i = 0; i < barCount; i++) {
            // Map the frequency data to bar index
            const dataIndex = Math.floor((i / barCount) * bufferLength);
            const value = dataArray[dataIndex] || 0;

            // Calculate bar height with some minimum
            const barHeight = Math.max(4, (value / 255) * height * 0.8);

            const x = i * (barWidth + gap);
            const y = height - barHeight;

            // Create gradient for bar
            const gradient = ctx.createLinearGradient(x, y, x, height);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, `${color}40`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();
        }

        animationRef.current = requestAnimationFrame(draw);
    }, [color]);

    useEffect(() => {
        if (isPlaying) {
            initAudio();
        }
    }, [isPlaying, initAudio]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [draw]);

    // Resize canvas to match container
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
            }
        });

        resizeObserver.observe(canvas.parentElement || canvas);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="absolute bottom-32 left-0 right-0 h-32 px-8">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ opacity: 0.8 }}
            />
        </div>
    );
};

export default AudioVisualizer;
