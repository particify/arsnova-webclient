import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';

@Component({
  selector: 'app-content-group-settings',
  standalone: true,
  imports: [CoreModule, SettingsSlideToggleComponent, LoadingButtonComponent],
  templateUrl: './content-group-settings.component.html',
  styleUrl: './content-group-settings.component.scss',
})
export class ContentGroupSettingsComponent
  extends FormComponent
  implements OnInit
{
  constructor(
    protected formService: FormService,
    private dialogRef: MatDialogRef<ContentGroupSettingsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { contentGroup: ContentGroup; groupNames: string[] },
    private contentGroupService: ContentGroupService
  ) {
    super(formService);
  }

  nameFormControl = new UntypedFormControl();
  GroupType = GroupType;

  ngOnInit(): void {
    this.setFormControl(this.nameFormControl);
    this.nameFormControl.setValue(this.data.contentGroup.name);
    this.nameFormControl.clearValidators();
    this.nameFormControl.setValidators([
      Validators.required,
      Validators.maxLength(50),
      this.validateUniqueName(),
    ]);
    this.nameFormControl.updateValueAndValidity();
  }

  saveGroup() {
    if (this.nameFormControl.valid) {
      this.disableForm();
      const changes = {
        name: this.nameFormControl.value,
        statisticsPublished: this.data.contentGroup.statisticsPublished,
        correctOptionsPublished: this.data.contentGroup.correctOptionsPublished,
        leaderboardEnabled: this.data.contentGroup.leaderboardEnabled,
      };
      this.contentGroupService
        .patchContentGroup(this.data.contentGroup, changes)
        .subscribe({
          next: (contentGroup) => {
            this.dialogRef.close(contentGroup);
          },
          error: () => this.enableForm(),
        });
    }
  }

  validateUniqueName(): ValidatorFn {
    return (formControl) =>
      formControl.value !== this.data.contentGroup.name &&
      this.data.groupNames.includes(formControl.value)
        ? { validateUniqueName: { value: formControl.value } }
        : null;
  }
}
