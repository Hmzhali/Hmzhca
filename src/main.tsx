
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  const API_BASE_URL = "https://ais-pre-u7un6hh2e475uaiehqhwxn-395727155540.europe-west2.run.app";
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string') {
      if (resource.startsWith('/api/')) {
        resource = API_BASE_URL + resource;
      } else if (resource.startsWith(window.location.origin + '/api/')) {
        resource = resource.replace(window.location.origin, API_BASE_URL);
      }
    } else if (resource instanceof URL) {
      if (resource.pathname.startsWith('/api/')) {
        resource = new URL(resource.pathname + resource.search, API_BASE_URL);
      }
    }
    return originalFetch(resource, config);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
