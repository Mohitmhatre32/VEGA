export default function Navbar() {
  return (
    <nav className="glass-panel w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary pulse-glow" />
          <span className="font-heading text-xs tracking-[0.25em] uppercase text-foreground">
            OTI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Classification", "Forecasting", "Analytics", "Deploy"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-mono text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-primary">●</span> SYSTEM ONLINE
        </div>
      </div>
    </nav>
  );
}
