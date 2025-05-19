import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { ActivatedRoute } from '@angular/router'; 
import { Title, Meta } from '@angular/platform-browser'; 
import axios from 'axios';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../footer/footer.component";
import { Router, RouterLink } from '@angular/router'; 
import { PostService } from '../services/post.service'; 
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

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
  imports: [HeaderComponent, RouterLink, NgFor, NgIf, CommonModule, FormsModule,FooterComponent],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss'],
  standalone: true
})
export class CarsComponent implements OnInit, OnDestroy {
  user: { email: string; name: string; avatar: string; isVerified: boolean } | null = null;
  products: any[] = [];
  post: Post | null = null;
  desctop: boolean = false;
  loading: boolean = true;
  author: boolean = false;
  headerstickey: boolean = false;
  adssticky: boolean = false;
  error: string | null = null;
  currentImageIndex: number = 0;
  buttons: string[] = [
    'Ещё продаётся?',
    'Обмен возможен?',
    'Торг возможен?',
    'Где и когда можно посмотреть?'
  ];
  selectedIndex: number = 0;
  messageText: string = this.buttons[this.selectedIndex];

  constructor(
    private route: ActivatedRoute,
    private titleService: Title, 
    private metaService: Meta,
    private postService: PostService, 
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.fetchPosts();
    window.scrollTo(0, 0);

    if (id) {
      this.fetchPost(id);
      this.chatService.connectWebSocket();
    } else {
      this.error = 'No post ID provided';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnectWebSocket();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.headerstickey = scrollPosition > 500;
    this.adssticky = scrollPosition > 500;
  }

  setDesctop(boolean: boolean): void {
    this.desctop = boolean;
  }

  async fetchPosts(): Promise<void> {
    this.products = await this.postService.fetchPosts(); 
  }

  async fetchPost(id: string): Promise<void> {
    try {
      const response = await axios.get(`http://localhost:8080/posts/${id}`);
      this.post = response.data.post;
      this.loading = false;
  
      if (this.post) {
        this.setMetaTags();
  
        try {
          const currentUser = await this.authService.getMe();
          this.author = currentUser.user._id === this.post.userId._id;
        } catch (err) {
          this.author = false; 
        }
      }
    } catch (err) {
      this.error = 'Failed to load post data';
      this.loading = false;
      console.error(err);
    }
  }

  async deletePost(): Promise<void> {
    if (!this.post) return;
  
    const confirmed = confirm('Вы уверены, что хотите удалить объявление?');
    if (!confirmed) return;
  
    try {
      await this.postService.deletePost(this.post._id);
      alert('Объявление удалено');
      this.router.navigate(['/']);
    } catch (error) {
      alert('Ошибка при удалении');
      console.error(error);
    }
  }

  onSelect(index: number): void {
    this.selectedIndex = index;
    this.messageText = this.buttons[index];
  }

  sendMessage(): void {
    if (!this.post || !this.messageText.trim()) {
      alert('Сообщение не может быть пустым или пост не загружен');
      return;
    }

    const recipientId = this.post.userId._id;
    const postId = this.post._id;

    try {
      this.chatService.sendMessage(recipientId, postId, this.messageText);
      alert('Сообщение отправлено');
      this.messageText = '';
      this.selectedIndex = -1;
    } catch (error) {
      alert('Ошибка при отправке сообщения');
      console.error(error);
    }
  }

  private setMetaTags(): void {
    if (!this.post) return;

    const title = `Купить б/у ${this.post.brand} ${this.post.model} ${this.post.generation} ${this.post.modification} ${this.post.engine} ${this.post.transmission} в Назрани: ${this.post.color} БМВ ${this.post.model} ${this.post.bodyType} ${this.post.year} года по цене ${this.formatPrice(this.post.price)} на OushAuto.ру`;

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

  startSlider(index: number) {
    this.stopSlider(index);
    this.products[index].intervalId = setInterval(() => {
      this.nextImages(index);
    }, 2000);
  }

  stopSlider(index: number) {
    if (this.products[index].intervalId) {
      clearInterval(this.products[index].intervalId);
      this.products[index].intervalId = null;
    }
  }

  nextImages(index: number) {
    const product = this.products[index];
    product.activeImageIndex = (product.activeImageIndex + 1) % product.images.length;
  }

  setActiveImage(productIndex: number, imageIndex: number) {
    this.products[productIndex].activeImageIndex = imageIndex;
    this.startSlider(productIndex);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation(); 
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