import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AdminPageHeaderComponent } from './admin-page-header.component';

describe('AdminPageHeaderComponent', () => {
  let component: AdminPageHeaderComponent;
  let fixture: ComponentFixture<AdminPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPageHeaderComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
