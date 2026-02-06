import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-hover-dropdown',
  templateUrl: './hover-dropdown.component.html',
  styleUrls: ['./hover-dropdown.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
          display: 'none',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          display: 'block',
        })
      ),
      transition('hidden => visible', [animate('300ms ease-in')]),
      transition('visible => hidden', [animate('300ms ease-out')]),
    ]),
  ],
})
export class HoverDropdownComponent {
  showDropdown = false;

  get dropdownState() {
    return this.showDropdown ? 'visible' : 'hidden';
  }
}
