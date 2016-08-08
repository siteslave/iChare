import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Pttype} from '../../providers/pttype/pttype';
import {OutPatientDetailPage} from '../out-patient-detail/out-patient-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface PttypeResult {
  current: any,
  history: any
}

interface PttypeHistory {
  vstdate?: any,
  vsttime?: any,
  pttype_name?: any,
  vn?: any
}

interface PttypeCurrent {
  pttype_name?: any,
  pttypeno?: any,
  hmain?: any,
  hsub?: any,
  expiredate?: any,
  begindate?: any
}

@Component({
  templateUrl: 'build/pages/pttype/pttype.html',
  providers: [Encrypt, Configure, Pttype]
})

export class PttypePage implements OnInit {
  url;
  localStorage;
  currentPttypeName;
  currentPttypeNo;
  currentBeginDate;
  currentExpireDate;
  currentHmain;
  currentHsub;
  historyPttype;
  hasData: boolean = false;
  isAndroid: boolean = false;
  
  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private pttype: Pttype,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();

    this.isAndroid = this.platform.is('android');
  }


  ngOnInit() {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/pttype/get-pttype`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.historyPttype = [];
        this.pttype.getPttype(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = <PttypeResult>JSON.parse(decryptText);

            
            let rowsHistories = <Array<any>>jsonData.history;
            let current = <PttypeCurrent>jsonData.current;
        
            // this.currentPttype = PttypeCurrent;
            // {
            this.currentBeginDate = `${moment(current.begindate).format('DD/MM')}/${moment(current.begindate).get('year') + 543}`;
            this.currentExpireDate = `${moment(current.expiredate).format('DD/MM')}/${moment(current.expiredate).get('year') + 543}`;
            this.currentPttypeNo = current.pttypeno;
            this.currentPttypeName = current.pttype_name;
            this.currentHmain = current.hmain;
            this.currentHsub = current.hsub;
            // };
            // this.currentPttype.expiredate = moment(current.expiredate).format('DD/MM/YYYY');
            // this.currentPttype.pttype_name = current.pttype_name;
            // this.currentPttype.pttypeno = current.pttypeno;


            for (let row of rowsHistories) {
              let history = <PttypeHistory>row;
              history.pttype_name = row.pttype_name;
              history.vstdate = `${moment(row.vstdate).format('DD/MM')}/${moment(row.vstdate).get('year') + 543}`;
              history.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              history.vn = row.vn;

              this.historyPttype.push(history);
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

  goDetail(vn) {
    this.nav.push(OutPatientDetailPage, { vn: vn });
  }
  
}
