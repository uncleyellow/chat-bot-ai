import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getChatbotResponse(message: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/chat`, { message });
    }

    getChatHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history`);
    }
}
