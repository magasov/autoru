import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service'; 

@Component({
  selector: 'app-main',
  imports: [NgFor],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  products: any[] = [];

  constructor(private postService: PostService) {} 

  ngOnInit(): void {
    this.fetchPosts();
  }

  async fetchPosts(): Promise<void> {
    this.products = await this.postService.fetchPosts(); 
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
}