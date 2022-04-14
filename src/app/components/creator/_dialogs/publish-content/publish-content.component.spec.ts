import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PublishContentComponent } from './publish-content.component';
import { JsonTranslationLoader, MockMatDialogRef } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';

describe('PublishContentComponent', () => {
  let component: PublishContentComponent;
  let fixture: ComponentFixture<PublishContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PublishContentComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
