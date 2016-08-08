import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Dashboard} from '../../providers/dashboard/dashboard';
import {BloodPressurePage} from '../blood-pressure/blood-pressure';
import {BmiPage} from '../bmi/bmi';
import {PulsePage} from '../pulse/pulse';
import {ScreenNotePage} from '../screen-note/screen-note';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';

@Component({
  templateUrl: 'build/pages/dash/dash.html',
  providers: [Configure, Encrypt, Dashboard]
})
  
export class DashPage implements OnInit {
  url: any;
  localStorage: any;
  bps: any;
  bpd: any;
  weight: any;
  bmi: any;
  pulse: any;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private dashboard: Dashboard,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { 
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
  }

  goBloodPressure() {
     this.nav.push(BloodPressurePage);
  }

  goBmi() {
     this.nav.push(BmiPage);
  }

  goPulse() {
     this.nav.push(PulsePage);
  }

  openScreenNote() {
    this.nav.push(ScreenNotePage);
  }

  ngOnInit() {
    
  }

  ionViewLoaded() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    let url = `${this.url}/api/dash/screening`;
  
    this.localStorage.get('token')
      .then(token => {
        this.dashboard.getScreening(url, token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = jsonData;
            console.log(rows);
            this.bmi = numeral(rows.bmi).format('0');;
            this.bpd = rows.bpd;
            this.bps = rows.bps;
            this.weight = rows.bw;
            this.pulse = rows.pulse;

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
