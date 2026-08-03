import { expect, Page, WebSocketRoute } from '@playwright/test';

export class MockGraphqlWs {
  private route?: WebSocketRoute;
  private readonly subscriptionIds = new Map<string, string>();

  constructor(private readonly page: Page) {}

  async install() {
    await this.page.routeWebSocket('**/graphql/ws', (ws) => {
      this.route = ws;
      ws.onMessage((message) => {
        const frame = JSON.parse(String(message));
        switch (frame.type) {
          case 'connection_init':
            ws.send(JSON.stringify({ type: 'connection_ack' }));
            break;
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          case 'subscribe':
            this.subscriptionIds.set(frame.payload.operationName, frame.id);
            break;
          case 'complete':
            this.subscriptionIds.forEach((id, operationName) => {
              if (id === frame.id) {
                this.subscriptionIds.delete(operationName);
              }
            });
            break;
        }
      });
    });
  }

  async push(operationName: string, data: unknown) {
    await expect
      .poll(() => this.subscriptionIds.has(operationName), {
        message: `client did not subscribe to ${operationName}`,
      })
      .toBe(true);
    this.route?.send(
      JSON.stringify({
        id: this.subscriptionIds.get(operationName),
        type: 'next',
        payload: { data },
      })
    );
  }
}
