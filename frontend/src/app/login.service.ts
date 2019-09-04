import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

const defaultHeaders: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

class LoginStatus {
    result: string;
}

@Injectable()
export class LoginService {
  private requireAuthSub: Subject<boolean> = new Subject();
  private authenticatedSub: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient) {
      this.requireAuthSub
          .subscribe(() => {
              let url = router.url;
              const params = router.parseUrl(url).queryParams;
              if (params.hasOwnProperty('goto')) {
                  url = params.goto;
              }
              this.router.navigate(['/login'], {queryParams: {goto: url}});
          });
    }

  public get authenticated() {
    return this.authenticatedSub;
  }

  public login(data) {
    return this.http.post<LoginStatus>('/passport/login', JSON.stringify(data), {headers: defaultHeaders})
      .pipe(tap((resp) => {
        this.authenticatedSub.next((resp.result === 'loggedin'));
      }));
  }

  public logout() {
    return this.http.get('/passport/logout', {headers: defaultHeaders})
        .pipe(tap(() => this.authenticatedSub.next(false)));
  }

  public requireAuth() {
      this.requireAuthSub.next(true);
  }
}
