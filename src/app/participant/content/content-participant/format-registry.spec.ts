import { ContentType } from '@gql/generated/graphql';
import { FORMAT_REGISTRY } from './format-registry';

describe('FORMAT_REGISTRY', () => {
  const formatsWithoutComponent = [ContentType.Flashcard, ContentType.Slide];

  it('has no participant component for Flashcard and Slide', () => {
    formatsWithoutComponent.forEach((format) => {
      expect(FORMAT_REGISTRY[format].component)
        .withContext(`${format} unexpectedly has a participant component`)
        .toBeUndefined();
    });
  });

  it('has a participant component for every other format', () => {
    Object.values(ContentType)
      .filter((format) => !formatsWithoutComponent.includes(format))
      .forEach((format) => {
        expect(FORMAT_REGISTRY[format].component)
          .withContext(`${format} is missing a participant component`)
          .toBeDefined();
      });
  });
});
