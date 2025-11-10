import { inject } from '@angular/core';
import {
  ApolloLink,
  CombinedGraphQLErrors,
  InMemoryCache,
  ServerError,
} from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message }) =>
      console.log(`GraphQL error: ${message}`)
    );
    forward(operation);
  } else if (ServerError.is(error)) {
    console.log(`Server error: ${error.message}`);
  } else if (error) {
    console.log(`Other error: ${error.message}`);
  }
});

export const apolloProvider = provideApollo(() => {
  const httpLink = inject(HttpLink);
  return {
    link: ApolloLink.from([
      errorLink,
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
