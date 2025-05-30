import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-content-group-settings',
  imports: [
    CoreModule,
    SettingsSlideToggleComponent,
    LoadingButtonComponent,
    MatButtonToggleModule,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-group-settings.component.html',
  styleUrl: './content-group-settings.component.scss',
})
export class ContentGroupSettingsComponent
  extends FormComponent
  implements OnInit
{
  private dialogRef =
    inject<MatDialogRef<ContentGroupSettingsComponent>>(MatDialogRef);
  data = inject<{
    contentGroup: ContentGroup;
    groupNames: string[];
    alreadyAnswered: boolean;
  }>(MAT_DIALOG_DATA);
  private contentGroupService = inject(ContentGroupService);
  private contentPublishService = inject(ContentPublishService);

  nameFormControl = new UntypedFormControl();
  group: ContentGroup;
  GroupType = GroupType;
  PublishingMode = PublishingMode;

  constructor() {
    super();
    const data = this.data;

    this.group = { ...data.contentGroup };
  }
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
        statisticsPublished: this.group.statisticsPublished,
        correctOptionsPublished: this.group.correctOptionsPublished,
        leaderboardEnabled: this.group.leaderboardEnabled,
        published: this.group.published,
        publishingMode: this.group.publishingMode,
        publishingIndex: this.group.publishingIndex,
      };
      this.contentGroupService
        .patchContentGroup(this.group, changes)
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
      formControl.value !== this.group.name &&
      this.data.groupNames.includes(formControl.value)
        ? { validateUniqueName: { value: formControl.value } }
        : null;
  }

  isLive(): boolean {
    return this.contentPublishService.isGroupLive(this.group);
  }
}
