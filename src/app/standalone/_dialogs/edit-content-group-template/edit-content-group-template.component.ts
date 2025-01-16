import { Component, Inject, ViewChild } from '@angular/core';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { FormService } from '@app/core/services/util/form.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublishContentGroupTemplateComponent } from '@app/creator/content-group/_dialogs/publish-content-group-template/publish-content-group-template.component';
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
  @ViewChild(ContentGroupTemplateEditingComponent)
  templateEditing!: ContentGroupTemplateEditingComponent;

  constructor(
    protected formService: FormService,
    private dialogRef: MatDialogRef<PublishContentGroupTemplateComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { template: ContentGroupTemplate },
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
  }

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
