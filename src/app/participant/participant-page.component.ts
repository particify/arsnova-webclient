import {
  Component,
  Input,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { NavBarComponent } from '@app/standalone/nav-bar/nav-bar.component';
import { NgClass } from '@angular/common';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import {
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { FlexModule } from '@angular/flex-layout';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomSettings } from '@app/core/models/room-settings';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { QnasByRoomIdGql, QnaState } from '@gql/generated/graphql';
import { catchError, map, of, switchMap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  providers: [FocusModeService],
  imports: [
    FlexModule,
    MatDrawerContainer,
    ExtensionPointModule,
    MatDrawer,
    NavBarComponent,
    MatDrawerContent,
    NgClass,
    RouterOutlet,
    FooterComponent,
  ],
})
export class ParticipantPageComponent implements OnInit {
  protected readonly translateService = inject(TranslocoService);
  protected readonly langService = inject(LanguageService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly routingService = inject(RoutingService);
  private readonly roomSettingsService = inject(RoomSettingsService);
  private readonly qnasByRoomId = inject(QnasByRoomIdGql);

  // Route data input below
  roomId = input.required<string>();
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) viewRole!: UserRole;

  roomSettings?: RoomSettings;
  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());

  qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: {
            roomId,
          },
        }).valueChanges;
      }),
      onlyCompleteData(),
      map((r) => r.data.qnasByRoomId),
      catchError(() => of())
    )
  );

  qnaEnabled = computed(() => {
    const qna = this.qnaResult();
    if (qna?.edges && qna.edges[0]) {
      return qna.edges[0]?.node.state !== QnaState.Stopped;
    }
  });

  constructor() {
    const translateService = this.translateService;
    const langService = this.langService;

    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
  }

  ngOnInit(): void {
    const feature = this.routingService.getRoutingFeature();
    if (!feature) {
      return;
    }
    this.focusModeService.init();
    this.roomSettingsService.getByRoomId(this.room.id).subscribe((settings) => {
      this.roomSettings = settings;
    });
  }
}
