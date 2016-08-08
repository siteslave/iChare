import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Drug} from '../../providers/drug/drug';

import * as _ from 'lodash';
import * as moment from 'moment';

interface rowResults {
  screen_date?: any,
  screen_time?: any,
  drug_name?: any,
  qty?: any,
  name1?: any,
  name2?: any,
  name3?: any
}

@Component({
  templateUrl: 'build/pages/drug/drug.html',
  providers: [Encrypt, Configure, Drug]
})
export class DrugPage implements OnInit {
  url;
  localStorage;
  drugs;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private drug: Drug,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {

    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);    
  }

  ngOnInit() {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/drug/history`;
  
    this.localStorage.get('token')
      .then(token => {
        this.drugs = [];
        let _token = token;
        this.drug.getHistory(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);

            // console.log(jsonData);

            let rows = jsonData;

            // console.log(rows);

            for (let row of rows) {
              let drugData = <rowResults>row;
              drugData.screen_date = `${moment(row.screen_date).format('DD/MM')}/${moment(row.screen_date).get('year') + 543}`;
              drugData.screen_time = moment(row.screen_time, 'HH:mm:ss').format('HH:mm');
              drugData.drug_name = row.drug_name;
              drugData.qty = row.qty;
              drugData.name1 = row.name1;
              drugData.name2 = row.name2;
              drugData.name3 = row.name3;

              this.drugs.push(drugData);
            }
            
            // console.log(this.drugs);

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
