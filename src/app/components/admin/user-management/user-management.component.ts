import { Component } from '@angular/core';
import { User } from 'app/models/user';
import { UserService } from 'app/services/http/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent {
  user: Observable<User>;

  constructor(protected userService: UserService) {
  }

  loadEntity(id: string) {
    id = id.replace(' ', '');
    this.user = this.userService.getUser(id)
  }
}
