import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-solicitar-redefinicao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './solicitar-redefinicao.html',
  styleUrls: ['./solicitar-redefinicao.css']
})
export class SolicitarRedefinicao {
  private http = inject(HttpClient);

  email = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  solicitarRedefinicao() {
    if (this.loading) return; 

    this.errorMsg = '';
    this.successMsg = '';

    if (!this.email.trim()) {
      this.errorMsg = 'Informe seu e-mail.';
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.errorMsg = 'E-mail inválido.';
      return;
    }

    this.loading = true;

    this.http.post('http://127.0.0.1:5000/api/auth/reset-password-request', {
      email: this.email.trim()
    })
    .subscribe({
      next: () => {
        this.loading = false;
        this.successMsg =
          'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';
        this.email = ''; // limpa campo
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Erro ao enviar o link. Tente novamente.';
      }
    });
  }
}
