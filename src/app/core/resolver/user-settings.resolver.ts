import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSettings } from '@app/core/models/user-settings';
import { UserService } from '@app/core/services/http/user.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsResolver implements Resolve<UserSettings> {
  private userService = inject(UserService);

  resolve(): Observable<UserSettings> {
    return this.userService.getCurrentUsersSettings();
  }
}
