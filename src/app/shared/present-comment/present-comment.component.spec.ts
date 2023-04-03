import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EventService } from '@app/core/services/util/event.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { JsonTranslationLoader, MockEventService } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PresentCommentComponent } from './present-comment.component';

describe('PresentCommentComponent', () => {
  let component: PresentCommentComponent;
  let fixture: ComponentFixture<PresentCommentComponent>;

  const mockHotKeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PresentCommentComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: EventService,
          useClass: MockEventService,
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
