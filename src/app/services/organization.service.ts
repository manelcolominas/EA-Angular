import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //Función: obtener organizaciones de la API
  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.baseUrl}/organizations`
    );
  }

  //Función: obtener una organización por su ID
  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/organizations/${id}`);
  }

  //Función: crear nueva organización
  createOrganization(name: string): Observable<Organization> {
    return this.http.post<Organization>(`${this.baseUrl}/organizations`, { name });
  }

  //Función: actualizar organización existente
  updateOrganization(id: string, name: string): Observable<Organization> {
    return this.http.put<Organization>(`${this.baseUrl}/organizations/${id}`, { name });
  }

  //Función: eliminar organización
  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organizations/${id}`);
  }

  //Función: obtener los usuarios de una organización
  getUsersByOrganization(organizationId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/organizations/${organizationId}/users`);
  }

  //Función: eliminar usuario de una organización
  removeUserFromOrganization(organizationId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organizations/${organizationId}/users/${userId}`);
  }
}
