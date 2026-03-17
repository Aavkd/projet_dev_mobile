import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationBell from '../NotificationBell';
import NotificationToast from '../NotificationToast';

export default function MerchantLayout() {
  const { logout, userDoc } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const navItems = [
    { label: 'Tableau de bord', path: '/merchant/dashboard' },
    { label: 'Produits', path: '/merchant/products' },
    { label: 'Catégories', path: '/merchant/categories' },
    { label: 'Commandes', path: '/merchant/orders' },
    { label: 'Historique', path: '/merchant/orders/history' },
    { label: 'Horaires', path: '/merchant/schedule' }
  ];

  return (
    <div className="app-shell flex bg-transparent text-slate-900 dark:text-slate-100">
      <aside className="surface-glass hidden w-72 flex-col border-r border-slate-200/70 lg:flex">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Espace Marchand</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-slate-100">{userDoc?.name}</p>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button onClick={logout} className="w-full rounded-2xl border border-red-200 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-900/20">
            Se deconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="surface-glass sticky top-0 z-40 border-b border-slate-200/70">
          <div className="app-container flex min-h-16 items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="btn-ghost h-10 w-10 p-0 lg:hidden"
                aria-label="Ouvrir la navigation"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Administration</h1>
            </div>
            <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkAsRead={markAsRead} />
          </div>

          {mobileNavOpen && (
            <div className="rise-in border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
              <nav className="grid gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileNavOpen(false)}
                      className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                        active
                          ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={logout}
                className="mt-3 w-full rounded-2xl border border-red-200 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Se deconnecter
              </button>
            </div>
          )}
        </header>

        <main className="app-container w-full flex-1 py-6 md:py-8 rise-in">
          <Outlet />
        </main>
      </div>

      <NotificationToast notifications={notifications} />
    </div>
  );
}
