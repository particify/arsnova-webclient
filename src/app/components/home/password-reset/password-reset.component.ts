import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { validatePassword } from '../register/register.component';
import { UserService } from '../../../services/http/user.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';


export class PasswordResetErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  passwordFormControl = new FormControl('', [Validators.required]);
  passwordFormControl2 = new FormControl('', [Validators.required, validatePassword(this.passwordFormControl)]);
  keyFormControl = new FormControl('', [Validators.required]);

  matcher = new PasswordResetErrorStateMatcher();

  deviceWidth = innerWidth;
  email: string;
  isLoading = true;

  constructor(private translationService: TranslateService,
              private userService: UserService,
              private notificationService: NotificationService,
              public eventService: EventService,
              private route: ActivatedRoute,
              private router: Router) {
  }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.email = params['email'];
      this.isLoading = false;
    });
  }

  setNewPassword(password: string, key: string) {
    if (!this.passwordFormControl2.hasError('passwordIsEqual')) {
      if (this.email !== '' && key !== '' && password !== '') {
        this.userService.setNewPassword(this.email, password, key).subscribe(() => {
          this.translationService.get('password-reset.new-password-successful').subscribe(message => {
            this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
          });
          this.router.navigate(['login'], { state: { data: { username: this.email, password: password } } });
        });
      } else {
        this.translationService.get('login.inputs-incorrect').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
        });
      }
    } else {
      this.translationService.get('login.inputs-incorrect').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
    }
  }

}
