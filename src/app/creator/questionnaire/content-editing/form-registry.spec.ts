import { ContentType } from '@gql/generated/graphql';
import { BinaryContentFormComponent } from './binary-content-form/binary-content-form.component';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { FORM_REGISTRY } from './form-registry';
import { PrioritizationContentFormComponent } from './prioritization-content-form/prioritization-content-form.component';
import { ShortAnswerContentFormComponent } from './short-answer-content-form/short-answer-content-form.component';
import { SortContentFormComponent } from './sort-content-form/sort-content-form.component';

describe('FORM_REGISTRY', () => {
  const formatsUsingTheChoiceForm = [ContentType.Choice];

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

  it('has its own form for the binary format', () => {
    expect(FORM_REGISTRY[ContentType.Binary].component).toBe(
      BinaryContentFormComponent
    );
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
