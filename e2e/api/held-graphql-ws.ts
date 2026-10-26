import { Page } from '@playwright/test';

/**
 * Passes the GraphQL WebSocket of a page through to the real backend, but can
 * hold back the subscription results the backend pushes. A page that misses a
 * push acts on what it knew before, the way a client does whose update is
 * still on its way.
 */
export class HeldGraphqlWs {
  private holding = false;
  private readonly held: (() => void)[] = [];

  constructor(private readonly page: Page) {}

  /** Has to run before the page opens the socket. */
  async install() {
    await this.page.routeWebSocket('**/graphql/ws', (ws) => {
      const server = ws.connectToServer();
      ws.onMessage((message) => server.send(message));
      server.onMessage((message) => {
        const push = () => ws.send(message);
        if (this.holding && JSON.parse(String(message)).type === 'next') {
          this.held.push(push);
        } else {
          push();
        }
      });
    });
  }

  hold() {
    this.holding = true;
  }

  /** Delivers what was held back, in order, and passes pushes on again. */
  release() {
    this.holding = false;
    this.held.splice(0).forEach((push) => push());
  }
}
