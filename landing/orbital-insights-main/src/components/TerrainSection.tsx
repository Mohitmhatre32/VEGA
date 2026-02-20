import { motion } from "framer-motion";

const terrainTypes = [
  { label: "Urban", color: "bg-terrain-urban", value: 94.2 },
  { label: "Forest", color: "bg-terrain-forest", value: 97.8 },
  { label: "Water", color: "bg-terrain-water", value: 99.1 },
  { label: "Agriculture", color: "bg-terrain-agriculture", value: 92.6 },
];

function AnimatedCounter({ value, suffix = "%" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      className="data-value text-2xl font-bold"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {value.toFixed(1)}{suffix}
    </motion.span>
  );
}

function RadarVisualization() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-primary/20" />
      <div className="absolute inset-4 rounded-full border border-primary/15" />
      <div className="absolute inset-8 rounded-full border border-primary/10" />
      {/* Cross lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-primary/10" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-primary/10" />
      </div>
      {/* Sweep */}
      <div className="absolute inset-0 radar-sweep">
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
          style={{
            background: "linear-gradient(90deg, hsl(185 100% 50% / 0.6), transparent)",
          }}
        />
      </div>
      {/* Terrain segments */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute inset-12 rounded-full overflow-hidden"
      >
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px">
          <div className="bg-terrain-forest/30 rounded-tl-full" />
          <div className="bg-terrain-water/30 rounded-tr-full" />
          <div className="bg-terrain-urban/30 rounded-bl-full" />
          <div className="bg-terrain-agriculture/30 rounded-br-full" />
        </div>
      </motion.div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary glow-cyan" />
      </div>
    </div>
  );
}

export default function TerrainSection() {
  return (
    <section id="classification" className="relative min-h-screen flex items-center py-24 px-6 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="data-label mb-4">Section 02 — Classification</p>
          <h2 className="section-heading mb-6">
            Autonomous Terrain<br />
            <span className="text-gradient-cyan">Classification</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Multi-spectral satellite imagery processed through deep neural networks
            for real-time terrain segmentation with sub-meter accuracy.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {terrainTypes.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="glass-panel p-4 rounded"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span className="data-label">{t.label}</span>
                </div>
                <AnimatedCounter value={t.value} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Radar */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <RadarVisualization />
        </motion.div>
      </div>
    </section>
  );
}
