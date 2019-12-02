import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupEditComponent } from './content-group-edit.component';

describe('ContentGroupEditComponent', () => {
  let component: ContentGroupEditComponent;
  let fixture: ComponentFixture<ContentGroupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
