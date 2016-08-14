import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpinnerDialog, Toast, SecureStorage } from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Dashboard} from '../../providers/dashboard/dashboard';
import {CHART_DIRECTIVES} from 'angular2-highcharts';

import * as _ from 'lodash';
import * as moment from 'moment';

interface ScreenData {
  vstdate?: any,
  vsttime?: any,
  bw?: any,
  height?: any,
  pulse?: any,
  bpd?: any,
  bps?: any,
  bmi?: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}


@Component({
  templateUrl: 'build/pages/blood-pressure/blood-pressure.html',
  directives: [CHART_DIRECTIVES],
  providers: [Configure, Encrypt, Dashboard]
})
export class BloodPressurePage implements OnInit {
  optionBP: Object;
  url: any;
  localStorage: any;
  bpData: any;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private dashboard: Dashboard
  ) {

    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });  
  }

  ngOnInit() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...')
    
    let url = `${this.url}/api/dash/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        
        this.bpData = [];
        
        let bps = [];
        let bpd = [];

        this.dashboard.getHistory(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);

            let rows = <Array<any>>jsonData;
            
            for (let row of rows) {
              let obj = <ScreenData>row;
              obj.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.regdate).get('year') + 543}`;
              obj.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              obj.bpd = row.bpd;
              obj.bps = row.bps;
              obj.bw = row.bw;
              obj.height = row.height;
              obj.bmi = row.bmi;
              obj.pulse = row.pulse;

              bps.push(parseInt(row.bps));
              bpd.push(parseInt(row.bpd));

              this.bpData.push(obj);
            }

            this.setGraph(bpd, bps);
            
            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย', '3000', 'center')
              .subscribe(toast => { });
            
          }, err => {
            SpinnerDialog.hide();
            Toast.show('เกิดข้อผิดพลาด', '3000', 'center')
              .subscribe(toast => { });
          });
      });
  }  

  setGraph(bpd, bps) {
    console.log(bpd);
    console.log(bps);

    this.optionBP = {
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      yAxis: {
        title: { text: 'ระดับนำ้ตาล (mg/dL)' },
        plotLines: [{
          value: 120.1,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐานไม่เกิน: 120',
            align: 'center',
            style: {
              color: 'gray'
            }
          }
        },
          {
            value: 90.1,
            color: 'red',
            width: 1,
            label: {
              text: 'ค่ามาตรฐานไม่เกิน: 90',
              align: 'center',
              style: {
                color: 'gray'
              }
            }
          }
        ],
      },
      title: { text: '' },
      series: [
        {
          name: 'ความดันบน (SBP)',
          data: bps,
        },
        {
          name: 'ความดันล่าง (DBP)',
          data: bpd,
          color: 'green'
        }
      ]
    };
  }

}
