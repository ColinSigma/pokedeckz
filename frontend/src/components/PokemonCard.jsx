import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css';

export default function PokemonCard({ card, onClick }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  if (!card) return null;

  const imageUrl = card.image
    ? `${card.image}/low.webp`
    : (card.id === 'miscp-001' ? 'https://images.pokemontcg.io/basep/8.png' : null);

  const handleClick = () => {
    if (onClick) {
      onClick(card);
    } else {
      navigate(`/card/${card.id}`);
    }
  };

  return (
    <div className="pokemon-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="pokemon-card-image-wrapper">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={card.name}
            className="pokemon-card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="pokemon-card-fallback-art">
            <div className="pokeball-disc">
              <div className="pokeball-disc-inner" />
            </div>
            <span className="fallback-card-name">{card.name}</span>
            <span className="fallback-notice">Official Card</span>
          </div>
        )}
        {card.localId && (
          <span className="pokemon-card-badge">#{card.localId}</span>
        )}
      </div>

      <div className="pokemon-card-info">
        <h3 className="pokemon-card-name">{card.name}</h3>
        {card.set?.name && (
          <span className="pokemon-card-set">{card.set.name}</span>
        )}
        {card.rarity && (
          <span className="pokemon-card-rarity">{card.rarity}</span>
        )}
      </div>
    </div>
  );
}
