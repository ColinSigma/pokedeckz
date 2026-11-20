import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, FolderHeart, Star, User, Info } from 'lucide-react';
import '../styles/components.css';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/catalog', label: 'Catalog', icon: BookOpen },
  { path: '/collection', label: 'Collection', icon: FolderHeart },
  { path: '/wishlist', label: 'Wishlist', icon: Star },
  { path: '/about', label: 'About', icon: Info },
  { path: '/profile', label: 'Profile', icon: User },
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
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

        return (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
