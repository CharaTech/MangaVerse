import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

// Resolve the document root element that hosts the React tree.
const container = document.getElementById('root');
if (container) {
  // Render the application inside React StrictMode for development checks.
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
