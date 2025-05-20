 import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatService, Chat, Message } from '../services/chat.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, NgIf, NgFor]
})
export class MessageComponent {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  isChatSelected: boolean = false; 
  isChatSelect: boolean = false; 

  constructor(private chatService: ChatService) {
    this.chats = this.chatService.getChats();
    if (this.chats.length > 0) {
      this.selectChat(this.chats[0]);
    }
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.messages = this.chatService.getMessages(chat.id);
    this.isChatSelected = true; 
    console.log(this.isChatSelected);

  }

  setClass() {
    this.isChatSelect = true; 
  }
}