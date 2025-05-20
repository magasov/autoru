import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MessageComponent } from "./message/message.component";
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IsPopupMessageService } from './services/ispopupmessage.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  isMessageVisible = false;
  private sub!: Subscription;

  constructor(private popupService: IsPopupMessageService) {}

  ngOnInit() {
    this.sub = this.popupService.isVisible$.subscribe(value => {
      this.isMessageVisible = value;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}