import { BehaviorSubject, Observable } from 'rxjs';
export class ItemObservable<T> {
  private item$: Observable<T>;
  private behaviorItem$: BehaviorSubject<T>;

  protected constructor(initialState: T) {
    this.behaviorItem$ = new BehaviorSubject<T>(initialState);
    this.item$ = this.behaviorItem$.asObservable();
  }

  get Item(): T {
     return this.behaviorItem$.getValue(); 
  }

  protected setItem(nextItem: T) : void {
      this.behaviorItem$.next(nextItem);
  }

  get GetItemObservable$(): Observable<T> {
    return this.behaviorItem$.asObservable();
  }
}
