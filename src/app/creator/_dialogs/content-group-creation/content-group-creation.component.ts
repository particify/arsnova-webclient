import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { DetailedRadioGroup } from '@app/standalone/detail-radio-group/detail-radio-group.component';

interface DialogData {
  roomId?: string;
}

@Component({
  selector: 'app-content-group-creation',
  templateUrl: './content-group-creation.component.html',
  styleUrl: './content-group-creation.component.scss',
})
export class ContentGroupCreationComponent extends FormComponent {
  readonly dialogId = 'create-content-group';

  @ViewChild('nameInput') nameInput!: ElementRef;

  name = '';

  selectedType = GroupType.MIXED;
  radioItems: DetailedRadioGroup[] = [];

  constructor(
    public dialogRef: MatDialogRef<ContentGroupCreationComponent>,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    private contentGroupService: ContentGroupService,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    protected formService: FormService
  ) {
    super(formService);
    Object.values(GroupType).forEach((type) => {
      const typeString = type.toLowerCase();
      const title = this.translateService.translate(
        'content.group-type-' + typeString
      );
      const description = this.translateService.translate(
        'creator.content.group-type-description-' + typeString
      );
      this.radioItems.push(
        new DetailedRadioGroup(
          type,
          title,
          description,
          this.contentGroupService.getTypeIcons().get(type),
          `var(--${typeString})`
        )
      );
    });
  }

  changeType(type: string) {
    this.selectedType = GroupType[type as keyof typeof GroupType];
  }

  addContentGroup() {
    if (this.name) {
      if (this.contentGroupService.saveGroupInMemoryStorage(this.name)) {
        if (!this.data.roomId) {
          this.closeDialog(this.name);
          return;
        }
        const newGroup = new ContentGroup();
        newGroup.roomId = this.data.roomId;
        newGroup.name = this.name;
        newGroup.groupType = this.selectedType;
        if (newGroup.groupType === GroupType.QUIZ) {
          newGroup.publishingMode = PublishingMode.LIVE;
        }
        this.disableForm();
        this.contentGroupService.post(newGroup).subscribe(
          () => {
            this.translateService
              .selectTranslate('creator.room-page.content-group-created')
              .pipe(take(1))
              .subscribe((msg) => {
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
            this.closeDialog(this.name);
          },
          () => {
            this.enableForm();
          }
        );
      } else {
        this.translateService
          .selectTranslate('creator.content.duplicate-series-name')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.FAILED
            );
          });
      }
    } else {
      this.translateService
        .selectTranslate('creator.dialog.please-enter-name')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
          this.nameInput.nativeElement.focus();
        });
    }
  }

  closeDialog(name?: string): void {
    if (name) {
      this.dialogRef.close(name);
    } else {
      this.dialogRef.close();
    }
  }
}
