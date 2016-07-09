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
  secretKey: string;

  constructor(private http: Http, private config: Configure) {
    this.data = null;
    this.secretKey = this.config.getSecretKey();
  }

  decrypt(encryptKey) {
    let bytes  = cryptojs.AES.decrypt(encryptKey.toString(), this.secretKey);
    let decrypt = bytes.toString(cryptojs.enc.Utf8);

    return decrypt;
  }

  encrypt(data: Object) {
    let encrypted = cryptojs.AES.encrypt(JSON.stringify(data), this.secretKey);
    return encrypted.toString();
  }

}

