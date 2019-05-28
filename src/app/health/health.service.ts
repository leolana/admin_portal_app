import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HealthService {
  constructor(private http: HttpClient) {}

  testMainServices() {
    return this.http.get(`${environment.apiUrl}/health-check`);
  }

  testPostgresConnection() {
    return this.http.get(`${environment.apiUrl}/health/testPostgresConnection`);
  }

  testOracleConnection() {
    return this.http.get(`${environment.apiUrl}/health/testOracleConnection`);
  }

  testKeyCloakAccess() {
    return this.http.get(`${environment.apiUrl}/health/testKeyCloakAccess`);
  }

  testMailer(to) {
    return this.http.post(`${environment.apiUrl}/health/testMailer`, { to: to });
  }

  getStatusCredenciamentos() {
    return this.http.get(`${environment.apiUrl}/health/getStatusCredenciamentos`);
  }

  getStatusFornecedores() {
    return this.http.get(`${environment.apiUrl}/health/getStatusFornecedores`);
  }

  getStatusCessoes() {
    return this.http.get(`${environment.apiUrl}/health/getStatusCessoes`);
  }

  getStatusSignins() {
    return this.http.get(`${environment.apiUrl}/health/getStatusSignins`);
  }

  getVersionAPI() {
    return this.http.get(`${environment.apiUrl}/version`);
  }

  getMigrations() {
    return this.http.get<any[]>(`${environment.apiUrl}/health/migrations`);
  }
}
