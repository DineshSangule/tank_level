import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface/app';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl= 'http://';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]>
  {
    return this.http.get<User[]>(this.baseUrl);
  }
  getUser(id: number): Observable<User>
  {
    return this.http.get<User> (`${this.baseUrl}/${id}`);
  }
  addUser(user: User): Observable<User>
  {
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(id: number, user: User): Observable<User>
  {
    return this.http.put<User>(`${this.baseUrl}/${id}`,user);
  }

  deleteUser(id:number): Observable<any>
  {
    return this.http.delete('${this.baseUrl}/${id}');
  }
}
