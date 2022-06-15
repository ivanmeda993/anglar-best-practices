import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({
      log: true,
    });
  }

  async init() {
    if (this.isReady) return;
    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true;
    const data = await fetchFile(file);

    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = ['01', '05', '09'];
    const commands: string[] = [];
    seconds.forEach((sec) => {
      commands.push(
        //  Input file
        '-i',
        file.name,
        //  Output options
        '-ss',
        `00:00:${sec}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=610:-1',
        //  Output file
        `img_${sec}.png`
      );
    });
    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];
    seconds.forEach((sec) => {
      const screenshot = this.ffmpeg.FS('readFile', `img_${sec}.png`);
      const blob = new Blob([screenshot.buffer], { type: 'image/png' });
      screenshots.push(URL.createObjectURL(blob));
    });
    this.isRunning = false;
    return screenshots;
  }

  async blobFromUrl(url: string) {
    const response = await fetch(url);
    return await response.blob();
  }
}
