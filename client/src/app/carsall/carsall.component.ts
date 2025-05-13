import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-carsall',
  imports: [HeaderComponent, RouterLink, NgFor, NgIf],
  templateUrl: './carsall.component.html',
  styleUrls: ['./carsall.component.scss']
})
export class CarsallComponent implements OnInit {
  products: any[] = [];
  brand: string | null = null;
  model: string | null = null;

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
    this.route.paramMap.subscribe(params => {
      this.brand = params.get('brand'); 
      this.model = params.get('model'); 
      this.fetchPosts();
    });
  }

  async fetchPosts(): Promise<void> {
    let allProducts = await this.postService.fetchPosts();

    
    if (this.brand) {
      allProducts = allProducts.filter(product =>
        product.name.toLowerCase() === this.brand!.toLowerCase()
      );
    }

    
    if (this.model) {
      allProducts = allProducts.filter(product =>
        product.model.toLowerCase() === this.model!.toLowerCase()
      );
    }

    this.products = allProducts;
  }

  
  get uniqueModels(): { model: string, count: number }[] {
    const modelCounts = this.products.reduce((acc, product) => {
      const model = product.model;
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(modelCounts).map(model => ({
      model,
      count: modelCounts[model]
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

  toggleFavorite(event: Event) {
    event.stopPropagation();
  }
}