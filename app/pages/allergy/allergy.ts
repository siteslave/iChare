import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Allergy} from '../../providers/allergy/allergy';
import * as _ from 'lodash';

interface encryptData {
  data: any
}

@Component({
  templateUrl: 'build/pages/allergy/allergy.html',
  providers: [Encrypt, Configure, Allergy]
})
export class AllergyPage implements OnInit {

  url;
  localStorage;
  allergies;
  hasData: boolean = false;

  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private allergy: Allergy,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.localStorage = new Storage(LocalStorage);
    this.url = config.getUrl();
  }

  ngOnInit() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/allergy/info`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.allergies = [];
        this.allergy.getAllergy(url, _token)
          .then(data => {
        // let secretKey = this.config.getSecretKey();
        let decryptText = this.encrypt.decrypt(data);
        let jsonData = JSON.parse(decryptText);

            
            let rows = <Array<any>>jsonData;
            for (let row of rows) {
              this.allergies.push(row);
            }

            if (this.allergies.length) {
              this.hasData = true;
            } else {
              this.hasData = false;
            }

            loading.dismiss();
          }, err => {
            loading.dismiss();
            let toast = this.toastCtrl.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            toast.present();
          });
      });
    
  }

}
