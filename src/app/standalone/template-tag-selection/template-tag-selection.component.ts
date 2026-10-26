import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CoreModule } from '@app/core/core.module';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormComponent } from '@app/standalone/form/form.component';
import {
  TemplateTagFragment,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-template-tag-selection',
  imports: [CoreModule],
  templateUrl: './template-tag-selection.component.html',
})
export class TemplateTagSelectionComponent
  extends FormComponent
  implements OnInit
{
  private announceService = inject(AnnounceService);
  private templateTagsByLanguage = inject(TemplateTagsByLanguageGql);

  readonly tagInput = viewChild<ElementRef<HTMLInputElement>>('tagInput');

  readonly lang = input.required<string>();
  readonly allowCreation = input(false);
  readonly selectedTags = model<TemplateTagFragment[]>([]);
  readonly selectedTagIds = input<string[]>([]);

  tagFormControl = new FormControl(
    '',
    Validators.pattern(/^[\p{Ll}\p{Lu}\d\s]*$/u)
  );

  readonly disabled = toSignal(this.formService.getFormDisabled(), {
    initialValue: false,
  });

  /** Tags belong to a language, so switching it starts the selection over. */
  readonly tags = toSignal(
    toObservable(this.lang).pipe(
      switchMap((lang, i) => {
        if (i > 0) {
          this.selectedTags.set([]);
        }
        return this.templateTagsByLanguage
          .fetch({ variables: { language: lang } })
          .pipe(map((r) => r.data?.templateTagsByLanguage ?? []));
      }),
      tap((tags) => this.selectPreselectedTags(tags))
    ),
    { initialValue: [] }
  );

  private readonly tagFilter = toSignal(this.tagFormControl.valueChanges, {
    initialValue: null,
  });

  readonly filteredTags = computed(() => {
    const filterValue = this.tagFilter()?.toLowerCase();
    return filterValue
      ? this.tags().filter((tag) =>
          tag.name.toLowerCase().includes(filterValue)
        )
      : this.tags();
  });

  ngOnInit(): void {
    this.setFormControl(this.tagFormControl);
  }

  remove(tag: TemplateTagFragment): void {
    const selected = this.selectedTags();
    const index = selected.map((t) => t.name).indexOf(tag.name);
    if (index >= 0) {
      this.selectedTags.set(selected.filter((_, i) => i !== index));
      this.announceService.announce('templates.tag-removed', { tag: tag });
    }
  }

  /**
   * Material resets the form control before reporting the selection, so the
   * filtered tags no longer tell which option it was: only offered tags have a
   * value. The typed name is still in the input, as the chip grid is the form
   * field's control.
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    const input = this.tagInput()?.nativeElement;
    const name: string | undefined = event.option.value;
    const tag =
      name === undefined || name === null
        ? {
            __typename: 'TemplateTag' as const,
            id: '',
            name: input?.value.trim() ?? '',
            verified: false,
          }
        : this.tags().find((t) => t.name === name);
    if (tag?.name) {
      this.selectedTags.update((selected) => [...selected, tag]);
      if (input) {
        input.value = '';
      }
      this.tagFormControl.setValue(null);
    }
  }

  isTagSelected(tag: TemplateTagFragment): boolean {
    return this.selectedTags()
      .map((t) => t.name)
      .includes(tag.name);
  }

  private selectPreselectedTags(tags: TemplateTagFragment[]): void {
    const ids = this.selectedTagIds();
    if (ids.length > 0) {
      this.selectedTags.set(tags.filter((t) => ids.includes(t.id)));
    }
  }
}
