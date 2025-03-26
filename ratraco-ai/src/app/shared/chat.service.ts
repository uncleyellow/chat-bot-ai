import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    /**
     * Gửi tin nhắn đến chatbot và nhận phản hồi
     * @param message Nội dung tin nhắn từ người dùng
     * @returns Observable chứa phản hồi từ chatbot
     */
    getChatbotResponse(message: string): Observable<{ reply: string }> {
        debugger
        return this.http.post<{ reply: string }>(`${this.apiUrl}/chat`, { message })
            .pipe(
                retry(2), // Thử lại 2 lần nếu lỗi
                catchError(this.handleError)
            );
    }

    /**
     * Lấy lịch sử chat từ API
     * @returns Observable chứa danh sách lịch sử chat
     */
    getChatHistory(): Observable<{ id: number; user_message: string; bot_reply: string; created_at: string }[]> {
        return this.http.get<{ id: number; user_message: string; bot_reply: string; created_at: string }[]>(`${this.apiUrl}/history`)
            .pipe(
                retry(2), // Thử lại 2 lần nếu lỗi
                catchError(this.handleError)
            );
    }

    /**
     * Xử lý lỗi từ HTTP request
     * @param error Đối tượng lỗi từ HttpErrorResponse
     * @returns Observable báo lỗi
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!';
        if (error.error instanceof ErrorEvent) {
            // Lỗi phía client
            errorMessage = `Lỗi: ${error.error.message}`;
        } else {
            // Lỗi phía server
            errorMessage = `Lỗi Server (${error.status}): ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
