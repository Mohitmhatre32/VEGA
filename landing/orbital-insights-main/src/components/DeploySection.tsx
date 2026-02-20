import { motion } from "framer-motion";

export default function DeploySection() {
  return (
    <section id="deploy" className="relative min-h-screen flex items-center justify-center py-24 px-6 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center max-w-2xl"
      >
        <p className="data-label mb-6">Section 05 — Deployment</p>
        <h2 className="section-heading text-3xl md:text-5xl mb-6">
          Deploy The<br />
          <span className="text-gradient-cyan glow-text-cyan">Orbital Engine</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-12 max-w-md mx-auto">
          Initialize the full intelligence pipeline. Real-time terrain classification,
          predictive modeling, and strategic analytics at your command.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary-orbital"
        >
          Launch Intelligence System →
        </motion.button>
        <div className="mt-16 flex items-center justify-center gap-8">
          {[
            { label: "Latency", value: "<200ms" },
            { label: "Coverage", value: "Global" },
            { label: "Clearance", value: "Level 5" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="data-value text-sm mb-1">{item.value}</p>
              <p className="data-label text-[10px]">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
