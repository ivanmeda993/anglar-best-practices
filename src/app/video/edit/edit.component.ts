import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import IClip from '../../models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();
  alertMsg = 'Title is updating...';
  alertColor = 'blue';
  showAlert = false;
  clipId = new FormControl('', [Validators.required]);
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  uploadForm = new FormGroup({
    id: this.clipId,
    title: this.title,
  });
  inSubmission = false;

  constructor(
    private modalService: ModalService,
    private clipService: ClipService
  ) {}

  ngOnInit(): void {
    this.modalService.registerModal('editClip');
  }

  ngOnDestroy() {
    this.modalService.unregisterModal('editClip');
  }

  ngOnChanges() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = false;
    this.showAlert = false;
    // @ts-ignore
    this.clipId.setValue(this.activeClip.docId);
    this.title.setValue(this.activeClip.title);
  }

  async changeTitle() {
    if (!this.activeClip) return;
    this.showAlert = true;
    this.inSubmission = true;
    this.alertMsg = 'Title is updating...';
    this.alertColor = 'blue';
    try {
      await this.clipService.editClipTitle(
        this.clipId.value as string,
        this.title.value as string
      );
    } catch (e) {
      this.alertMsg = 'Something went wrong';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.inSubmission = false;
    this.alertMsg = 'Title updated';
    this.alertColor = 'green';
    this.activeClip.title = this.title.value as string;
    this.update.emit(this.activeClip);
    setTimeout(() => {
      this.showAlert = false;
      this.modalService.toggleModal('editClip');
    }, 1000);
  }
}
