import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollections: AngularFirestoreCollection<IClip>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipsCollections = this.db.collection<IClip>('clips');
  }

  crateClip(clip: IClip): Promise<DocumentReference> {
    return this.clipsCollections.add(clip);
  }

  getClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;
        if (values) {
          return this.clipsCollections.ref
            .where('uid', '==', user?.uid)
            .orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
            .get();
        } else {
          return of(null);
        }
      }),
      map((snapshot) => {
        if (snapshot) {
          return snapshot.docs.map(
            (doc) => ({ docId: doc.id, ...doc.data() } as IClip)
          );
        } else {
          return [];
        }
      })
    );
  }

  editClipTitle(docId: string, title: string) {
    return this.clipsCollections.doc(docId).update({ title });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    await clipRef.delete();
    await this.clipsCollections.doc(clip.docId as string).delete();
  }
}
