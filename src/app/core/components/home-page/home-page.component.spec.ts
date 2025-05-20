import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { Component, NO_ERRORS_SCHEMA, Input, Renderer2 } from '@angular/core';
import { EventService } from '@app/core/services/util/event.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  MockAnnounceService,
  MockEventService,
  MockGlobalStorageService,
  MockRenderer2,
} from '@testing/test-helpers';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ApiConfig } from '@app/core/models/api-config';
@Component({
  selector: 'lib-extension-point',
  template: '<svg>Particify</svg>',
})
class LibExtensionPointStubComponent {
  @Input({ required: true }) extensionId!: string;
}

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  let dialogService = jasmine.createSpyObj('DialogService', [
    'openRoomCreateDialog',
  ]);

  let logo: HTMLElement;
  let header: HTMLElement;

  let loader: HarnessLoader;
  let newRoomButton: MatButtonHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        HomePageComponent,
        LibExtensionPointStubComponent,
      ],
      providers: [
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    component.apiConfig = new ApiConfig([], {}, {});
    dialogService = TestBed.inject(DialogService);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    logo = fixture.nativeElement.querySelector('svg');
    header = fixture.nativeElement.querySelector('h1');
    newRoomButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#new-room-button' })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display particify logo or arsnova header', () => {
    const expected = (!!logo && !header) || (!!header && !logo);
    expect(expected).toBe(true);
  });

  it('should open room creation dialog after clicking button', async () => {
    expect(dialogService.openRoomCreateDialog).not.toHaveBeenCalled();
    await newRoomButton.click();
    expect(dialogService.openRoomCreateDialog).toHaveBeenCalled();
  });
});
