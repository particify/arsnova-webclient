import { InMemoryCache, gql } from '@apollo/client';
import { evictRoundStats, evictRounds } from './evict-round-stats';

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

describe('evictRounds', () => {
  const ROUNDS = gql`
    query Rounds($contentId: UUID!) {
      questionnaireRoundsByContentId(contentId: $contentId) {
        id
      }
    }
  `;
  const CONTENT = gql`
    query Content($id: UUID!) {
      questionnaireContentById(id: $id) {
        id
        activeRound {
          id
        }
      }
    }
  `;
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache();
    cache.writeQuery({
      query: CONTENT,
      variables: { id: 'c-1' },
      data: {
        questionnaireContentById: {
          __typename: 'Content',
          id: 'c-1',
          activeRound: { __typename: 'Round', id: 'round-1' },
        },
      },
    });
    for (const contentId of ['c-1', 'c-2']) {
      cache.writeQuery({
        query: ROUNDS,
        variables: { contentId },
        data: {
          questionnaireRoundsByContentId: [
            { __typename: 'Round', id: 'round-1' },
            { __typename: 'Round', id: `round-${contentId}` },
          ],
        },
      });
    }
    for (const roundId of ['round-1', 'round-2']) {
      cache.writeQuery({
        query: CHOICE,
        variables: { roundId },
        data: {
          questionnaireChoiceRoundStatsByRoundId: {
            __typename: 'ChoiceContentRoundStats',
            selectionCounts: [1],
          },
        },
      });
    }
    cache.writeQuery({
      query: OTHER,
      variables: { roundId: 'round-1' },
      data: {
        questionnaireAnswerByRoundId: { __typename: 'Answer', id: 'answer-1' },
      },
    });
  });

  it('forgets the rounds of every content', () => {
    evictRounds(cache);

    for (const contentId of ['c-1', 'c-2']) {
      expect(
        cache.readQuery({ query: ROUNDS, variables: { contentId } })
      ).toBeNull();
    }
  });

  it('forgets the stats of every round', () => {
    evictRounds(cache);

    for (const roundId of ['round-1', 'round-2']) {
      expect(
        cache.readQuery({ query: CHOICE, variables: { roundId } })
      ).toBeNull();
    }
  });

  it('keeps the rounds the contents still reference', () => {
    evictRounds(cache);

    expect(
      cache.readQuery({ query: CONTENT, variables: { id: 'c-1' } })
    ).not.toBeNull();
    expect(cache.extract()['Round:round-c-2']).toBeUndefined();
  });

  it('keeps unrelated queries', () => {
    evictRounds(cache);

    expect(
      cache.readQuery({ query: OTHER, variables: { roundId: 'round-1' } })
    ).not.toBeNull();
  });
});
