import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCounter]',
  standalone: true,
})
export class CounterDirective implements OnChanges, OnDestroy {
  @Input('appCounter') value = 0;
  @Input() duration = 2000;

  private frameId?: number;

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnChanges(): void {
    this.cancel();
    const target = Number(this.value) || 0;
    const isInt = Number.isInteger(target);
    const start = performance.now();

    // run outside Angular so the animation doesn't trigger change detection every frame
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const p = Math.min((now - start) / this.duration, 1);
        const eased = 0.5 - Math.cos(p * Math.PI) / 2; // same feel as jQuery "swing"
        const current = target * eased;
        this.el.nativeElement.textContent = isInt
          ? String(Math.floor(current))
          : current.toFixed(1).replace('.', ',');
        if (p < 1) {
          this.frameId = requestAnimationFrame(tick);
        } else {
          this.el.nativeElement.textContent = isInt ? String(target) : target.toFixed(1).replace('.', ',');
        }
      };
      this.frameId = requestAnimationFrame(tick);
    });
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  private cancel(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}