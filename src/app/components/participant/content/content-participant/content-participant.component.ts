import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentType } from '../../../../models/content-type.enum';
import { Answer } from '../../../../models/answer';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { TextAnswer } from '../../../../models/text-answer';
import { ChoiceAnswer } from '../../../../models/choice-answer';

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss']
})
export class ContentParticipantComponent implements OnInit {

  @Input() content: Content;
  @Input() answer: Answer;
  @Output() message = new EventEmitter<Answer>();

  sendEvent = new EventEmitter<string>();
  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  selectedSingleAnswer: string;
  hasAbstained = false;
  multipleAlreadyAnswered = '';
  allAnswers = '';
  extensionData: any;
  alreadySent = false;
  flipped: boolean;
  isMultiple: boolean;

  constructor() { }

  ngOnInit(): void {
    this.setExtensionData(this.content.roomId, this.content.id);
    if (this.answer) {
      this.alreadySent = true;
      this.checkIfAbstention(this.answer);
    }
    this.isMultiple = (this.content as ContentChoice).multiple;
    this.isLoading = false;
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      'roomId': roomId,
      'refType': 'content',
      'refId': refId,
      'detailedView': false
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
    this.message.emit($event);
    this.alreadySent = true;
    this.checkIfAbstention($event);
  }

  goToStats() {
    this.flipped = !this.flipped;
    setTimeout(() => {
      document.getElementById('go-to-' + (this.flipped ? 'content' : 'stats')).focus();
    }, 300);
  }

}
