import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await orderService.listOrdersByMerchant(user.$id);
      const historyOrders = res.documents.filter(o => o.status === 'ready' || o.status === 'done');
      setOrders(historyOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (orderId, clientId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'done', clientId);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert('Erreur de mise à jour');
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Historique des commandes</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">ID Commande</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Total</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">Aucune commande dans l'historique.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.$id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">#{order.$id.slice(-6).toUpperCase()}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{new Date(order.$createdAt).toLocaleString()}</td>
                  <td className="p-4 text-sm font-medium">{order.total.toFixed(2)} €</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'ready' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      {order.status === 'ready' ? 'Prête' : 'Terminée'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'ready' && (
                      <button 
                        onClick={() => handleMarkDone(order.$id, order.client_id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium cursor-pointer"
                      >
                        Marquer Récupérée
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
