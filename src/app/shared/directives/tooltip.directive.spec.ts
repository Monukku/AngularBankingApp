import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

@Component({
  template: `<div appTooltip="Test tooltip">Hover me</div>`,
})
class TestComponent {}

describe('TooltipDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TooltipDirective, TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.query(By.directive(TooltipDirective));
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should show tooltip on mouseenter', () => {
    debugElement.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();

    const tooltip = Array.from(document.body.querySelectorAll('span'))
      .find(el => el.textContent === 'Test tooltip');
    expect(tooltip).toBeTruthy();

    debugElement.triggerEventHandler('mouseleave', null);
    fixture.detectChanges(); // flushes the animation renderer's pending removal
    expect(tooltip!.isConnected).toBeFalse();
  });
});
