import { Component, OnInit, ViewChild } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { UserService } from '../../../services/http/user.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordEntryComponent } from '../password-entry/password-entry.component';

export class RegisterErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @ViewChild(PasswordEntryComponent) passwordEntry: PasswordEntryComponent;

  usernameFormControl = new FormControl('', [Validators.required, Validators.email]);
  matcher = new RegisterErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS: string;
  accountServiceTitle: string;

  constructor(private translationService: TranslateService,
              public userService: UserService,
              public notificationService: NotificationService,
              public eventService: EventService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.accountServiceTitle = data.apiConfig.ui.registration?.service || 'ARSnova';
      this.linkOfToS = data.apiConfig.ui.links.tos.url;
    });
    document.getElementById('email-input').focus();
  }

  register(username: string): void {
    const password = this.passwordEntry.getPassword();
    if (!this.usernameFormControl.hasError('required') && !this.usernameFormControl.hasError('email')
        && password) {
      if (this.acceptToS) {
        this.userService.register(username, password).subscribe(result => {
            this.router.navigateByUrl('login', { state: { data: { username: username, password: password } } });
            this.translationService.get('register.register-successful').subscribe(message => {
              this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
            });
          },
          err => {
            this.translationService.get('register.register-request-error').subscribe(message => {
              this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.FAILED);
            });
          }
        );
      } else {
        this.translationService.get('register.please-accept').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
        });
      }
    } else {
      this.translationService.get('register.register-unsuccessful').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
    }
  }
}
