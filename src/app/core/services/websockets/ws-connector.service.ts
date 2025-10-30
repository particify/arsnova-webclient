import { Injectable, effect, inject } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ARSRxStompConfig } from '@app/rx-stomp.config';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';

const defaultMessageHeaders = {
  'content-type': 'application/json',
};

@Injectable({
  providedIn: 'root',
})
export class WsConnectorService {
  private authService = inject(AuthenticationService);

  private client: RxStomp;

  constructor() {
    const authService = this.authService;

    this.client = new RxStomp();
    effect(async () => {
      await this.client.deactivate();
      const token = authService.accessToken();
      if (token) {
        const copiedConf = ARSRxStompConfig;
        if (copiedConf?.connectHeaders) {
          copiedConf.connectHeaders.token = token;
        }
        this.client.configure(copiedConf);
        this.client.activate();
      }
    });
  }

  public send(destination: string, body: string): void {
    if (this.client.connected()) {
      this.client.publish({
        destination: destination,
        headers: defaultMessageHeaders,
        body: body,
      });
    }
  }

  public getWatcher(topic: string): Observable<IMessage> {
    return this.client.watch(topic);
  }

  public getConnectionState(): Observable<RxStompState> {
    return this.client.connectionState$;
  }
}
