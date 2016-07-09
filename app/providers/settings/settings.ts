import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Settings provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Settings {
  patients: any;
  url: string;

  constructor(private http: Http) {
    this.patients = null;
  }

  getMemberPatients(url) {
    this.url = url;
    return new Promise(resolve => {

      this.http.get(url)
        .map(res => res.json())
        .subscribe(data => resolve(data))
    })
  }

  setDefault(url, token, params) {
    this.url = url;

    return new Promise(resolve => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data))
    });
  }

  savePhoto(url, token, params) {
    this.url = url;

    return new Promise(resolve => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data))
    })
  }


}

