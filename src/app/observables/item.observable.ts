import { BehaviorSubject, Observable } from 'rxjs';
export class ItemObservable<T> {
  private behaviorItem$: BehaviorSubject<T> | undefined

  protected constructor() { }

  get item(): T | undefined {
    return this.behaviorItem$?.getValue()
  }

  protected setItem(nextItem: T) : void {
    if (!this.behaviorItem$) {
      this.behaviorItem$ = new BehaviorSubject<T>(nextItem)
    } else {
      this.behaviorItem$!.next(nextItem)
    }
  }

  get getItemObservable$(): Observable<T> {
    return this.behaviorItem$!.asObservable()
  }
}
