import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class NotificacoesService {
  constructor(private http: HttpClient) {}

  getNotifications(page: number, limit?: number) {
    const url = `${environment.apiUrl}/notification`;

    return this.http.get<any[]>(url, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });
  }

  getBullets() {
    const url = `${environment.apiUrl}/notifications-bullets`;
    return this.http.get<any>(url, { params: { hideLoading: 'true' } });
  }
}
