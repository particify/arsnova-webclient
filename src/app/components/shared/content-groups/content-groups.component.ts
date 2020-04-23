import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '../../../models/user-roles.enum';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';


@Component({
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss']
})
export class ContentGroupsComponent implements OnInit {

  @Input() contentGroupName: string;
  @Input() length: number;
  @Input() isLoose: boolean;
  @Input() role: UserRole;
  roomShortId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.roomShortId = this.route.snapshot.paramMap.get('shortId');
  }

  viewContents() {
    if (!this.isLoose) {
      if (this.role === UserRole.CREATOR) {
        this.router.navigate([`creator/room/${this.roomShortId}/group/${this.contentGroupName}`]);

      } else {
        this.router.navigate([`participant/room/${this.roomShortId}/group/${this.contentGroupName}`]);
      }
      this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, this.contentGroupName);
    } else {
      if (this.role === UserRole.CREATOR) {
        this.router.navigate([`creator/room/${this.roomShortId}/loosecontent`]);
      }
    }
  }
}
