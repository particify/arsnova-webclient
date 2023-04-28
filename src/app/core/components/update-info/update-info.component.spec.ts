import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UpdateInfoComponent } from './update-info.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UpdateInfoComponent', () => {
  let component: UpdateInfoComponent;
  let fixture: ComponentFixture<UpdateInfoComponent>;

  const mockApiConfigService = jasmine.createSpyObj(['getApiConfig$']);
  const config = {
    ui: {
      links: {
        news: {
          url: 'news',
        },
      },
    },
  };
  mockApiConfigService.getApiConfig$.and.returnValue(of(config));

  const mockMatDialogData = {
    updateAvailable: false,
    afterUpdate: true,
    versions: [],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateInfoComponent],
      imports: [
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
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
