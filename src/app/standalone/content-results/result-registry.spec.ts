import { ContentType } from '@gql/generated/graphql';
import { RESULT_REGISTRY } from './result-registry';

describe('RESULT_REGISTRY', () => {
  const formatsSupportingComparison = [
    ContentType.Choice,
    ContentType.Binary,
    ContentType.Numeric,
    ContentType.Scale,
    ContentType.ShortAnswer,
  ];

  it('supports round comparison only for choice-like formats', () => {
    Object.values(ContentType).forEach((format) => {
      expect(!!RESULT_REGISTRY[format].supportsRoundComparison)
        .withContext(
          `${format} had an unexpected supportsRoundComparison value`
        )
        .toBe(formatsSupportingComparison.includes(format));
    });
  });
});
