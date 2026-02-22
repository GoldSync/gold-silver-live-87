import { ProductPrice } from '@/hooks/useGoldPrices';
import { AnimatedNumber } from './AnimatedNumber';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PriceTableProps {
  title: string;
  subtitle?: string;
  products: ProductPrice[];
  unit?: string;
  icon: React.ReactNode;
  compact?: boolean;
}

export function PriceTable({ title, subtitle, products, unit, icon, compact }: PriceTableProps) {
  return (
    <section className="animate-fade-in-up flex flex-col h-full">
      <div className={`flex items-center gap-4 ${compact ? 'mb-2' : 'mb-6'}`}>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-base font-sans text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden bg-card flex-1 min-h-0 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Product</TableHead>
                <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground text-right">QAR</TableHead>
                <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground text-right">USD</TableHead>
                <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.name} className="border-border/30 hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-sans font-semibold text-foreground">
                    {product.name}
                    {unit && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{unit}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <AnimatedNumber value={product.qar} decimals={1} className="font-sans font-bold tabular-nums text-foreground" />
                  </TableCell>
                  <TableCell className="text-right">
                    <AnimatedNumber value={product.usd} prefix="$" decimals={1} className="font-sans font-semibold tabular-nums text-primary" />
                  </TableCell>
                  <TableCell className="text-right">
                    {product.trend !== 'flat' ? (
                      <span
                        className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${product.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}
                      >
                        {product.trend === 'up' ? '▲' : '▼'}{Math.abs(product.stickyPct).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
