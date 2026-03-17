import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    productService.listProducts()
      .then(res => setProducts(res.documents.filter(p => p.available)))
      .catch((err) => {
        console.error(err);
        setError('Impossible de charger le catalogue pour le moment.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category === categoryFilter)
    : products;

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement du catalogue...</div>;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
        <p className="font-semibold">Erreur de chargement</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="page-title text-3xl">Decouvrez nos produits</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Selection artisanale disponible en retrait.</p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button 
            onClick={() => setCategoryFilter('')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${!categoryFilter ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${categoryFilter === cat ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filteredProducts.map(product => (
          <article key={product.$id} className="app-card group flex flex-col overflow-hidden transition hover:shadow-md">
            <Link to={`/client/catalog/${product.$id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
              {product.image_id ? (
                <img 
                  src={productService.getImageUrl(product.image_id)} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">Pas d'image</div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">Épuisé</span>
                </div>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex justify-between items-start mb-2">
                <Link to={`/client/catalog/${product.$id}`}>
                  <h3 className="text-lg font-bold text-slate-900 transition-colors hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300">{product.name}</h3>
                </Link>
                <span className="font-bold text-slate-900 dark:text-slate-100">{product.price.toFixed(2)} €</span>
              </div>
              <span className="mb-4 inline-flex w-max rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">{product.category}</span>
              
              <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock} en stock
                </span>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product)}
                  className="btn-primary px-3 py-2 text-xs"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="app-card mt-6 p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Aucun produit disponible</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Le catalogue est vide pour le moment{categoryFilter ? ` dans la catégorie "${categoryFilter}"` : ''}.
          </p>
        </div>
      )}
    </div>
  );
}
