import { CdkStepperModule } from '@angular/cdk/stepper';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { UserSettings } from '@app/core/models/user-settings';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';

@Component({
  selector: 'app-content-stepper',
  standalone: true,
  imports: [
    CoreModule,
    StepperComponent,
    CdkStepperModule,
    ContentResultsComponent,
    ContentStepInfoComponent,
    AttributionsInfoComponent,
  ],
  templateUrl: './content-stepper.component.html',
  styleUrl: './content-stepper.component.scss',
})
export class ContentStepperComponent implements AfterViewInit {
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) settings!: UserSettings;
  @Input({ required: true }) startIndex!: number;
  @Input() attributions: ContentLicenseAttribution[] = [];
  @Input() hideControls = false;
  @Output() indexChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() answerCountUpdated: EventEmitter<number> =
    new EventEmitter<number>();

  stepCount = 0;
  currentStep = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.stepCount =
        this.contents.length + (this.attributions.length ? 1 : 0);
      this.stepper?.init(this.startIndex, this.stepCount);
      this.updateIndex(this.startIndex);
    }, 0);
  }

  updateIndex(index: number) {
    this.currentStep = index;
    this.indexChanged.emit(index);
  }

  updateCounter(count: number, isActive: boolean) {
    if (isActive) {
      this.answerCountUpdated.emit(count);
    }
  }
}