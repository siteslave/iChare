import { Component, OnInit } from '@angular/core';
import { NavController, Platform, Loading, Toast, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Lab} from '../../providers/lab/lab';

import * as _ from 'lodash';
import * as moment from 'moment';

import {CHART_DIRECTIVES} from 'angular2-highcharts';

@Component({
  templateUrl: 'build/pages/lab/lab.html',
  providers: [Encrypt, Configure, Lab],
  directives: [CHART_DIRECTIVES],
})
export class LabPage implements OnInit {
  optionFBS: Object;
  optionEGfr: Object;
  optionTc: Object;
  optionHdl: Object;
  optionHbA1c: Object;
  optionCretinine: Object;

  currentGfr: any;
  currentGfrStage: any;

  currentFbs: any;
  currentTc: any;
  currentHbA1c: any;
  currentHdl: any;
  currentCretinine: any;

  url;
  localStorage;
  
  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private lab: Lab
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
  }

  ngOnInit() {
    
  }

  ionViewLoaded() {
    this.getData();
  }


  getData() {
    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/lab/history`;
  
    this.localStorage.get('token')
      .then(token => {
        let _token = token;
        this.lab.getHistory(url, _token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            // console.log(jsonData);
            let egfrs = jsonData.egfr;
            let fbss = jsonData.fbs;
            let tcs = jsonData.tc;
            let hdls = jsonData.hdl;
            let creatinines = jsonData.creatinine;
            let hba1cs = jsonData.hba1c;

            let egfrData = [];
            let egfrCategories = [];

            let fbsData = [];
            let fbsCategories = [];

            let tcData = [];
            let tcCategories = [];

            let hdlData = [];
            let hdlCategories = [];

            let creatinineData = [];
            let creatinineCategories = [];

            let HbA1cData = [];
            let HbA1cCategories = [];
            
            for (let v of fbss) {
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              fbsData.push(v.fbs);
              fbsCategories.push(_vstdate);
            };

            //let current = egfrs[egfrs.length - 1].egfr;
            this.currentFbs = fbss[fbss.length - 1].fbs;

            
            // let maxGfr = 0;
            for (let v of egfrs) {
              // if (v.egfr > maxGfr) maxGfr = v.egfr;
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              egfrData.push(v.egfr);
              egfrCategories.push(_vstdate);
            };

            this.currentGfr = egfrs[egfrs.length - 1].egfr;
            
            if (this.currentGfr >= 90) this.currentGfrStage = 1;
            else if (this.currentGfr >= 60 && this.currentGfr < 90) this.currentGfrStage = 2;
            else if (this.currentGfr >= 30 && this.currentGfr <= 59) this.currentGfrStage = 3;
            else if (this.currentGfr >= 15 && this.currentGfr <= 29) this.currentGfrStage = 4;
            else this.currentGfrStage = 5;
            

            for (let v of tcs) {
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              tcData.push(v.tc);
              tcCategories.push(_vstdate);
            };

            this.currentTc = tcs[tcs.length - 1].tc;
            
            for (let v of hdls) {
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              hdlData.push(v.hdl);
              hdlCategories.push(_vstdate);
            };
            
            this.currentHdl = hdls[hdls.length - 1].hdl;

            for (let v of creatinines) {
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              creatinineData.push(v.creatinine);
              creatinineCategories.push(_vstdate);
            };
            
            this.currentCretinine = creatinines[creatinines.length - 1].creatinine;

            for (let v of hba1cs) {
              let _vstdate = `${moment(v.vstdate).format('DD/MM')}/${moment(v.vstdate).get('year') + 543}`;
              HbA1cData.push(v.creatinine);
              HbA1cCategories.push(_vstdate);
            };

            this.currentHbA1c = hba1cs[hba1cs.length - 1].hba1x;

            // create charts 
            this.setEGfrGraph(egfrData, egfrCategories);
            this.setFBSGraph(fbsData, fbsCategories);
            this.setTcGraph(tcData, tcCategories);
            this.setHdlGraph(hdlData, hdlCategories);
            this.setCretinineGraph(creatinineData, creatinineCategories);
            this.setHbA1cGraph(HbA1cData, HbA1cCategories);
            
            // console.log(this.optionEGfr);

            loading.dismiss();
          }, err => {
            loading.dismiss();
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            this.nav.present(toast);
          });
      });
        

  }

  setEGfrGraph(data, categories) {
    this.optionEGfr = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับ eGFR (ml/min)' },
        plotLines: [{
          value: 90.1,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐาน >= 90 ml/min',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับ eGFR' },
      series: [
        {
          name: 'eGFR',
          data: data,
        }
      ]

    };
  }

  setFBSGraph(data, categories) {
    this.optionFBS = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับนำ้ตาลในเลือด (mg%)' },
        plotLines: [{
          value: 99.9,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐานไม่เกิน 100 mg%',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับนำ้ตาลในเลือด (FBS)' },
      series: [
        {
          name: 'fbs',
          data: data,
        }
      ]

    };
  }

  setTcGraph(data, categories) {
    this.optionTc = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับ Total Cholesterol (mg/dL)' },
        plotLines: [{
          value: 199.9,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐาน <= 200 mg/dL',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับ Total Cholesterol' },
      series: [
        {
          name: 'tc',
          data: data,
        }
      ]

    };
  };
  

  setHdlGraph(data, categories) {
    this.optionHdl = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับ HDL (mg/dL)' },
        plotLines: [{
          value: 60.1,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐาน >= 60 mg/dL',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับ HDL' },
      series: [
        {
          name: 'hdl',
          data: data,
        }
      ]

    };
  }

  setCretinineGraph(data, categories) {
    this.optionCretinine = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับ Creatinine (mg/dL)' },
        plotLines: [{
          value: 90.1,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐาน 0.7 - 1.3 mg/dL',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับ Creatinine' },
      series: [
        {
          name: 'creatinine',
          data: data,
        }
      ]

    };
  }

  setHbA1cGraph(data, categories) {
    this.optionHbA1c = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'ระดับ HbA1c (mg%)' },
        plotLines: [{
          value: 5.7,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐาน น้อยกว่า 5.7 mg%',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: 'ระดับน้ำตาลเฉลี่ยสะสมในเลือด (HbA1c)' },
      series: [
        {
          name: 'HbA1c',
          data: data,
        }
      ]

    };
  }


}
