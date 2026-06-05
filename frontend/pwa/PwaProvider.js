'use client';
import { useEffect } from 'react';
import { registerServiceWorker } from './pwaRegister';
import usePWA from './usePWA';
import OfflineIndicator from './OfflineIndicator';

export default function PwaProvider({ children }) {
  const { isOnline } = usePWA();

  useEffect(() => {
    // Register PWA service worker on mount
    registerServiceWorker();
  }, []);

  return (
    <>
      {children}
      <OfflineIndicator isOnline={isOnline} />
    </>
  );
}
