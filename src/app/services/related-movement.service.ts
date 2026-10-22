import { Injectable } from '@angular/core';
import { CollectionType } from '../enums/collection-type.enum';
import { CollectionReference, DocumentData, DocumentReference, Firestore, Query, WriteBatch, addDoc, collection, collectionData, deleteDoc, doc, documentId, orderBy, query, setDoc, updateDoc, where, writeBatch } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, firstValueFrom, map } from 'rxjs';
import { RelatedMovementModel } from '../models/related-movement.model';
import { RelatedMapModel } from '../models/related-map-model';

@Injectable({
  providedIn: 'root'
})
export class RelatedMovementService {
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
    const ref = query(this.getReference(), where('owner', '==', this.email))
    return collectionData<RelatedMovementModel>(ref as Query<RelatedMovementModel>, { idField: 'id' })
  }

  public getRelatedMovementsShowingInMovements = (): Observable<RelatedMovementModel[]> => {
    this.email = this.userService.getUserEmail()
    if (!this.email) {
      this.router.navigate([''])
    }
    const ref = query(this.getReference(), where('owner', '==', this.email), where('showInUpsertMovement', '==', true), orderBy('owner'))
    return collectionData<RelatedMovementModel>(ref as Query<RelatedMovementModel>, { idField: 'id' })
  }

  public getById = (id: string): Observable<RelatedMovementModel> => {
    const ref = query(this.getReference(), where('owner', '==', this.userService.getUserEmail()), where(documentId(), '==', id))
    return collectionData<RelatedMovementModel>(ref as Query<RelatedMovementModel>, { idField: 'id' }).pipe(map(x => Array.isArray(x) ? (x as RelatedMovementModel[])[0]! : x!))
  }

  public create = (model: RelatedMovementModel): Promise<DocumentReference> => {
    delete model.id
    model.owner = this.userService.getUserEmail()
    return addDoc(this.getReference(), model)
  }

  public update = (model: RelatedMovementModel): Promise<void> => {
    const { id, ...data } = model
    data.owner = this.userService.getUserEmail()
    const ref = doc(this.firestore, `${this.collectionType}/${id}`)
    return setDoc(ref, data)
  }

  // Only the movement list changes, the rest of the group stays as it is
  public updateRelated = (id: string, related: (RelatedMapModel | Record<string, string>)[]): Promise<void> => {
    const ref = doc(this.firestore, `${this.collectionType}/${id}`)
    return updateDoc(ref, { related: related.map(x => ({ id: x.id, type: x.type })) })
  }

  // Called after deleting movements so groups do not keep ids of movements that no longer exist
  public removeMovements = async (movementIds: string[]): Promise<void> => {
    if (movementIds.length === 0) { return }
    const groups = await firstValueFrom(this.getAll())
    const affected = groups.filter(x => x.related.some(y => movementIds.includes(y.id)))
    if (affected.length === 0) { return }
    const batch = this.openBatch()
    affected.forEach(x => batch.update(this.getReferenceById(x.id!), {
      related: x.related.filter(y => !movementIds.includes(y.id)).map(y => ({ id: y.id, type: y.type }))
    }))
    await batch.commit()
  }

  public openBatch = (): WriteBatch => {
    return writeBatch(this.firestore)
  }

  public getReferenceById = (id: string): DocumentReference<DocumentData> => doc(this.firestore, `${this.collectionType}/${id}`)


  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.collectionType)
  }

  public delete = (id: string): Promise<void> => {
    const ref = doc(this.firestore, `${this.collectionType}/${id}`)
    return deleteDoc(ref)
  }
}
