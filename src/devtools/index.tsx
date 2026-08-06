import React from 'react';
import ReactDOM from 'react-dom/client';
import { DevToolsApp } from './DevToolsApp';
import '../index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <DevToolsApp />
    </React.StrictMode>
  );
}
