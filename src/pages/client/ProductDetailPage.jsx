import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { scheduleService } from '../../services/scheduleService';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const prod = await productService.getProduct(id);
      setProduct(prod);
      if (prod.merchant_id) {
        const sched = await scheduleService.getOpeningHours(prod.merchant_id);
        const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const sorted = sched.sort((a,b) => a.day_of_week - b.day_of_week).map(s => ({
          ...s,
          name: daysOrder[s.day_of_week]
        }));
        setSchedule(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500 dark:text-slate-400">Chargement...</div>;
  if (!product) return <div className="py-20 text-center text-red-500 font-bold">Produit introuvable.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link to="/client/catalog" className="inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">
        &larr; Retour au catalogue
      </Link>
      
      <div className="app-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center bg-slate-50 p-8 dark:bg-slate-800">
          {product.image_id ? (
            <img 
              src={productService.getImageUrl(product.image_id)} 
              alt={product.name}
              className="w-full h-full object-cover aspect-square rounded-xl shadow-sm"
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center text-gray-400 font-medium">Pas d'image</div>
          )}
        </div>
        
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <div className="mb-2 flex justify-between items-start">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{product.name}</h1>
            <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">{product.price.toFixed(2)} €</span>
          </div>
          <span className="mb-5 inline-flex w-max rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {product.category}
          </span>
          
          <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className={`mb-4 flex items-center text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {product.stock > 0 ? `${product.stock} en stock actuellement` : 'Épuisé'}
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="1" 
                max={product.stock}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                disabled={product.stock <= 0}
                className="ui-input w-20 text-center font-bold"
              />
              <button 
                disabled={product.stock <= 0}
                onClick={() => addToCart(product, quantity)}
                className="btn-primary flex-1 px-6 py-3"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
          
          {schedule.length > 0 && (
            <div className="mt-auto border-t border-slate-200 pt-7 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Horaires de retrait
              </h3>
              <ul className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                {schedule.map(s => (
                  <li key={s.$id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="rounded-md bg-slate-50 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {s.is_closed ? <span className="text-red-500 font-bold">Fermé</span> : `${s.open_time} - ${s.close_time}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
