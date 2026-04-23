import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentType } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentChoiceParticipantComponent } from './content-choice-participant.component';

describe('ContentChoiceParticipantComponent', () => {
  let fixture: ComponentFixture<ContentChoiceParticipantComponent>;

  it('keeps the rendered label of each option', () => {
    TestBed.overrideComponent(ContentChoiceParticipantComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ContentChoiceParticipantComponent],
      [
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('contentFormatData', {
      format: ContentType.Choice,
      options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.answerOptions()[0].answerOption).toEqual({
      label: '**A**',
      renderedLabel: '<p><b>A</b></p>',
    });
  });
});
