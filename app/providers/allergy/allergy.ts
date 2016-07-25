import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Allergy provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Allergy {
 
  constructor(private http: Http) {
    
  }

  getAllergy(url, token) {
    // don't have the data yet
    return new Promise((resolve, reject) => {
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      let body = { token: token };

      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.ok) {
            resolve(data.data);
          } else {
            reject(data.msg);
          }
        }, err => reject(err));
    });
  }
}

