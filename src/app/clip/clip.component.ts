import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClipService } from '../services/clip.service';
import videojs from 'video.js';
import IClip from '../models/clip.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: videojs.Player;
  clip?: IClip;

  constructor(private route: ActivatedRoute, public clipService: ClipService) {}

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.route.data.subscribe((data) => {
      this.clip = data.clip as IClip;
      this.player?.src({
        src: this.clip?.url,
        type: 'video/mp4',
      });
      this.player?.play();
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
