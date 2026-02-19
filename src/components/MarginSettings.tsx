import { useState } from 'react';
import { Settings2 } from 'lucide-react';

interface MarginSettingsProps {
  margin: number;
  onMarginChange: (margin: number) => void;
}

export function MarginSettings({ margin, onMarginChange }: MarginSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm font-sans font-medium ${
          open
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/30'
        }`}
      >
        <Settings2 className="w-4 h-4" />
        <span>Margin: {margin}%</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border/60 bg-card p-5 shadow-xl animate-fade-in">
          <h3 className="text-base font-sans font-semibold text-foreground mb-1">External Margin</h3>
          <p className="text-sm font-sans text-muted-foreground mb-4">
            Add a percentage margin on top of all displayed prices.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-muted-foreground">Margin %</span>
              <span className="text-lg font-sans font-bold text-foreground tabular-nums">{margin}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={margin}
              onChange={e => onMarginChange(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 rounded-full"
            />
            <div className="flex justify-between text-xs font-sans text-muted-foreground">
              <span>0%</span>
              <span>30%</span>
            </div>

            <div className="flex gap-2 mt-2">
              {[0, 2, 5, 10, 15].map(v => (
                <button
                  key={v}
                  onClick={() => onMarginChange(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-colors ${
                    margin === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
