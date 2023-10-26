import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CoreModule } from '@app/core/core.module';
import { TemplateTag } from '@app/core/models/template-tag';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { startWith, takeUntil } from 'rxjs';

@Component({
  selector: 'app-template-tag-selection',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './template-tag-selection.component.html',
})
export class TemplateTagSelectionComponent
  extends FormComponent
  implements OnInit
{
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  @Input() langChanged: EventEmitter<string>;
  @Input() lang: string;
  @Input() allowCreation = false;
  @Input() selectedTags: TemplateTag[] = [];
  @Output() selectedTagsChanged = new EventEmitter<TemplateTag[]>();
  tags: TemplateTag[] = [];
  filteredTags: TemplateTag[] = [];
  tagFormControl = new FormControl('');

  constructor(
    protected formService: FormService,
    private announceService: AnnounceService,
    private templateService: BaseTemplateService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    this.setFormControl(this.tagFormControl);
    this.tagFormControl.valueChanges.pipe(startWith(null)).subscribe((tag) => {
      setTimeout(() => {
        this.filteredTags = tag ? this.filterTags(tag) : this.tags.slice();
      });
    });
    this.loadTags();
    this.langChanged.pipe(takeUntil(this.destroyed$)).subscribe((lang) => {
      this.selectedTags = [];
      this.emitSelectionEvent();
      this.loadTags(lang);
    });
  }

  remove(tag: TemplateTag): void {
    const index = this.selectedTags.map((t) => t.name).indexOf(tag.name);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.announceService.announce('templates.tag-removed', { tag: tag });
      this.emitSelectionEvent();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const tag =
      this.filteredTags.length === 0
        ? { id: '', name: this.tagInput.nativeElement.value }
        : this.tags.find((t) => t.name === event.option.viewValue);
    if (tag) {
      this.selectedTags.push(tag);
      this.tagInput.nativeElement.value = '';
      this.tagFormControl.setValue(null);
      this.emitSelectionEvent();
    }
  }

  loadTags(lang: string = this.lang): void {
    this.templateService
      .getTemplateTags(lang, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tags) => {
        this.tags = tags;
        this.filteredTags = this.tags;
      });
  }

  isTagSelected(tag: TemplateTag): boolean {
    return this.selectedTags.map((t) => t.name).includes(tag.name);
  }

  private filterTags(value: string): TemplateTag[] {
    const filterValue = value.toLowerCase();
    return this.tags.filter((tag) =>
      tag.name.toLowerCase().includes(filterValue)
    );
  }

  private emitSelectionEvent(): void {
    this.selectedTagsChanged.next(this.selectedTags);
  }
}
