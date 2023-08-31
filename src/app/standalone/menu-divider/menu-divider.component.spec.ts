import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDividerComponent } from './menu-divider.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('MenuDividerComponent', () => {
  let component: MenuDividerComponent;
  let fixture: ComponentFixture<MenuDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDividerComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
