import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '../../../models/user-roles.enum';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';


@Component({
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss']
})
export class ContentGroupsComponent implements OnInit {

  @Input() contentGroupName: string;
  @Input() length: number;
  @Input() isLoose: boolean;
  @Input() isLocked = false;
  role: UserRole;
  roomShortId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.roomShortId = this.route.snapshot.paramMap.get('shortId');
    this.route.data.subscribe(data => this.role = data.viewRole);
  }

  viewContents() {
    if (!this.isLoose) {
      let role: string;
      if (this.role === UserRole.CREATOR) {
        role = UserRole.CREATOR.toLowerCase();
      } else {
        role = UserRole.PARTICIPANT.toLowerCase();
      }
      this.router.navigate([`${role}/room/${this.roomShortId}/group/${this.contentGroupName}`]);
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.contentGroupName);
    } else {
      if (this.role === UserRole.CREATOR) {
        this.router.navigate([`creator/room/${this.roomShortId}/archive`]);
      }
    }
  }
}
