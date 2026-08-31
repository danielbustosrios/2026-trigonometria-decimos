import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SessionGate } from './components/auth/SessionGate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionGate><App /></SessionGate>
  </StrictMode>,
);
