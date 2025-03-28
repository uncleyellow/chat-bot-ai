import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private API_URL = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    // 🧠 Gửi tin nhắn cùng user_id
    getChatbotResponse(userId: number, message: string): Observable<any> {
        return this.http.post(`${this.API_URL}/chat`, { user_id: userId, message });
    }

    // 📜 Lấy lịch sử chat theo user_id
    getChatHistory(userId: number): Observable<any> {
        return this.http.get(`${this.API_URL}/history/${userId}`);
    }
}
