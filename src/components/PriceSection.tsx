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
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-base font-sans text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map(product => (
          <PriceCard key={product.name} product={product} unit={unit} />
        ))}
      </div>
    </section>
  );
}
