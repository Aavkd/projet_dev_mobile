import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addressService } from '../../services/addressService';

export default function PickupAddressPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ label: '', address: '' });

  useEffect(() => {
    if (!user?.$id) return;
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await addressService.listAddresses(user.$id);
      setAddresses(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.label || !formData.address) return;
    
    try {
      const isFirst = addresses.length === 0;
      await addressService.createAddress({
        client_id: user.$id,
        label: formData.label,
        address: formData.address,
        is_default: isFirst
      });
      setFormData({ label: '', address: '' });
      setShowForm(false);
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter(a => a.$id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        await addressService.updateAddress(defaultAddr.$id, { is_default: false });
      }
      await addressService.setDefault(id);
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert('Erreur.');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="app-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title text-3xl">Mes Adresses</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Gerez vos points de retrait et votre adresse par defaut.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full sm:w-auto">
            {showForm ? 'Annuler' : '+ Ajouter une adresse'}
          </button>
        </div>
      </section>

      {showForm && (
        <section className="app-card p-5 sm:p-6">
          <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">Nouvelle adresse</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Libelle</label>
              <input
                type="text"
                required
                placeholder="Ex: Domicile"
                className="ui-input"
                value={formData.label}
                onChange={e => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse complete</label>
              <textarea
                required
                rows="3"
                placeholder="123 rue de la Paix, 75000 Paris"
                className="ui-input"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </section>
      )}

      {addresses.length === 0 ? (
        <section className="app-card p-10 text-center text-slate-500 dark:text-slate-400">
          Vous n'avez pas encore d'adresse enregistree.
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map(addr => (
            <article
              key={addr.$id}
              className={`app-card flex flex-col p-5 ${addr.is_default ? 'border-blue-300 dark:border-blue-500/50 bg-blue-50/40 dark:bg-blue-500/10' : ''}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{addr.label}</h3>
                {addr.is_default && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                    Par defaut
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{addr.address}</p>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.$id)} className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                    Definir par defaut
                  </button>
                )}
                <button onClick={() => handleDelete(addr.$id)} className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
