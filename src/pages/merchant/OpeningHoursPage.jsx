import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/scheduleService';

const DAYS = [
  { id: 0, name: 'Lundi' },
  { id: 1, name: 'Mardi' },
  { id: 2, name: 'Mercredi' },
  { id: 3, name: 'Jeudi' },
  { id: 4, name: 'Vendredi' },
  { id: 5, name: 'Samedi' },
  { id: 6, name: 'Dimanche' }
];

export default function OpeningHoursPage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.$id) return;
    loadSchedule();
  }, [user]);

  const loadSchedule = async () => {
    try {
      const docs = await scheduleService.getOpeningHours(user.$id);
      const schedMap = {};
      docs.forEach(doc => {
        schedMap[doc.day_of_week] = {
          open_time: doc.open_time,
          close_time: doc.close_time,
          is_closed: doc.is_closed
        };
      });
      DAYS.forEach(day => {
        if (!schedMap[day.id]) {
          schedMap[day.id] = { open_time: '09:00', close_time: '18:00', is_closed: false };
        }
      });
      setSchedule(schedMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const day of DAYS) {
        const data = schedule[day.id];
        await scheduleService.upsertOpeningHour(user.$id, day.id, data.open_time, data.close_time, data.is_closed);
      }
      alert('Horaires sauvegardés avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (dayId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Horaires d'ouverture</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="space-y-6">
          {DAYS.map(day => (
            <div key={day.id} className="flex items-center p-4 border rounded-lg border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <div className="w-1/3 text-slate-800 dark:text-slate-200 font-semibold">{day.name}</div>
              <div className="w-1/3 flex items-center">
                <input
                  type="checkbox"
                  id={`closed-${day.id}`}
                  checked={schedule[day.id]?.is_closed}
                  onChange={e => updateDay(day.id, 'is_closed', e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 focus:ring-slate-800 dark:focus:ring-slate-400 mr-2 cursor-pointer"
                />
                <label htmlFor={`closed-${day.id}`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Fermé</label>
              </div>
              <div className="w-1/3 flex items-center gap-2">
                <input
                  type="time"
                  disabled={schedule[day.id]?.is_closed}
                  value={schedule[day.id]?.open_time || ''}
                  onChange={e => updateDay(day.id, 'open_time', e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm disabled:opacity-50"
                />
                <span className="text-slate-500 dark:text-slate-400">-</span>
                <input
                  type="time"
                  disabled={schedule[day.id]?.is_closed}
                  value={schedule[day.id]?.close_time || ''}
                  onChange={e => updateDay(day.id, 'close_time', e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
