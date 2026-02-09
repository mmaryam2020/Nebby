
import React, { useEffect, useRef } from 'react';

export const StarsBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear previous stars if any
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'fixed bg-white rounded-full pointer-events-none opacity-20';
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.left = `${Math.random() * 100}vw`;
            container.appendChild(star);
        }

    }, []);

    return <div ref={containerRef} className="absolute inset-0 -z-10" />;
};
