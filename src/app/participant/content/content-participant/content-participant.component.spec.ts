import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentParticipantComponent } from './content-participant.component';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentState } from '@app/core/models/content-state';
import { Content } from '@app/core/models/content';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContentParticipantComponent', () => {
  let component: ContentParticipantComponent;
  let fixture: ComponentFixture<ContentParticipantComponent>;

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentParticipantComponent, A11yRenderedBodyPipe],
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
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentParticipantComponent);
    component = fixture.componentInstance;
    component.content = new Content(
      '1234',
      '1',
      '1234',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {},
      new ContentState(1, new Date(), false)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
