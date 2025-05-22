import { Component, ViewChild, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TemplateService } from '@app/creator/_services/template.service';
import {
  ContentGroupTemplateEditingComponent,
  ContentGroupTemplateEditingComponent as ContentGroupTemplateEditingComponent_1,
} from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatButton } from '@angular/material/button';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@Component({
  selector: 'app-create-content-group-template',
  templateUrl: './create-content-group-template.component.html',
  styleUrls: ['./create-content-group-template.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FlexModule,
    ContentGroupTemplateEditingComponent_1,
    MatDialogActions,
    MatButton,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class CreateContentGroupTemplateComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<CreateContentGroupTemplateComponent>>(MatDialogRef);
  data = inject<{
    name: string;
    contentGroupId: string;
  }>(MAT_DIALOG_DATA);
  private templateService = inject(TemplateService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  @ViewChild(ContentGroupTemplateEditingComponent)
  templateEditing!: ContentGroupTemplateEditingComponent;

  closeDialog(): void {
    this.dialogRef.close();
  }

  publish() {
    const template = this.templateEditing.getTemplate();
    if (!template) {
      return;
    }
    this.disableForm();
    this.templateService
      .addContentGroupTemplate(template, this.data.contentGroupId)
      .subscribe({
        next: () => {
          this.closeDialog();
          const msg = this.translateService.translate(
            'templates.template-published'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        error: () => {
          this.enableForm();
        },
      });
  }
}
