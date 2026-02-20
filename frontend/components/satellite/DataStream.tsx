'use client';

import { useMemo } from 'react';

function randomHex() {
    return Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function randomVal() {
    const types = [
        () => `${(Math.random() * 999).toFixed(1)}`,
        () => `0x${randomHex()}`,
        () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        () => `SIG:${Math.floor(Math.random() * 100)}%`,
        () => `LAT:${(Math.random() * 90).toFixed(4)}`,
        () => `LON:${(Math.random() * 180).toFixed(4)}`,
        () => `PKT:${Math.floor(Math.random() * 9999)}`,
        () => `T+${Math.floor(Math.random() * 3600)}s`,
    ];
    return types[Math.floor(Math.random() * types.length)]();
}

export function DataStream() {
    // Generate two copies for seamless loop
    const lines = useMemo(() => Array.from({ length: 40 }, () => randomVal()), []);

    return (
        <div className="overflow-hidden h-full relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
            <div className="data-stream-inner font-mono text-xs leading-6 text-accent-cyan/40 select-none whitespace-nowrap">
                {/* Two copies for seamless infinite scroll */}
                {[...lines, ...lines].map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-accent-cyan/20">{'>'}</span>
                        <span>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
