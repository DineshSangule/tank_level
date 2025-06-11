import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://tank.agromationindia.com/api';

  constructor(private http: HttpClient) {}
    loading: BehaviorSubject<boolean> = new BehaviorSubject(false);


  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

   getToken(): string {
    const token = localStorage.getItem('token');
    return token !== null ? token : '';
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
  }
    setLoading(loading: boolean) {
    this.loading.next(loading);
  }

getDevices() {
  return this.http.get<any>(`${this.apiUrl}/getDevices`, {
    headers: { Authorization: (typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : '') }
  });
}

getReports(id: number, from: string, to: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.getToken(),
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/getReports`, { id, from, to }, { headers });
  }

  getMonthReports(id: number, from: string, to: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.getToken(),
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/getMonthReports`, { id, from, to }, { headers });
  }
}