import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', permission: 'dashboard:view' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>ShopSphere Admin</h1>
        <nav>
          {navItems
            .filter((item) => hasPermission(item.permission))
            .map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
        </nav>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
