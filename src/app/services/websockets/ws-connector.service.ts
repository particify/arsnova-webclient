import { Injectable } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { AuthenticationService } from '../http/authentication.service';
import { ARSRxStompConfig } from '../../rx-stomp.config';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import {
  ClientAuthentication,
  TransientClientAuthentication,
} from '../../models/client-authentication';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WsConnectorService {
  private client: RxStomp;

  private headers = {
    'content-type': 'application/json',
    'ars-user-id': '',
  };

  constructor(private authService: AuthenticationService) {
    this.client = new RxStomp();
    authService
      .getAuthenticationChanges()
      .pipe(filter((auth) => !(auth instanceof TransientClientAuthentication)))
      .subscribe(async (auth: ClientAuthentication) => {
        if (this.client.connected) {
          await this.client.deactivate();
        }

        if (auth && auth.userId) {
          const copiedConf = ARSRxStompConfig;
          copiedConf.connectHeaders.token = auth.token;
          this.headers = {
            'content-type': 'application/json',
            'ars-user-id': '' + auth.userId,
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
        headers: this.headers,
      });
    }
  }

  public getWatcher(topic: string): Observable<IMessage> {
    if (this.client.connected) {
      return this.client.watch(topic, this.headers);
    }
  }

  public getConnectionState(): Observable<RxStompState> {
    return this.client.connectionState$;
  }
}
