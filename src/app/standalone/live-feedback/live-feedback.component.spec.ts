import { ComponentFixture } from '@angular/core/testing';

import { LiveFeedbackComponent } from './live-feedback.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatIconHarness } from '@angular/material/icon/testing';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { By } from '@angular/platform-browser';
import { EventEmitter } from '@angular/core';
import { configureTestModule } from '@testing/test.setup';

describe('LiveFeedbackComponent', () => {
  let component: LiveFeedbackComponent;
  let fixture: ComponentFixture<LiveFeedbackComponent>;

  let loader: HarnessLoader;
  let icon: MatIconHarness;

  beforeEach(async () => {
    fixture = configureTestModule([
      LiveFeedbackComponent,
      getTranslocoModule(),
    ]).createComponent(LiveFeedbackComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    component.dataChanged = new EventEmitter<number[]>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct labels type is feedback', async () => {
    component.type = LiveFeedbackType.FEEDBACK;
    fixture.detectChanges();
    icon = await loader.getHarness(MatIconHarness);
    expect(icon).not.toBeNull('Icon should be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).toBeNull('Answer label should not be displayed');
  });

  it('should display correct labels if type is survey', () => {
    component.type = LiveFeedbackType.SURVEY;
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeNull('Icon should not be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).not.toBeNull('Answer label should be displayed');
  });

  it('should display correct labels if type is survey', () => {
    component.type = LiveFeedbackType.SURVEY;
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeNull('Icon should not be displayed');
    const answerLabel = fixture.debugElement.query(By.css('.answer-label'));
    expect(answerLabel).not.toBeNull('Answer label should be displayed');
  });

  it('should display progress bar', () => {
    const bar = fixture.debugElement.query(By.css('mat-progress-bar'));
    expect(bar).not.toBeNull();
  });
});
