import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPresentationMenuComponent } from './content-presentation-menu.component';
import { ContentService } from '@app/core/services/http/content.service';
import { of } from 'rxjs';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { DialogService } from '@app/core/services/util/dialog.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('ContentPresentationMenuComponent', () => {
  let component: ContentPresentationMenuComponent;
  let fixture: ComponentFixture<ContentPresentationMenuComponent>;

  const content = new Content(
    'roomId',
    'subject',
    'body',
    [],
    ContentType.CHOICE
  );

  const contentService = jasmine.createSpyObj(ContentService, [
    'getAnswersDeleted',
    'getRoundStarted',
    'hasFormatRounds',
    'deleteAnswersOfContent',
    'goToEdit',
    'startNewRound',
  ]);
  contentService.getAnswersDeleted.and.returnValue(of('contentId'));
  contentService.getRoundStarted.and.returnValue(of(content));

  const dialogService = jasmine.createSpyObj(DialogService, [
    'openDeleteDialog',
  ]);

  const presentationService = jasmine.createSpyObj(PresentationService, [
    'getMultipleRoundState',
    'getContentState',
    'updateRoundState',
  ]);
  presentationService.getMultipleRoundState.and.returnValue(of(true));
  presentationService.getContentState.and.returnValue(
    of(new ContentPresentationState(PresentationStepPosition.START, 0, content))
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentPresentationMenuComponent,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      providers: [
        { provide: ContentService, useValue: contentService },
        { provide: DialogService, useValue: dialogService },
        { provide: PresentationService, useValue: presentationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPresentationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
