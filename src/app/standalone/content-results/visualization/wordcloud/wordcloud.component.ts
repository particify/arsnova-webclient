import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';

import Wordcloud from 'd3-cloud';

import { timer } from 'rxjs';

import { WordcloudItem } from './wordcloud-item';
import { VisualizationData } from '@app/standalone/content-results/visualization/visualization-data';
import { TranslocoPipe } from '@jsverse/transloco';

const TARGET_FONT_SIZE = 50;
const RENDER_WIDTH = 800;
const RATIO = 16 / 9;
const ZOOM_EFFECT = 'zoom-effect';

@Component({
  selector: 'app-wordcloud',
  standalone: true,
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
export class WordcloudComponent {
  data = input.required<VisualizationData>();

  readonly words = computed(() =>
    this.data().labels.map((label, index) => ({
      text: label,
      size: this.data().datasets[0]?.values[index] ?? 0,
    }))
  );
  readonly rotateWords = input(false);
  readonly elementRef = viewChild<ElementRef<SVGGraphicsElement>>('wordcloud');
  readonly renderedWords = signal<Wordcloud.Word[]>([]);
  readonly width = RENDER_WIDTH;
  readonly height = RENDER_WIDTH / RATIO;
  readonly scale = signal(1.2);
  readonly scaleOffsetX = signal(0);
  readonly scaleOffsetY = signal(0);
  readonly wordColorIndexes = signal<string[]>([]);
  private readonly fontFamily = getComputedStyle(document.body).fontFamily;

  constructor() {
    effect(() => {
      const svg = this.elementRef()?.nativeElement;
      if (!svg) {
        return;
      }
      const words = this.words();
      if (words && words.length > 0) {
        setTimeout(() => {
          this.updateColorIndex(words);
          this.updateWordcloud(words);
        });
      }
    });
  }

  readonly max = computed(() =>
    Math.max(...this.words().map((w) => w.size), 0)
  );

  color(word?: string) {
    if (word) {
      const colors = this.data().datasets[0].colors;
      if (colors) {
        const index = this.wordColorIndexes().indexOf(word);
        return colors[index % colors.length];
      }
    }
  }

  trackWord(_: number, word: Wordcloud.Word) {
    return word?.text;
  }

  private updateColorIndex(words: WordcloudItem[]) {
    const current = words.map((w) => w.text);
    const wordColorIndexes = this.wordColorIndexes();
    const newWords = current.filter((word) => !wordColorIndexes.includes(word));
    const newIndexes = wordColorIndexes
      .map((word) => (current.includes(word) ? word : newWords.pop() || ''))
      .concat(newWords);
    this.wordColorIndexes.set(newIndexes);
  }

  private updateWordcloud(words: WordcloudItem[]) {
    const max = this.max();
    const reduceScale = words.every((w) => w.size === 1) && words.length > 8;
    Wordcloud()
      .size([this.width, this.height])
      .words(words)
      .rotate((d: Wordcloud.Word) => this.getRotation(d, max))
      .font(this.fontFamily)
      .fontSize((d: Wordcloud.Word) => this.fontSize(d, reduceScale))
      .on('end', (d: Wordcloud.Word[]) => {
        this.determineScaling();
        return this.renderedWords.set(d);
      })
      .start();
  }

  private determineScaling() {
    const svg = this.elementRef()?.nativeElement;
    if (!svg) {
      return;
    }
    svg.classList.remove(ZOOM_EFFECT);
    timer(500).subscribe(() => {
      svg.classList.add(ZOOM_EFFECT);
      const bounds = svg.getBBox();
      const marginX0 = this.width / 2 + bounds.x;
      const marginX1 = this.width / 2 - bounds.x - bounds.width;
      const marginY0 = this.height / 2 + bounds.y;
      const marginY1 = this.height / 2 - bounds.y - bounds.height;
      this.scaleOffsetX.set((marginX1 - marginX0) / 2);
      this.scaleOffsetY.set((marginY1 - marginY0) / 2);
      const scaleX = this.width / bounds.width;
      const scaleY = this.height / bounds.height;
      this.scale.set(Math.max(Math.min(scaleX, scaleY, 4), 0.5));
    });
  }

  private fontSize(word: Wordcloud.Word, reduceScale: boolean) {
    let factor =
      Math.log2((word.size as number) + 1) / Math.log2(this.max() + 1);
    if (reduceScale) {
      factor *= 0.65;
    }
    if (factor >= 0.6 && word.text && word.text.length >= 20) {
      factor *= Math.pow(0.95, word.text.length - 20);
    }
    return TARGET_FONT_SIZE * factor;
  }

  private getRotation(word: Wordcloud.Word, maxCount: number) {
    if (
      !this.rotateWords() ||
      word.size === maxCount ||
      (word.text && word.text.length >= 10)
    ) {
      return 0;
    }
    return Math.random() > 0.5 ? 90 : 0;
  }
}
