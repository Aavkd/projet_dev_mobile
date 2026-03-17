import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

function getFileExtension(filename = '') {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export default function ProductFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: 0,
    available: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (!user?.$id) return;

    categoryService.listCategories(user.$id)
      .then(res => setCategories(res.documents))
      .catch(console.error);

    if (isEdit) {
      productService.getProduct(id)
        .then(doc => {
          setFormData({
            name: doc.name,
            price: doc.price,
            category: doc.category,
            stock: doc.stock,
            available: doc.available
          });
          setInitialLoading(false);
        })
        .catch(err => {
          console.error(err);
          navigate('/merchant/products');
        });
    }
  }, [id, user, navigate, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_id = undefined;
      if (imageFile) {
        const extension = getFileExtension(imageFile.name);
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
          throw new Error('Format image non supporte. Utilisez un fichier .jpg, .jpeg ou .png.');
        }

        const uploadRes = await productService.uploadImage(imageFile);
        image_id = uploadRes.$id;
      }

      const productPayload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        available: formData.available,
        merchant_id: user.$id
      };

      if (isEdit) {
        if (image_id) productPayload.image_id = image_id;
        await productService.updateProduct(id, productPayload);
      } else {
        productPayload.image_id = image_id || '';
        await productService.createProduct(productPayload);
      }
      navigate('/merchant/products');
    } catch (err) {
      console.error(err);
      const message = err?.message || 'Erreur lors de la sauvegarde du produit.';
      if (message.toLowerCase().includes('file extension not allowed')) {
        alert('Extension d\'image refusee par Appwrite. Autorisez .jpg, .jpeg et .png dans le bucket, ou choisissez un fichier accepte.');
      } else {
        alert(message);
      }
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
        {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du produit</label>
          <input
            required
            type="text"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix (€)</label>
            <input
              required
              type="number"
              step="0.01"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
            <input
              required
              type="number"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2"
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
          <select
            required
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.$id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image (Optionnel)</label>
           <input
              type="file"
              accept=".jpg,.jpeg,.png,image/png,image/jpeg"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-2"
              onChange={e => setImageFile(e.target.files[0])}
           />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            className="rounded border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50"
            checked={formData.available}
            onChange={e => setFormData({...formData, available: e.target.checked})}
          />
          <label htmlFor="available" className="ml-2 block text-sm text-slate-900 dark:text-slate-100">
            Produit disponible à la vente
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/merchant/products')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-md hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}
