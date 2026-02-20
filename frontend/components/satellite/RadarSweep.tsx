'use client';

export function RadarSweep({ size = 64 }: { size?: number }) {
    const r = size / 2;
    const cx = r;
    const cy = r;

    return (
        <div
            className="pointer-events-none select-none"
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                fill="none"
            >
                {/* Concentric circles */}
                {[0.25, 0.5, 0.75, 1].map((f) => (
                    <circle
                        key={f}
                        cx={cx}
                        cy={cy}
                        r={r * f - 1}
                        stroke="rgba(0,245,255,0.12)"
                        strokeWidth="1"
                    />
                ))}

                {/* Cross-hairs */}
                <line x1={cx} y1={0} x2={cx} y2={size} stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
                <line x1={0} y1={cy} x2={size} y2={cy} stroke="rgba(0,245,255,0.1)" strokeWidth="1" />

                {/* Sweeping gradient arc */}
                <g className="radar-arc" style={{ transformOrigin: `${cx}px ${cy}px` }}>
                    <defs>
                        <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(0,245,255,0)" />
                            <stop offset="100%" stopColor="rgba(0,245,255,0.35)" />
                        </radialGradient>
                    </defs>
                    {/* Cone: 90° sweep */}
                    <path
                        d={`M ${cx} ${cy} L ${cx} ${cy - r + 2} A ${r - 2} ${r - 2} 0 0 1 ${cx + (r - 2)} ${cy} Z`}
                        fill="url(#sweepGrad)"
                    />
                    {/* Leading edge */}
                    <line
                        x1={cx}
                        y1={cy}
                        x2={cx}
                        y2={cy - r + 2}
                        stroke="rgba(0,245,255,0.7)"
                        strokeWidth="1.5"
                    />
                </g>

                {/* Center dot */}
                <circle cx={cx} cy={cy} r="2" fill="rgba(0,245,255,0.8)" />
            </svg>
        </div>
    );
}
