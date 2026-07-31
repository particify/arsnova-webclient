import { ApolloCache } from '@apollo/client';

/**
 * Removes the cached stats of a round from every `*RoundStatsByRoundId`
 * query, whatever the content format, so watching results refetch them.
 */
export function evictRoundStats(cache: ApolloCache, roundId: string) {
  cache.modify({
    id: 'ROOT_QUERY',
    fields: (value, { fieldName, storeFieldName, DELETE }) =>
      fieldName.endsWith('RoundStatsByRoundId') &&
      storeFieldName.includes(`"${roundId}"`)
        ? DELETE
        : value,
  });
}
