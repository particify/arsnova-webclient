import { inject } from '@angular/core';
import {
  ApolloLink,
  CombinedGraphQLErrors,
  InMemoryCache,
  ServerError,
} from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { environment } from '@environments/environment';
import { TranslocoService } from '@jsverse/transloco';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from './core/services/util/global-storage.service';

const TOKEN_TIMEOUT = 1000;
const TOKEN_INTERVAL = 200;

function errorLink(
  notificationService: NotificationService,
  translationService: TranslocoService
) {
  function showUnknownError() {
    notificationService.showAdvanced(
      translationService.translate('errors.something-went-wrong'),
      AdvancedSnackBarTypes.FAILED
    );
  }
  return new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
      console.group('GraphQL error(s)');
      error.errors.forEach((e) => {
        console.error(`[/${(e.path ?? []).join('/')}] ${e.message}`);
        if (!environment.production) {
          console.dir(e);
        }
      });
      console.groupEnd();
      forward(operation);
    } else if (ServerError.is(error)) {
      console.log(`Server error: ${error.message}`);
      showUnknownError();
    } else if (error) {
      console.log(`Other error: ${error.message}`);
      showUnknownError();
    }
  });
}

function waitForAccessToken(
  globalStorageService: GlobalStorageService
): Promise<string | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const token = globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        resolve(token);
        return;
      }
      if (Date.now() - start >= TOKEN_TIMEOUT) {
        resolve(null);
        return;
      }
      setTimeout(check, TOKEN_INTERVAL);
    };
    check();
  });
}

export const apolloProvider = provideApollo(() => {
  const globalStorageService = inject(GlobalStorageService);
  const httpLink = inject(HttpLink);
  const ws = new GraphQLWsLink(
    createClient({
      url: '/api/graphql/ws',
      on: {
        connected: () => console.log('GraphQLWsLink connected'),
        closed: () => console.log('GraphQLWsLink closed'),
      },
      connectionParams: async () => {
        const token = await waitForAccessToken(globalStorageService);
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    })
  );
  const notificationService = inject(NotificationService);
  const translationService = inject(TranslocoService);
  return {
    link: ApolloLink.from([
      errorLink(notificationService, translationService),
      ApolloLink.split(
        ({ operationType }) => {
          return operationType === OperationTypeNode.SUBSCRIPTION;
        },
        ws,
        httpLink.create({ uri: '/api/graphql' })
      ),
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            users: relayStylePagination(),
            rooms: relayStylePagination(),
            roomMemberships: relayStylePagination(),
            qnas: relayStylePagination(),
            qnaPostsByQnaId: relayStylePagination(),
            questionnaires: relayStylePagination(),
            questionnaireContents: relayStylePagination(),
          },
        },
        RoomMember: {
          keyFields: ['user', ['id']],
        },
      },
    }),
    devtools: {
      enabled: true,
    },
  };
});
