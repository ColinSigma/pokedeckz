import { Layers, Hash, Archive, Star } from 'lucide-react';
import '../styles/components.css';

const statItems = [
  { key: 'uniqueCards', label: 'Unique Cards', icon: Layers },
  { key: 'totalCards', label: 'Total Cards', icon: Hash },
  { key: 'totalSets', label: 'Sets', icon: Archive },
  { key: 'wishlistCount', label: 'Wishlist', icon: Star },
];

export default function CollectionStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="collection-stats">
      {statItems.map(({ key, label, icon: Icon }) => (
        <div key={key} className="stat-card">
          <Icon size={24} className="stat-icon" />
          <span className="stat-number">{stats[key] ?? 0}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
