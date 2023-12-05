import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [CommonModule, FlexModule, TranslocoModule],
  selector: 'app-answer-count',
  templateUrl: './answer-count.component.html',
  styleUrls: ['./answer-count.component.scss'],
})
export class AnswerCountComponent implements OnInit {
  @Input({ required: true }) count!: number;
  @Input() size?: string;

  controlBar = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService
      .on<boolean>('ControlBarVisible')
      .subscribe((isVisible) => {
        this.controlBar = isVisible;
      });
  }
}
