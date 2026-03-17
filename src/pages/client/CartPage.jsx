import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService'; 

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, merchantId, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.$id) {
      addressService.listAddresses(user.$id)
        .then(res => {
          setAddresses(res.documents);
          const defaultAddr = res.documents.find(a => a.is_default);
          if (defaultAddr) setSelectedAddressId(defaultAddr.$id);
          else if (res.documents.length > 0) setSelectedAddressId(res.documents[0].$id);
        })
        .catch(console.error);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Veuillez sélectionner ou ajouter une adresse de retrait.");
      return;
    }
    if (cartItems.length === 0) return;
    
    setSubmitting(true);
    try {
      const order = await orderService.createOrder(
        cartItems, 
        selectedAddressId, 
        user.$id, 
        merchantId, 
        cartTotal
      );
      clearCart();
      navigate(`/client/orders/${order.$id}/confirmation`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la commande.");
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-14 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h1 className="mb-3 text-4xl font-extrabold text-slate-900 dark:text-slate-100">Votre panier est vide</h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600 dark:text-slate-400">Decouvrez nos produits et commencez vos achats pour remplir votre panier.</p>
        <Link to="/client/catalog" className="btn-primary px-6 py-3 text-base">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="page-title text-3xl">Votre Panier</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Verifiez vos articles puis choisissez votre adresse de retrait.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex-1 space-y-4">
          {cartItems.map(item => (
            <article key={item.product_id} className="app-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                {item.image_id ? (
                  <img src={productService.getImageUrl(item.image_id)} alt={item.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">Pas d'image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{item.name}</h3>
                <p className="text-sm font-medium text-green-600 mb-2">En stock</p>
                <div className="text-slate-800 dark:text-slate-300 font-extrabold text-xl">{item.price.toFixed(2)} €</div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <button 
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                >-</button>
                <span className="w-10 text-center font-bold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                >+</button>
              </div>
              <button 
                onClick={() => removeFromCart(item.product_id)}
                className="rounded-xl p-2.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              >
                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </article>
          ))}
        </div>
        
        <div>
          <aside className="app-card sticky top-24 p-6">
            <h3 className="mb-5 text-xl font-extrabold text-slate-900 dark:text-slate-100">Resume de la commande</h3>
            
            <div className="mb-6 space-y-3 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Sous-total HT</span>
                <span>{(cartTotal * 0.8).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>TVA (20%)</span>
                <span>{(cartTotal * 0.2).toFixed(2)} €</span>
              </div>
              <div className="mt-5 flex justify-between border-t border-dashed border-slate-300 pt-5 text-2xl font-extrabold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                <span>Total TTC</span>
                <span className="text-blue-700 dark:text-blue-300">{cartTotal.toFixed(2)} €</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Adresse de retrait</h4>
              {addresses.length === 0 ? (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-800 dark:border-orange-900/50 dark:bg-orange-500/10 dark:text-orange-300">
                  Aucune adresse enregistree. <Link to="/client/addresses" className="underline font-bold">Gerer mes adresses</Link>
                </div>
              ) : (
                <div className="relative">
                  <select 
                    className="ui-input appearance-none pr-10 text-sm font-medium"
                    value={selectedAddressId}
                    onChange={e => setSelectedAddressId(e.target.value)}
                  >
                    <option value="" disabled>Choisir une adresse</option>
                    {addresses.map(a => (
                      <option key={a.$id} value={a.$id}>{a.label} - {a.address}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={submitting || addresses.length === 0}
              className="btn-primary w-full py-3 text-base font-extrabold"
            >
              {submitting ? 'Validation en cours...' : 'Valider ma commande'}
            </button>
            <p className="mt-3 flex items-center justify-center text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Paiement sécurisé lors du retrait
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
