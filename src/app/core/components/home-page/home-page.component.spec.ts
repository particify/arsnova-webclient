import { ComponentFixture } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { Component, Input } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ApiConfig } from '@app/core/models/api-config';
import { configureTestModule } from '@testing/test.setup';
@Component({
  selector: 'lib-extension-point',
  template: '<svg>Particify</svg>',
})
class LibExtensionPointStubComponent {
  @Input({ required: true }) extensionId!: string;
}

xdescribe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  let dialogService: DialogService;

  let loader: HarnessLoader;

  beforeEach(async () => {
    const testBed = configureTestModule([
      getTranslocoModule(),
      HomePageComponent,
      LibExtensionPointStubComponent,
    ]);
    fixture = testBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    component.apiConfig = new ApiConfig([], {}, {});
    dialogService = testBed.inject(DialogService);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display particify logo or arsnova header', () => {
    console.log(fixture.nativeElement);
    const logo = fixture.nativeElement.querySelector('svg');
    const header = fixture.nativeElement.querySelector('h1');
    console.log(logo);
    console.log(header);
    const expected = (!!logo && !header) || (!!header && !logo);
    expect(expected).toBe(true);
  });

  it('should open room creation dialog after clicking button', async () => {
    const newRoomButton = await loader.getHarness<MatButtonHarness>(
      MatButtonHarness.with({ selector: '#new-room-button' })
    );
    expect(dialogService.openRoomCreateDialog).not.toHaveBeenCalled();
    await newRoomButton.click();
    expect(dialogService.openRoomCreateDialog).toHaveBeenCalled();
  });
});
