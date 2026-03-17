import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    
    async function loadData() {
      try {
        const res = await orderService.listOrdersByClient(user.$id);
        const found = res.documents.find(o => o.$id === id);
        
        if (found) {
          setOrder(found);
          const itemsRes = await orderService.getOrderItems(id);
          setItems(itemsRes.documents);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement...</div>;
  if (!order) return <div className="text-center py-20 text-red-500 font-bold">Commande introuvable.</div>;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Commande confirmée !</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
          Merci pour votre commande. Votre numéro de suivi est le <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md ml-1 border border-slate-200 dark:border-slate-700 uppercase">#{order.$id.slice(-6)}</span>
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-left mb-8 border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm uppercase tracking-wider">Résumé de la commande</h3>
          <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            {items.map(item => (
              <div key={item.$id} className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>{item.quantity}x {item.product_name}</span>
                <span>{(item.unit_price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-extrabold text-lg text-slate-900 dark:text-slate-100">
            <span>Total TTC</span>
            <span className="text-slate-800 dark:text-slate-300">{order.total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium text-sm mb-8 border border-slate-200 dark:border-slate-700">
          Statut actuel : <span className="font-bold uppercase tracking-wide">En préparation</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/client/orders" className="bg-slate-800 dark:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm inline-flex items-center justify-center">
            Suivre ma commande
          </Link>
          <Link to="/client/catalog" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 dark:bg-slate-800 transition-colors inline-flex items-center justify-center">
            Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
