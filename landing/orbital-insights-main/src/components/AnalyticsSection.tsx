import React from "react";
import { motion } from "framer-motion";

function CircularProgress({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-sm">
          {value}%
        </text>
      </svg>
      <span className="data-label text-center">{label}</span>
    </div>
  );
}

function MiniLineChart() {
  const points = [20, 35, 28, 45, 52, 48, 65, 72, 68, 80, 85, 90];
  const width = 300;
  const height = 120;
  const padding = 10;
  const xStep = (width - padding * 2) / (points.length - 1);

  const pathD = points
    .map((p, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (p / 100) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="glass-panel rounded p-4">
      <p className="data-label mb-3">Processing Throughput</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(185 100% 50% / 0.3)" />
            <stop offset="100%" stopColor="hsl(185 100% 50%)" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (height - padding * 2)) / 3}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2)) / 3}
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
          />
        ))}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

function ConfusionMatrix() {
  const data = [
    [92, 3, 2, 3],
    [2, 95, 1, 2],
    [1, 1, 96, 2],
    [3, 2, 1, 94],
  ];
  const labels = ["URB", "FOR", "WAT", "AGR"];

  return (
    <div className="glass-panel rounded p-4">
      <p className="data-label mb-3">Classification Matrix</p>
      <div className="grid grid-cols-5 gap-1 text-center">
        <div />
        {labels.map((l) => (
          <div key={l} className="data-label text-[10px]">{l}</div>
        ))}
        {data.map((row, i) => (
          <React.Fragment key={`row-${i}`}>
            <div className="data-label text-[10px] flex items-center">{labels[i]}</div>
            {row.map((val, j) => (
              <motion.div
                key={`${i}-${j}`}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i * 4 + j) * 0.05, duration: 0.3 }}
                className="font-mono text-xs py-2 rounded"
                style={{
                  backgroundColor:
                    i === j
                      ? `hsl(185 100% 50% / ${val / 120})`
                      : `hsl(var(--muted) / ${val / 200})`,
                  color: i === j ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                {val}
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="relative min-h-screen flex items-center py-24 px-6 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="data-label mb-4">Section 04 — Analytics</p>
          <h2 className="section-heading">
            Intelligence <span className="text-gradient-cyan">Dashboard</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel rounded p-6 flex justify-around"
          >
            <CircularProgress value={96} label="Accuracy" color="hsl(185 100% 50%)" />
            <CircularProgress value={89} label="Recall" color="hsl(140 60% 45%)" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <MiniLineChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ConfusionMatrix />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel rounded p-6 flex flex-wrap justify-around gap-6"
        >
          {[
            { label: "Sectors Scanned", value: "12,847" },
            { label: "Data Processed", value: "4.2 PB" },
            { label: "Active Satellites", value: "24" },
            { label: "Uptime", value: "99.97%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="data-value text-2xl mb-1">{stat.value}</p>
              <p className="data-label">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
