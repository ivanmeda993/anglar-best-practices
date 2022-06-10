import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-event-blocker]',
  host: {},
})
//Stop browser from opening links in new tab
export class EventBlockerDirective {
  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleEvent($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
  }
}
