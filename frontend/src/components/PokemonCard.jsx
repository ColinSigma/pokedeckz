import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRarityColor } from '../utils/rarity';
import '../styles/components.css';

const EXTENSIONS = ['/low.webp', '/low.png', '/high.webp', '/high.png'];

export default function PokemonCard({ card, onClick }) {
  const [extIndex, setExtIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();

  if (!card) return null;

  const getBaseImage = () => {
    if (card.image) return card.image;
    if (card.set?.id && card.localId) {
      return `https://assets.tcgdex.net/en/${card.set.id}/${card.localId}`;
    }
    return null;
  };

  const baseImage = getBaseImage();
  const currentImageUrl = baseImage
    ? `${baseImage}${EXTENSIONS[extIndex]}`
    : (card.id === 'miscp-001' ? 'https://images.pokemontcg.io/basep/8.png' : null);

  const handleImageError = () => {
    if (extIndex < EXTENSIONS.length - 1) {
      setExtIndex(extIndex + 1);
    } else {
      setImgFailed(true);
    }
  };

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
        {currentImageUrl && !imgFailed ? (
          <img
            src={currentImageUrl}
            alt={card.name}
            className="pokemon-card-image"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <img
            src="/images/card-back.jpg"
            alt={card.name || 'Pokémon Card'}
            className="pokemon-card-image"
            style={{ borderRadius: '6px' }}
          />
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
          <span
            className="pokemon-card-rarity"
            style={{ color: getRarityColor(card.rarity).color }}
          >
            {card.rarity}
          </span>
        )}
      </div>
    </div>
  );
}
