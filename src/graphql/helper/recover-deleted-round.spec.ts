import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  InMemoryCache,
  gql,
} from '@apollo/client';
import { QuestionnaireContentByIdDocument } from '@gql/generated/graphql';
import { Subject, of } from 'rxjs';
import {
  recoverFromDeletedRound,
  recoverOnRoundNotFound,
} from './recover-deleted-round';

const ROUNDS = gql`
  query Rounds($contentId: UUID!) {
    questionnaireRoundsByContentId(contentId: $contentId) {
      id
    }
  }
`;

function notFound() {
  return new CombinedGraphQLErrors({
    errors: [
      {
        message: 'Round not found',
        extensions: { classification: 'NOT_FOUND' },
      },
    ],
  });
}

describe('recoverOnRoundNotFound', () => {
  let client: ApolloClient;
  let operations: string[];

  beforeEach(() => {
    operations = [];
    client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink((operation) => {
        operations.push(operation.operationName!);
        return of({
          data:
            operation.operationName === 'Rounds'
              ? { questionnaireRoundsByContentId: [] }
              : {
                  questionnaireContentById: {
                    __typename: 'Content',
                    id: 'c-1',
                  },
                },
        }) as never;
      }),
    });
    client.cache.writeQuery({
      query: ROUNDS,
      variables: { contentId: 'c-1' },
      data: {
        questionnaireRoundsByContentId: [{ __typename: 'Round', id: 'r-1' }],
      },
    });
  });

  function push(result: unknown) {
    const results$ = new Subject<unknown>();
    const passed: unknown[] = [];
    results$
      .pipe(recoverOnRoundNotFound(client))
      .subscribe((r) => passed.push(r));
    results$.next(result);
    return passed;
  }

  function cachedRounds() {
    return client.cache.readQuery({
      query: ROUNDS,
      variables: { contentId: 'c-1' },
    });
  }

  it('forgets the rounds once a round is not found', () => {
    push({ data: undefined, error: notFound() });

    expect(cachedRounds()).toBeNull();
  });

  it('passes the result on', () => {
    const result = { data: undefined, error: notFound() };

    expect(push(result)).toEqual([result]);
  });

  it('keeps the rounds on other errors', () => {
    push({
      data: undefined,
      error: new CombinedGraphQLErrors({
        errors: [
          { message: 'Forbidden', extensions: { classification: 'FORBIDDEN' } },
        ],
      }),
    });

    expect(cachedRounds()).not.toBeNull();
  });

  it('keeps the rounds on results', () => {
    push({ data: { stats: {} } });

    expect(cachedRounds()).not.toBeNull();
  });

  it('reloads the watched contents, which reference the new rounds', async () => {
    const watched = client
      .watchQuery({
        query: QuestionnaireContentByIdDocument,
        variables: { id: 'c-1' },
      })
      .subscribe(() => {});
    await new Promise((resolve) => setTimeout(resolve));
    operations = [];

    await recoverFromDeletedRound(client);

    expect(operations).toEqual(['QuestionnaireContentById']);
    watched.unsubscribe();
  });

  it('recovers once for errors arriving together', async () => {
    const watched = client
      .watchQuery({
        query: QuestionnaireContentByIdDocument,
        variables: { id: 'c-1' },
      })
      .subscribe(() => {});
    await new Promise((resolve) => setTimeout(resolve));
    operations = [];

    await Promise.all([
      recoverFromDeletedRound(client),
      recoverFromDeletedRound(client),
    ]);

    expect(operations).toEqual(['QuestionnaireContentById']);
    watched.unsubscribe();
  });
});
