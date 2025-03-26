import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from 'app/shared/chat.service';

interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
}

@Component({
    selector: 'chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
    messages: ChatMessage[] = [];
    userInput: string = '';
    isLoading: boolean = false;

    @ViewChild('chatBox') chatBox!: ElementRef;

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.loadChatHistory();
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    sendMessage(): void {
        if (!this.userInput.trim()) return;

        const userMessage: ChatMessage = { text: this.userInput, sender: 'user' };
        this.messages.push(userMessage);
        this.isLoading = true; // Hiển thị trạng thái loading
        
        this.chatService.getChatbotResponse(this.userInput).subscribe(
            response => {
                const botMessage: ChatMessage = { text: response.reply, sender: 'bot' };
                this.messages.push(botMessage);
                this.isLoading = false;
            },
            error => {
                this.messages.push({ text: '⚠️ Chatbot gặp lỗi, vui lòng thử lại!', sender: 'bot' });
                this.isLoading = false;
            }
        );

        this.userInput = '';
    }

    handleKeypress(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    loadChatHistory(): void {
        this.chatService.getChatHistory().subscribe(
            history => {
                this.messages = history.map(chat => ({
                    text: chat.bot_reply || chat.user_message,
                    sender: chat.bot_reply ? 'bot' : 'user'
                }));
            },
            error => console.error('⚠️ Lỗi tải lịch sử chat:', error)
        );
    }

    scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatBox) {
                this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
            }
        }, 100);
    }
}
