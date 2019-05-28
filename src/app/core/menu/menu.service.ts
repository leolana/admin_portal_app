import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExportProfile, MenuViewModel } from './menu.component';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenuViewModel() {
    const url = `${environment.apiUrl}/menu`;
    return this.http.get<MenuViewModel>(url);
  }

  getExportPermission() {
    const url = `${environment.apiUrl}/exportacao/verificacao`;
    return this.http.get<ExportProfile>(url);
  }
}
