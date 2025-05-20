import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { PopupService } from '../services/popup-service.service';
import { IsPopupMessageService } from '../services/ispopupmessage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: { email: string; avatar: string; name: null | null } | null = null;
  isAuthenticated: boolean = false;
  isPopup: boolean = false;

  constructor(private authService: AuthService, private popupService: PopupService,private popupService2: IsPopupMessageService) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  
  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.authService.getMe().then(
        (response) => {
          this.user = response.user; 
          
          
        },
        (error) => {
          console.error('Ошибка при получении данных пользователя:', error);
          this.isAuthenticated = false;
          this.user = null;
          this.authService.logout(); 
        }
      );
    }
  }

  setIsPopup() {
    this.isPopup = !this.isPopup;
  }

  toggleMessage(event: Event) {
    event.preventDefault(); 
    this.popupService2.toggle();
  }

  setIsPopupFavorite(): void {
    this.popupService.setIsPopup(true); 
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.user = null;
  }
}