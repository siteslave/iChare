import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class Settings {
  patients: any;
  url: string;

  constructor(private http: Http) {
    this.patients = null;
  }

  getMemberPatients(url, memberId, params) {
    this.url = url;
    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { memberId: memberId, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.data);
          } else {
            reject(data.msg);
          }
        }, err => reject(err));
    })
  }

  setDefault(url, memberId, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { memberId: memberId, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => resolve(data), error => reject(error))
    });
  }

  getBarCode(url, memberId, params) {
    this.url = url;

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { memberId: memberId, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.img);
          } else {
            reject(data.msg);
          }
        }, err => reject(err));
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

  setAlert(url, memberId, params) {

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      let body = { memberId: memberId, params: params };

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

  getAlertSetting(url, memberId, params) {

    return new Promise((resolve, reject) => {

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = { memberId: memberId, params: params };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.data);
          } else {
            reject(data.msg);
          }
        }, err => reject(err));
      
    })
  }


}

