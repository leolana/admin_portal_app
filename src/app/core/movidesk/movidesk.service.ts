import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare const window: any;
declare const movideskLogin: any;

@Injectable({
    providedIn: 'root'
})
export class MovideskService {
    constructor(
        private http: HttpClient
    ) { }

    createChatbox() {
        this.removeExistingChatbox();

        this.http.get<any>(environment.apiUrl + '/movidesk-chatbox-token').subscribe(result => {
            if (!result || !result.integrado) {
                return;
            }

            window.mdChatClient = environment.movideskChatboxToken;

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://chat.movidesk.com/Scripts/chat-widget.min.js';

            document.body.appendChild(script);

            setTimeout(() => {
                const loginObject = {
                    name: result.nome,
                    email: result.email,
                    codeReference: result.uuidIntegracao,
                    stayConnected: false,
                    startChat: false
                };

                movideskLogin(loginObject);
            }, 1000);
        });
    }

    removeExistingChatbox() {
        const movideskChat = document.getElementById('md-chat-widget');
        window.mdChatClient = null;

        if (movideskChat) {
            movideskChat.remove();
        }
    }

    forceIntegration(participanteId: number) {
        const url = environment.apiUrl + '/movidesk-integration';
        return this.http.post<any>(url, { participanteId });
    }
}
