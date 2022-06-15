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
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollections: AngularFirestoreCollection<IClip>;
  public pageClips: IClip[] = [];
  public clip = null;
  public pendingReq = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
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
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    await clipRef.delete();
    await screenshotRef.delete();
    await this.clipsCollections.doc(clip.docId as string).delete();
  }

  public async getAllClips() {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsCollections.ref.orderBy('timestamp', 'desc').limit(3);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docId;
      const lastDoc = await this.clipsCollections
        .doc(lastDocID as string)
        .get()
        .toPromise();

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    this.pendingReq = false;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollections
      .doc(route.params.id)
      .get()
      .pipe(
        map((doc) => {
          const data = doc.data();
          if (!data) {
            this.router.navigate(['/']);
            return null;
          }
          return data;
        })
      );
  }
}
