import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { UserService } from '../../../services/http/user.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';

export class RegisterErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

const PASSWORD_STRICTNESS_LEVEL = 2;

const LENGTH_PATTERN = /.{20,}/;
const NUMBER_PATTERN = /\d/;
const LOWER_CASE_PATTERN = /\p{Ll}/u;
const UPPER_CASE_PATTERN = /\p{Lu}/u;
const SPECIAL_CHARACTERS_PATTERN = /\W/;

const PATTERN: RegExp[] = [LENGTH_PATTERN, NUMBER_PATTERN, LOWER_CASE_PATTERN, UPPER_CASE_PATTERN, SPECIAL_CHARACTERS_PATTERN];

export function validatePasswordStrength() {
  return (formControl: FormControl) => {
    if (getPasswordStrength(formControl.value) < PASSWORD_STRICTNESS_LEVEL) {
      return {
        passwordIsStrong: {
          isStrong: false
        }
      };
    } else {
      return null;
    }
  }
}

export function getPasswordStrength(password: string): number {
  let strength = 0;
  for (let pattern of PATTERN) {
    if (pattern.test(password)) {
      strength++;
    }
  }
  return strength;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  usernameFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.min(8), validatePasswordStrength()]);
  matcher = new RegisterErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS: string;
  accountServiceTitle: string;
  hidePw = true;

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

  register(username: string, password: string): void {
    if (!this.usernameFormControl.hasError('required') && !this.usernameFormControl.hasError('email') &&
      !this.passwordFormControl.hasError('required')) {
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
