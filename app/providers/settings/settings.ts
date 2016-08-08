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
    return new Promise((resolve, reject) => {

      this.http.get(url)
        .map(res => res.json())
        .subscribe(data => resolve(data), error => reject(error))
    })
  }

  setDefault(url, token, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data), error => reject(error))
    });
  }

  getBarCode(url, token, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data), error => reject(error))
    });
  }

  savePhoto(url, token, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token, params: params };

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

  setAlert(url, token, type, status) {

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      let body = { token: token, type: type, status: status };

      
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve();
          } else {
            resolve(data.msg);
          }
        }, error => reject(error))
    })
  }

  getAlertSetting(url, token) {

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { token: token };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.alert);
          } else {
            resolve(data.msg);
          }
        }, error => reject(error))
    })
  }


}

