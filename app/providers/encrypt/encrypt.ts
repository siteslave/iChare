import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {Configure} from '../configure/configure';

import 'rxjs/add/operator/map';

import * as cryptojs from 'crypto-js';

/*
  Generated class for the Encrypt provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Encrypt {
  data: any;

  constructor(private http: Http, private config: Configure) {
    this.data = null;
  }

  decrypt(encryptKey: any, sessionKey: string) {
    let bytes  = cryptojs.AES.decrypt(encryptKey.toString(), sessionKey);
    let decrypt = bytes.toString(cryptojs.enc.Utf8);

    return decrypt;
  }

  encrypt(data: Object, sessionKey: string) {
    let encrypted = cryptojs.AES.encrypt(JSON.stringify(data), sessionKey);
    return encrypted.toString();
  }

}

