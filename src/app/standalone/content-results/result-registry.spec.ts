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

  const formatsWithoutComponent = [ContentType.Slide];

  it('supports round comparison only for choice-like formats', () => {
    Object.values(ContentType).forEach((format) => {
      expect(!!RESULT_REGISTRY[format].supportsRoundComparison)
        .withContext(
          `${format} had an unexpected supportsRoundComparison value`
        )
        .toBe(formatsSupportingComparison.includes(format));
    });
  });

  it('has a component for every format except those without one yet', () => {
    Object.values(ContentType).forEach((format) => {
      expect(!!RESULT_REGISTRY[format].component)
        .withContext(`${format} had an unexpected component presence`)
        .toBe(!formatsWithoutComponent.includes(format));
    });
  });
});
