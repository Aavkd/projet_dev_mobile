import { useState, useEffect } from 'react';

export default function NotificationToast({ notifications }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Look for the newest unread notification that was just created
    const newUnread = notifications.filter(n => !n.read);
    if (newUnread.length > 0) {
      const latest = newUnread[0];
      // Check if it's less than 5 seconds old
      const age = new Date() - new Date(latest.$createdAt);
      if (age < 5000) {
         setToast(latest);
         const timer = setTimeout(() => setToast(null), 5000);
         return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!toast) return null;

  return (
    <div className="slide-in-bottom fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
      </div>
      <div className="min-w-0 text-sm font-normal">
        <span className="mb-1 block font-semibold">Nouvelle notification</span>
        {toast.message}
      </div>
      <button type="button" onClick={() => setToast(null)} className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Close">
        <span className="sr-only">Fermer</span>
        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
      <style>{`
        @keyframes slideInBottom {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slide-in-bottom {
          animation: slideInBottom 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
