import { ContentType } from '@gql/generated/graphql';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { FORM_REGISTRY } from './form-registry';
import { PrioritizationContentFormComponent } from './prioritization-content-form/prioritization-content-form.component';
import { ShortAnswerContentFormComponent } from './short-answer-content-form/short-answer-content-form.component';
import { SortContentFormComponent } from './sort-content-form/sort-content-form.component';

describe('FORM_REGISTRY', () => {
  /** Binary is a choice content. */
  const formatsUsingTheChoiceForm = [ContentType.Binary, ContentType.Choice];

  it('has a form component for every format', () => {
    Object.values(ContentType).forEach((format) => {
      expect(FORM_REGISTRY[format].component)
        .withContext(`${format} had no form component`)
        .toBeDefined();
    });
  });

  it('falls back to the choice form only for the choice-like formats', () => {
    Object.values(ContentType).forEach((format) => {
      expect(FORM_REGISTRY[format].component === ChoiceContentFormComponent)
        .withContext(`${format} had an unexpected form component`)
        .toBe(formatsUsingTheChoiceForm.includes(format));
    });
  });

  it('has its own form for the prioritization format', () => {
    expect(FORM_REGISTRY[ContentType.Prioritization].component).toBe(
      PrioritizationContentFormComponent
    );
  });

  it('has its own form for the short answer format', () => {
    expect(FORM_REGISTRY[ContentType.ShortAnswer].component).toBe(
      ShortAnswerContentFormComponent
    );
  });

  it('has its own form for the sort format', () => {
    expect(FORM_REGISTRY[ContentType.Sort].component).toBe(
      SortContentFormComponent
    );
  });
});
