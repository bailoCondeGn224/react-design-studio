// src/components/storefront/CategoryFilter.tsx
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  nom: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === null ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => onSelect(null)}
        >
          Tous
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selected === cat.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => onSelect(cat.id)}
          >
            {cat.nom}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
