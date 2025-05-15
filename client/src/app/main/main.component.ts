import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { FavoriteService } from '../services/favorite.service';
import { PopupService } from '../services/popup-service.service';
import { FavoriteComponent } from "../favorite/favorite.component";

@Component({
  selector: 'app-main',
  imports: [NgFor, RouterLink, NgIf, FavoriteComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  products: any[] = [];
  favoritelength: number = 0;

  constructor(
    private postService: PostService,
    private favoriteService: FavoriteService,
    private router: Router,
    private popupService: PopupService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  get isNotification(): boolean {
    return this.favoriteService.isNotification;
  }

  async fetchPosts(): Promise<void> {
    this.products = await this.postService.fetchPosts();
    
    const favoritePostIds = await this.favoriteService.getUserFavorites();
    this.favoritelength = favoritePostIds.length
    

    this.products = this.products.map((product) => ({
      ...product,
      isFavorite: favoritePostIds.includes(product.id),
    }));
  }

  

  startSlider(index: number) {
    this.stopSlider(index);
    this.products[index].intervalId = setInterval(() => {
      this.nextImage(index);
    }, 2000);
  }

  stopSlider(index: number) {
    if (this.products[index].intervalId) {
      clearInterval(this.products[index].intervalId);
      this.products[index].intervalId = null;
    }
  }

  nextImage(index: number) {
    const product = this.products[index];
    product.activeImageIndex = (product.activeImageIndex + 1) % product.images.length;
  }

  setActiveImage(productIndex: number, imageIndex: number) {
    this.products[productIndex].activeImageIndex = imageIndex;
    this.startSlider(productIndex);
  }

  setIsPopupFavorite(): void {
    this.popupService.setIsPopup(true); 
  }

  async toggleFavorite(event: Event, product: any) {
    event.stopPropagation();
    event.preventDefault(); 
    this.fetchPosts()

    try {
      if (product.isFavorite) {
        await this.favoriteService.removeFromFavorites(product.id);
        product.isFavorite = false;
      } else {
        await this.favoriteService.addToFavorites(product.id);
        product.isFavorite = true;
      }
      this.cdr.detectChanges(); 
    } catch (error) {
      console.error('Error toggling favorite', error);
    }
  }
}