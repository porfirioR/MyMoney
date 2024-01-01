import { Injectable } from '@angular/core';
import { CollectionType } from '../enums/collection-type.enum';
import { CollectionReference, DocumentReference, Firestore, Query, addDoc, collection, collectionData, doc, documentId, orderBy, query, setDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';
import { RelatedMovementModel } from '../models/related-movement.model';

@Injectable({
  providedIn: 'root'
})
export class RelatedMovementsService {
  private collectionType: CollectionType = CollectionType.RelatedMovements
  private email!: string

  constructor(
    private readonly firestore: Firestore,
    private readonly router: Router, private readonly userService: UserService
  ) { }

  public getAll = (): Observable<RelatedMovementModel[]> => {
    this.email = this.userService.getUserEmail()
    if (!this.email) {
      this.router.navigate([''])
    }
    const ref = query(this.getReference(), where('owner', 'in', [ this.email ]), orderBy('type'))
    return collectionData<RelatedMovementModel>(ref as Query<RelatedMovementModel>, { idField: 'id' })
  }

  public getById = (id: string): Observable<RelatedMovementModel> => {
    const ref = query(this.getReference(), where('owner', '==', this.email), where(documentId(), '==', id), orderBy('owner'))
    return collectionData<RelatedMovementModel>(ref as Query<RelatedMovementModel>, { idField: 'id' }).pipe(map(x => Array.isArray(x) ? (x as RelatedMovementModel[])[0]! : x!))
  }
  
  public create = (model: RelatedMovementModel): Promise<DocumentReference> => {
    model.owner = this.userService.getUserEmail()
    return addDoc(this.getReference(), model)
  }

  public update = (model: RelatedMovementModel): Promise<void> => {
    model.owner = this.userService.getUserEmail()
    const ref = doc(this.firestore, `${this.collectionType}/${model.id}`)
    return setDoc(ref, model)
  }

  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.collectionType)
  }
}
