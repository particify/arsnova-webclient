import { Component } from '@angular/core';

class GroupStatus {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

@Component({
  selector: 'app-statistic-help',
  templateUrl: './statistic-help.component.html',
  styleUrls: ['./statistic-help.component.scss']
})

export class StatisticHelpComponent {

  chips: GroupStatus[] = [
    new GroupStatus('good', ' > 85 % '),
    new GroupStatus('okay', ' >= 50 % '),
    new GroupStatus('negative',  '< 50 %'),
  ];

  constructor() {
  }
}
