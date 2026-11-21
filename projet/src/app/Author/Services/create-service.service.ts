import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { API } from '../../core/api.config';
import { Comment, MessageResponse, Post, PostPayload } from '../../core/models';

/** Posts, comments and account activation. */
@Injectable({ providedIn: 'root' })
export class CreateServiceService {

  constructor(private http: HttpClient) { }

  // ------------------------------------------------------------ posts (public)

  /** Published posts only, newest first. */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API}/posts`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${API}/posts/${id}`);
  }

  // ----------------------------------------------------- posts (author/admin)

  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API}/me/posts`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string }>(`${API}/uploads`, formData)
      .pipe(switchMap(r => of(r.filename)));
  }

  /** Uploads the image first, then creates the post with the name returned by the server. */
  addContent(data: Omit<PostPayload, 'image'>, file: File): Observable<Post> {
    return this.uploadImage(file).pipe(
      switchMap(image => this.http.post<Post>(`${API}/posts`, { ...data, image }))
    );
  }

  /** `file` is only uploaded when the author picked a new image. */
  updatePost(id: number, data: PostPayload, file: File | null): Observable<Post> {
    const image$ = file ? this.uploadImage(file) : of(data.image);
    return image$.pipe(
      switchMap(image => this.http.put<Post>(`${API}/posts/${id}`, { ...data, image }))
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/posts/${id}`);
  }

  // ------------------------------------------------------------------ comments

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API}/posts/${postId}/comments`);
  }

  commentPost(postId: number, data: { pseudo: string; comment: string }): Observable<Comment> {
    return this.http.post<Comment>(`${API}/posts/${postId}/comments`, data);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/comments/${id}`);
  }

  // ---------------------------------------------------------------- activation

  validation(email: string, code: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${API}/auth/activate`, { email, code });
  }

  resendCode(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${API}/auth/resend-code`, { email });
  }
}
