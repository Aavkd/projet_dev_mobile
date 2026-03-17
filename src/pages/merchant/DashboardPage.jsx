import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { statsService } from '../../services/statsService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    statsService.getMerchantStats(user.$id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement des statistiques...</div>;
  if (!stats) return <div className="text-red-500">Erreur de chargement.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Commandes totales</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chiffre d'affaires</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">{stats.revenue.toFixed(2)} €</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">En attente</h3>
          <p className="text-3xl font-bold mt-2 text-orange-500">{stats.ordersByStatus?.pending || 0}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-200">Commandes par statut</h3>
        <div className="space-y-4">
          {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
            <div key={status} className="flex items-center">
              <span className="w-24 text-sm capitalize text-slate-600 dark:text-slate-400">{status}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mx-4">
                <div 
                  className={`h-full ${status === 'pending' ? 'bg-orange-400' : status === 'ready' ? 'bg-blue-400' : 'bg-green-400'}`} 
                  style={{ width: `${stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right text-slate-700 dark:text-slate-300">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
