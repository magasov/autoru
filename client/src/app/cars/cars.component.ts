import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router'; 
import axios from 'axios';
import { CommonModule, NgFor, NgIf } from '@angular/common';

interface Post {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
  };
  brand: string;
  model: string;
  year: string;
  bodyType: string;
  generation: string;
  engine: string;
  drivetrain: string;
  transmission: string;
  modification: string;
  color: string;
  mileage: number;
  photos: string[];
  ptsType: string;
  description: string;
  contactName: string;
  email: string;
  phone: string;
  price: number;
  createdAt: string;
}

@Component({
  selector: 'app-cars',
  imports: [HeaderComponent, RouterLink, NgFor, NgIf, CommonModule],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})

export class CarsComponent implements OnInit {
  post: Post | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0; 

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchPost(id);
    } else {
      this.error = 'No post ID provided';
      this.loading = false;
    }
  }

  async fetchPost(id: string): Promise<void> {
    try {
      const response = await axios.get(`http://localhost:8080/posts/${id}`);
      this.post = response.data.post;
      this.loading = false;
    } catch (err) {
      this.error = 'Failed to load post data';
      this.loading = false;
      console.error(err);
    }
  }

  
  prevImage(): void {
    if (this.post && this.post.photos.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.post.photos.length) % this.post.photos.length;
    }
  }

  
  nextImage(): void {
    if (this.post && this.post.photos.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.post.photos.length;
    }
  }

  
  setImage(index: number): void {
    if (this.post && this.post.photos.length > index) {
      this.currentImageIndex = index;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}