import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { useRealtime } from '../../hooks/useRealtime';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ORDERS = import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS;

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const res = await orderService.listOrdersByClient(user.$id);
      
      const ordersWithItems = await Promise.all(res.documents.map(async (order) => {
        const itemsRes = await orderService.getOrderItems(order.$id);
        return { ...order, items: itemsRes.documents };
      }));
      
      setOrders(ordersWithItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useRealtime(DB_ID, COLLECTION_ORDERS, useCallback((response) => {
    if (response.payload.client_id === user?.$id) {
      loadOrders();
    }
  }, [user, loadOrders]));

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="app-card p-5 sm:p-6">
        <h1 className="page-title text-3xl">Mes Commandes</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Suivez l'etat de preparation de vos commandes en temps reel.</p>
      </section>
      
      {orders.length === 0 ? (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400">
          Vous n'avez passé aucune commande pour le moment.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <article key={order.$id} className="app-card overflow-hidden transition hover:shadow-md">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800">
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Numero de commande</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-300 text-lg">#{order.$id.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(order.$createdAt).toLocaleDateString()} à {new Date(order.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{order.total.toFixed(2)} €</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    order.status === 'ready' ? 'bg-green-50 text-green-700 border-green-200' : 
                    order.status === 'done' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' : 
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {order.status === 'pending' && <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>}
                    {order.status === 'ready' && <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>}
                    {order.status === 'pending' ? 'En préparation' : order.status === 'ready' ? 'Prête à retirer' : 'Terminée'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {order.items?.map(item => (
                    <div key={item.$id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="font-bold text-slate-900 dark:text-slate-100 w-8">{item.quantity}x</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item.product_name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
