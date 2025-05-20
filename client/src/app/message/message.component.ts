// src/app/message/message.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChatService, Chat, Message } from '../services/chat.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import axios from 'axios';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, NgIf, NgFor],
})
export class MessageComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  isChatSelect: boolean = false;
  messageInput: string = '';
  private messageSubscription: Subscription | null = null;
  private chatsSubscription: Subscription | null = null;
  private userId: string | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      const userData = await this.authService.getMe();
      
      this.userId = userData.user._id;
      this.chatsSubscription = this.chatService.getChatsObservable().subscribe((chats) => {
        this.chats = chats;
        this.route.queryParams.subscribe(async (params) => {
          const recipientId = params['recipientId'];
          if (recipientId && !this.selectedChat) {
            const chat = this.chats.find((c) => c.recipientId === recipientId);
            if (chat) {
              await this.selectChat(chat);
            } else {
              try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/users/${recipientId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const user = response.data.user;
                const newChat: Chat = {
                  id: user._id,
                  recipientId: user._id,
                  sellerType: user.name ? 'Частное лицо' : 'Неизвестно',
                  lastMessage: '',
                  lastMessageTime: '',
                  avatar: user.avatar || 'https://example.com/default-avatar.png',
                  carName: 'Unknown Car',
                  price: '0 ₽',
                };
                this.chats.push(newChat);
                await this.selectChat(newChat);
              } catch (error) {
                console.error('Ошибка получения данных получателя:', error);
              }
            }
          } else if (this.chats.length > 0 && !this.selectedChat) {
            await this.selectChat(this.chats[0]);
          }
        });
      });
      this.messageSubscription = this.chatService.getMessagesObservable().subscribe((message) => {
        if (
          this.selectedChat &&
          (message.sender === this.selectedChat.recipientId || message.recipient === this.selectedChat.recipientId)
        ) {
          this.messages.push(message);
        }
      });
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.chatsSubscription?.unsubscribe();
    this.chatService.disconnectWebSocket();
  }

  async selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.isChatSelect = true;
    try {
      this.messages = await this.chatService.getMessages(chat.recipientId);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  }

  async sendMessage() {
    if (!this.messageInput.trim() || !this.selectedChat) return;
    try {
      await this.chatService.sendMessage(this.selectedChat.recipientId, this.messageInput);
      this.messageInput = '';
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  }

  setClass() {
    this.isChatSelect = true;
  }

  getMessageClass(message: Message): string {
    return message.sender === this.userId ? 'chat__sms' : 'interlocutor';
  }
}