import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';

export class DetailedRadioGroup {
  value: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;

  constructor(
    value: string,
    title: string,
    description: string,
    icon?: string,
    color?: string
  ) {
    this.value = value;
    this.title = title;
    this.description = description;
    this.icon = icon;
    this.color = color;
  }
}

@Component({
  selector: 'app-detail-radio-group',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    FlexModule,
    FlexLayoutModule,
  ],
  templateUrl: './detail-radio-group.component.html',
  styleUrl: './detail-radio-group.component.scss',
})
export class DetailRadioGroupComponent implements OnInit {
  @Input({ required: true }) items!: DetailedRadioGroup[];
  @Output() itemValueChanged = new EventEmitter<string>();

  selectedItemValue?: string;

  ngOnInit(): void {
    this.selectedItemValue = this.items[0].value;
  }
}
