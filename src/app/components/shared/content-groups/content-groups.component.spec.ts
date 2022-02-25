import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentGroupsComponent } from './content-groups.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { UserRole } from '@arsnova/app/models/user-roles.enum';

describe('ContentGroupsComponent', () => {
  let component: ContentGroupsComponent;
  let fixture: ComponentFixture<ContentGroupsComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    shortId: '12345678'
  }

  const data = {
    viewRole: UserRole.PARTICIPANT
  }
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentGroupsComponent
       ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
