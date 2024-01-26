import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextOverflowClipComponent } from './text-overflow-clip.component';

describe('TextOverflowClipComponent', () => {
  let component: TextOverflowClipComponent;
  let fixture: ComponentFixture<TextOverflowClipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextOverflowClipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextOverflowClipComponent);
    component = fixture.componentInstance;
    component.text = 'This is a sample text.';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
