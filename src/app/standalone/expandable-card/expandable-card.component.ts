import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-expandable-card',
  imports: [MatCard, MatIcon, NgStyle],
  templateUrl: './expandable-card.component.html',
  styleUrl: './expandable-card.component.scss',
})
export class ExpandableCardComponent implements AfterViewInit {
  expanded = false;
  isExpandable = true;
  isLoading = true;

  readonly COLLAPSED_HEIGHT = 72;

  @ViewChild('contentWrapper') contentWrapper?: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      const content = this.contentWrapper?.nativeElement;
      if (content) {
        const actualHeight = content.scrollHeight;
        this.isExpandable = actualHeight > this.COLLAPSED_HEIGHT;
      }
      this.isLoading = false;
    });
  }

  toggleExpanded() {
    if (this.isExpandable) {
      this.expanded = !this.expanded;
    }
  }
}
