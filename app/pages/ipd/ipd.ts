import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Ipd} from '../../providers/ipd/ipd';
import {IpdDetailPage} from '../ipd-detail/ipd-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface rowResults {
  an?: any,
  dchdate?: any,
  dchtime?: any,
  prediag?: any,
  regdate?: any,
  regtime?: any,
  ward_name?: any,
  pttype_name?: any,
  diag_name?: any,
  dchstts_name?: any,
  dchtype_name?: any
}

@Component({
  templateUrl: 'build/pages/ipd/ipd.html',
  providers: [Encrypt, Configure, Ipd]
})
export class IpdPage implements OnInit {

  url;
  localStorage;
  admissions;
  isAndroid: boolean = false;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private ipd: Ipd,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    this.isAndroid = this.platform.is('android');
  }


  goIpdDetail(an) {
    this.nav.push(IpdDetailPage, {an: an});
  }  

  ngOnInit() {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
  
    let url = `${this.url}/api/ipd/history`;
  
    this.localStorage.get('token')
      .then(token => {
        this.admissions = [];
        let _token = token;
        this.ipd.getAdmid(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = jsonData;

            // console.log(rows);

            for (let row of rows) {
              let ipdData = <rowResults>row;
              ipdData.regdate = `${moment(row.regdate).format('DD/MM')}/${moment(row.regdate).get('year') + 543}`;
              ipdData.regtime = moment(row.regtime, 'HH:mm:ss').format('HH:mm');
              ipdData.ward_name = row.ward_name;
              ipdData.prediag = row.prediag;
              ipdData.an = row.an;

              this.admissions.push(ipdData);
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
