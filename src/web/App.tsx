import type { ReactElement } from 'react';

import logoUrl from './assets/logo.png';

/**
 * Root application component for the MangaVerse web client.
 *
 * @returns {ReactElement} The rendered application tree.
 */
export function App(): ReactElement {
  // Render the primary landing layout with the brand header.
  return (
    <div>
      <header>
        <img src={logoUrl} alt="MangaVerse logo" width={48} height={48} />
        <span>MangaVerse</span>
      </header>
    </div>
  );
}
