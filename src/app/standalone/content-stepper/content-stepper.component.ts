import { CdkStepperModule } from '@angular/cdk/stepper';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { AnswerResponseCounts } from '@app/core/models/answer-response-counts';
import { Content } from '@app/core/models/content';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { UserSettings } from '@app/core/models/user-settings';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
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
    AttributionsInfoComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './content-stepper.component.html',
  styleUrl: './content-stepper.component.scss',
})
export class ContentStepperComponent implements AfterViewInit, OnInit {
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) settings!: UserSettings;
  @Input({ required: true }) startIndex!: number;
  @Input() attributions: ContentLicenseAttribution[] = [];
  @Input() hideControls = false;
  @Input() showStepInfo = true;
  @Input() isLiveMode = false;
  @Input() language?: string;
  @Output() indexChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() answerCountUpdated: EventEmitter<AnswerResponseCounts> =
    new EventEmitter<AnswerResponseCounts>();

  stepCount = 0;
  currentStep?: number;

  ngOnInit(): void {
    this.stepCount = this.contents.length + (this.attributions.length ? 1 : 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.stepper?.init(this.startIndex, this.stepCount);
      this.updateIndex(this.startIndex);
    });
  }

  updateIndex(index: number) {
    this.currentStep = index;
    setTimeout(() => {
      this.indexChanged.emit(index);
    }, 300);
  }

  updateCounter(count: AnswerResponseCounts, isActive: boolean) {
    if (isActive) {
      this.answerCountUpdated.emit(count);
    }
  }
}
