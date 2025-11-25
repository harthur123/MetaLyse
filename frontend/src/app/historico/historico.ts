import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from "@angular/material/menu";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface HistoricoItem {
  nome_arquivo: string;
  formato: string;
  data_analise: string;
  hora_analise: string;
  author_name?: string; 
  author_email?: string;
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './historico.html',
  styleUrls: ['./historico.css']
})
export class Historico implements AfterViewInit {
  private http = inject(HttpClient);

  displayedColumns: string[] = ['nome_arquivo', 'formato', 'data_analise', 'hora_analise']; 
  dataSource = new MatTableDataSource<HistoricoItem>([]);
  isAdmin: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    // Debug: Logar o valor da role no localStorage
    const role = localStorage.getItem('user_role');
    console.log("Debug Role: Valor lido do localStorage:", role); 
    
    this.isAdmin = (role === 'admin');

    console.log("Debug Role: isAdmin definido como:", this.isAdmin);

    // ✅ CORRIGIDO: Se admin, adiciona a coluna 'usuario' (matColumnDef="usuario")
    if (this.isAdmin) {
      this.displayedColumns.splice(1, 0, 'usuario'); 
    }

    // Filtro
    this.dataSource.filterPredicate = (data: HistoricoItem, filter: string): boolean => {
      const f = filter.trim().toLowerCase();
      const nome = (data.nome_arquivo ?? '').toLowerCase();
      const formato = (data.formato ?? '').toLowerCase();
      const author = (data.author_name ?? '').toLowerCase();
      const email = (data.author_email ?? '').toLowerCase();
      const dataStr = (data.data_analise ?? '').toLowerCase();
      return nome.includes(f) || formato.includes(f) || author.includes(f) || email.includes(f) || dataStr.includes(f);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.loadHistory();
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  loadHistory() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn("⚠ Nenhum token encontrado no localStorage.");
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const endpoint = this.isAdmin 
      ? 'http://127.0.0.1:5000/api/history/all' // Admin (ver todos)
      : 'http://127.0.0.1:5000/api/history/me'; // Usuário Comum (ver apenas o seu)

    console.log("Debug Endpoint: Chamando endpoint:", endpoint);

    this.http.get<any[]>(endpoint, { headers }).subscribe({
      next: (res) => {
        console.log("Debug Resposta: Quantidade de itens recebidos:", res.length);
        console.log("Debug Resposta: Dados brutos recebidos:", res);

        const formattedData: HistoricoItem[] = res.map((item: any) => {
          const dataObj = new Date(item.created_at); 
          return {
            nome_arquivo: item.filename,
            formato: item.filetype,
            data_analise: dataObj.toLocaleDateString('pt-BR'),
            hora_analise: dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
            author_name: item.author_name,
            author_email: item.author_email
          };
        });

        this.dataSource.data = formattedData;
      },
      error: (err) => {
        console.error("❌ Erro ao carregar histórico:", err);
      }
    });
  }
}