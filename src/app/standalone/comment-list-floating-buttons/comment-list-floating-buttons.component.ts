import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FlexModule,
    TranslocoModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  selector: 'app-comment-list-floating-buttons',
  templateUrl: './comment-list-floating-buttons.component.html',
  styleUrls: ['./comment-list-floating-buttons.component.scss'],
})
export class CommentListFloatingButtonsComponent implements OnInit {
  @Input() showAddButton = false;
  @Input() addButtonDisabled = false;
  @Input() showScrollButton = false;
  @Input() showScrollToNewPostsButton = false;
  @Input() navBarExists = false;

  @Output() scrollTopClicked = new EventEmitter<void>();
  @Output() loadAndScrollClicked = new EventEmitter<void>();
  @Output() createClicked = new EventEmitter<void>();

  onInit = false;

  ngOnInit(): void {
    this.onInit = true;
  }

  scrollTop() {
    this.scrollTopClicked.emit();
  }

  loadAndScroll() {
    this.loadAndScrollClicked.emit();
  }

  create() {
    this.createClicked.emit();
  }
}
