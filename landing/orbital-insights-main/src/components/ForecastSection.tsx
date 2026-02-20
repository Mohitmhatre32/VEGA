import { motion } from "framer-motion";
import { useState } from "react";

function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full aspect-[4/3] rounded overflow-hidden border-glow">
      {/* Before - Forest */}
      <div className="absolute inset-0 bg-gradient-to-br from-terrain-forest/40 via-terrain-forest/20 to-background">
        <div className="absolute inset-0 flex items-end p-4">
          <span className="data-label">2024 — Current State</span>
        </div>
        {/* Simulated terrain grid */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-terrain-forest/40"
              style={{ top: `${(i + 1) * 12}%`, left: 0, right: 0 }}
            />
          ))}
        </div>
      </div>
      {/* After - Urban expansion */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-terrain-urban/40 via-terrain-agriculture/20 to-background"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <div className="absolute inset-0 flex items-end justify-end p-4">
          <span className="data-label">2030 — Predicted</span>
        </div>
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-terrain-urban/40"
              style={{ top: `${(i + 1) * 12}%`, left: 0, right: 0 }}
            />
          ))}
        </div>
      </div>
      {/* Slider control */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-primary glow-cyan z-[5] pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
      </div>
    </div>
  );
}

export default function ForecastSection() {
  return (
    <section id="forecasting" className="relative min-h-screen flex items-center py-24 px-6 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Visual */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <BeforeAfterSlider />
        </motion.div>

        {/* Right: Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="data-label mb-4">Section 03 — Forecasting</p>
          <h2 className="section-heading mb-6">
            Predictive<br />
            <span className="text-gradient-cyan">Environmental</span><br />
            Forecasting
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Temporal analysis models project land-use changes, deforestation rates,
            and urban expansion patterns with decade-scale accuracy.
          </p>
          <div className="space-y-4">
            {[
              { label: "Model Reliability", value: "96.4%" },
              { label: "Temporal Range", value: "10 YRS" },
              { label: "Resolution", value: "0.5M" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex items-center justify-between py-3 border-b border-border/50"
              >
                <span className="data-label">{item.label}</span>
                <span className="data-value text-lg">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
