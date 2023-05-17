import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDividerComponent } from './menu-divider.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';

describe('MenuDividerComponent', () => {
  let component: MenuDividerComponent;
  let fixture: ComponentFixture<MenuDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuDividerComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
