import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { AuthenticationService } from '../http/authentication.service';
import { ARSRxStompConfig } from '../../rx-stomp.config';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import { ClientAuthentication } from 'app/models/client-authentication';

@Injectable({
  providedIn: 'root'
})
export class WsConnectorService {
  private client: RxStomp;

  private headers = {
    'content-type': 'application/json',
    'ars-user-id': ''
  };

  constructor(
    private authService: AuthenticationService
  ) {
    this.client = new RxStomp();
    authService.getAuthenticationChanges().subscribe((auth: ClientAuthentication) => {
      if (this.client.connected) {
        this.client.deactivate();
      }

      if (auth && auth.userId) {
        const copiedConf = ARSRxStompConfig;
        copiedConf.connectHeaders.token = auth.token;
        this.headers = {
          'content-type': 'application/json',
          'ars-user-id': '' + auth.userId
        };
        this.client.configure(copiedConf);
        this.client.activate();
      }
    });
  }

  public send(destination: string, body: string): void {
    if (this.client.connected) {
      this.client.publish({
        destination: destination,
        body: body,
        headers: this.headers
      });
    }
  }

  public getWatcher(topic: string): Observable<IMessage> {
    if (this.client.connected) {
      return this.client.watch(topic, this.headers);
    }
  }
}
