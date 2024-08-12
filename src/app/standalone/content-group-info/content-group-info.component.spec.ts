import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupInfoComponent } from './content-group-info.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

class MockContentGroupService {
  getTypeIcons() {
    return new Map<GroupType, string>();
  }
}

describe('ContentGroupInfoComponent', () => {
  let component: ContentGroupInfoComponent;
  let fixture: ComponentFixture<ContentGroupInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentGroupInfoComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentGroupInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
