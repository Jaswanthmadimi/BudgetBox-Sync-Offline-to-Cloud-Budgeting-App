import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
      isOnline
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Offline
        </>
      )}
    </div>
  );
}
