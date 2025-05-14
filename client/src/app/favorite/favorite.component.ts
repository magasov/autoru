import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../services/favorite.service'; 
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = []; 
  isPopup: boolean = false;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadFavorites(); 
  }

  
  async loadFavorites(): Promise<void> {
    try {
      
      const response = await fetch('http://localhost:8080/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      this.favorites = data.favorites.map((fav: any) => ({
        _id: fav.postId._id,
        title: `${fav.postId.brand} ${fav.postId.model}`, 
        price: `${fav.postId.price.toLocaleString()} ₽`, 
        image: fav.postId.photos.length
          ? `http://localhost:8080/${fav.postId.photos[0]}` 
          : 'https://via.placeholder.com/320x240', 
        engine: `${fav.postId.engine}, ${fav.postId.modification}`, 
        year: fav.postId.year,
        drive: fav.postId.drivetrain,
        mileage: `${fav.postId.mileage.toLocaleString()} км`, 
        body: fav.postId.bodyType,
        color: fav.postId.color,
      }));
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      this.favorites = [];
    }
  }

  
  async removeFromFavorites(postId: string): Promise<void> {
    try {
      await this.favoriteService.removeFromFavorites(postId);
      this.favorites = this.favorites.filter((fav) => fav._id !== postId); 
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
    }
  }
}