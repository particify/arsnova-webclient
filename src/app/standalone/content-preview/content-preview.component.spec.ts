import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentFormatData, ContentType } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { TranslocoService } from '@jsverse/transloco';
import {
  getTranslocoModule,
  getTranslocoModuleWithTranslations,
} from '@testing/transloco-testing.module';
import { ContentPreviewComponent } from './content-preview.component';

describe('ContentPreviewComponent', () => {
  let fixture: ComponentFixture<ContentPreviewComponent>;

  it('keeps the rendered label of each choice option', () => {
    TestBed.overrideComponent(ContentPreviewComponent, {
      set: { template: '' },
    });
    configureTestModule([
      getTranslocoModule(),
      ContentPreviewComponent,
    ]).compileComponents();
    fixture = TestBed.createComponent(ContentPreviewComponent);
    fixture.componentRef.setInput('body', 'body');
    fixture.componentRef.setInput('contentFormatData', {
      __typename: 'ChoiceContentFormatData',
      format: ContentType.Choice,
      options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }],
    });
    fixture.detectChanges();

    const inputs = fixture.componentInstance.componentInputs() as {
      answerOptions: SelectableAnswer[];
    };
    expect(inputs.answerOptions[0].answerOption).toEqual({
      label: '**A**',
      renderedLabel: '<p><b>A</b></p>',
    });
  });

  describe('binary', () => {
    function inputsFor(
      correctAnswer?: boolean | null,
      translocoModule = getTranslocoModule()
    ) {
      TestBed.overrideComponent(ContentPreviewComponent, {
        set: { template: '' },
      });
      configureTestModule([
        translocoModule,
        ContentPreviewComponent,
      ]).compileComponents();
      fixture = TestBed.createComponent(ContentPreviewComponent);
      fixture.componentRef.setInput('body', 'body');
      fixture.componentRef.setInput('contentFormatData', {
        __typename: 'BinaryContentFormatData',
        format: ContentType.Binary,
        correctAnswer,
      } as ContentFormatData);
      fixture.detectChanges();
      return fixture.componentInstance.componentInputs() as {
        answerOptions: SelectableAnswer[];
        correctOptionIndexes?: number[];
      };
    }

    it('offers yes before no, both unchecked', () => {
      const inputs = inputsFor(true);
      expect(
        inputs.answerOptions.map((option) => option.answerOption.label)
      ).toEqual(['answer.yes', 'answer.no']);
      expect(inputs.answerOptions.some((option) => option.checked)).toBe(false);
    });

    it('marks yes as correct', () => {
      expect(inputsFor(true).correctOptionIndexes).toEqual([0]);
    });

    it('marks no as correct', () => {
      expect(inputsFor(false).correctOptionIndexes).toEqual([1]);
    });

    it('marks nothing without a correct answer', () => {
      expect(inputsFor(null).correctOptionIndexes).toBeUndefined();
    });

    it('labels the options in the active language and follows a switch', () => {
      const labels = () =>
        (
          fixture.componentInstance.componentInputs() as {
            answerOptions: SelectableAnswer[];
          }
        ).answerOptions.map((option) => option.answerOption.label);
      inputsFor(true, getTranslocoModuleWithTranslations());
      expect(labels()).toEqual(['Yes', 'No']);
      TestBed.inject(TranslocoService).setActiveLang('de');
      expect(labels()).toEqual(['Ja', 'Nein']);
    });
  });
});
