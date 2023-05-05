import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListFloatingButtonsComponent } from './comment-list-floating-buttons.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';

describe('CommentListFloatingButtonsComponent', () => {
  let component: CommentListFloatingButtonsComponent;
  let fixture: ComponentFixture<CommentListFloatingButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommentListFloatingButtonsComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListFloatingButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
