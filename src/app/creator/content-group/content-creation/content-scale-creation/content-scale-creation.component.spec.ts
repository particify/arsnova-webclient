import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentScaleCreationComponent } from './content-scale-creation.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';

@Injectable()
class MockLikertScaleService {
  getOptionLabels() {}
}

describe('ContentScaleCreationComponent', () => {
  let component: ContentScaleCreationComponent;
  let fixture: ComponentFixture<ContentScaleCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentScaleCreationComponent],
      providers: [
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentScaleCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
