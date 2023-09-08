import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-series-page',
  templateUrl: './series-page.component.html',
  styleUrls: ['./series-page.component.scss'],
})
export class SeriesPageComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit(): void {
    console.log('onInit');
    // TODO
  }

  ngOnDestroy(): void {
    console.log('onDestroy');
    // TODO
  }
}
