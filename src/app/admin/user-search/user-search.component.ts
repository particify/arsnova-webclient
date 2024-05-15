import { Component } from '@angular/core';
import { User } from '@app/core/models/user';
import { AdminService } from '@app/core/services/http/admin.service';
import { UserService } from '@app/core/services/http/user.service';

@Component({
  selector: 'app-user-search',
  template: '',
})
export class UserSearchComponent {
  user?: User;
  users: User[] = [];
  searchResults: string[] = [];

  constructor(
    protected userService: UserService,
    protected adminService: AdminService
  ) {}

  clear() {
    this.user = undefined;
    this.users = [];
    this.searchResults = [];
  }

  search(input: string) {
    if (!input || this.user) {
      return;
    }
    this.searchResults = [];
    this.adminService.getUser(input).subscribe({
      next: (user) => {
        this.setUserData([user]);
      },
      error: () => {
        this.userService.getUserByDisplayId(input).subscribe((users) => {
          this.setUserData(users);
        });
      },
    });
  }

  setUserData(users: User[]) {
    this.users = users;
    if (users.length > 0) {
      users.forEach((user) => {
        this.searchResults.push(
          `${user.person.displayId} (${user.authProvider})`
        );
      });
    }
  }
}
