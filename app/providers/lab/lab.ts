import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class Lab {


  constructor(private http: Http) {
    
  }

  getHistory(url, token) {
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

