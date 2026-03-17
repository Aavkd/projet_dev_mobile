import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationBell from '../NotificationBell';
import NotificationToast from '../NotificationToast';

export default function ClientLayout() {
  const { logout, userDoc } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const navItems = [
    { label: 'Catalogue', path: '/client/catalog' },
    { label: 'Mes Adresses', path: '/client/addresses' },
    { label: 'Mes Commandes', path: '/client/orders' }
  ];

  return (
    <div className="app-shell text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="app-container">
          <div className="flex min-h-18 items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-ghost h-10 w-10 p-0 md:hidden"
                aria-label="Ouvrir le menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/client/catalog" className="text-2xl font-extrabold tracking-tight text-blue-700 dark:text-blue-400">
                Click &amp; Collect
              </Link>

              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkAsRead={markAsRead} />

              <Link to="/client/cart" className="btn-ghost relative h-10 px-3">
                <span className="text-sm font-semibold">Panier</span>
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-700 sm:flex">
                <span className="max-w-44 truncate text-sm font-medium text-slate-700 dark:text-slate-300">{userDoc?.name}</span>
                <button onClick={logout} className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Deconnexion
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-200 py-3 md:hidden dark:border-slate-800">
              <nav className="grid gap-1">
                {navItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70 sm:hidden">
                <span className="max-w-[70%] truncate text-sm text-slate-600 dark:text-slate-300">{userDoc?.name}</span>
                <button onClick={logout} className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Deconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-container py-6 md:py-8">
        <Outlet />
      </main>

      <NotificationToast notifications={notifications} />
    </div>
  );
}
