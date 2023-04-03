import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';

@Component({
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss'],
})
export class ContentGroupsComponent implements OnInit {
  @Input() contentGroupName: string;
  @Input() length: number;
  @Input() isLocked = false;
  role: UserRole;
  roomShortId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalStorageService: GlobalStorageService,
    private routingService: RoutingService
  ) {}

  ngOnInit() {
    this.roomShortId = this.route.snapshot.paramMap.get('shortId');
    this.route.data.subscribe((data) => (this.role = data.viewRole));
  }

  viewContents() {
    this.router.navigate([
      this.routingService.getRoleRoute(this.role),
      this.roomShortId,
      'series',
      this.contentGroupName,
    ]);
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.contentGroupName
    );
  }
}
