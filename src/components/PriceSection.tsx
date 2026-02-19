import { ProductPrice } from '@/hooks/useGoldPrices';
import { PriceCard } from './PriceCard';

interface PriceSectionProps {
  title: string;
  subtitle?: string;
  products: ProductPrice[];
  unit?: string;
  icon: React.ReactNode;
}

export function PriceSection({ title, subtitle, products, unit, icon }: PriceSectionProps) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map(product => (
          <PriceCard key={product.name} product={product} unit={unit} />
        ))}
      </div>
    </section>
  );
}
