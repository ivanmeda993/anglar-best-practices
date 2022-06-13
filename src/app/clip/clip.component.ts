import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
})
export class ClipComponent implements OnInit {
  id = '';
  userClips: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ id }: Params) => {
      this.id = id;
    });
    this.onActivate();
  }

  onActivate() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 10);
  }
}
