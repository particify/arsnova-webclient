import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScaleContentFormComponent } from './scale-content-form.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Room } from '@app/core/models/room';
import { ActivatedRouteStub } from '@testing/test-helpers';

@Injectable()
class MockLikertScaleService {
  getOptionLabels() {}
}

describe('ScaleContentFormComponent', () => {
  let component: ScaleContentFormComponent;
  let fixture: ComponentFixture<ScaleContentFormComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleContentFormComponent],
      providers: [
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ScaleContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
