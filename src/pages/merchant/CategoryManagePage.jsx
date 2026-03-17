import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { categoryService } from '../../services/categoryService';

export default function CategoryManagePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (!user?.$id) return;
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.listCategories(user.$id);
      setCategories(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.createCategory({ name: newCatName, merchant_id: user.$id });
      setNewCatName('');
      loadCategories();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(c => c.$id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Gérer les catégories</h1>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="Nouvelle catégorie..."
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md p-2"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
          />
          <button type="submit" className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors cursor-pointer">
            Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Nom de la catégorie</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-8 text-center text-slate-500 dark:text-slate-400">Aucune catégorie.</td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.$id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{cat.name}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(cat.$id)} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                    >
                      Supprimer
                    </button>
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
