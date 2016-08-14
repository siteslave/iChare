import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable }     from 'rxjs/Observable';

/*
  Generated class for the Login provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Login {
  data: any;
  url: any;

  constructor(private http: Http) {
    this.data = null;
  }

  login(url, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      
       let body = { params: params };

      let url = `${this.url}/api/login`;

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data), error => reject(error))
    })
  }

  saveDevicetoken(url, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      
       let body = { params: params };

      let url = `${this.url}/api/login/register/device`;

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve();
          } else {
            reject(data.msg);
          }
        }, error => reject(error))
    })

  }

  getSessionKey(url, params) {
    this.url = url;

    return new Promise((resolve, reject) => {
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { params: params };

      let url = `${this.url}/api/login/send/session_key`;

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.data);
          } else {
            reject(data.msg);
          }
        }, error => reject(error));
    })
  }
}

