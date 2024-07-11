import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupInfoComponent } from './content-group-info.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentGroup } from '@app/core/models/content-group';

describe('ContentGroupInfoComponent', () => {
  let component: ContentGroupInfoComponent;
  let fixture: ComponentFixture<ContentGroupInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentGroupInfoComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentGroupInfoComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
