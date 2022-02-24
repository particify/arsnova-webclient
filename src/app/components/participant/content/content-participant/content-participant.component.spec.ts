import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentParticipantComponent } from './content-participant.component';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { Content } from '@arsnova/app/models/content';

describe('ContentParticipantComponent', () => {
  let component: ContentParticipantComponent;
  let fixture: ComponentFixture<ContentParticipantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentParticipantComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentParticipantComponent);
    component = fixture.componentInstance;
    component.content = new Content('1234', '1', '1234', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), false));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
