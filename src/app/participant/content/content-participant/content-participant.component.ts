import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { Answer } from '@app/core/models/answer';
import { Content } from '@app/core/models/content';
import { ContentChoice } from '@app/core/models/content-choice';
import { TextAnswer } from '@app/core/models/text-answer';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormComponent } from '@app/standalone/form/form.component';

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss'],
})
export class ContentParticipantComponent
  extends FormComponent
  implements OnInit
{
  @Input() content: Content;
  @Input() answer?: Answer;
  @Input() lastContent: boolean;
  @Input() active: boolean;
  @Input() index: number;
  @Input() statsPublished: boolean;
  @Input() correctOptionsPublished: boolean;
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

  choiceContent: ContentChoice;
  prioritizationContent: ContentPrioritization;
  flashcardContent: ContentFlashcard;
  scaleContent: ContentScale;
  wordloudContent: ContentWordcloud;

  choiceAnswer: ChoiceAnswer;
  prioritizationAnswer: PrioritizationAnswer;
  wordcloudAnswer: MultipleTextsAnswer;
  textAnswer: TextAnswer;

  ngOnInit(): void {
    this.setExtensionData(this.content.roomId, this.content.id);
    if (this.answer) {
      this.alreadySent = true;
      this.checkIfAbstention(this.answer);
      this.initAnswerData();
    }
    this.initContentData();
    this.isMultiple = (this.content as ContentChoice).multiple;
    this.a11yMsg = this.getA11yMessage();
    this.isLoading = false;
  }

  initAnswerData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.choiceAnswer = this.answer as ChoiceAnswer;
      for (const option of (this.answer as ChoiceAnswer)
        .selectedChoiceIndexes ?? []) {
        this.answersString = this.answersString.concat(
          (this.content as ContentChoice).options[option].label + ','
        );
      }
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.wordcloudAnswer = this.answer as MultipleTextsAnswer;
      for (const text of (this.answer as MultipleTextsAnswer).texts ?? []) {
        this.answersString = this.answersString.concat(text + ',');
      }
    } else if (this.content.format === ContentType.TEXT) {
      this.textAnswer = this.answer as TextAnswer;
      this.answersString = (this.answer as TextAnswer).body;
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationAnswer = this.answer as PrioritizationAnswer;
    } else if (this.content.format === ContentType.SCALE) {
      this.choiceAnswer = this.answer as ChoiceAnswer;
    }
  }

  initContentData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.choiceContent = this.content as ContentChoice;
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.wordloudContent = this.content as ContentWordcloud;
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationContent = this.content as ContentPrioritization;
    } else if (this.content.format === ContentType.SCALE) {
      this.scaleContent = this.content as ContentScale;
    } else if (this.content.format === ContentType.FLASHCARD) {
      this.flashcardContent = this.content as ContentFlashcard;
    }
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      roomId: roomId,
      refType: 'content',
      refId: refId,
      detailedView: false,
    };
  }

  checkIfAbstention(answer: Answer) {
    if (answer.format === ContentType.TEXT) {
      this.hasAbstained = !(answer as TextAnswer).body;
    } else if (answer.format === ContentType.WORDCLOUD) {
      this.hasAbstained = !((answer as MultipleTextsAnswer).texts?.length > 0);
    } else if (answer.format === ContentType.PRIORITIZATION) {
      this.hasAbstained = !(answer as PrioritizationAnswer).assignedPoints;
    } else {
      this.hasAbstained = !(answer as ChoiceAnswer).selectedChoiceIndexes;
    }
  }

  submitAnswerEvent($event: MouseEvent, type: string) {
    $event.preventDefault();
    this.sendEvent.emit(type);
  }

  forwardAnswerMessage($event: Answer) {
    this.answerChanged.emit($event);
    setTimeout(() => {
      this.enableForm();
      this.checkIfAbstention($event);
      this.alreadySent = true;
    }, 100);
  }

  goToStats() {
    this.flipped = !this.flipped;
  }

  goToNextContent() {
    this.next.emit();
  }

  getA11yMessage(): string {
    let msg = 'participant.answer.a11y-';
    if (this.alreadySent) {
      msg += 'already-answered';
    } else {
      msg += 'current-';
      let format: string;
      if (this.content.format !== ContentType.CHOICE) {
        format = this.content.format.toLowerCase();
      } else {
        format = (this.content as ContentChoice).multiple
          ? 'multiple'
          : 'single';
      }
      msg += format;
    }
    return msg;
  }
}
