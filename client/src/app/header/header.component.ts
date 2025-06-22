import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { PopupService } from '../services/popup-service.service';
import { IsPopupMessageService } from '../services/ispopupmessage.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf, FormsModule, NgFor, SlicePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: { email: string; avatar: string; name: string | null } | null = null;
  isAuthenticated: boolean = false;
  isPopup: boolean = false;
  isSearchOpen: boolean = false;
  searchQuery: string = '';
  filteredBrands: any[] = [];
  private routerSubscription: Subscription | null = null;

  carBrands = [
    { name: 'Lada (ВАЗ)', link: '/carsall/lada', image: '/assets/carbrands/dealer_logo-0.png' },
    { name: 'Audi', link: '/carsall/audi', image: null },
    { name: 'BMW', link: '/carsall/bmw', image: '/assets/carbrands/dealer_logo-1.png' },
    { name: 'Belgee', link: '/carsall/belgee', image: null },
    { name: 'Changan', link: '/carsall/changan', image: null },
    { name: 'Chery', link: '/carsall/chery', image: '/assets/carbrands/dealer_logo-2.png' },
    { name: 'Chevrolet', link: '/carsall/chevrolet', image: null },
    { name: 'Citroen', link: '/carsall/citroen', image: null },
    { name: 'Exeed', link: '/carsall/exeed', image: null },
    { name: 'Ford', link: '/carsall/ford', image: '/assets/carbrands/dealer_logo-3.png' },
    { name: 'GAC', link: '/carsall/gac', image: null },
    { name: 'Geely', link: '/carsall/geely', image: '/assets/carbrands/dealer_logo-4.png' },
    { name: 'Haval', link: '/carsall/haval', image: null },
    { name: 'Honda', link: '/carsall/honda', image: null },
    { name: 'Hyundai', link: '/carsall/hyundai', image: '/assets/carbrands/dealer_logo-5.png' },
    { name: 'Jaecoo', link: '/carsall/jaecoo', image: null },
    { name: 'Kia', link: '/carsall/kia', image: '/assets/carbrands/dealer_logo-6.png' },
    { name: 'Knewstar', link: '/carsall/knewstar', image: null },
    { name: 'Land Rover', link: '/carsall/land-rover', image: null },
    { name: 'Lexus', link: '/carsall/lexus', image: null },
    { name: 'Lixiang', link: '/carsall/lixiang', image: null },
    { name: 'Mazda', link: '/carsall/mazda', image: null },
    { name: 'Mercedes-Benz', link: '/carsall/mercedes', image: '/assets/carbrands/dealer_logo-7.png' },
    { name: 'Mitsubishi', link: '/carsall/mitsubishi', image: null },
    { name: 'Nissan', link: '/carsall/nissan', image: '/assets/carbrands/dealer_logo-8.png' },
    { name: 'Omoda', link: '/carsall/omoda', image: null },
    { name: 'Opel', link: '/carsall/opel', image: null },
    { name: 'Peugeot', link: '/carsall/peugeot', image: null },
    { name: 'Porsche', link: '/carsall/porsche', image: null },
    { name: 'Renault', link: '/carsall/renault', image: null },
    { name: 'Skoda', link: '/carsall/skoda', image: null },
    { name: 'Toyota', link: '/carsall/toyota', image: '/assets/carbrands/dealer_logo-9.png' },
    { name: 'Volkswagen', link: '/carsall/volkswagen', image: '/assets/carbrands/dealer_logo-10.png' },
    { name: 'Volvo', link: '/carsall/volvo', image: null }
  ];

  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private popupService2: IsPopupMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.filteredBrands = this.carBrands;
    // Close search popup on navigation
    this.routerSubscription = this.router.events.subscribe(() => {
      this.isSearchOpen = false;
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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

  setIsPopup(): void {
    this.isPopup = !this.isPopup;
  }

  toggleMessage(event: Event): void {
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

  toggleSearch(event: Event): void {
    event.stopPropagation();
    this.isSearchOpen = !this.isSearchOpen;
  }

  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredBrands = this.carBrands.filter(brand =>
        brand.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredBrands = this.carBrands;
    }
  }

  closeSearchOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.popup__search-content') || target.closest('.search')) {
      return;
    }
    this.isSearchOpen = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isSearchOpen) {
      this.isSearchOpen = false;
    }
  }
}