import { useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './AnimatedBackground.module.css';

function FloatingPaths({ position }: { position: number }) {
    // Generate paths based on the provided formula
    const paths = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
            } ${343 - i * 6}C${1316 - i * 5 * position} ${470 - i * 6} ${1384 - i * 5 * position
            } ${875 - i * 6} ${1384 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(255, 255, 255, ${0.1 + i * 0.03})`, // Adapted for dark mode default
        width: 0.5 + i * 0.03,
    })), [position]);

    const { scrollY } = useScroll();

    // Parallax effect: Move the paths based on scroll
    // Multiply by position to invert/vary direction for the two groups
    const yRange = useTransform(scrollY, [0, 2000], [0, 300 * position]);
    const smoothY = useSpring(yRange, { stiffness: 40, damping: 20 });

    return (
        <motion.div
            className={styles.svgContainer}
            style={{ y: smoothY }}
        >
            <svg
                className={styles.svg}
                viewBox="0 0 1396 316"
                fill="none"
            >
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </motion.div>
    );
}

export const AnimatedBackground = () => {
    return (
        <div className={styles.container}>
            <div className={styles.absoluteInset}>
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>
        </div>
    );
};
