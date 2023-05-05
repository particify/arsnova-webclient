import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListAddButtonComponent } from './comment-list-add-button.component';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('CommentListAddButtonComponent', () => {
  let component: CommentListAddButtonComponent;
  let fixture: ComponentFixture<CommentListAddButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommentListAddButtonComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListAddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
