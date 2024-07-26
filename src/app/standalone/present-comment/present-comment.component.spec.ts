import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { PresentCommentComponent } from './present-comment.component';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Room } from '@app/core/models/room';
import { ActivatedRouteStub } from '@testing/test-helpers';

describe('PresentCommentComponent', () => {
  let component: PresentCommentComponent;
  let fixture: ComponentFixture<PresentCommentComponent>;

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'updateCommentZoom',
  ]);

  const mockHotKeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), PresentCommentComponent],
      providers: [
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotKeyService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
