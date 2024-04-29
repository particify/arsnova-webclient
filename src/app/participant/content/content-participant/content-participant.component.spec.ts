import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentParticipantComponent } from './content-participant.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentType } from '@app/core/models/content-type.enum';
import { Content } from '@app/core/models/content';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { of } from 'rxjs';
import { Room } from '@app/core/models/room';

describe('ContentParticipantComponent', () => {
  let component: ContentParticipantComponent;
  let fixture: ComponentFixture<ContentParticipantComponent>;

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = of([{ seriesName: 'SERIES' }]);
  snapshot.data = {
    room: new Room(),
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentParticipantComponent, A11yRenderedBodyPipe],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },

        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentParticipantComponent);
    component = fixture.componentInstance;
    component.content = new Content(
      '1234',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {}
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
