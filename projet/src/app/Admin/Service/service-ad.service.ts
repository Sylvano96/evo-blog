import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../core/api.config';
import { AuthorSummary, Post, Stats } from '../../core/models';

/** Administration endpoints (the API rejects them for non-admin users). */
@Injectable({ providedIn: 'root' })
export class ServiceAdService {

  constructor(private http: HttpClient) { }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${API}/admin/stats`);
  }

  /** All posts, drafts included. */
  getAllPosts(search = ''): Observable<Post[]> {
    const params = search.trim() ? new HttpParams().set('q', search.trim()) : undefined;
    return this.http.get<Post[]>(`${API}/admin/posts`, { params });
  }

  getAuthors(): Observable<AuthorSummary[]> {
    return this.http.get<AuthorSummary[]>(`${API}/admin/users`);
  }

  getUserAllPosts(id: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${API}/admin/users/${id}/posts`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/admin/users/${id}`);
  }
}
