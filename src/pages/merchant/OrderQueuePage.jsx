import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { useRealtime } from '../../hooks/useRealtime';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ORDERS = import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS;

export default function OrderQueuePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const res = await orderService.listOrdersByMerchant(user.$id);
      const pendingOrders = res.documents.filter(o => o.status === 'pending');
      
      const ordersWithItems = await Promise.all(pendingOrders.map(async (order) => {
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
    if (response.payload.merchant_id === user?.$id) {
      loadOrders();
    }
  }, [user, loadOrders]));

  const handleMarkReady = async (orderId, clientId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'ready', clientId);
      setOrders(orders.filter(o => o.$id !== orderId));
    } catch (err) {
      console.error(err);
      alert('Erreur de mise à jour');
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Commandes en attente</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
          Aucune commande en attente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.$id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-orange-200 overflow-hidden flex flex-col">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                <span className="font-bold text-orange-800">#{order.$id.slice(-6).toUpperCase()}</span>
                <span className="text-sm text-orange-600 font-medium">En attente</span>
              </div>
              <div className="p-4 flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Date: {new Date(order.$createdAt).toLocaleString()}</p>
                <div className="space-y-2 mb-4">
                  {order.items?.map(item => (
                    <div key={item.$id} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-medium">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t">
                <button 
                  onClick={() => handleMarkReady(order.$id, order.client_id)}
                  className="w-full bg-slate-800 dark:bg-slate-700 text-white font-medium py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Marquer comme Prête
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
