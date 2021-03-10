import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ContentType } from '../../../../models/content-type.enum';
import { Answer } from '../../../../models/answer';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { TextAnswer } from '../../../../models/text-answer';
import { ChoiceAnswer } from '../../../../models/choice-answer';
import { MarkdownFeatureset } from '../../../../services/http/formatting.service';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { KeyboardKey } from '../../../../utils/keyboard/keys';

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

  constructor() { }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.active) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.SPACE) === true) {
        if (this.alreadySent) {
          this.goToStats();
        }
      }
    }
  }

  ngOnInit(): void {
    this.setExtensionData(this.content.roomId, this.content.id);
    if (this.answer) {
      this.alreadySent = true;
      this.checkIfAbstention(this.answer);
      if ([ContentType.TEXT, ContentType.SLIDE].indexOf(this.content.format) === -1) {
        for (let option of (this.answer as ChoiceAnswer).selectedChoiceIndexes) {
          this.answersString = this.answersString.concat((this.content as ContentChoice).options[option].label);
        }
      }
    }
    this.isMultiple = (this.content as ContentChoice).multiple;
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
    if ((answer.format === ContentType.TEXT && !(answer as TextAnswer).body) ||
      answer.format !== ContentType.TEXT && !(answer as ChoiceAnswer).selectedChoiceIndexes) {
      this.hasAbstained = true;
    }
  }

  submitAnswerEvent($event, type: string) {
    $event.preventDefault();
    this.sendEvent.emit(type);
  }

  forwardAnswerMessage($event: Answer) {
    this.answerChanged.emit($event);
    this.alreadySent = true;
    this.checkIfAbstention($event);
  }

  goToStats() {
    this.flipped = !this.flipped;
    setTimeout(() => {
      document.getElementById((this.flipped ? 'message-button' : 'content-message')).focus();
    }, 300);
  }

  goToNextContent(last: boolean) {
    this.next.emit(last);
  }

}
