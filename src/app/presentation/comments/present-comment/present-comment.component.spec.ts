import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { PresentCommentComponent } from './present-comment.component';
import { PresentationService } from '@app/core/services/util/presentation.service';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PresentCommentComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotKeyService,
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
