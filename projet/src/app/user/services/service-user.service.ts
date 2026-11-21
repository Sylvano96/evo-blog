import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../core/api.config';
import { MessageResponse, Session } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ServiceUserService {

  constructor(private http: HttpClient) { }

  /** The role and activation state are decided by the server. */
  createUser(data: { name: string; lastName: string; email: string; password: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${API}/auth/register`, data);
  }

  loginUser(data: { email: string; password: string }): Observable<Session> {
    return this.http.post<Session>(`${API}/auth/login`, data);
  }
}
