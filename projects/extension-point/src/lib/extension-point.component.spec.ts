import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExtensionPointComponent } from './extension-point.component';
import { ExtensionFactory } from './extension-factory';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { MockFeatureFlagService } from '@testing/test-helpers';

describe('ExtensionPointComponent', () => {
  let component: ExtensionPointComponent;
  let fixture: ComponentFixture<ExtensionPointComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExtensionPointComponent],
      providers: [
        ExtensionFactory,
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
