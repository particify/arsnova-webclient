import { Component, OnDestroy, OnInit } from '@angular/core';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
})
export class ParticipantPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  room: Room;

  constructor(
    private roomService: RoomService,
    protected translateService: TranslateService,
    protected langService: LanguageService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
    });
  }

  ngOnInit(): void {
    this.roomService
      .getCurrentRoomStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((room) => (this.room = room));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
