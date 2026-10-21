import { CdkStepperModule } from '@angular/cdk/stepper';
import {
  Component,
  inject,
  input,
  viewChild,
  output,
  effect,
  booleanAttribute,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ContentDetailsFragment, UserUiSettings } from '@gql/generated/graphql';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';

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
export class ContentStepperComponent {
  private readonly contentResultsServive = inject(ContentResultsService);

  stepper = viewChild.required(StepperComponent);

  contents = input.required<ContentDetailsFragment[]>();
  settings = input.required<UserUiSettings>();
  startIndex = input.required<number>();
  startedContentId = input<string>();

  hideControls = input(false, { transform: booleanAttribute });
  showStepInfo = input(true);
  isLiveMode = input(false, { transform: booleanAttribute });
  language = input<string>();

  indexChanged = output<number>();

  currentStep?: number;

  constructor() {
    effect(() => {
      if (this.stepper()) {
        this.stepper().init(this.startIndex(), this.contents().length);
        this.currentStep = this.startIndex();
      }
    });
  }

  /**
   * A live content waits for its start only once: going back to a content
   * which already ran shows it again, not the waiting screen.
   */
  hasStarted(content: ContentDetailsFragment): boolean {
    return (
      content.id === this.startedContentId() || !!content.activeRound?.started
    );
  }

  updateIndex(index: number) {
    this.currentStep = index;
    this.contentResultsServive.setResultsVisible(false);
    this.contentResultsServive.setCorrectResultsVisible(false);
    this.indexChanged.emit(index);
  }
}
