import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListHintComponent } from './comment-list-hint.component';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('CommentListHintComponent', () => {
  let component: CommentListHintComponent;
  let fixture: ComponentFixture<CommentListHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommentListHintComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
