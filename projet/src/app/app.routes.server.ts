import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public pages are rendered on the server (SEO, fast first paint).
  { path: '', renderMode: RenderMode.Server },
  { path: 'post/:id/detail', renderMode: RenderMode.Server },
  // Everything else depends on the session stored in the browser.
  { path: '**', renderMode: RenderMode.Client },
];
