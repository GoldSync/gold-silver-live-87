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
}

export function PriceTable({ title, subtitle, products, unit, icon }: PriceTableProps) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm font-sans text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader>
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
                  <AnimatedNumber value={product.qar} className="font-sans font-bold tabular-nums text-foreground" />
                </TableCell>
                <TableCell className="text-right">
                  <AnimatedNumber value={product.usd} prefix="$" className="font-sans font-semibold tabular-nums text-primary" />
                </TableCell>
                <TableCell className="text-right">
                  {product.change !== 0 ? (
                    <span
                      className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${
                        product.change > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {product.change > 0 ? '+' : ''}{product.change.toFixed(2)}%
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
    </section>
  );
}
