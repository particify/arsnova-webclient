import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  Input,
} from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatAutocompleteTrigger,
  MatAutocomplete,
  MatOption,
} from '@angular/material/autocomplete';
import { DisableFormDirective } from '@app/core/directives/disable-form.directive';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatAutocompleteTrigger,
    DisableFormDirective,
    ReactiveFormsModule,
    MatIcon,
    MatPrefix,
    NgClass,
    ExtendedModule,
    MatIconButton,
    MatSuffix,
    MatAutocomplete,
    MatOption,
  ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() label?: string;
  @Input() results: string[] = [];
  @Input() showSuccessIndicator = false;
  @Output() inputChanged: EventEmitter<string> = new EventEmitter();
  @Output() inputCleared: EventEmitter<void> = new EventEmitter();
  @Output() itemSelected: EventEmitter<string> = new EventEmitter();
  formControl = new FormControl();
  destroyed$ = new Subject<void>();

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroyed$))
      .subscribe((value) => {
        this.inputChanged.emit(value);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectItem(value: string) {
    this.itemSelected.emit(value);
  }

  clear() {
    this.formControl.setValue('');
    this.inputCleared.emit();
  }
}
