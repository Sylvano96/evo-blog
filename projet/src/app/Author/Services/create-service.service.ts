import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';
import { Comment, MessageResponse, Post, PostPayload } from '../../core/models';

/** Posts, comments and account activation. */
@Injectable({ providedIn: 'root' })
export class CreateServiceService {

  private readonly api = `${inject(API_BASE_URL)}/api`;

  constructor(private http: HttpClient) { }

  // ------------------------------------------------------------ posts (public)

  /** Published posts only, newest first. */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.api}/posts`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.api}/posts/${id}`);
  }

  // ----------------------------------------------------- posts (author/admin)

  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.api}/me/posts`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string }>(`${this.api}/uploads`, formData)
      .pipe(switchMap(r => of(r.filename)));
  }

  /** Uploads the image first, then creates the post with the name returned by the server. */
  addContent(data: Omit<PostPayload, 'image'>, file: File): Observable<Post> {
    return this.uploadImage(file).pipe(
      switchMap(image => this.http.post<Post>(`${this.api}/posts`, { ...data, image }))
    );
  }

  /** `file` is only uploaded when the author picked a new image. */
  updatePost(id: number, data: PostPayload, file: File | null): Observable<Post> {
    const image$ = file ? this.uploadImage(file) : of(data.image);
    return image$.pipe(
      switchMap(image => this.http.put<Post>(`${this.api}/posts/${id}`, { ...data, image }))
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${id}`);
  }

  // ------------------------------------------------------------------ comments

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/posts/${postId}/comments`);
  }

  commentPost(postId: number, data: { pseudo: string; comment: string }): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/posts/${postId}/comments`, data);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/comments/${id}`);
  }

  // ---------------------------------------------------------------- activation

  validation(email: string, code: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.api}/auth/activate`, { email, code });
  }

  resendCode(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.api}/auth/resend-code`, { email });
  }
}
