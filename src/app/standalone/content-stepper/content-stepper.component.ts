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
import { UserSettings } from '@app/core/models/user-settings';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-content-stepper',
  imports: [
    CoreModule,
    StepperComponent,
    CdkStepperModule,
    ContentResultsComponent,
    ContentStepInfoComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './content-stepper.component.html',
  styleUrl: './content-stepper.component.scss',
})
export class ContentStepperComponent implements AfterViewInit {
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) settings!: UserSettings;
  @Input({ required: true }) startIndex!: number;
  @Input() hideControls = false;
  @Input() showStepInfo = true;
  @Input() isLiveMode = false;
  @Input() language?: string;
  @Output() indexChanged: EventEmitter<number> = new EventEmitter<number>();

  currentStep?: number;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.stepper?.init(this.startIndex, this.contents.length);
      this.updateIndex(this.startIndex);
    });
  }

  updateIndex(index: number) {
    this.currentStep = index;
    setTimeout(() => {
      this.indexChanged.emit(index);
    }, 300);
  }
}
