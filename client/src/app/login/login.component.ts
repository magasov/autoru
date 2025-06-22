import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  code: string[] = Array(6).fill('');
  isCodeStep: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  isCodeVerified: boolean = false;

  @ViewChild('codeInput1') codeInput1!: ElementRef;
  @ViewChild('codeInput2') codeInput2!: ElementRef;
  @ViewChild('codeInput3') codeInput3!: ElementRef;
  @ViewChild('codeInput4') codeInput4!: ElementRef;
  @ViewChild('codeInput5') codeInput5!: ElementRef; 
  @ViewChild('codeInput6') codeInput6!: ElementRef;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Вход в систему');
    this.metaService.updateTag({
      name: 'description',
      content: 'Страница входа в систему для пользователей',
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: 'вход, авторизация, логин',
    });
  }

  async requestAuthCode(): Promise<void> {
    if (!this.email) {
      this.errorMessage = 'Введите email или телефон';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await axios.post('http://localhost:8080/auth', { email: this.email });
      this.isCodeStep = true;
      setTimeout(() => this.codeInput1.nativeElement.focus(), 0);
    } catch (error: any) {
      this.errorMessage = error.response?.data?.message || 'Ошибка при запросе кода';
    } finally {
      this.isLoading = false;
    }
  }

  onCodeInput(index: number, event: any): void {
    const value = event.target.value;
    if (value) {
      this.code[index - 1] = value;

      if (index < 6) {
        const nextInput = this[`codeInput${index + 1}` as keyof LoginComponent] as ElementRef;
        nextInput.nativeElement.focus();
      }

      if (this.code.every(c => c)) {
        this.verifyCode();
      }
    }
  }

  onCodeBackspace(index: number, event: any): void {
    if (event.target.value === '' && index > 1) {
      const prevInput = this[`codeInput${index - 1}` as keyof LoginComponent] as ElementRef;
      prevInput.nativeElement.focus();
    }
  }

  async verifyCode(): Promise<void> {
    const fullCode = this.code.join('');
    if (fullCode.length !== 6) {
      this.errorMessage = 'Код должен состоять из 6 цифр';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await axios.post('http://localhost:8080/auth/verify-code', {
        email: this.email,
        code: fullCode,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      this.isCodeVerified = true;

      
      try {
        const userData = await this.authService.getMe();
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      } catch (error: any) {
        this.errorMessage = error.message || 'Ошибка при получении данных пользователя';
        console.error('Ошибка при получении данных:', error);
      }
    } catch (error: any) {
      this.errorMessage = error.response?.data?.message || 'Неверный код';
      this.isCodeVerified = false;
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.isCodeStep = false;
    this.code = Array(6).fill('');
    this.errorMessage = '';
    this.isCodeVerified = false;
  }
}