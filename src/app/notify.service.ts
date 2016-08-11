import { Injectable } from '@angular/core';
import {Subject} from "rxjs/Subject";

var Notification;
if (window && 'Notification' in window) {
  Notification = window['Notification'];
}

@Injectable()
export class NotifyService {
  private icon = 'app/images/icon-128x128.png';
  private notifier: Subject<Object>;
  constructor() {
    this.notifier = new Subject<Object>();
    this.notifier
      .share()
      .subscribe(object => this.send(object));

    Notification.requestPermission((permission) => {
      if (permission == 'denied')
        alert('Notification disabled, enable it in browser settings.');
    });
  }

  public notify(title, body) {
    if (Notification.permission === 'granted') {
      return this.notifier.next({title: title, body: body});
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          this.notifier.next({title: title, body: body});
        }
      });
    }
  }

  private send(object) {
    var notification = new Notification(object.title, {icon: this.icon, body: object.body});
    notification.onclick = function() {};
  }
}
