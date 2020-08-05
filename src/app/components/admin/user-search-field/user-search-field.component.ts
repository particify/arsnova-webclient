import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { UserService } from '../../../services/http/user.service';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { User } from '../../../models/user';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-search-field',
  templateUrl: './user-search-field.component.html',
  styleUrls: ['./user-search-field.component.scss']
})
export class UserSearchFieldComponent implements OnInit, OnDestroy {
  formControl = new FormControl();
  users: User[] = [];
  value: string;
  submittable: boolean;
  @Input() label: string;
  @Output() submit: EventEmitter<string> = new EventEmitter();
  ngUnsubscribe = new Subject();

  constructor(protected userService: UserService) {
  }

  ngOnInit() {
    this.submittable = this.submit.observers.length > 0;
    const mapFunc = (value: string|User) => typeof value === 'string' ? value : value.id;
    /* Set value for use by parent components */
    this.formControl.valueChanges.pipe(map(mapFunc), takeUntil(this.ngUnsubscribe)).subscribe(value =>
        this.value = value);
    /* Lookup users for autocomplete options */
    this.formControl.valueChanges.pipe(map(mapFunc), debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(value =>
        this.search(value).subscribe(users => this.users = users));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  search(loginId: string) {
    return this.userService.getUserByLoginId(loginId);
  }

  displayFn(user: User): string {
    return user && user.id ? user.id : '';
  }

  submitUserId(id: string) {
    console.debug('submitUserId', id)
    this.submit.emit(id);
  }
}
