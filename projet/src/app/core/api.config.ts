/** Base URL of the Spring Boot API (change it for production). */
export const API_URL = 'http://localhost:8080';

export const API = `${API_URL}/api`;

export function imageUrl(name: string | null | undefined): string {
  return name ? `${API_URL}/images/${encodeURIComponent(name)}` : 'assets/img3.jpg';
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
