import PokemonCard from './PokemonCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { Search } from 'lucide-react';
import '../styles/components.css';

export default function CardGrid({ cards, loading, emptyMessage }) {
  if (loading) {
    return <LoadingSkeleton type="card" count={8} />;
  }

  if (!cards || cards.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No cards found"
        message={emptyMessage || 'Try adjusting your search or filters.'}
      />
    );
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <PokemonCard key={card.id} card={card} />
      ))}
    </div>
  );
}
