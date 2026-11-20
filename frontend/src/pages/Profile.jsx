import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Edit2,
  Save,
  LogOut,
  Layers,
  ShieldCheck,
  Award,
  Sparkles,
  Upload,
  Check,
  Compass,
  ExternalLink,
  Code,
  Database,
  Pencil,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, getCollection, getWishlist } from '../services/api';
import Toast from '../components/Toast';
import PokeballHatLogo from '../components/PokeballHatLogo';
import '../styles/pages.css';

// ─── First Generation Starter & Iconic Avatars ────────────────────────
const STARTER_AVATARS = [
  {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    num: '#001',
    type: 'Grass',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
  },
  {
    id: 'charmander',
    name: 'Charmander',
    num: '#004',
    type: 'Fire',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png'
  },
  {
    id: 'squirtle',
    name: 'Squirtle',
    num: '#007',
    type: 'Water',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png'
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    num: '#025',
    type: 'Electric',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  },
  {
    id: 'eevee',
    name: 'Eevee',
    num: '#133',
    type: 'Normal',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png'
  },
  {
    id: 'gengar',
    name: 'Gengar',
    num: '#094',
    type: 'Ghost',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png'
  },
  {
    id: 'mew',
    name: 'Mew',
    num: '#151',
    type: 'Psychic',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png'
  }
];

// ─── Official Pokémon TCG Energy Types ────────────────────────────────
const POKEMON_TYPES = [
  { name: 'Fire', color: '#bf360c' },
  { name: 'Water', color: '#0d47a1' },
  { name: 'Grass', color: '#1b5e20' },
  { name: 'Electric', color: '#f9a825' },
  { name: 'Psychic', color: '#6a1b9a' },
  { name: 'Fighting', color: '#4e342e' },
  { name: 'Darkness', color: '#263238' },
  { name: 'Metal', color: '#546e7a' },
  { name: 'Dragon', color: '#1a237e' },
  { name: 'Fairy', color: '#ad1457' },
  { name: 'Colorless', color: '#424242' }
];

const POKEMON_REGIONS = [
  'Kanto (Indigo Plateau)',
  'Johto (Silver Conference)',
  'Hoenn (Ever Grande City)',
  'Sinnoh (Lily of the Valley)',
  'Unova (Vertress City)',
  'Kalos (Lumiose Conference)',
  'Alola (Manalo Stadium)',
  'Galar (Wyndon Stadium)',
  'Paldea (Mesagoza League)'
];

function getDefaultUsername(userId) {
  const suffix = userId ? userId.slice(0, 4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
  return `PokeTrainer_${suffix}`;
}

function sanitizeUsername(raw, userId) {
  if (!raw || raw.includes('@') || raw.trim() === '') {
    return getDefaultUsername(userId);
  }
  return raw;
}

function getTrainerRank(uniqueCards) {
  if (uniqueCards >= 250) return { rank: 'Pokémon Champion', next: null, target: 250, min: 250 };
  if (uniqueCards >= 100) return { rank: 'Elite Four', next: 'Pokémon Champion', target: 250, min: 100 };
  if (uniqueCards >= 50) return { rank: 'Gym Leader', next: 'Elite Four', target: 100, min: 50 };
  if (uniqueCards >= 10) return { rank: 'Ace Trainer', next: 'Gym Leader', target: 50, min: 10 };
  if (uniqueCards >= 1) return { rank: 'Novice Trainer', next: 'Ace Trainer', target: 10, min: 1 };
  return { rank: 'Rookie Collector', next: 'Novice Trainer', target: 1, min: 0 };
}

export default function Profile() {
  const { user, profile: authProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Avatar Pop-up Modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [modalAvatarPreview, setModalAvatarPreview] = useState('');
  const [selectedStarter, setSelectedStarter] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Collection Statistics
  const [stats, setStats] = useState({
    uniqueCards: 0,
    totalCards: 0,
    totalSets: 0,
    wishlistCount: 0
  });

  // Pokémon Catalog / Trainer Specialty Preferences
  const [favoriteType, setFavoriteType] = useState(
    () => localStorage.getItem('pokedeckz_fav_type') || 'Electric'
  );
  const [region, setRegion] = useState(
    () => localStorage.getItem('pokedeckz_region') || 'Kanto (Indigo Plateau)'
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync profile data from auth or API and sanitize any email usernames
  useEffect(() => {
    if (authProfile) {
      setFullName(authProfile.full_name || 'Pokémon Trainer');
      const cleanUser = sanitizeUsername(authProfile.username, user?.id);
      setUsername(cleanUser);

      // If user had an email as their username in DB, silently update to default username
      if (authProfile.username && authProfile.username.includes('@')) {
        updateProfile({ username: cleanUser }).catch(() => {});
      }

      const url = authProfile.avatar_url || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
      setAvatarUrl(url);
      setModalAvatarPreview(url);

      const matched = STARTER_AVATARS.find((s) => s.url === url);
      if (matched) setSelectedStarter(matched.id);
    } else if (user) {
      getProfile()
        .then((res) => {
          const p = res.data || res;
          if (p) {
            setFullName(p.full_name || 'Pokémon Trainer');
            const cleanUser = sanitizeUsername(p.username, user?.id);
            setUsername(cleanUser);

            const url = p.avatar_url || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
            setAvatarUrl(url);
            setModalAvatarPreview(url);

            const matched = STARTER_AVATARS.find((s) => s.url === url);
            if (matched) setSelectedStarter(matched.id);
          }
        })
        .catch((err) => console.error('Error fetching profile:', err));
    }
  }, [authProfile, user]);

  // Load collection and wishlist stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [colRes, wishRes] = await Promise.allSettled([
          getCollection(),
          getWishlist()
        ]);

        let colItems = [];
        let wishItems = [];

        if (colRes.status === 'fulfilled') {
          colItems = colRes.value.data || colRes.value || [];
        }
        if (wishRes.status === 'fulfilled') {
          wishItems = wishRes.value.data || wishRes.value || [];
        }

        const uniqueCards = colItems.length;
        const totalCards = colItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const setIds = new Set(
          colItems.map((item) => item.card_id?.split('-')[0]).filter(Boolean)
        );

        setStats({
          uniqueCards,
          totalCards,
          totalSets: setIds.size,
          wishlistCount: wishItems.length
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }

    if (user) loadStats();
  }, [user]);

  // Open Avatar Modal
  const handleOpenAvatarModal = () => {
    setModalAvatarPreview(avatarUrl);
    const matched = STARTER_AVATARS.find((s) => s.url === avatarUrl);
    setSelectedStarter(matched ? matched.id : null);
    setShowUrlInput(false);
    setShowAvatarModal(true);
  };

  // Close Avatar Modal
  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  // Select starter avatar inside pop-up modal
  const handleSelectStarterInModal = (starter) => {
    setSelectedStarter(starter.id);
    setModalAvatarPreview(starter.url);
  };

  // Handle local image file upload inside pop-up modal
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file too large. Please select an image under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setModalAvatarPreview(thumbnailDataUrl);
        setSelectedStarter(null);
        showToast('Image uploaded! Click "Save Avatar" to apply.', 'info');
      };
      img.onerror = () => {
        showToast('Could not process selected image file.', 'error');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save chosen avatar from pop-up modal
  const handleSaveAvatarFromModal = async () => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        username,
        avatar_url: modalAvatarPreview
      });
      setAvatarUrl(modalAvatarPreview);
      await refreshProfile();
      setShowAvatarModal(false);
      showToast('Profile picture updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update avatar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply custom URL from input in modal
  const handleApplyCustomUrlInModal = () => {
    if (!customUrlInput.trim()) return;
    setModalAvatarPreview(customUrlInput.trim());
    setSelectedStarter(null);
    showToast('Custom image link applied! Click "Save Avatar" to persist.', 'info');
  };

  // Save personal profile settings (Full Name, Username)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const cleanUsername = sanitizeUsername(username, user?.id);

    try {
      await updateProfile({
        full_name: fullName,
        username: cleanUsername,
        avatar_url: avatarUrl
      });
      setUsername(cleanUsername);
      localStorage.setItem('pokedeckz_fav_type', favoriteType);
      localStorage.setItem('pokedeckz_region', region);
      await refreshProfile();
      setIsEditing(false);
      showToast('Personal settings saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFavoriteType = (typeName) => {
    setFavoriteType(typeName);
    localStorage.setItem('pokedeckz_fav_type', typeName);
    showToast(`Specialty set to ${typeName} type!`);
  };

  const handleSelectRegion = (e) => {
    const val = e.target.value;
    setRegion(val);
    localStorage.setItem('pokedeckz_region', val);
    showToast(`Home league updated to ${val}!`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Error signing out', 'error');
    }
  };

  const initials = fullName && fullName !== 'Pokémon Trainer'
    ? fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PK';

  const trainerRankInfo = getTrainerRank(stats.uniqueCards);
  const trainerIdDisplay = user?.id ? user.id.slice(0, 8).toUpperCase() : 'TRAINER1';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'November 2026';

  return (
    <div className="profile-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ─── Pokémon League Stadium Hero Backdrop ─── */}
      <div className="profile-hero-backdrop" />

      {/* ─── Hero Section Header ─── */}
      <header className="profile-header">
        <div className="hero-badge">
          <PokeballHatLogo size={20} />
          <span>Official Pokémon Trainer Registry</span>
        </div>
        <h1>
          Trainer <span className="hero-accent">Passport</span>
        </h1>
        <p>
          Official Pokémon Trading Card Game collector credentials, partner avatar, and collection statistics.
        </p>
      </header>

      {/* ─── Holographic Trainer Passport Card ─── */}
      <div className="trainer-card">
        {/* Top Header Row */}
        <div className="trainer-card-header">
          <div className="trainer-id-pill">
            <Sparkles size={13} />
            <span>ID: #TRN-{trainerIdDisplay}</span>
          </div>
          <div className="trainer-verified-pill">
            <ShieldCheck size={14} />
            <span>Verified TCG Collector</span>
          </div>
        </div>

        {/* Identity & Avatar Section (No email displayed here — protected from other users) */}
        <div className="trainer-hero-body">
          {/* Circular Avatar with Pencil Icon: Click anywhere to open Pop-up */}
          <div
            className="trainer-avatar-box"
            onClick={handleOpenAvatarModal}
            title="Click to change profile picture"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenAvatarModal();
            }}
          >
            <div className="trainer-avatar-img-wrap">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Trainer Avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
                  }}
                />
              ) : (
                <span className="trainer-avatar-initials">{initials}</span>
              )}
            </div>
            {/* Pencil Icon Badge */}
            <div className="trainer-avatar-edit-badge" title="Change profile picture">
              <Pencil size={15} />
            </div>
          </div>

          <div className="trainer-identity-info">
            <h2 className="trainer-title-name">
              {fullName || 'Pokémon Trainer'}
            </h2>
            <div className="trainer-handle">@{username || 'PokeTrainer'}</div>

            <div className="trainer-rank-pill">
              <Award size={15} />
              <span>{trainerRankInfo.rank}</span>
            </div>
          </div>
        </div>

        {/* ─── Collection Statistics Dashboard ─── */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box featured">
            <div className="profile-stat-num">{stats.uniqueCards}</div>
            <div className="profile-stat-title">Unique Cards</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-num">{stats.totalCards}</div>
            <div className="profile-stat-title">Total Cards</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-num">{stats.totalSets}</div>
            <div className="profile-stat-title">Sets Collected</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-num">{stats.wishlistCount}</div>
            <div className="profile-stat-title">Wishlist Targets</div>
          </div>
        </div>
      </div>

      {/* ─── Official Pokémon TCG Catalog & Trainer Registry ─── */}
      <div className="trainer-registry-card">
        <div className="trainer-registry-header">
          <h3>
            <Compass size={20} style={{ color: 'var(--color-electric-yellow)' }} />
            <span>Pokémon TCG Trainer Registry</span>
          </h3>
        </div>

        <div className="trainer-registry-grid">
          {/* Trainer Rank & Progress */}
          <div className="trainer-field-box">
            <div className="trainer-field-label">
              <Award size={13} />
              <span>Trainer Tier / Rank</span>
            </div>
            <div className="trainer-field-value">{trainerRankInfo.rank}</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted-gray)', marginTop: 4 }}>
              {trainerRankInfo.next
                ? `${trainerRankInfo.target - stats.uniqueCards} more unique cards to reach ${trainerRankInfo.next}`
                : 'Top ranking attained! Maximum Pokémon Champion tier.'}
            </p>
          </div>

          {/* Member Registration Date */}
          <div className="trainer-field-box">
            <div className="trainer-field-label">
              <Sparkles size={13} />
              <span>Registry Member Since</span>
            </div>
            <div className="trainer-field-value">{memberSince}</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted-gray)', marginTop: 4 }}>
              TCGdex Global Collector Registry
            </p>
          </div>

          {/* Home League / Region */}
          <div className="trainer-field-box">
            <div className="trainer-field-label">
              <Compass size={13} />
              <span>Home League / Region</span>
            </div>
            <select
              value={region}
              onChange={handleSelectRegion}
              className="trainer-region-select"
            >
              {POKEMON_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Unique Account ID */}
          <div className="trainer-field-box">
            <div className="trainer-field-label">
              <ShieldCheck size={13} />
              <span>Trainer License UUID</span>
            </div>
            <div className="trainer-field-value mono">
              {user?.id ? `${user.id.slice(0, 16)}...` : 'GUEST-TRAINER'}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted-gray)', marginTop: 4 }}>
              Secured with Supabase RLS verification
            </p>
          </div>

          {/* Specialty Energy Type Selector */}
          <div className="trainer-field-box full-width">
            <div className="trainer-field-label">
              <Sparkles size={13} />
              <span>Specialty Energy Type: <strong style={{ color: 'var(--color-white)', marginLeft: 4 }}>{favoriteType}</strong></span>
            </div>
            <div className="type-selector-strip">
              {POKEMON_TYPES.map((type) => {
                const isActive = favoriteType === type.name;
                return (
                  <button
                    key={type.name}
                    type="button"
                    className={`type-chip-btn ${isActive ? 'active' : ''}`}
                    style={isActive ? { background: type.color, borderColor: type.color } : {}}
                    onClick={() => handleSelectFavoriteType(type.name)}
                  >
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Profile Account Settings Form (Full Name & Username Only) ─── */}
      <div className="profile-settings-card">
        <div className="profile-settings-header">
          <h3>
            <Edit2 size={18} style={{ color: 'var(--color-electric-yellow)' }} />
            <span>Personal Profile Settings</span>
          </h3>
          <button
            type="button"
            className="settings-toggle-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Info'}
          </button>
        </div>

        {isEditing ? (
          <form className="profile-form-modern" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Full Name / Display Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Red, Ash Ketchum, Cynthia"
              />
            </div>

            <div className="form-group">
              <label>Trainer Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. PokeTrainer_1234"
              />
            </div>

            <button type="submit" className="profile-save-btn" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        ) : (
          <div className="trainer-registry-grid">
            <div className="trainer-field-box">
              <div className="trainer-field-label">Full Name</div>
              <div className="trainer-field-value">{fullName || 'Pokémon Trainer'}</div>
            </div>
            <div className="trainer-field-box">
              <div className="trainer-field-label">Username</div>
              <div className="trainer-field-value">
                @{username || 'PokeTrainer'}
              </div>
            </div>
            {/* Private email section: visible strictly to account owner */}
            <div className="trainer-field-box full-width">
              <div className="trainer-field-label">
                <Lock size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Account Login Email (Private to You)
              </div>
              <div className="trainer-field-value mono" style={{ fontSize: '0.88rem', color: 'var(--color-muted-gray)' }}>
                {user?.email || 'Not available'}
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--color-muted-gray)', marginTop: 4 }}>
                This email is strictly used for logging into your account and is hidden from all other collectors.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Application Architecture & Official Attribution ─── */}
      <div className="trainer-tech-card">
        <h3>Application Architecture</h3>
        <div className="tech-grid">
          <div className="tech-item-box">
            <Code size={18} style={{ color: 'var(--color-electric-yellow)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong>Frontend PWA</strong>
              <p>React 18, Vite, JavaScript, PWA Service Worker & Manifest</p>
            </div>
          </div>
          <div className="tech-item-box">
            <Code size={18} style={{ color: 'var(--color-red)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong>Custom REST API</strong>
              <p>Node.js, Express.js with Bearer JWT Security</p>
            </div>
          </div>
          <div className="tech-item-box">
            <Database size={18} style={{ color: '#00E5FF', marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong>Database & Security</strong>
              <p>Supabase PostgreSQL with Row Level Security (RLS)</p>
            </div>
          </div>
          <div className="tech-item-box">
            <ShieldCheck size={18} style={{ color: 'var(--color-grass-green)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong>Authentic Card Database</strong>
              <p>TCGdex Official Pokémon Card REST API</p>
            </div>
          </div>
        </div>

        <div className="tcgdex-attr-box">
          <p>
            Pokémon TCG card catalog data and authentic card illustrations are provided by{' '}
            <a
              href="https://tcgdex.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TCGdex <ExternalLink size={12} style={{ display: 'inline' }} />
            </a>.
          </p>
        </div>
      </div>

      {/* ─── Legal Disclaimer ─── */}
      <div className="disclaimer-card">
        <p>
          "Pokédeckz is an unofficial fan-made collector app and is not affiliated with, endorsed by, or sponsored by Nintendo, Creatures Inc., GAME FREAK, or The Pokémon Company. Pokémon names, trademarks, characters, and trading card artwork belong to their respective owners."
        </p>
      </div>

      {/* ─── Sign Out Button ─── */}
      <button type="button" className="profile-signout-btn" onClick={handleSignOut}>
        <LogOut size={18} />
        <span>Sign Out from Pokédeckz</span>
      </button>

      {/* ─── Avatar Pop-up Modal ─────────────────────────────── */}
      {showAvatarModal && (
        <div className="avatar-modal-backdrop" onClick={handleCloseAvatarModal}>
          <div className="avatar-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="avatar-modal-header">
              <div>
                <h3>
                  <Sparkles size={18} style={{ color: 'var(--color-electric-yellow)' }} />
                  <span>Change Profile Picture</span>
                </h3>
                <p>Choose a Gen 1 starter partner or upload your own avatar photo.</p>
              </div>
              <button
                type="button"
                className="avatar-modal-close-btn"
                onClick={handleCloseAvatarModal}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Avatar Preview Bar */}
            <div className="avatar-modal-preview-bar">
              <div className="avatar-modal-preview-thumb">
                {modalAvatarPreview ? (
                  <img
                    src={modalAvatarPreview}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-electric-yellow)' }}>
                    {initials}
                  </span>
                )}
              </div>
              <div className="avatar-modal-preview-info">
                <strong>Current Selection Preview</strong>
                <span>
                  {selectedStarter
                    ? STARTER_AVATARS.find((s) => s.id === selectedStarter)?.name || 'Custom Avatar'
                    : 'Custom Image Avatar'}
                </span>
              </div>
            </div>

            {/* Gen 1 Starter Grid */}
            <div className="avatar-picker-title">
              <Sparkles size={14} style={{ color: 'var(--color-electric-yellow)' }} />
              <span>Generation 1 Starters & Icons</span>
            </div>

            <div className="avatar-starters-grid">
              {STARTER_AVATARS.map((starter) => {
                const isSelected = selectedStarter === starter.id || modalAvatarPreview === starter.url;
                return (
                  <button
                    key={starter.id}
                    type="button"
                    className={`avatar-starter-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectStarterInModal(starter)}
                    title={`Choose ${starter.name} (${starter.type})`}
                  >
                    <img
                      src={starter.url}
                      alt={starter.name}
                      className="avatar-starter-thumb"
                      loading="lazy"
                    />
                    <span className="avatar-starter-label">{starter.name}</span>
                    <span className="avatar-starter-num">{starter.num}</span>
                    {isSelected && (
                      <div className="avatar-selected-check">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Upload and Link Actions */}
            <div className="avatar-actions-row">
              <button
                type="button"
                className="avatar-upload-trigger-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload From Device</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <button
                type="button"
                className="avatar-url-input-toggle"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                {showUrlInput ? 'Hide image link' : 'Or paste image link'}
              </button>
            </div>

            {showUrlInput && (
              <div className="avatar-custom-url-box" style={{ marginTop: 12 }}>
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <button
                  type="button"
                  className="avatar-upload-trigger-btn"
                  onClick={handleApplyCustomUrlInModal}
                >
                  Preview
                </button>
              </div>
            )}

            {/* Modal Bottom Buttons */}
            <div className="avatar-modal-actions">
              <button
                type="button"
                className="avatar-modal-cancel-btn"
                onClick={handleCloseAvatarModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="avatar-modal-save-btn"
                disabled={loading}
                onClick={handleSaveAvatarFromModal}
              >
                <Check size={16} />
                <span>{loading ? 'Saving...' : 'Save Avatar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
