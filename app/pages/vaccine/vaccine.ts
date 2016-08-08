import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Vaccine} from '../../providers/vaccine/vaccine';
import * as _ from 'lodash';
import * as moment from 'moment';

interface VaccineData {
  vaccine_code: any,
  vaccine_name: any,
  vstdate: any,
  vsttime: any
}

@Component({
  templateUrl: 'build/pages/vaccine/vaccine.html',
  providers: [Vaccine, Configure, Encrypt]
})
export class VaccinePage implements OnInit {

  isAndroid: boolean = false;
  url;
  localStorage;
  vaccines;
  hasData: boolean = false;

  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private vaccine: Vaccine,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.isAndroid = this.platform.is('android');
    this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();
  }

  ngOnInit() {
    
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();    
    // this.nav.present(loading);
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/vaccine/history`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.vaccines = [];
        this.vaccine.getHistory(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);

            console.log(jsonData);

            let rowsHistories = <Array<any>>jsonData;

            for (let row of rowsHistories) {
              let data = <VaccineData>row;
              data.vaccine_code = row.vaccine_code;
              data.vaccine_name = row.vaccine_name;
              data.vstdate = `${moment(row.vstdate).format('DD/MM')}/${moment(row.vstdate).get('year') + 543}`;
              data.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');

              this.vaccines.push(data);
            }
            // console.log(this.vaccines.length);
            
            if (this.vaccines.length) {
              this.hasData = true;
            } else {
              this.hasData = false;
            }

            console.log(this.vaccines);
            loading.dismiss();
          }, err => {
            loading.dismiss();
            let toast = this.toastCtrl.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            // this.nav.present(toast);
            toast.present();
          });
      });
        

  }

}
