import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentType } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
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
});
