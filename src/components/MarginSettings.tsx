import { useState } from 'react';
import { Settings2, Plus, Minus } from 'lucide-react';

interface MarginSettingsProps {
  margin: number;
  onMarginChange: (margin: number) => void;
}

export function MarginSettings({ margin, onMarginChange }: MarginSettingsProps) {
  const [open, setOpen] = useState(false);

  const increment = (step: number) => {
    onMarginChange(Math.max(0, margin + step));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Price settings"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border/60 bg-card p-5 shadow-xl animate-fade-in">
            <h3 className="text-base font-sans font-semibold text-foreground mb-1">Price Adjustment</h3>
            <p className="text-sm font-sans text-muted-foreground mb-5">
              Add a fixed USD amount on top of all displayed prices.
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => increment(-1)}
                className="w-10 h-10 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="text-center min-w-[80px]">
                <span className="text-3xl font-sans font-bold text-foreground tabular-nums">${margin}</span>
              </div>

              <button
                onClick={() => increment(1)}
                className="w-10 h-10 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {[0, 2, 5, 10, 20].map(v => (
                <button
                  key={v}
                  onClick={() => onMarginChange(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-colors ${
                    margin === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
