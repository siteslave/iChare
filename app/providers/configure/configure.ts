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
  secretKey: string;

  constructor() {
    this.url = `http://localhost:3000`;
    this.secretKey = '9336bff7d152422e5ca53599bc129142';
  }

  getUrl() {
    return this.url;
  }

  getSecretKey() {
      return this.secretKey;
  }
  
}

