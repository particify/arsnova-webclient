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

export const apolloProvider = provideApollo(() => {
  const httpLink = inject(HttpLink);
  const notificationService = inject(NotificationService);
  const translationService = inject(TranslocoService);
  return {
    link: ApolloLink.from([
      errorLink(notificationService, translationService),
      httpLink.create({ uri: '/api/graphql' }),
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            users: relayStylePagination(),
            rooms: relayStylePagination(),
            roomMemberships: relayStylePagination(),
            qnas: relayStylePagination(),
            qnaPosts: relayStylePagination(),
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
