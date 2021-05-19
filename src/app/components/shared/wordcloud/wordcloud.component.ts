import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as WordCloud from 'wordcloud';

const TARGET_FONT_SIZE = 120;
const RENDER_WIDTH = 1600;
const RENDER_HEIGHT = 900;

export enum WordcloudMode {
  DEFAULT,
  PLAYFUL,
  BORING
}

type WordCloudOptions = WordCloud.Options & {
  rotationSteps? : number;
  shrinkToFit? : boolean;
};

@Component({
  selector: 'app-wordcloud',
  template: `<canvas #wordcloud width="${RENDER_WIDTH}" height="${RENDER_HEIGHT}" fxFlexFill>`
})
export class WordcloudComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() wordWeights: [string, number][];
  @Input() mode = WordcloudMode.DEFAULT;
  @ViewChild('wordcloud') elementRef: ElementRef<HTMLCanvasElement>;

  presets: WordCloudOptions = {}

  ngOnInit() {
    // Determine theme CSS so we can avoid to hard code styles here.
    const bodyStyle = getComputedStyle(document.body);
    this.presets.weightFactor = weight => weight * TARGET_FONT_SIZE;
    this.presets.shrinkToFit = true;
    this.presets.backgroundColor = 'transparent';
    switch(this.mode) {
      case WordcloudMode.PLAYFUL:
        // A cursive font is used and words can be rotated by any angle in the
        // range of -90 to 90 degrees.
        this.presets.fontFamily = 'cursive, ' + bodyStyle.fontFamily;
        this.presets.rotateRatio = 1 / 3;
        break;
      case WordcloudMode.BORING:
        // The default font is used and words are never rotated.
        this.presets.fontFamily = bodyStyle.fontFamily;
        this.presets.rotateRatio = 0;
        break;
      default:
        // The default font is used and words can be rotated by exactly +90 or
        // -90 degrees.
        this.presets.fontFamily = bodyStyle.fontFamily;
        this.presets.rotateRatio = 0.5;
        this.presets.rotationSteps = 2;
        break;
    }
  }

  ngAfterViewInit() {
    this.updateGridSize();
  }

  ngOnChanges() {
    if (this.elementRef) {
      this.updateWordcloud();
    }
  }

  updateWordcloud() {
    if (!this.presets.gridSize) {
      // ngAfterViewInit might not have set the grid size correctly.
      this.updateGridSize();
    }
    const options: WordCloud.Options & { rotationSteps? : number } = {
      list: this.normalizedWeights(),
      ...this.presets
    }
    if (this.mode === WordcloudMode.DEFAULT) {
    }
    WordCloud(this.elementRef.nativeElement, options);
  }

  normalizedWeights(): [string, number][] {
    const maxWeight = this.wordWeights.map(w => w[1]).reduce((a, b) => Math.max(a, b));
    return this.wordWeights.map(w => [w[0], w[1] / maxWeight]);
  }

  scaleFactor(): number {
    const maxWeight = this.wordWeights.map(w => w[1]).reduce((a, b) => Math.max(a, b));
    return TARGET_FONT_SIZE / maxWeight;
  }

  updateGridSize() {
    const elementStyle = getComputedStyle(this.elementRef.nativeElement);
    const renderingRatio = RENDER_WIDTH / parseInt(elementStyle.width);
    this.presets.gridSize = 20 * renderingRatio;
  }
}
