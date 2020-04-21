import { Component, Input, OnInit } from '@angular/core';
import { BonusTokenService } from '../../../../services/http/bonus-token.service';
import { BonusToken } from '../../../../models/bonus-token';
import { Room } from '../../../../models/room';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService, LocalStorageKey } from '../../../../services/util/global-storage.service';

@Component({
  selector: 'app-bonus-token',
  templateUrl: './bonus-token.component.html',
  styleUrls: ['./bonus-token.component.scss']
})
export class BonusTokenComponent implements OnInit {
  @Input() room: Room;
  bonusTokens: BonusToken[] = [];
  lang: string;

  constructor(
    private bonusTokenService: BonusTokenService,
    protected router: Router,
    private translationService: TranslateService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.bonusTokenService.getTokensByRoomId(this.room.id).subscribe(list => {
      this.bonusTokens = list.sort((a, b) => {
        return (a.token > b.token) ? 1 : -1;
      });
    });
    this.lang = this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE);
  }

  openDeleteSingleBonusDialog(userId: string, commentId: string, index: number): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-token');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteBonus(userId, commentId, index);
      }
    });
  }

  openDeleteAllBonusDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-tokens');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAllBonuses();
      }
    });
  }

  deleteBonus(userId: string, commentId: string, index: number): void {
    const toDelete = this.bonusTokens[index];
    this.bonusTokenService.deleteToken(toDelete.roomId, toDelete.commentId, toDelete.userId).subscribe(_ => {
      this.translationService.get('settings.token-deleted').subscribe(msg => {
        this.bonusTokens.splice(index, 1);
        this.notificationService.show(msg);
      });
    });
  }

  deleteAllBonuses(): void {
    this.bonusTokenService.deleteTokensByRoomId(this.room.id).subscribe(() => {
      this.bonusTokens = [];
      this.translationService.get('settings.tokens-deleted').subscribe(msg => {
        this.notificationService.show(msg);
      });
    });
  }

  navToComment(commentId: string) {
    const commentURL = `creator/room/${this.room.shortId}/comment/${commentId}`;
    this.router.navigate([commentURL]);
  }
}
