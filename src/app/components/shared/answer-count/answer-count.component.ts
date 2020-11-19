import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-answer-count',
  templateUrl: './answer-count.component.html',
  styleUrls: ['./answer-count.component.scss']
})
export class AnswerCountComponent implements OnInit {

  @Input() count: number;
  @Input() size: string;
  @Input() horizontal: boolean;

  constructor() { }

  ngOnInit(): void {
  }
}
