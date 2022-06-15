import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from '../../services/clip.service';
import { FfmpegService } from '../../services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  isUploading = false;
  alertMessage = "'File uploading...'";
  alertColor = 'blue';
  inSubmission = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenshotTask?: AngularFireUploadTask;
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  uploadForm = new FormGroup({
    title: this.title,
  });
  screenshots: string[] = [];
  selectedScreenshot = '';

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private clipService: ClipService,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy() {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) return;
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;
    console.log(this.file);
    if (!this.file || this.file.type !== 'video/mp4') {
      return alert('Please drop a valid mp4 file');
    }
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^.]+$/, ''));

    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.isUploading = true;
    this.alertMessage = 'File uploading...';
    this.alertColor = 'blue';
    this.inSubmission = true;
    const fileName = uuid();
    const filePath = `clips/${fileName}.mp4`;
    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${fileName}.png`;
    const clipRef = this.storage.ref(filePath);
    const screenshotRef = this.storage.ref(screenshotPath);

    this.task = this.storage.upload(filePath, this.file);
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((percentage) => {
      const [taskPercentage, screenshotPercentage] = percentage.values();
      if (!taskPercentage || !screenshotPercentage) return;
      const totalPercentage = (taskPercentage + screenshotPercentage) / 2;
      this.alertMessage = `File uploading... ${totalPercentage?.toFixed()}%`;
    });
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${fileName}.mp4`,
            url: clipUrl,
            screenshotUrl: screenshotUrl,
            screenshotFileName: `${fileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          console.log(clip);

          const clipDocRef = await this.clipService.crateClip(clip);

          this.alertMessage = 'File uploaded successfully';
          this.alertColor = 'green';

          this.inSubmission = false;
          this.file = null;
          setTimeout(() => {
            this.isUploading = false;
            this.title.setValue('');
            this.nextStep = false;
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (err) => {
          this.uploadForm.enable();
          this.alertMessage = 'File upload failed';
          this.alertColor = 'red';
          this.isUploading = false;
          this.inSubmission = false;
          console.log(err.message);
        },
      });
  }

  cancelUpload() {
    this.isUploading = false;
    this.inSubmission = false;
    this.file = null;
    this.title.setValue('');
    this.nextStep = false;
  }

  changeThumbnail(screenshot: string) {
    this.selectedScreenshot = screenshot;
  }
}
