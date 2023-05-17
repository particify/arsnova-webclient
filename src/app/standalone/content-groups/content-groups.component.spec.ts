import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentGroupsComponent } from './content-groups.component';
import { Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockGlobalStorageService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RoutingService } from '@app/core/services/util/routing.service';

describe('ContentGroupsComponent', () => {
  let component: ContentGroupsComponent;
  let fixture: ComponentFixture<ContentGroupsComponent>;

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRoleRoute',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ContentGroupsComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
