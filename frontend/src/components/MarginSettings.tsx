import { useState, useEffect } from 'react';
import { Settings2, Plus, Minus, Percent, DollarSign, X } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TROY_OZ_GRAMS = 31.1035;

interface MarginSettingsProps {
  margin: number;
  marginType: 'fixed' | 'percent';
  goldSpotUSD?: number | null;
  onSave: (margin: number, type: 'fixed' | 'percent') => Promise<boolean> | void;
}

export function MarginSettings({ margin, marginType, goldSpotUSD, onSave }: MarginSettingsProps) {
  const { currencyRate } = useSettings();
  const [open, setOpen] = useState(false);
  const [localMargin, setLocalMargin] = useState(margin.toString());
  const [localType, setLocalType] = useState(marginType);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalMargin(margin.toString());
      setLocalType(marginType);
    }
  }, [open, margin, marginType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMargin(e.target.value);
  };

  const increment = (step: number) => {
    const current = parseFloat(localMargin) || 0;
    setLocalMargin(Math.max(0, current + step).toString());
  };

  const handleSave = async () => {
    const num = parseFloat(localMargin);
    if (!isNaN(num) && num >= 0) {
      setIsSaving(true);
      await onSave(num, localType);
      setIsSaving(false);
      setOpen(false);
    }
  };

  // Per-gram margin calculation for preview
  const numMargin = parseFloat(localMargin) || 0;
  const hasChanged = numMargin !== margin || localType !== marginType;

  // Calculate per-gram values for preview
  const goldPerGram = goldSpotUSD ? goldSpotUSD / TROY_OZ_GRAMS : null;
  let marginPerGram: number | null = null;
  let displayPerGram: number | null = null;

  if (goldPerGram !== null) {
    if (localType === 'fixed') {
      // Fixed margin is $/oz — convert to per gram
      marginPerGram = numMargin / TROY_OZ_GRAMS;
    } else {
      // Percent margin: % of the product price per gram
      marginPerGram = goldPerGram * (numMargin / 100);
    }
    displayPerGram = goldPerGram + marginPerGram;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-colors ${open ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        aria-label="Price settings"
      >
        <Settings2 className="w-5 h-5 text-primary" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-96 rounded-xl border border-border/60 bg-card p-5 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-sans font-semibold text-foreground">Global Display Margin</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => setOpen(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <Tabs value={localType} onValueChange={(v) => setLocalType(v as 'fixed' | 'percent')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fixed">Fixed ($/oz)</TabsTrigger>
                  <TabsTrigger value="percent">Percent (%)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => increment(localType === 'fixed' ? -1 : -0.5)}
                className="w-10 h-10 shrink-0 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {localType === 'fixed' ? <DollarSign className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                </div>
                <Input
                  type="number"
                  value={localMargin}
                  onChange={handleInputChange}
                  className="pl-9 text-center font-bold text-lg h-10"
                  min="0"
                  step={localType === 'fixed' ? "1" : "0.1"}
                />
              </div>

              <button
                onClick={() => increment(localType === 'fixed' ? 1 : 0.5)}
                className="w-10 h-10 shrink-0 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {(localType === 'fixed' ? [1, 2, 3, 4, 5] : [0.5, 1, 1.5, 2, 3]).map(v => (
                <button
                  key={v}
                  onClick={() => setLocalMargin(v.toString())}
                  className={`py-1.5 rounded-lg text-sm font-sans font-medium transition-colors border ${parseFloat(localMargin) === v
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border-border/40'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Live per-gram preview */}
            {goldPerGram !== null && marginPerGram !== null && displayPerGram !== null && (
              <div className="mb-4 p-3 rounded-xl bg-background border border-border/40">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 text-center">
                  Live Price Preview (per gram · 24K)
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Base</div>
                    <div className="text-sm font-bold tabular-nums text-muted-foreground">${goldPerGram.toFixed(2)}</div>
                    <div className="text-[9px] text-muted-foreground/60">{(goldPerGram * currencyRate).toFixed(2)} QAR</div>
                  </div>
                  <div className="text-muted-foreground/40 text-sm font-bold">+</div>
                  <div className="flex-1 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      Margin{localType === 'fixed' ? '/g' : ''}
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${hasChanged ? 'text-primary' : 'text-muted-foreground'}`}>
                      {localType === 'fixed' ? '$' : ''}{marginPerGram.toFixed(2)}{localType === 'percent' ? '%→$' + marginPerGram.toFixed(2) : ''}
                    </div>
                    <div className={`text-[9px] ${hasChanged ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                      {(marginPerGram * currencyRate).toFixed(2)} QAR
                    </div>
                  </div>
                  <div className="text-muted-foreground/40 text-sm font-bold">=</div>
                  <div className="flex-1 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Display</div>
                    <div className={`text-base font-bold tabular-nums ${hasChanged ? 'text-primary' : 'text-foreground'}`}>
                      ${displayPerGram.toFixed(2)}
                    </div>
                    <div className={`text-[9px] font-semibold ${hasChanged ? 'text-primary/70' : 'text-muted-foreground/60'}`}>
                      {(displayPerGram * currencyRate).toFixed(2)} QAR
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving} className="w-full font-bold uppercase tracking-wider">
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
