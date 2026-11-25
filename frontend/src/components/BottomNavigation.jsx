import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, FolderHeart, Star, User, Info, Users } from 'lucide-react';
import '../styles/components.css';

const navItems = [
  { path: '/', label: 'Home', icon: Home, color: '#FFCB05', glow: 'rgba(255, 203, 5, 0.6)' },
  { path: '/catalog', label: 'Catalog', icon: BookOpen, color: '#FF5252', glow: 'rgba(255, 82, 82, 0.6)' },
  { path: '/collection', label: 'Collection', icon: FolderHeart, color: '#00E676', glow: 'rgba(0, 230, 118, 0.65)' },
  { path: '/wishlist', label: 'Wishlist', icon: Star, color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
  { path: '/trainers', label: 'Trainers', icon: Users, color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.6)' },
  { path: '/about', label: 'About', icon: Info, color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.6)' },
  { path: '/profile', label: 'Profile', icon: User, color: '#A78BFA', glow: 'rgba(167, 139, 250, 0.6)' },
];

const hiddenRoutes = ['/login', '/register'];

export default function BottomNavigation() {
  const location = useLocation();

  const shouldHide =
    hiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/card/');

  if (shouldHide) return null;

  return (
    <nav className="bottom-navigation">
      {navItems.map(({ path, label, icon: Icon, color, glow }) => {
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

        return (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={isActive ? {
              '--nav-active-color': color,
              '--nav-active-glow': glow,
            } : undefined}
          >
            {isActive && <span className="bottom-nav-beam" />}
            <Icon size={21} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
