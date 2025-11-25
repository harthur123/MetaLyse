

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }


  get(endpoint: string, headers?: HttpHeaders): Observable<any> {
    return this.http.get(`${API_URL}${endpoint}`, { headers });
  }

  post(endpoint: string, body: any, headers?: HttpHeaders): Observable<any> {
    return this.http.post(`${API_URL}${endpoint}`, body, { headers });
  }


  getRelatorios(): Observable<any> {
    return this.http.get(`${API_URL}/relatorios`);
  }

  analisarArquivo(dadosArquivo: FormData): Observable<any> {
    return this.http.post(`${API_URL}/analisar`, dadosArquivo);
  }


  checkStatus(): Observable<any> {
    return this.http.get(`${API_URL}/status`);
  }
}
