import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  private http = inject(HttpClient);
  private router = inject(Router);

  identifier = '';
  password = '';
  hidePassword = true;
  loading = false;
  errorMsg = '';
  remember = false;

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onLogin() {
    this.errorMsg = '';

    if (!this.identifier || !this.password) {
      this.errorMsg = 'Preencha todos os campos.';
      return;
    }

    // Só valida email se realmente for um email
    if (this.identifier.includes('@') && !this.validateEmail(this.identifier)) {
      this.errorMsg = 'E-mail inválido.';
      return;
    }

    const body = { identifier: this.identifier, password: this.password };
    this.loading = true;

    this.http.post('http://127.0.0.1:5000/api/auth/login', body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          // 1. SALVAR O TOKEN
          localStorage.setItem('access_token', res.access_token);

          // ✅ CORREÇÃO CRÍTICA: SALVAR A ROLE DO USUÁRIO
          if (res.user_role) {
            localStorage.setItem('user_role', res.user_role);
          } else {
            // Se não houver role, assume user
            localStorage.setItem('user_role', 'user');
          }

          if (this.remember) {
            localStorage.setItem('saved_identifier', this.identifier);
          } else {
            localStorage.removeItem('saved_identifier');
          }

          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 401) this.errorMsg = 'Senha incorreta.';
          else if (err.status === 404) this.errorMsg = 'Usuário ou e-mail não encontrado.';
          else this.errorMsg = 'Erro ao conectar ao servidor.';
        }
      });
  }
}