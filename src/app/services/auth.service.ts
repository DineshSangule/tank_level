import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://'

  constructor(private http: HttpClient) { }

  login(credentials:{userId: string; password: string}):Observable<any>
  {
    return this.http.post('${baseUrl}/login',credentials);
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem('token');
  }

  logout()
  {
    localStorage.removeItem('token');
  }
}
