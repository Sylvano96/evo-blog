import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';
import { MessageResponse, Session } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ServiceUserService {

  private readonly api = `${inject(API_BASE_URL)}/api`;

  constructor(private http: HttpClient) { }

  /** The role and activation state are decided by the server. */
  createUser(data: { name: string; lastName: string; email: string; password: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.api}/auth/register`, data);
  }

  loginUser(data: { email: string; password: string }): Observable<Session> {
    return this.http.post<Session>(`${this.api}/auth/login`, data);
  }
}
