import { InMemoryCache, gql } from '@apollo/client';
import { evictRoundStats } from './evict-round-stats';

const CHOICE = gql`
  query Choice($roundId: UUID!) {
    questionnaireChoiceRoundStatsByRoundId(roundId: $roundId) {
      selectionCounts
    }
  }
`;
const WORDCLOUD = gql`
  query Wordcloud($roundId: UUID!) {
    questionnaireWordcloudRoundStatsByRoundId(roundId: $roundId) {
      words
    }
  }
`;
const OTHER = gql`
  query Other($roundId: UUID!) {
    questionnaireAnswerByRoundId(roundId: $roundId) {
      id
    }
  }
`;

describe('evictRoundStats', () => {
  let cache: InMemoryCache;

  function write(query: typeof CHOICE, roundId: string, data: object) {
    cache.writeQuery({ query, variables: { roundId }, data });
  }

  function read(query: typeof CHOICE, roundId: string) {
    return cache.readQuery({ query, variables: { roundId } });
  }

  beforeEach(() => {
    cache = new InMemoryCache();
    for (const roundId of ['round-1', 'round-2']) {
      write(CHOICE, roundId, {
        questionnaireChoiceRoundStatsByRoundId: {
          __typename: 'ChoiceContentRoundStats',
          selectionCounts: [1],
        },
      });
    }
    write(WORDCLOUD, 'round-1', {
      questionnaireWordcloudRoundStatsByRoundId: {
        __typename: 'WordcloudContentRoundStats',
        words: ['a'],
      },
    });
    write(OTHER, 'round-1', {
      questionnaireAnswerByRoundId: { __typename: 'Answer', id: 'answer-1' },
    });
  });

  it('evicts the stats of the round for every format', () => {
    evictRoundStats(cache, 'round-1');

    expect(read(CHOICE, 'round-1')).toBeNull();
    expect(read(WORDCLOUD, 'round-1')).toBeNull();
  });

  it('keeps the stats of other rounds and unrelated queries', () => {
    evictRoundStats(cache, 'round-1');

    expect(read(CHOICE, 'round-2')).not.toBeNull();
    expect(read(OTHER, 'round-1')).not.toBeNull();
  });
});
