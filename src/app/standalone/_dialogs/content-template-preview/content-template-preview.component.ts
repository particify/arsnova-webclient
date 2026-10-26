import {
  Component,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { CoreModule } from '@app/core/core.module';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentDetailsFragment } from '@gql/generated/graphql';

@Component({
  selector: 'app-content-template-preview',
  imports: [
    CoreModule,
    ContentPreviewComponent,
    StepperComponent,
    CdkStepperModule,
  ],
  templateUrl: './content-template-preview.component.html',
  styleUrls: ['./content-template-preview.component.scss'],
})
export class ContentTemplatePreviewComponent {
  private dialogRef =
    inject<MatDialogRef<ContentTemplatePreviewComponent>>(MatDialogRef);
  data = inject<{
    contents: ContentDetailsFragment[];
    index: number;
    lang?: string;
  }>(MAT_DIALOG_DATA);

  readonly stepper = viewChild(StepperComponent);
  readonly index = signal(this.data.index);

  constructor() {
    afterNextRender(() => {
      this.stepper()?.init(this.index(), this.data.contents.length);
    });
  }

  nextContent(): void {
    this.stepper()?.next();
  }

  previousContent(): void {
    this.stepper()?.previous();
  }
}
