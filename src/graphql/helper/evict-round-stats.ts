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

/** The root fields that cache what is known about the rounds of contents. */
const ROUND_FIELDS = [
  'questionnaireRoundsByContentId',
  'questionnaireBinaryRoundStatsByRoundId',
  'questionnaireChoiceRoundStatsByRoundId',
  'questionnaireNumericRoundStatsByRoundId',
  'questionnairePrioritizationRoundStatsByRoundId',
  'questionnaireScaleRoundStatsByRoundId',
  'questionnaireShortAnswerRoundStatsByRoundId',
  'questionnaireSortRoundStatsByRoundId',
  'questionnaireWordcloudRoundStatsByRoundId',
];

/**
 * Forgets the rounds lists and round stats of every content, so watching
 * views reload them once rounds have been replaced, e.g. by a reset.
 *
 * Rounds themselves stay, as contents still reference them until they are
 * reloaded; the ones no longer reachable are collected.
 */
export function evictRounds(cache: ApolloCache) {
  for (const fieldName of ROUND_FIELDS) {
    cache.evict({ id: 'ROOT_QUERY', fieldName });
  }
  cache.gc();
}
