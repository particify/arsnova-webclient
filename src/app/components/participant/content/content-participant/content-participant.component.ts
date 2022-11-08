import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentType } from '../../../../models/content-type.enum';
import { Answer } from '../../../../models/answer';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { TextAnswer } from '../../../../models/text-answer';
import { ChoiceAnswer } from '../../../../models/choice-answer';
import { MarkdownFeatureset } from '../../../../services/http/formatting.service';
import { MultipleTextsAnswer } from '../../../../models/multiple-texts-answer';
import { HotkeyAction } from '../../../../directives/hotkey.directive';
import { UserSettings } from '../../../../models/user-settings';
import { PriorizationAnswer } from '../../../../models/priorization-answer';

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss']
})
export class ContentParticipantComponent implements OnInit {

  @Input() content: Content;
  @Input() answer: Answer;
  @Input() lastContent: boolean;
  @Input() active: boolean;
  @Input() index: number;
  @Input() statsPublished: boolean;
  @Input() correctOptionsPublished: boolean;
  @Input() settings: UserSettings;
  @Output() answerChanged = new EventEmitter<Answer>();
  @Output() next = new EventEmitter<boolean>();

  sendEvent = new EventEmitter<string>();
  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  hasAbstained = false;
  answersString = '';
  extensionData: any;
  alreadySent = false;
  flipped: boolean;
  isMultiple: boolean;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;
  HotkeyAction = HotkeyAction;
  a11yMsg: string;

  constructor() { }

  ngOnInit(): void {
    this.setExtensionData(this.content.roomId, this.content.id);
    if (this.answer) {
      this.alreadySent = true;
      this.checkIfAbstention(this.answer);
      if ([ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(this.content.format)) {
        for (let option of (this.answer as ChoiceAnswer).selectedChoiceIndexes ?? []) {
          this.answersString = this.answersString.concat((this.content as ContentChoice).options[option].label + ',');
        }
      } else if (this.content.format === ContentType.WORDCLOUD) {
        for (let text of (this.answer as MultipleTextsAnswer).texts ?? []) {
          this.answersString = this.answersString.concat(text + ',');
        }
      }
    }
    this.isMultiple = (this.content as ContentChoice).multiple;
    this.a11yMsg = this.getA11yMessage();
    this.isLoading = false;
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      roomId: roomId,
      refType: 'content',
      refId: refId,
      detailedView: false
    };
  }

  checkIfAbstention(answer: Answer) {
    if (answer.format === ContentType.TEXT) {
      this.hasAbstained = !(answer as TextAnswer).body;
    } else if (answer.format === ContentType.WORDCLOUD) {
      this.hasAbstained = !((answer as MultipleTextsAnswer).texts?.length > 0);
    } else if(answer.format === ContentType.PRIORIZATION) {
      this.hasAbstained = !(answer as PriorizationAnswer).assignedPoints;
    } else {
      this.hasAbstained = !(answer as ChoiceAnswer).selectedChoiceIndexes;
    }
  }

  submitAnswerEvent($event, type: string) {
    $event.preventDefault();
    this.sendEvent.emit(type);
  }

  forwardAnswerMessage($event: Answer) {
    this.answerChanged.emit($event);
    setTimeout(() => {
      this.checkIfAbstention($event);
      this.alreadySent = true;
    }, 100);
  }

  goToStats() {
    this.flipped = !this.flipped;
    setTimeout(() => {
      document.getElementById((this.flipped ? 'message-button' : 'content-message')).focus();
    }, 500);
  }

  goToNextContent(last: boolean) {
    this.next.emit(last);
  }

  goToOverview() {
    this.goToNextContent(null);
  }

  getA11yMessage(): string {
    let msg = 'answer.a11y-';
    if (this.alreadySent) {
      msg += 'already-answered';
    } else {
      msg += 'current-';
      let format: string;
      if (this.content.format !== ContentType.CHOICE) {
        format = this.content.format.toLowerCase();
      } else {
        format = (this.content as ContentChoice).multiple ? 'multiple' : 'single';
      }
      msg += format;
    }
    return msg;
  }
}
