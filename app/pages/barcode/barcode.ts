import { Component, OnInit } from '@angular/core';
import {Modal, Toast, Loading, Platform, NavController, NavParams, ViewController, LocalStorage, Storage} from 'ionic-angular';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
/*
  Generated class for the BarcodePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/barcode/barcode.html',
  providers: [Configure, Settings, Encrypt]
})
  
export class BarcodePage implements OnInit {
  url: any;
  token: any;
  hashKey: any;
  barcode: any;
  localStorage: any;

  constructor(
    private nav: NavController,
    private viewCtrl: ViewController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform,
    private params: NavParams
  ) {

    this.localStorage = new Storage(LocalStorage);
    // console.log(this.params);
    
  }

  ngOnInit() {
    
    this.hashKey = this.params.data.hashKey; 

    this.url = this.config.getUrl();
    // console.log(this.hashKey);
    this.localStorage.get('token')
      .then(token => {
        this.token = token;
        let url = `${this.url}/api/patient/get-barcode`;
        console.log(url);
        let params = this.encrypt.encrypt({ hashKey: this.hashKey });
        return this.settings.getBarCode(url, this.token, params);
      })
      .then(data => {
        console.log(data);
        if (data.ok) {
      
          this.barcode = data.img;
        } else {
          alert(JSON.stringify(data.msg));
        }
      });
    
  }

}
