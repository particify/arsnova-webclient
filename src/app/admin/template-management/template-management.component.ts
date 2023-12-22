import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { TemplateService } from '@app/admin/template-management/template.service';
import { TemplateTag } from '@app/core/models/template-tag';
import { DialogService } from '@app/core/services/util/dialog.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';

enum FILTER {
  ALL = 'all',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

@Component({
  selector: 'app-template-management',
  templateUrl: './template-management.component.html',
  styleUrls: ['./template-management.component.scss'],
})
export class TemplateManagementComponent
  extends FormComponent
  implements OnInit
{
  isLoading = true;
  tags: TemplateTag[] = [];
  filteredTags: TemplateTag[] = [];
  currentFilter = FILTER.ALL;
  FILTER = FILTER;
  filterOptions = Object.values(FILTER);
  searchFormControl = new FormControl('');

  constructor(
    protected formService: FormService,
    private templateService: TemplateService,
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    private dialogService: DialogService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    this.loadTags(this.translateService.getActiveLang());
    this.searchFormControl.valueChanges.subscribe((input) => {
      this.searchTags(input || '');
    });
  }

  loadTags(lang: string): void {
    this.isLoading = true;
    forkJoin([
      this.templateService.getTemplateTags(lang, false),
      this.templateService.getTemplateTags(lang, true),
    ]).subscribe((tags) => {
      this.tags = tags.flat();
      this.filterTags(this.currentFilter);
      this.isLoading = false;
    });
  }

  toggleVerified(tag: TemplateTag): void {
    const changes = { verified: !tag.verified };
    this.templateService
      .patchTemplateTag(tag.id, changes)
      .subscribe((updatedTag) => {
        tag.verified = updatedTag.verified;
        const msg = this.translateService.translate(
          tag.verified
            ? 'admin.admin-area.tag-has-been-verified'
            : 'admin.admin-area.tag-verification-has-been-removed'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
  }

  delete(tag: TemplateTag): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'delete-tag',
      'admin.dialog.really-delete-tag',
      tag.name,
      undefined,
      () => this.templateService.deleteTemplateTag(tag.id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tags = this.tags.filter((t) => t.id !== tag.id);
        this.filterTags(this.currentFilter);
        const msg = this.translateService.translate(
          'admin.admin-area.tag-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  edit(tag: TemplateTag): void {
    const dialogRef = this.dialogService.openDialog(InputDialogComponent, {
      data: {
        inputName: 'tag',
        primaryAction: tag.verified ? 'save' : 'verify',
        input: tag.name,
      },
    });
    dialogRef.componentInstance.clicked$.subscribe((name) => {
      const changes = { name: name, verified: true };
      this.templateService
        .patchTemplateTag(tag.id, changes)
        .subscribe((updatedTag) => {
          this.formService.enableForm();
          dialogRef.close();
          const msg = this.translateService.translate(
            tag.verified
              ? 'admin.admin-area.changes-have-been-saved'
              : 'admin.admin-area.tag-has-been-verified'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          tag.name = updatedTag.name;
          tag.verified = updatedTag.verified;
        });
    });
  }

  filterTags(filter: FILTER): void {
    this.currentFilter = filter;
    if (filter === FILTER.ALL) {
      this.filteredTags = this.tags;
    } else {
      this.filteredTags = this.tags.filter(
        (t) => t.verified === (filter === FILTER.VERIFIED)
      );
    }
  }

  searchTags(input: string): void {
    if (input) {
      this.filteredTags = this.filteredTags.filter((t) =>
        t.name.toLowerCase().includes(input.toLowerCase())
      );
    } else {
      this.filterTags(this.currentFilter);
    }
  }
}
