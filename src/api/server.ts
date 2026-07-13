import express from 'express';
import type { Request, Response } from 'express';

/**
 * Creates and configures the MangaVerse API Express application.
 *
 * @returns {express.Express} The fully configured Express application instance.
 */
export function createApp(): express.Express {
  // Instantiate the core Express application.
  const app = express();
  // Enable JSON body parsing for inbound requests.
  app.use(express.json());

  // Register the liveness health-check endpoint.
  app.get('/health', (_request: Request, response: Response) => {
    // Respond with a simple ok status payload.
    response.json({ status: 'ok' });
  });

  return app;
}

// Guard against auto-starting the server while running under test.
if (process.env['NODE_ENV'] !== 'test') {
  const port = 3000;
  // Begin accepting inbound HTTP connections on the configured port.
  createApp().listen(port, () => {
    console.error(`MangaVerse API listening on http://localhost:${port}`);
  });
}
