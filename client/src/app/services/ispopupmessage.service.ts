import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsPopupMessageService {
  private _isVisible = new BehaviorSubject<boolean>(false);
  isVisible$ = this._isVisible.asObservable();

  show() {
    this._isVisible.next(true);
  }

  hide() {
    this._isVisible.next(false);
  }

  toggle() {
    this._isVisible.next(!this._isVisible.getValue());
  }
}
