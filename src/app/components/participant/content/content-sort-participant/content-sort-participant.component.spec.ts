import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSortParticipantComponent } from './content-sort-participant.component';

describe('ContentSortParticipantComponent', () => {
  let component: ContentSortParticipantComponent;
  let fixture: ComponentFixture<ContentSortParticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentSortParticipantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSortParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
