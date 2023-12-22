import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Content } from '@app/core/models/content';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { CoreModule } from '@app/core/core.module';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';

@Component({
  selector: 'app-content-template-preview',
  standalone: true,
  imports: [
    CoreModule,
    ContentPreviewComponent,
    StepperComponent,
    CdkStepperModule,
  ],
  templateUrl: './content-template-preview.component.html',
  styleUrls: ['./content-template-preview.component.scss'],
})
export class ContentTemplatePreviewComponent implements AfterViewInit {
  constructor(
    private dialogRef: MatDialogRef<ContentTemplatePreviewComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { contents: Content[]; index: number }
  ) {}

  @ViewChild(StepperComponent) stepper!: StepperComponent;

  ngAfterViewInit(): void {
    // Timeout is used for waiting until stepper component is available
    setTimeout(() => {
      this.stepper.init(this.data.index, this.data.contents.length);
    }, 0);
  }

  close(): void {
    this.dialogRef.close;
  }

  nextContent(): void {
    this.stepper.next();
  }

  previousContent(): void {
    this.stepper.previous();
  }
}
