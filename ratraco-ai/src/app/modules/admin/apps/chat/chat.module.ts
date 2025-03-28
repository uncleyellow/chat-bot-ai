import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ChatComponent } from './chat.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

const chatRoutes: Route[] = [
    {
        path     : '',
        component: ChatComponent
    }
];

@NgModule({
    declarations: [
        ChatComponent
    ],
    imports     : [
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule.forChild(chatRoutes),
        MatIconModule
    ]
})
export class ChatModule
{
}
