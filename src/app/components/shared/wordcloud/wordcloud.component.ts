import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import * as Wordcloud from 'd3-cloud';

const TARGET_FONT_SIZE = 160;
const RENDER_WIDTH = 1600;
const RATIO = 16 / 9;

@Component({
  selector: 'app-wordcloud',
  templateUrl: './wordcloud.component.svg',
  styles: ['svg text { transition: all .5s ease-in-out }']
})
export class WordcloudComponent implements OnChanges {
  @Input() wordWeights: [string, number][];
  @ViewChild('wordcloud') elementRef: ElementRef<SVGElement>;

  width: number = RENDER_WIDTH;
  height: number = RENDER_WIDTH / RATIO;
  renderedWords = [];
  fontFamily: string;

  private canvas = document.createElement('canvas');

  constructor() {
    // Determine theme CSS so we can avoid to hard code styles here.
    const bodyStyle = getComputedStyle(document.body);
    this.fontFamily = bodyStyle.fontFamily;
  }

  ngOnChanges() {
    this.updateWordcloud();
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
        .on('end', d => this.renderedWords = d )
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

  private max() {
    return this.wordWeights.map(w => w[1]).reduce((a, b) => Math.max(a, b), 0);
  }

  private scaleFactor(): number {
    return TARGET_FONT_SIZE / this.max();
  }
}
