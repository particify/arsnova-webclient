import { Component, Input, OnInit } from '@angular/core';
import { EventService } from '../../../services/util/event.service';

@Component({
  selector: 'app-answer-count',
  templateUrl: './answer-count.component.html',
  styleUrls: ['./answer-count.component.scss']
})
export class AnswerCountComponent implements OnInit {

  @Input() count: number;
  @Input() size: string;
  @Input() visible = true;

  controlBar = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.on<boolean>('ControlBarVisible').subscribe(isVisible => {
      this.controlBar = isVisible;
    });
  }
}
