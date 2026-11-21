import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';
import { AuthorSummary, Post, Stats } from '../../core/models';

/** Administration endpoints (the API rejects them for non-admin users). */
@Injectable({ providedIn: 'root' })
export class ServiceAdService {

  private readonly api = `${inject(API_BASE_URL)}/api`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.api}/admin/stats`);
  }

  /** All posts, drafts included. */
  getAllPosts(search = ''): Observable<Post[]> {
    const params = search.trim() ? new HttpParams().set('q', search.trim()) : undefined;
    return this.http.get<Post[]>(`${this.api}/admin/posts`, { params });
  }

  getAuthors(): Observable<AuthorSummary[]> {
    return this.http.get<AuthorSummary[]>(`${this.api}/admin/users`);
  }

  getUserAllPosts(id: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.api}/admin/users/${id}/posts`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/users/${id}`);
  }
}
