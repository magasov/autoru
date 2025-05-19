import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly BASE_API_URL = 'http://localhost:8080';
  isNotification: boolean = false;

  async addToFavorites(postId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.BASE_API_URL}/favorites`,
        { postId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } 
      );
      this.isNotification = true
      setTimeout(() => {
      this.isNotification = false

      }, 4000)
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites', error);
      throw error;
    }
  } 

  async removeFromFavorites(postId: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.BASE_API_URL}/favorites/${postId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites', error);
      throw error;
    }
  }

  async getUserFavorites(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.BASE_API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(response.data.favorites.length);

      return response.data.favorites.map((fav: any) => fav.postId._id);

      
    } catch (error) {
      console.error('Error fetching favorites', error);
      return [];
    }
  }
}