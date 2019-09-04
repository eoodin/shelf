import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {share} from 'rxjs/operators';

let Notification;
if (window && 'Notification' in window) {
  Notification = window['Notification'];
}

@Injectable()
export class NotifyService {
  private icon = 'assets/images/icon-128x128.png';
  private notifier: Subject<Object>;
  constructor() {
    this.notifier = new Subject<Object>();
    this.notifier
      .pipe(share())
      .subscribe(object => this.send(object));
    if (Notification) {
      Notification.requestPermission((permission) => {
        if (permission === 'denied') {
          console.log('Notification disabled, enable it in browser settings.');
        }
      });
    }
  }

  public notify(title, body) {
    if (!Notification) {
      return;
    }

    if (Notification.permission === 'granted') {
      return this.notifier.next({title: title, body: body});
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          this.notifier.next({title: title, body: body});
        }
      });
    }
  }

  private send(object) {
    const notification = new Notification(object.title, {icon: this.icon, body: object.body});
    notification.onclick = () => {};
  }
}
