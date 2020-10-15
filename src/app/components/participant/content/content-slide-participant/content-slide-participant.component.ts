import { Component, Input, OnInit } from '@angular/core';
import { ContentParticipantComponent } from '../content-participant.component';
import { ContentText } from '../../../../models/content-text';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { EventService } from '../../../../services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';

@Component({
  selector: 'app-content-slide-participant',
  templateUrl: './content-slide-participant.component.html',
  styleUrls: ['./content-slide-participant.component.scss']
})
export class ContentSlideParticipantComponent extends ContentParticipantComponent implements OnInit {

  @Input() content: ContentText;

  constructor(
    protected authenticationService: AuthenticationService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected eventService: EventService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  initAnswer() {
    this.setExtensionData(this.content.roomId, this.content.id);
    this.isLoading = false;
  }
}
