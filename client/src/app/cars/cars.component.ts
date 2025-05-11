import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router'; 
import { Title, Meta } from '@angular/platform-browser'; 
import axios from 'axios';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Post {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
    avatar: string;
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
  imports: [HeaderComponent, RouterLink, NgFor, NgIf, CommonModule, FormsModule],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss'],
  standalone: true
})
export class CarsComponent implements OnInit {
  post: Post | null = null;
  desctop: boolean = false;
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title, 
    private metaService: Meta   
  ) {}

  setDesctop(boolean: boolean): void {
    this.desctop = boolean;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    window.scrollTo(0,0)
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

      
      if (this.post) {
        this.setMetaTags();
      }
    } catch (err) {
      this.error = 'Failed to load post data';
      this.loading = false;
      console.error(err);
    }
  }

buttons: string[] = [
    'Ещё продаётся?',
    'Обмен возможен?',
    'Торг возможен?',
    'Где и когда можно посмотреть?'
  ];

  selectedIndex: number = 0;
  messageText: string = this.buttons[this.selectedIndex];

  onSelect(index: number): void {
    this.selectedIndex = index;
    this.messageText = this.buttons[index];
  }

  
  private setMetaTags(): void {
    if (!this.post) return;

    
    const title = `Купить б/у ${this.post.brand} ${this.post.model} ${this.post.generation} ${this.post.modification} ${this.post.engine} ${this.post.transmission} в Назрани: ${this.post.color} БМВ ${this.post.model} ${this.post.bodyType} ${this.post.year} года по цене ${this.formatPrice(this.post.price)} на Авто.ру`;

    
    const shortDescription = this.post.description.length > 100 
      ? this.post.description.substring(0, 100) + '...' 
      : this.post.description;

    const metaDescription = `Продается ${this.post.brand} ${this.post.model} ${this.post.year}, ${this.post.color}, ${this.post.bodyType}, ${this.post.engine}, ${this.formatPrice(this.post.price)}. ${shortDescription}`;

    
    this.titleService.setTitle(title);

    
    this.metaService.updateTag({ name: 'description', content: metaDescription });
    this.metaService.updateTag({ name: 'keywords', content: `${this.post.brand}, ${this.post.model}, б/у, купить, ${this.post.year}, ${this.post.color}, автомобиль, Назрань` });
    this.metaService.updateTag({ name: 'og:title', content: title });
    this.metaService.updateTag({ name: 'og:description', content: metaDescription });
    this.metaService.updateTag({ name: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'og:image', content: this.post.photos[0] || '' }); 
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