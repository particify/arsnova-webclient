import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWaitingComponent } from './content-waiting.component';

describe('ContentWaitingComponent', () => {
  let component: ContentWaitingComponent;
  let fixture: ComponentFixture<ContentWaitingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentWaitingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentWaitingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
