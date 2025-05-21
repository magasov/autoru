import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChatService, Chat, Message } from '../services/chat.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; 
import axios from 'axios';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, NgIf, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class MessageComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  isChatSelect: boolean = false;
  messageInput: string = '';
  showEmojiPicker: boolean = false;
  placeholders: string[] = [
    'Здравствуйте',
    'Ещё продается?',
    'Обмен интересует?',
    'Торг возможен?',
    'Где можно посмотреть?',
    'Какая причина продажи?',
  ];
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
                  lastSeen: user.lastSeen || '',
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

  getLastSeenText(): string {
    if (!this.selectedChat?.lastSeen) {
      return 'время неизвестно';
    }

    const lastSeenDate = new Date(this.selectedChat.lastSeen);
    if (isNaN(lastSeenDate.getTime())) {
      return 'время неизвестно';
    }

    const now = new Date();
    const lastSeenDay = lastSeenDate.getDate();
    const lastSeenMonth = lastSeenDate.getMonth();
    const lastSeenYear = lastSeenDate.getFullYear();

    const nowDay = now.getDate();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    const isToday = lastSeenDay === nowDay && lastSeenMonth === nowMonth && lastSeenYear === nowYear;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      lastSeenDay === yesterday.getDate() &&
      lastSeenMonth === yesterday.getMonth() &&
      lastSeenYear === yesterday.getFullYear();

    const hours = lastSeenDate.getHours().toString().padStart(2, '0');
    const minutes = lastSeenDate.getMinutes().toString().padStart(2, '0');

    if ((now.getTime() - lastSeenDate.getTime()) < 60000) {
      return 'в сети';
    }

    if (isToday) {
      return `был(а) в сети сегодня в ${hours}:${minutes}`;
    } else if (isYesterday) {
      return `был(а) в сети вчера в ${hours}:${minutes}`;
    } else {
      const dateStr = lastSeenDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      return `был(а) в сети ${dateStr} в ${hours}:${minutes}`;
    }
  }

  async selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.showEmojiPicker = false;
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
      this.showEmojiPicker = false;
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

  insertPlaceholder(placeholder: string) {
    this.messageInput = placeholder;
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.messageInput += event.detail.unicode;
  }

  onInputChange() {
  }
}