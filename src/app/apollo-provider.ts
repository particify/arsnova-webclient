import { inject } from '@angular/core';
import { from, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const errorLink = onError(({ operation, response, forward }) => {
  if (response) {
    console.error('GQL data error');
    forward(operation);
  } else {
    console.error('GQL network error');
  }
});

export const apolloProvider = provideApollo(() => {
  const httpLink = inject(HttpLink);
  return {
    link: from([errorLink, httpLink.create({ uri: '/api/graphql' })]),
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
      },
    }),
    devtools: {
      enabled: true,
    },
  };
});
