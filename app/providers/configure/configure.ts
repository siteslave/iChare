import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Configure provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Configure {
  url: string;
  masterKey: string;

  constructor() {
    this.url = `http://192.168.43.76:3000`;
    this.masterKey = 'd59c2916461236846d375108a07e2fb6ede2800c39fe0e325286282186aa5c42';
  }

  getUrl() {
    return this.url;
  }

  getMasterKey() {
      return this.masterKey;
  }
  
}

