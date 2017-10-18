import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'username',
  pure: false
})
export class NamePipe implements OnDestroy, PipeTransform {
  private userName = '';
  private subs;

  constructor(private userService: UserService, private detectorRef: ChangeDetectorRef) { }

  transform(value: any, args?: any): any {
    if (!this.subs && (typeof value === 'string')) {
      this.subs = this.userService.getUser(value).subscribe(u => {
        this.userName = u ? u.name : '';
        this.detectorRef.markForCheck();
      });
    }

    return this.userName;
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe(); }
  }
}
