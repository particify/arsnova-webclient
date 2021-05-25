import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import * as Wordcloud from 'd3-cloud';
import { Subscription, timer } from 'rxjs';

const TARGET_FONT_SIZE = 80;
const RENDER_WIDTH = 800;
const RATIO = 16 / 9;
const ZOOM_EFFECT = 'zoom-effect';

@Component({
  selector: 'app-wordcloud',
  templateUrl: './wordcloud.component.svg',
  styles: [
    'svg text { transition: all 0.5s ease-in-out }',
    `svg g.${ZOOM_EFFECT} { transition: all 0.5s ease-in-out }`
  ]
})
export class WordcloudComponent implements OnChanges {
  @Input() wordWeights: [string, number][];
  @ViewChild('wordcloud') elementRef: ElementRef<SVGGeometryElement>;

  width: number = RENDER_WIDTH;
  height: number = RENDER_WIDTH / RATIO;
  scale = 1.2;
  scaleOffsetX = 0;
  scaleOffsetY = 0;
  renderedWords = [];
  fontFamily: string;

  private canvas = document.createElement('canvas');
  private timerSubscription: Subscription;

  constructor() {
    // Determine theme CSS so we can avoid to hard code styles here.
    const bodyStyle = getComputedStyle(document.body);
    this.fontFamily = bodyStyle.fontFamily;
  }

  ngOnChanges() {
    if (this.wordWeights.length > 0) {
      this.updateWordcloud();
    }
  }

  updateWordcloud() {
    const scaleFactor = this.scaleFactor();
    const max = this.max();
    Wordcloud()
        .size([this.width, this.height])
        .canvas(this.canvas)
        .words(this.wordWeights.map(d => ({ text: d[0], size: d[1] })))
        .padding(4)
        .rotate(d => (d.size === max) ? 0 : ~~(Math.random() * 2) * 90)
        .font(this.fontFamily)
        .fontSize(d => d.size * scaleFactor)
        .on('end', d => {
          this.determineScaling();
          return this.renderedWords = d;
        })
        .start();
  }

  wordIdentity(index: number, word: any) {
    return word?.text;
  }

  color(i: number) {
    // TODO: Move color palette to theme service.
    const colors = ['#027db9', '#eb0054', '#4d8076', '#9f6b3f', '#8e79ab', '#e64a19', '#787b1d'];
    return colors[i % colors.length];
  }

  /* Calculates the scale based on the bounding box of the word cloud so that
   * it just fits into the view port. The scale factor is chosen between 0.5 and
   * 2. The word cloud is not moved, so there might still be margins left if it
   * is not centered. */
  private determineScaling() {
    this.timerSubscription?.unsubscribe();
    this.elementRef?.nativeElement.classList.remove(ZOOM_EFFECT);
    this.timerSubscription = timer(500).subscribe(() => {
      this.elementRef.nativeElement.classList.add(ZOOM_EFFECT);
      const boundaries = this.elementRef.nativeElement.getBBox();
      const marginX0 = this.width / 2 + boundaries.x;
      const marginX1 = this.width / 2 - boundaries.x - boundaries.width;
      const marginY0 = this.height / 2 + boundaries.y;
      const marginY1 = this.height / 2 - boundaries.y - boundaries.height;
      this.scaleOffsetX = (marginX1 - marginX0) / 2;
      this.scaleOffsetY = (marginY1 - marginY0) / 2;
      const scaleX = this.width / boundaries.width;
      const scaleY = this.height / boundaries.height;
      this.scale = Math.max(Math.min(scaleX, scaleY, 4), 0.5);
    });
  }

  private max() {
    return this.wordWeights.map(w => w[1]).reduce((a, b) => Math.max(a, b), 0);
  }

  private scaleFactor(): number {
    return TARGET_FONT_SIZE / this.max();
  }
}
