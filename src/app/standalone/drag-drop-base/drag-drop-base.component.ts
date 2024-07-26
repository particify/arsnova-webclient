import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatListItem } from '@angular/material/list';

@Component({
  selector: 'app-drag-drop-base',
  template: '',
  standalone: true,
})
export class DragDropBaseComponent {
  @ViewChildren('sortListItem') listItems!: QueryList<ElementRef | MatListItem>;

  dragDroplist: object[] = [];
  selectedSortItem?: number;

  drop(previousIndex: number, currentIndex: number) {
    this.moveItem(previousIndex, currentIndex);
  }

  moveAnswer(event: KeyboardEvent, answerIndex: number) {
    let nextIndex = answerIndex;
    if (event.key === 'ArrowDown' && nextIndex < this.dragDroplist.length - 1) {
      nextIndex += 1;
    }
    if (event.key === 'ArrowUp' && nextIndex > 0) {
      nextIndex -= 1;
    }
    if (answerIndex !== nextIndex) {
      this.moveItem(answerIndex, nextIndex);
      setTimeout(() => {
        this.setFocus();
      }, 0);
    }
  }

  moveItem(currentIndex: number, nextIndex: number) {
    const currentItem = this.listItems.toArray()[currentIndex];
    if (currentItem instanceof ElementRef) {
      currentItem.nativeElement.focus();
    } else if (currentItem instanceof MatListItem) {
      currentItem._elementRef.nativeElement.focus();
    }
    moveItemInArray(this.dragDroplist, currentIndex, nextIndex);
    this.selectedSortItem = nextIndex;
  }

  setFocus() {
    if (this.selectedSortItem !== undefined) {
      const selectedItem = this.listItems.toArray()[this.selectedSortItem];
      if (selectedItem instanceof ElementRef) {
        selectedItem.nativeElement.focus();
      } else if (selectedItem instanceof MatListItem) {
        selectedItem._elementRef.nativeElement.focus();
      }
    }
  }
}
