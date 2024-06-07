import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownTimerComponent } from './countdown-timer.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('CountdownTimerComponent', () => {
  let component: CountdownTimerComponent;
  let fixture: ComponentFixture<CountdownTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownTimerComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownTimerComponent);
    component = fixture.componentInstance;
    component.endDate = new Date();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
