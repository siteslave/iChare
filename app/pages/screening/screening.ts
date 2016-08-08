import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Screening} from '../../providers/screening/screening';
import * as _ from 'lodash';
import * as moment from 'moment';

interface httpData {
  foot: any,
  eye: any
}

interface footResult {
  screen_date?: any,
  screen_time?: any,
  foot_left_result?: any,
  foot_right_result?: any,
  has_foot_cormobidity?: any
} 

interface eyeResult {
  screen_date?: any,
  screen_time?: any,
  eye_left_result?: any,
  eye_right_result?: any,
  has_eye_cormobidity?: any
}

@Component({
  templateUrl: 'build/pages/screening/screening.html',
  providers: [Encrypt, Configure, Screening]
})
export class ScreeningPage implements OnInit {

  isAndroid: boolean = false;
  url;
  localStorage;
  footScreenDate;
  footScreenTime;
  footRightResult;
  footLeftResult;

  eyeScreenDate;
  eyeScreenTime;
  eyeRightResult;
  eyeLeftResult;

  hasData: boolean = false;
  
  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private screening: Screening,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
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
    
     let secretKey = this.config.getSecretKey();
      let url = `${this.url}/api/screening/history`;
  
      this.localStorage.get('token')
        .then(token => {
          let _token = token;
          this.screening.getHistory(url, _token)
            .then(data => {
              let decryptText = this.encrypt.decrypt(data);
              let jsonData = JSON.parse(decryptText);

              // console.log(jsonData);

              let rows = <httpData>jsonData;
              let footHistory = <footResult>rows.foot;
              let eyeHistory = <eyeResult>rows.eye;

              if (footHistory) {
                this.footScreenDate = `${moment(footHistory.screen_date).format('D/M')}/${moment(footHistory.screen_date).get('year') + 543}`;
                this.footScreenTime = moment(footHistory.screen_time, 'HH:mm:ss').format('HH:mm');
                this.footLeftResult = footHistory.foot_left_result;
                this.footRightResult = footHistory.foot_right_result;
              }
              // console.log(rows);  
              if (eyeHistory) {
                this.eyeScreenDate = `${moment(eyeHistory.screen_date).format('D/M')}/${moment(eyeHistory.screen_date).get('year') + 543}`;
                this.eyeScreenTime = moment(eyeHistory.screen_time, 'HH:mm:ss').format('HH:mm');
                this.eyeLeftResult = eyeHistory.eye_left_result;
                this.eyeRightResult = eyeHistory.eye_right_result;
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
