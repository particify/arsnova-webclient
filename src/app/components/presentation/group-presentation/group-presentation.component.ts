import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-presentation',
  templateUrl: './group-presentation.component.html',
  styleUrls: ['./group-presentation.component.scss']
})
export class GroupPresentationComponent implements OnInit {

  @Input() groupChanged: EventEmitter<string> = new EventEmitter<string>();
  shortId: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.shortId = params['shortId'];
    });
  }

}
