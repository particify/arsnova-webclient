import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DisplayAnswer } from '../../../creator/content-choice-creator/content-choice-creator.component';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../services/util/notification.service';
import { EventService } from '../../../../services/util/event.service';

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
              public dialogRef: MatDialogRef<ContentEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ContentChoice,
              public eventService: EventService) {
  }

  ngOnInit() {
    for (let i = 0; i < this.data.options.length; i++) {
      let correct: boolean;
      correct = this.data.options[i].points > 0;
      this.displayAnswers[i] = new DisplayAnswer(new AnswerOption(this.data.options[i].label,
        this.data.options[i].points), correct);
    }
  }

  updateAnswer(index: number) {
    if (this.displayAnswers[index].correct === true) {
      this.ansCounter++;
      if ((!this.data.multiple) && this.ansCounter > 1) {
        for (let i = 0; i < this.displayAnswers.length; i++) {
          if (!(i === index)) {
            this.displayAnswers[i].correct = false;
            this.data.options[i].points = -10;
          }
        }
        this.ansCounter = 1;
      }
      this.data.options[index].points = 10;
    } else {
      this.ansCounter--;
      this.data.options[index].points = -10;
    }
  }

  updateContent() {
    let counter = 0;
    if (this.data.subject === '' || this.data.body === '') {
      this.translateService.get('dialog.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    for (let i = 0; i < this.data.options.length; i++) {
      if (this.displayAnswers[i].answerOption.label === '') {
        this.translateService.get('dialog.no-empty-answers').subscribe(message => {
          this.notificationService.show(message);
        });
        return;
      }
      if (this.data.options[i].points > 0) {
        counter++;
      }
    }
    if (counter <= 0) {
      if (this.data.multiple) {
        this.translateService.get('dialog.at-least-one').subscribe(message => {
          this.notificationService.show(message);
          return;
        });
      } else {
        this.translateService.get('dialog.select-one').subscribe(message => {
          this.notificationService.show(message);
          return;
        });
      }
    } else {
      if ((!this.data.multiple) && counter > 1) {
        this.translateService.get('dialog.select-one').subscribe(message => {
          this.notificationService.show(message);
        });
        return;
      }
      this.dialogRef.close('update');
      return;
    }
  }
}
