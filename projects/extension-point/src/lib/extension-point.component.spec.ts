import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExtensionPointComponent } from './extension-point.component';
import { ExtensionFactory } from './extension-factory';

describe('ExtensionPointComponent', () => {
  let component: ExtensionPointComponent;
  let fixture: ComponentFixture<ExtensionPointComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionPointComponent ],
      providers: [ ExtensionFactory ]
    })
    .compileComponents();
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
