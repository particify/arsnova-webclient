import { Component, OnInit } from '@angular/core';
import { TextContent } from '../text-content';

@Component({
  selector: 'app-participant-text-content',
  templateUrl: './participant-text-content.component.html',
  styleUrls: ['./participant-text-content.component.scss']
})
export class ParticipantTextContentComponent implements OnInit {

  content: TextContent = new TextContent('1',
    '1',
    '1',
    'Text Content 1',
    'This is the body of Text Content 1',
    1);

  constructor() {
  }

  ngOnInit() {
  }

  submit(answer: string) {
  }

}
