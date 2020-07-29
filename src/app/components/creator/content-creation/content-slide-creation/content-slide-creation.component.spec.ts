import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSlideCreationComponent } from './content-slide-creation.component';

describe('ContentSlideCreationComponent', () => {
  let component: ContentSlideCreationComponent;
  let fixture: ComponentFixture<ContentSlideCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentSlideCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSlideCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
