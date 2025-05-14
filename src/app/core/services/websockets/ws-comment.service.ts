import { Injectable, inject } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class WsCommentService {
  private wsConnector = inject(WsConnectorService);

  getCommentStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${roomId}.comment.stream`);
  }

  getModeratorCommentStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(
      `/topic/${roomId}.comment.moderator.stream`
    );
  }

  getCommentSettingsStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(
      `/topic/${roomId}.comment.settings.stream`
    );
  }
}
