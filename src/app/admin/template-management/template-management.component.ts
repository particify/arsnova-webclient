import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import {
  AdminDeleteTemplateTagGql,
  AdminUpdateTemplateTagNameGql,
  AdminUpdateTemplateTagVerifiedGql,
  TemplateTagFragment,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { FlexModule } from '@angular/flex-layout';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';

enum FILTER {
  ALL = 'all',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

@Component({
  selector: 'app-template-management',
  templateUrl: './template-management.component.html',
  styleUrls: ['./template-management.component.scss'],
  imports: [
    FlexModule,
    AdminPageHeaderComponent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    TemplateLanguageSelectionComponent,
    LoadingIndicatorComponent,
    MatActionList,
    MatListItem,
    MatIconButton,
    MatIcon,
    NgStyle,
    ExtendedModule,
    TranslocoPipe,
  ],
})
export class TemplateManagementComponent
  extends FormComponent
  implements OnInit
{
  private templateTagsByLanguage = inject(TemplateTagsByLanguageGql);
  private adminDeleteTemplateTag = inject(AdminDeleteTemplateTagGql);
  private adminUpdateTemplateTagName = inject(AdminUpdateTemplateTagNameGql);
  private adminUpdateTemplateTagVerified = inject(
    AdminUpdateTemplateTagVerifiedGql
  );
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly tags = signal<TemplateTagFragment[]>([]);
  readonly currentFilter = signal(FILTER.ALL);
  FILTER = FILTER;
  filterOptions = Object.values(FILTER);
  searchFormControl = new FormControl('');
  private readonly search = toSignal(this.searchFormControl.valueChanges, {
    initialValue: '',
  });

  /** Changes only when tags are loaded or deleted, not when one is updated. */
  private readonly tagIds = computed(() => this.tags().map((t) => t.id), {
    equal: (a, b) => a.length === b.length && a.every((id, i) => id === b[i]),
  });

  /**
   * An updated tag stays where it is listed, even if it no longer matches,
   * until the filter, the search or the set of tags changes. The tags are
   * matched when the list is read, which the view does before any of them
   * can be updated from it.
   */
  private readonly listedTagIds = computed(() => {
    this.tagIds();
    const filter = this.currentFilter();
    const search = this.search()?.toLowerCase();
    const tags = untracked(this.tags);
    return new Set(
      tags
        .filter(
          (t) =>
            (filter === FILTER.ALL ||
              t.verified === (filter === FILTER.VERIFIED)) &&
            (!search || t.name.toLowerCase().includes(search))
        )
        .map((t) => t.id)
    );
  });

  readonly filteredTags = computed(() => {
    const listed = this.listedTagIds();
    return this.tags().filter((t) => listed.has(t.id));
  });

  ngOnInit(): void {
    this.loadTags(this.translateService.getActiveLang());
  }

  loadTags(lang?: string): void {
    if (!lang) {
      return;
    }
    this.isLoading.set(true);
    forkJoin([
      this.fetchTags(lang, false),
      this.fetchTags(lang, true),
    ]).subscribe((tags) => {
      this.tags.set([...new Map(tags.flat().map((t) => [t.id, t])).values()]);
      this.isLoading.set(false);
    });
  }

  private fetchTags(
    language: string,
    verified: boolean
  ): Observable<TemplateTagFragment[]> {
    return this.templateTagsByLanguage
      .fetch({
        variables: { language, verified },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data?.templateTagsByLanguage ?? []));
  }

  private replaceTag(tag: TemplateTagFragment): void {
    this.tags.update((tags) => tags.map((t) => (t.id === tag.id ? tag : t)));
  }

  private updateVerified(
    id: string,
    verified: boolean
  ): Observable<TemplateTagFragment | undefined> {
    return this.adminUpdateTemplateTagVerified
      .mutate({ variables: { id, verified } })
      .pipe(map((r) => r.data?.adminUpdateTemplateTagVerified));
  }

  toggleVerified(tag: TemplateTagFragment): void {
    this.updateVerified(tag.id, !tag.verified).subscribe((updatedTag) => {
      if (!updatedTag) {
        return;
      }
      this.replaceTag(updatedTag);
      const msg = this.translateService.translate(
        updatedTag.verified
          ? 'admin.admin-area.tag-has-been-verified'
          : 'admin.admin-area.tag-verification-has-been-removed'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }

  delete(tag: TemplateTagFragment): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'delete-tag',
      'admin.dialog.really-delete-tag',
      tag.name,
      undefined,
      () => this.adminDeleteTemplateTag.mutate({ variables: { id: tag.id } })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tags.update((tags) => tags.filter((t) => t.id !== tag.id));
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

  edit(tag: TemplateTagFragment): void {
    const dialogRef = this.dialogService.openDialog(InputDialogComponent, {
      data: {
        inputName: 'tag',
        primaryAction: tag.verified ? 'save' : 'verify',
        input: tag.name,
      },
    });
    dialogRef.componentInstance.clicked$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((name) => {
        this.renameAndVerify(tag, name).subscribe((updatedTag) => {
          this.formService.enableForm();
          dialogRef.close();
          if (!updatedTag) {
            return;
          }
          const msg = this.translateService.translate(
            tag.verified
              ? 'admin.admin-area.changes-have-been-saved'
              : 'admin.admin-area.tag-has-been-verified'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.replaceTag(updatedTag);
        });
      });
  }

  private renameAndVerify(
    tag: TemplateTagFragment,
    name: string
  ): Observable<TemplateTagFragment | undefined> {
    const renamed$ =
      name === tag.name
        ? of(tag)
        : this.adminUpdateTemplateTagName
            .mutate({ variables: { id: tag.id, name } })
            .pipe(map((r) => r.data?.adminUpdateTemplateTagName));
    return renamed$.pipe(
      switchMap((renamed) =>
        renamed && !renamed.verified
          ? this.updateVerified(renamed.id, true)
          : of(renamed)
      )
    );
  }

  filterTags(filter: FILTER): void {
    this.currentFilter.set(filter);
  }
}
