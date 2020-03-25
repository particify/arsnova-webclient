import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DisplayAnswer } from '../../content-choice-creator/content-choice-creator.component';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../services/util/notification.service';
import { EventService } from '../../../../services/util/event.service';

export interface DialogData {
  content: ContentChoice;
}

@Component({
  selector: 'app-content-edit',
  templateUrl: './content-edit.component.html',
  styleUrls: ['./content-edit.component.scss']
})
export class ContentEditComponent implements OnInit {
  displayAnswers: DisplayAnswer[] = [];
  displayedColumns = ['label', 'checked'];
  ansCounter = 1;

  constructor(private translateService: TranslateService,
              private notificationService: NotificationService,
              public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public eventService: EventService) {
  }

  ngOnInit() {
    for (let i = 0; i < this.data.content.options.length; i++) {
      let correct: boolean;
      correct = this.data.content.options[i].points > 0;
      this.displayAnswers[i] = new DisplayAnswer(new AnswerOption(this.data.content.options[i].label,
        this.data.content.options[i].points), correct);
    }
  }

  updateAnswer(index: number) {
    if (this.displayAnswers[index].correct === true) {
      this.ansCounter++;
      if ((!this.data.content.multiple) && this.ansCounter > 1) {
        for (let i = 0; i < this.displayAnswers.length; i++) {
          if (!(i === index)) {
            this.displayAnswers[i].correct = false;
            this.data.content.options[i].points = -10;
          }
        }
        this.ansCounter = 1;
      }
      this.data.content.options[index].points = 10;
    } else {
      this.ansCounter--;
      this.data.content.options[index].points = -10;
    }
  }

  updateContent() {
    let counter = 0;
    if (this.data.content.subject === '' || this.data.content.body === '') {
      this.translateService.get('content.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    if (this.displayAnswers.length === 0) {
      this.translateService.get('content.need-answers').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    for (let i = 0; i < this.data.content.options.length; i++) {
      if (this.displayAnswers[i].answerOption.label === '') {
        this.translateService.get('content.no-empty2').subscribe(message => {
          this.notificationService.show(message);
        });
        return;
      }
      if (this.data.content.options[i].points > 0) {
        counter++;
      }
    }
    if (counter <= 0) {
      if (this.data.content.multiple) {
        this.translateService.get('content.at-least-one').subscribe(message => {
          this.notificationService.show(message);
          return;
        });
      } else {
        this.translateService.get('content.select-one').subscribe(message => {
          this.notificationService.show(message);
          return;
        });
      }
    } else {
      if ((!this.data.content.multiple) && counter > 1) {
        this.translateService.get('content.select-one').subscribe(message => {
          this.notificationService.show(message);
        });
        return;
      }
      this.dialogRef.close('update');
      return;
    }
  }
}
