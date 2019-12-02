import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupCreationComponent } from './content-group-creation.component';

describe('ContentGroupCreationComponent', () => {
  let component: ContentGroupCreationComponent;
  let fixture: ComponentFixture<ContentGroupCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentGroupCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentGroupCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
