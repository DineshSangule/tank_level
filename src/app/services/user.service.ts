import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface/app';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5000/api/userss';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);  // GET /api/users to fetch all users (implement backend accordingly)
  }


  addUser(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, user); // POST /api/users/add (matches backend add user API)
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, user); // PUT /api/users/:id (implement backend accordingly)
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);  // DELETE /api/users/:id (implement backend accordingly)
  }
}
