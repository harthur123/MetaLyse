import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface MetadataResponse {
  file: any;
  metadados_extraidos: any;
}

export interface HistoryItem {
  nomeArquivo: string;
  formato: string;
  dataAnalise: string;
  horaAnalise: string;
}

@Component({
  selector: 'app-upload-metadata',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './upload-metadata.html',
  styleUrls: ['./upload-metadata.css']
})
export class UploadMetadata implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  selectedFile: File | null = null;
  metadata: any = null;
  extractedMetadata: any = null;
  uploading: boolean = false;
  uploadProgress: number = 0;
  fileType: 'pdf' | 'jpeg' | null = null;

  displayedColumns: string[] = ['nome_arquivo', 'formato', 'data_analise', 'hora_analise'];
  dataSource = new MatTableDataSource<HistoryItem>([]);

  isDragging = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loadHistory();
  }


  private showError(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-error']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.handleFile(file);
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.fileType = null;
    this.metadata = null;
    this.extractedMetadata = null;

    if (file.type === 'application/pdf') this.fileType = 'pdf';
    else if (file.type === 'image/jpeg') this.fileType = 'jpeg';
    else {
      this.selectedFile = null;
      this.showError('Apenas PDF ou JPEG são suportados!');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }


  uploadFile(): void {
    if (!this.selectedFile) {
      this.showError('Selecione um arquivo antes de enviar.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.showError('Você precisa estar logado para enviar arquivos.');
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post<MetadataResponse>('http://127.0.0.1:5000/api/metadata/upload', formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }

        if (event.type === HttpEventType.Response && event.body) {
          this.metadata = event.body.file;
          this.extractedMetadata = event.body.metadados_extraidos;
          this.uploading = false;

          this.saveToHistory(this.metadata);
        }
      },
      error: (err: any) => {
        this.uploading = false;

        if (err.status === 401) this.showError('Token inválido ou sessão expirada.');
        else if (err.status === 400) this.showError(err.error?.error || 'Arquivo já foi analisado anteriormente.');
        else this.showError('Erro desconhecido ao enviar arquivo.');

        this.selectedFile = null;
        this.fileType = null;
        this.metadata = null;
        this.extractedMetadata = null;

        console.error('Upload falhou:', err);
      }
    });
  }

  private saveToHistory(fileData: any): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body: HistoryItem = {
      nomeArquivo: fileData.nome || fileData.fileName,
      formato: fileData.tipo || fileData.type,
      dataAnalise: new Date().toLocaleDateString(),
      horaAnalise: new Date().toLocaleTimeString()
    };

    this.dataSource.data = [body, ...this.dataSource.data];
    this.http.post('http://127.0.0.1:5000/api/history/me', body, { headers }).subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private loadHistory() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<HistoryItem[]>('http://127.0.0.1:5000/api/history/me', { headers })
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (err) => console.error('Falha ao carregar histórico:', err)
      });
  }
}
