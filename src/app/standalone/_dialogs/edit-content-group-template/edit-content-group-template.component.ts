import { Component, ViewChild, inject } from '@angular/core';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';

@Component({
  selector: 'app-edit-content-group-template',
  imports: [
    CoreModule,
    LoadingButtonComponent,
    ContentGroupTemplateEditingComponent,
  ],
  templateUrl: './edit-content-group-template.component.html',
})
export class EditContentGroupTemplateComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<EditContentGroupTemplateComponent>>(MatDialogRef);
  data = inject<{
    template: ContentGroupTemplate;
  }>(MAT_DIALOG_DATA);
  private templateService = inject(BaseTemplateService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  @ViewChild(ContentGroupTemplateEditingComponent)
  templateEditing!: ContentGroupTemplateEditingComponent;

  save() {
    const template = this.templateEditing.getTemplate();
    if (!template) {
      return;
    }
    const oldTemplate = this.data.template;
    template.id = oldTemplate.id;
    template.revision = oldTemplate.revision;
    template.templateIds = oldTemplate.templateIds;
    this.disableForm();
    this.templateService.updateContentGroupTemplate(template).subscribe({
      next: (updatedTemplate) => {
        this.dialogRef.close(updatedTemplate);
        const msg = this.translateService.translate('templates.changes-saved');
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
