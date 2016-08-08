import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Opd} from '../../providers/opd/opd';

import * as _ from 'lodash';
import * as moment from 'moment';

import {OutPatientDetailPage} from '../out-patient-detail/out-patient-detail';

interface ServiceResult {
  vstdate?: any,
  vsttime?: any,
  cc?: any,
  department?: any,
  vn?: any
}

@Component({
  templateUrl: 'build/pages/out-patient/out-patient.html',
  providers: [Encrypt, Configure, Opd]
})
export class OutPatientPage implements OnInit {
  isAndroid: boolean = false;
  url: any
  localStorage: any;
  services: any;
  refresher: any;

  constructor(
    private nav: NavController,
    private platform: Platform,
    private encrypt: Encrypt,
    private config: Configure,
    private opd: Opd,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    this.isAndroid = platform.is('android');
  }

  gotoDetail(vn) {
    this.nav.push(OutPatientDetailPage, {vn: vn})
  }

  doRefresh(refresher) {
    //console.log('Begin async operation', refresher);

    // setTimeout(() => {
    //   console.log('Async operation has ended');
    //   refresher.complete();
    // }, 2000);
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/opd/history`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.services = [];

        this.opd.getHistory(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            console.log(rows);

            for (let row of rows) {
              let service = <ServiceResult>row;
              
              service.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.vstdate).get('year') + 543}`;
              service.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              service.department = row.department;
              service.vn = row.vn;

              this.services.push(service);
            }

            refresher.complete();
          }, err => {
            refresher.complete();
            this.refresher.complete();
            let toast = this.toastCtrl.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            toast.present();
          });
      });

  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.getData();
  }

  getData() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/opd/history`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.services = [];

        this.opd.getHistory(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            console.log(rows);

            for (let row of rows) {
              let service = <ServiceResult>row;
              
              service.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.vstdate).get('year') + 543}`;
              service.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              service.department = row.department;
              service.vn = row.vn;

              this.services.push(service);
            }

            // this.refresher.complete();            
            loading.dismiss();
          }, err => {
            loading.dismiss();
            this.refresher.complete(); 
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
