import { Component, OnInit } from '@angular/core';
import { ChatService } from 'app/shared/chat.service';

@Component({
    selector: 'chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit{
    messages: { text: string, sender: string }[] = [];
    userInput: string = '';

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.loadChatHistory();
    }

    sendMessage() {
        if (!this.userInput.trim()) return;

        const userMessage = { text: this.userInput, sender: 'user' };
        this.messages.push(userMessage);

        this.chatService.getChatbotResponse(this.userInput).subscribe(response => {
            const botMessage = { text: response.reply, sender: 'bot' };
            this.messages.push(botMessage);
        });

        this.userInput = '';
    }

    handleKeypress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    loadChatHistory() {
        this.chatService.getChatHistory().subscribe(history => {
            this.messages = history;
        });
    }
}
