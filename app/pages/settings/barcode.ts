import {Component, OnInit} from '@angular/core';
import {Modal, Toast, Loading, Platform, NavController, NavParams, ViewController, LocalStorage, Storage} from 'ionic-angular';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

@Component({
  templateUrl: `build/pages/settings/barcode.html`
})
  
export class BarcodeModal implements OnInit {
  url: any;
  token: any;
  hashKey: any;

  constructor(
    private viewCtrl: ViewController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform,
    private localStorage: LocalStorage,
    private params: NavParams
  ) {
    this.url = this.config.getUrl();
    console.log(this.params);
   }

  close() {
    this.viewCtrl.dismiss();
  }

  ngOnInit() {
    
     this.localStorage.get('token')
      .then(token => {
        this.token = token;
        let url = `${this.url}/api/patient/patient/get-barcode}`;
        let params = this.encrypt.encrypt({ hashKey: hashKey });
        return this.settings.getBarCode(url, this.toke);
      })
    
  }
}