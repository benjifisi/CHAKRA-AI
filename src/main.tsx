import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

// Register Service Worker for offline field access
registerServiceWorker().catch((err) => {
  console.warn('[PWA] Service worker registration issue:', err);
});

createRoot(document.getElementById('root')!).render(<App />);
