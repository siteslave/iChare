import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';


/*
  Generated class for the Patient provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Patient {
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
}

