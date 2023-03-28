import { Component } from '@angular/core';
import { User } from '@core/models/user';
import { UserService } from '@core/services/http/user.service';

@Component({
  selector: 'app-user-search',
  template: '',
})
export class UserSearchComponent {
  user: User;
  users: User[];
  searchResults: string[];

  constructor(protected userService: UserService) {}

  clear() {
    this.user = null;
    this.users = [];
    this.searchResults = [];
  }

  search(loginId: string) {
    this.searchResults = [];
    this.userService.getUserByLoginId(loginId).subscribe((users) => {
      this.users = users;
      if (this.users.length > 0) {
        this.users.forEach((user) => {
          this.searchResults.push(`${user.loginId} (${user.authProvider})`);
        });
      }
    });
  }
}
