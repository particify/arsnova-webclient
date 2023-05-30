import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LiveFeedbackIcon } from '@app/core/models/live-feedback-icon.enum';
import { LiveFeedbackLabel } from '@app/core/models/live-feedback-label.enum';
import { LiveFeedbackSurveyLabel } from '@app/core/models/live-feedback-survey-label.enum';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

class LiveFeedback {
  count = 0;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FlexModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  selector: 'app-live-feedback',
  templateUrl: './live-feedback.component.html',
  styleUrls: ['./live-feedback.component.scss'],
})
export class LiveFeedbackComponent implements OnInit, OnDestroy {
  @Input() type: LiveFeedbackType;
  @Input() isClosed: boolean;
  @Input() fixedSize: boolean;
  @Input() data: number[] = [0, 0, 0, 0];
  @Input() dataChanged = new EventEmitter<number[]>();

  displayData: LiveFeedback[] = [
    new LiveFeedback(),
    new LiveFeedback(),
    new LiveFeedback(),
    new LiveFeedback(),
  ];

  LiveFeedbackType: typeof LiveFeedbackType = LiveFeedbackType;
  feedbackLabels = Object.values(LiveFeedbackLabel);
  feedbackIcons = Object.values(LiveFeedbackIcon);
  surveyLabels = Object.values(LiveFeedbackSurveyLabel);

  private hotkeyRefs: symbol[] = [];

  constructor(
    private translateService: TranslateService,
    private hotkeyService: HotkeyService,
    private announceService: AnnounceService
  ) {}

  ngOnInit(): void {
    this.setData(this.data);
    this.dataChanged.subscribe((data) => {
      this.setData(data);
    });
    this.translateService.get('survey.status-summary').subscribe((t) =>
      this.hotkeyService.registerHotkey(
        {
          key: '5',
          action: () => !this.isClosed && this.announceStatus(),
          actionTitle: t,
        },
        this.hotkeyRefs
      )
    );
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  private setData(data: number[]) {
    data.forEach((v, i) => {
      this.displayData[i].count = v;
    });
  }

  private announceStatus() {
    const typeLabels = (
      this.type === LiveFeedbackType.FEEDBACK
        ? this.feedbackLabels
        : this.surveyLabels
    ).map((label) => 'survey.' + label);
    const labels = this.translateService.instant(typeLabels);
    const status = this.translateService.instant(
      this.isClosed ? 'survey.a11y-stopped' : 'survey.a11y-started'
    );
    const summary = this.translateService.instant('survey.a11y-status', {
      status: status,
      state0: this.data[0] || 0,
      state1: this.data[1] || 0,
      state2: this.data[2] || 0,
      state3: this.data[3] || 0,
      answer0: labels[typeLabels[0]],
      answer1: labels[typeLabels[1]],
      answer2: labels[typeLabels[2]],
      answer3: labels[typeLabels[3]],
    });
    this.announceService.announce(summary);
  }
}
