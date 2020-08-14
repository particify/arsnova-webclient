import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { Router } from '@angular/router';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { first } from 'rxjs/operators';

export class RegisterErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export function validatePassword(password1: FormControl) {
  return (formControl: FormControl) => {
    const password1Value = password1.value;
    const password2Value = formControl.value;

    if (password1Value !== password2Value) {
      return {
        passwordIsEqual: {
          isEqual: false
        }
      };
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  usernameFormControl = new FormControl('', [Validators.required, Validators.email]);
  password1FormControl = new FormControl('', [Validators.required]);
  password2FormControl = new FormControl('', [Validators.required, validatePassword(this.password1FormControl)]);

  matcher = new RegisterErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS: string;

  constructor(private translationService: TranslateService,
              public authenticationService: AuthenticationService,
              public notificationService: NotificationService,
              public eventService: EventService,
              private router: Router,
              private apiConfigService: ApiConfigService) {
  }

  ngOnInit(): void {
    this.apiConfigService.getApiConfig$().subscribe(config => {
      this.linkOfToS = config.ui.links.tos.url;
    });
  }

  register(username: string, password: string): void {
    if (!this.usernameFormControl.hasError('required') && !this.usernameFormControl.hasError('email') &&
      !this.password1FormControl.hasError('required') && !this.password2FormControl.hasError('required') &&
      !this.password2FormControl.hasError('passwordIsEqual')) {
      if (this.acceptToS) {
        this.authenticationService.register(username, password).subscribe(result => {
            this.router.navigate(['login'], {state: {data: {username: username, password: password}}});
            this.translationService.get('register.register-successful').subscribe(message => {
              this.notificationService.show(message);
            });
          },
          err => {
            this.translationService.get('register.register-request-error').subscribe(message => {
              this.notificationService.show(message);
            });
          }
        );
      } else {
        this.translationService.get('register.please-accept').subscribe(message => {
          this.notificationService.show(message);
        });
      }
    } else {
      this.translationService.get('register.register-unsuccessful').subscribe(message => {
        this.notificationService.show(message);
      });
    }
  }
}
