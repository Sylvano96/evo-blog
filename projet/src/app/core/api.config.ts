import { InjectionToken } from '@angular/core';

/**
 * Origin of the Spring Boot API.
 * - In the browser it is '' : calls go to /api on the same origin and the Node
 *   server (server.ts) or the dev proxy forwards them to Spring Boot.
 * - During server-side rendering it is overridden in app.config.server.ts with
 *   API_INTERNAL_URL (e.g. http://api:8080 inside Docker).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

/** Images are always loaded by the browser through the same origin. */
export function imageUrl(name: string | null | undefined): string {
  return name ? `/images/${encodeURIComponent(name)}` : 'assets/img3.jpg';
}

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'Actualités technologique', label: 'Actualités Tech' },
  { value: 'Intelligence Artificielle', label: 'Intelligence Artificielle' },
  { value: 'Technologie Mobile', label: 'Technologie Mobile' },
  { value: 'Innovations Emergantes', label: 'Innovations Émergentes' },
  { value: 'Gadgets et Wearables', label: 'Gadgets et Wearables' },
  { value: 'Technologie et Environnement', label: 'Technologie et Environnement' },
  { value: 'Sécurité Informatique', label: 'Sécurité Informatique' },
  { value: 'Technologie et Santé', label: 'Technologie et Santé' },
  { value: 'Technologie et Société', label: 'Technologie et Société' },
  { value: 'Futur et Futurologie', label: 'Futur et Futurologie' },
];

export const STATUS_PUBLISHED = 'publié';
export const STATUS_DRAFT = 'non publié';
