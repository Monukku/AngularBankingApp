import { Injectable } from '@angular/core';

export interface BrandAnimState {
  brandLetters: { char: string; visible: boolean }[];
  taglineLetters: { char: string; visible: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class BrandAnimationService {
  buildLetters(text: string): { char: string; visible: boolean }[] {
    return text.split('').map(char => ({ char, visible: false }));
  }

  startLoop(
    brandLetters: { char: string; visible: boolean }[],
    taglineLetters: { char: string; visible: boolean }[],
    timeouts: ReturnType<typeof setTimeout>[],
    onTick: () => void
  ): void {
    this.typeIn(brandLetters, 100, onTick, timeouts, () => {
      const t1 = setTimeout(() => {
        this.spiralIn(taglineLetters, onTick, timeouts, () => {
          const t2 = setTimeout(() => {
            this.deleteOut(taglineLetters, 40, onTick, timeouts, () => {
              this.deleteOut(brandLetters, 60, onTick, timeouts, () => {
                const t3 = setTimeout(() => this.startLoop(brandLetters, taglineLetters, timeouts, onTick), 600);
                timeouts.push(t3);
              });
            });
          }, 2500);
          timeouts.push(t2);
        });
      }, 200);
      timeouts.push(t1);
    });
  }

  private typeIn(
    letters: { char: string; visible: boolean }[],
    delay: number,
    onTick: () => void,
    timeouts: ReturnType<typeof setTimeout>[],
    done: () => void
  ): void {
    letters.forEach((l, i) => {
      const t = setTimeout(() => {
        l.visible = true;
        onTick();
        if (i === letters.length - 1) done();
      }, i * delay);
      timeouts.push(t);
    });
  }

  private spiralIn(
    letters: { char: string; visible: boolean }[],
    onTick: () => void,
    timeouts: ReturnType<typeof setTimeout>[],
    done: () => void
  ): void {
    const len = letters.length;
    const mid = Math.floor(len / 2);
    const order: number[] = [];
    for (let i = 0; i <= mid; i++) {
      if (mid - i >= 0) order.push(mid - i);
      if (mid + i < len && i !== 0) order.push(mid + i);
    }
    order.forEach((idx, step) => {
      const t = setTimeout(() => {
        letters[idx].visible = true;
        onTick();
        if (step === order.length - 1) done();
      }, step * 60);
      timeouts.push(t);
    });
  }

  private deleteOut(
    letters: { char: string; visible: boolean }[],
    delay: number,
    onTick: () => void,
    timeouts: ReturnType<typeof setTimeout>[],
    done: () => void
  ): void {
    const reversed = letters.slice().reverse();
    reversed.forEach((l, i) => {
      const t = setTimeout(() => {
        l.visible = false;
        onTick();
        if (i === reversed.length - 1) done();
      }, i * delay);
      timeouts.push(t);
    });
  }

  clearTimeouts(timeouts: ReturnType<typeof setTimeout>[]): void {
    timeouts.forEach(t => clearTimeout(t));
    timeouts.length = 0;
  }
}
