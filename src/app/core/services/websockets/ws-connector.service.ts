import { Injectable, inject } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ARSRxStompConfig } from '@app/rx-stomp.config';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import { ClientAuthentication } from '@app/core/models/client-authentication';

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
    authService
      .getAuthenticationChanges()
      .subscribe(async (auth: ClientAuthentication) => {
        await this.client.deactivate();

        if (auth && auth.userId) {
          const copiedConf = ARSRxStompConfig;
          if (copiedConf?.connectHeaders) {
            copiedConf.connectHeaders.token = auth.token;
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
