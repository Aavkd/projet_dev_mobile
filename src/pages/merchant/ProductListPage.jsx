import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import { useRealtime } from '../../hooks/useRealtime';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_PRODUCTS = import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS;

export default function ProductListPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const res = await productService.listProducts({ merchantId: user.$id });
      setProducts(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useRealtime(DB_ID, COLLECTION_PRODUCTS, useCallback((response) => {
    if (response.payload.merchant_id === user?.$id) {
      loadProducts();
    }
  }, [user, loadProducts]));

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p.$id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Mes Produits</h1>
        <Link 
          to="/merchant/products/new" 
          className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
        >
          + Ajouter un produit
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Image</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Nom</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Prix</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Stock</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">Aucun produit trouvé.</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.$id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                  <td className="p-4">
                    {product.image_id ? (
                      <img 
                        src={productService.getImageUrl(product.image_id)} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs text-center p-1">
                        Pas d'image
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{product.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{product.price.toFixed(2)} €</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${product.available ? 'text-green-600' : 'text-red-500'}`}>
                      {product.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/merchant/products/${product.$id}/edit`} className="text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium">Modifier</Link>
                      <button onClick={() => handleDelete(product.$id)} className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer">Supprimer</button>
                    </div>
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
