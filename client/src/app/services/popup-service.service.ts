import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private isPopupSubject = new BehaviorSubject<boolean>(false);
  isPopup$: Observable<boolean> = this.isPopupSubject.asObservable();

  setIsPopup(value: boolean): void {
    this.isPopupSubject.next(value);
  }
}