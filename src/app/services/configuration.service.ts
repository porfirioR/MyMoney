import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, doc, DocumentReference, setDoc, Firestore, Query, query, where, orderBy } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { ConfigurationModel } from '../models/configuration.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private collections: CollectionType = CollectionType.Configurations

  constructor(
    private readonly firestore: Firestore,
    private readonly userService: UserService
  ) { }

  public upsert = (model: ConfigurationModel): Promise<DocumentReference | void> => {
    model.email = this.userService.getUserEmail()
    if (model.id) {
      const ref = doc(this.firestore, `${this.collections}/${model.id}`)
      return setDoc(ref, model)
    }
    return addDoc(this.getReference(), model)
  }

  public getConfiguration = (): Observable<ConfigurationModel | undefined> => {
    const ref = query(this.getReference(), where('email', '==', this.userService.getUserEmail()), orderBy('language'))
    return collectionData<ConfigurationModel>(ref as Query<ConfigurationModel>, { idField: 'id' }).pipe(map(x => x[0]))
  }

  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.collections)
  }

}
