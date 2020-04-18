import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { UserRole } from '../../../models/user-roles.enum';
import { ContentGroup } from '../../../models/content-group';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';


@Component({
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss']
})
export class ContentGroupsComponent implements OnInit {

  @Input() public contentGroups: ContentGroup[];
  roomShortId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected authService: AuthenticationService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.roomShortId = this.route.snapshot.paramMap.get('shortId');
  }

  viewContents(contentGroup: ContentGroup) {
    if (this.authService.getRole() === UserRole.CREATOR) {
      this.router.navigate([`creator/room/${this.roomShortId}/group/${contentGroup.name}`]);

    } else {
      this.router.navigate([`participant/room/${this.roomShortId}/group/${contentGroup.name}`]);
    }
    this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, contentGroup);
  }

  viewContentsViaEnter(contentGroup: ContentGroup, event) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.ENTER) === true) {
      this.viewContents(contentGroup);
    }
  }
}
