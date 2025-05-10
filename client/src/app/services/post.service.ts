import { Injectable, model } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly BASE_API_URL = 'http://localhost:8080';
  private readonly BASE_IMAGE_URL = 'http://localhost:8080/';

  async fetchPosts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.BASE_API_URL}/posts`);
      const posts = response.data.posts || [];

     
      return posts.map((post: any) => ({
        id: post._id,
        name: post.brand,
        model: post.model,
        generation: post.generation,
        price: `${post.price.toLocaleString('ru-RU')} ₽`,
        year: post.year,
        mileage: `${post.mileage.toLocaleString('ru-RU')} км`,
        images: post.photos.map((photo: string) => `${this.BASE_IMAGE_URL}${photo}`),
        activeImageIndex: 0,
        intervalId: null as any,
      }));
    } catch (error) {
      console.error('Error', error);
      return []; 
    }
  }
  
}