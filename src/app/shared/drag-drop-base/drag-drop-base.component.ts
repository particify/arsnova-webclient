import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-drag-drop-base',
  template: '',
})
export class DragDropBaseComponent {
  @ViewChildren('sortListItem') listItems: QueryList<ElementRef>;

  dragDroplist: object[] = [];
  selectedSortItem: number;

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
    this.moveItem(answerIndex, nextIndex);
    setTimeout(() => {
      this.setFocus();
    }, 0);
  }

  moveItem(currentIndex: number, nextIndex: number) {
    this.listItems.toArray()[currentIndex].nativeElement.blur();
    moveItemInArray(this.dragDroplist, currentIndex, nextIndex);
    this.selectedSortItem = nextIndex;
  }

  setFocus() {
    this.listItems.toArray()[this.selectedSortItem].nativeElement.focus();
  }
}
