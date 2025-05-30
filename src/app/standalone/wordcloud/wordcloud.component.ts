import {
  booleanAttribute,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
  inject,
} from '@angular/core';
import Wordcloud from 'd3-cloud';
import { Subscription, timer } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '@app/core/theme/theme.service';

// Font size was reduced from 60 to avoid dropped words
const TARGET_FONT_SIZE = 50;
const RENDER_WIDTH = 800;
const RATIO = 16 / 9;
const ZOOM_EFFECT = 'zoom-effect';

export class WordCloudItem {
  text: string;
  size: number;

  constructor(text: string, size: number) {
    this.text = text;
    this.size = size;
  }
}

@Component({
  selector: 'app-wordcloud',
  templateUrl: './wordcloud.component.svg',
  styles: [
    'svg text { transition: all 0.5s ease-in-out }',
    `
      svg g.${ZOOM_EFFECT} {
        transition: all 0.5s ease-in-out;
      }
    `,
  ],
  imports: [TranslocoPipe],
})
export class WordcloudComponent implements OnChanges {
  private themeService = inject(ThemeService);

  @Input({ required: true }) wordWeights!: WordCloudItem[];
  @Input({ transform: booleanAttribute }) rotateWords?: boolean;
  @ViewChild('wordcloud') elementRef!: ElementRef<SVGGeometryElement>;

  width: number = RENDER_WIDTH;
  height: number = RENDER_WIDTH / RATIO;
  scale = 1.2;
  scaleOffsetX = 0;
  scaleOffsetY = 0;
  renderedWords: Wordcloud.Word[] = [];
  fontFamily: string;
  wordColorIndexes: string[] = [];

  private timerSubscription?: Subscription;

  constructor() {
    // Determine theme CSS so we can avoid to hard code styles here.
    const bodyStyle = getComputedStyle(document.body);
    this.fontFamily = bodyStyle.fontFamily;
  }

  ngOnChanges() {
    // Sorting is not required but leads to a consistent color order based on
    // word frequency for the initially rendered cloud.
    this.wordWeights.sort((a, b) => b.size - a.size);
    this.updateColorIndex();
    this.updateWordcloud();
  }

  /**
   * Updates the color indexes assigned to words and ensures that already
   * existing color index assignments for words do not change.
   */
  updateColorIndex() {
    const updatedWords = this.wordWeights.map((ww) => ww.text);
    const newWords = updatedWords.filter(
      (word) => !this.wordColorIndexes.includes(word)
    );
    this.wordColorIndexes = this.wordColorIndexes
      .map((word) =>
        updatedWords.includes(word) ? word : newWords.pop() || ''
      )
      .concat(newWords);
  }

  updateWordcloud() {
    const max = this.max();
    // Reduce scale if there are more than 8 words and no duplicates
    const reduceScale =
      this.wordWeights.every((w) => w.size === 1) &&
      this.wordWeights.length > 8;
    Wordcloud()
      .size([this.width, this.height])
      .words(this.wordWeights.map((d) => ({ text: d.text, size: d.size })))
      .padding(4)
      .rotate((d: Wordcloud.Word) => this.getRotation(d, max))
      .font(this.fontFamily)
      .fontSize((d: Wordcloud.Word) => this.fontSize(d, reduceScale))
      .on('end', (d: Wordcloud.Word[]) => {
        this.determineScaling();
        return (this.renderedWords = d);
      })
      .start();
  }

  wordIdentity(index: number, word: Wordcloud.Word) {
    return word?.text;
  }

  color(word?: string) {
    if (word) {
      const colors = this.themeService.getAltTextColors();
      const index = this.wordColorIndexes.indexOf(word);
      return colors[index % colors.length];
    }
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

  /* Calculates the font size based on word frequency (logarithmical). The font
   * size is reduced for long words (> 20 chars) if they would otherwise be
   * rendered with a large font size to ensure they will fit the canvas. */
  private fontSize(word: Wordcloud.Word, reduceScale: boolean) {
    let factor =
      Math.log2((word.size as number) + 1) / Math.log2(this.max() + 1);
    if (reduceScale) {
      factor *= 0.65;
    }
    factor *=
      factor >= 0.6 && word.text && word.text.length >= 20
        ? Math.pow(0.95, word.text?.length - 20)
        : 1;
    return TARGET_FONT_SIZE * factor;
  }

  private max() {
    return this.wordWeights
      .map((w) => w.size)
      .reduce((a, b) => Math.max(a, b), 0);
  }

  /* Determinates the rotation of a word in degree. This should be set to 0
   * if rotation is disabled, it's the most common word or word size is larger than 10.
   * Otherwise 50% of the words should be rotated by 90 degrees.
  . */
  private getRotation(word: Wordcloud.Word, maxCount: number): number {
    return !this.rotateWords ||
      word.size === maxCount ||
      (word.text && word.text.length >= 10)
      ? 0
      : Math.random() > 0.5
        ? 90
        : 0;
  }
}
