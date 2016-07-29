import {Component, OnInit} from '@angular/core';
import {Camera} from 'ionic-native';
import {Modal, Toast, Alert, ActionSheet, Loading, Platform, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
import * as _ from 'lodash';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {BarcodePage} from '../barcode/barcode';

import {JwtHelper} from 'angular2-jwt';

interface PatientData {
  age?: any,
  hash_key?: any,
  image?: any,
  is_default?: any,
  ptname?: any
}

interface AlertData {
  alert_news?: any;
  alert_appoint?: any;
  alert_service?: any;
}

interface httpData {
  ok: boolean,
  msg?: any,
  rows?: any
}

@Component({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [],
  providers: [Configure, Settings, Encrypt]
})

export class SettingsPage implements OnInit {

  localStorage: any;
  url: string;
  patients: any;
  token: any;
  selectedPatient;
  alertAppoint: boolean = false;
  alertNews: boolean = false;
  alertService: boolean = false;

  constructor(public nav: NavController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform
  ) {
    this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();

   }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.getPatient();  
    this.getAlertSetting();
  }

  getPatient() {
    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);

    this.localStorage.get('token')
      .then(token => {
        this.token = token;
        let url = `${this.url}/api/patient/members?token=${this.token}`;
        return this.settings.getMemberPatients(url);
      })
      .then(data => {
        // console.log(data);
        let encryptedData = data.data;
        // let secretKey = this.config.getSecretKey();
        let decryptText = this.encrypt.decrypt(encryptedData);
        let jsonData = JSON.parse(decryptText);

        let rows = <Array<any>>jsonData;
        this.patients = [];

        for (let row of rows) {
          let data = <PatientData>row;
          data.age = row.age;
          data.hash_key = row.hash_key;
          data.image = row.image;
          data.is_default = row.is_default;
          data.ptname = row.ptname;

          this.patients.push(data);
        }

        console.log(this.patients);

        loading.dismiss();
      }, err => {
        let msg = null;
        if (err) {
          msg = `Error [${err.status}]: ${err.statusText} `;
        } else {
          msg = 'Connection failed';
        }
        let alert = Alert.create({
          title: 'เกิดข้อผิดพลาด',
          subTitle: msg,
          buttons: ['ตกลง']
        });
          this.nav.present(alert);
      });
  }

  setDefault(hashKey) {

    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);
    
    let url = `${this.url}/api/patient/set-default`;
    let params = this.encrypt.encrypt({ hashKey: hashKey });

    this.settings.setDefault(url, this.token, params)
      .then(data => {
        let result = <httpData>data;
        if (result.ok) {
          loading.dismiss();
          this.getPatient();
        } else {
          loading.dismiss();
          let alert = Alert.create({
            title: 'เกิดข้อผิดพลาด',
            subTitle: result.msg,
            buttons: ['ตกลง']
          });
          this.nav.present(alert);
          console.log(result.msg);
        }
      }, err => {
        loading.dismiss();
        let alert = Alert.create({
          title: 'เกิดข้อผิดพลาด',
          subTitle: `Error [${err.status}]: ${err.statusText} `,
          buttons: ['ตกลง']
        });
        this.nav.present(alert);
      });
  }

  // show action sheet
  showTakePhotoAction(hashKey) {
    console.log(hashKey);
    // let idx = _.findIndex(this.patients, { hn: hn });
    let actionSheet = ActionSheet.create({
      title: 'เลือกที่มาของภาพถ่าย',
      cssClass:'action-sheets-basic-page',
      buttons: [
        {
          text: 'แกลอรี่',
          icon: !this.platform.is('ios') ? 'image' : null,
          // role: 'destructive',
          handler: () => {
            this.takePhotoWithGallery(hashKey)
          }
        }, {
          text: 'กล้อง',
          icon: !this.platform.is('ios') ? 'camera' : null,
          handler: () => {
            this.takePhotoWithCamera(hashKey)
          }
        }, {
          text: 'ยกเลิก',
          // icon: !this.platform.is('ios') ? 'clear' : null,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

  this.nav.present(actionSheet);
  }

  takePhotoWithCamera(hashKey) {
    this.platform.ready().then(() => {
      let options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 400,
        targetHeight: 400,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };


      Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
        //this.patients[idx].image = base64Image;
        // alert(JSON.stringify(this.patientData));
        this.savePhoto(hashKey, base64Image);
      }, (err) => {
        alert(JSON.stringify(err));
      });
    });
  }

  takePhotoWithGallery(hashKey) {
    this.platform.ready().then(() => {
      let options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 400,
        targetHeight: 400,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };


      Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
        //this.patients[idx].image = base64Image;
        // alert(JSON.stringify(this.patientData));
        this.savePhoto(hashKey, base64Image);
      }, (err) => {
        alert(JSON.stringify(err))
      });
    });
  }

  savePhoto(hashKey, image) {
    let loading = Loading.create({
      content: 'Saving...'
    });

    this.nav.present(loading);

    this.localStorage.get('token')
      .then(token => {
        let params = this.encrypt.encrypt({ image: image, hashKey: hashKey });
    
        let url = `${this.url}/api/patient/save-photo`;
        this.settings.savePhoto(url, token, params)
          .then(() => {
            this.getPatient();
            loading.dismiss();
            let toast = Toast.create({
              message: 'เรียบร้อย',
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          }, err => {
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          });
      });
    
  }

  getBarcode(hashKey) {
    this.nav.push(BarcodePage, {hashKey: hashKey});
  }

  toggleAppoint() {
    // alert(this.alertAppoint);
    // type : 1 = news, 2 = appoint, 3 = service
    let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;
    this.localStorage.get('token')
      .then(token => {
        console.log(token);
        this.settings.setAlert(url, token, '2', status)
          .then(() => {
            let toast = Toast.create({
              message: 'เรียบร้อย',
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          }, err => {
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          });
       });

  }

  toggleService() {
    // type : 1 = news, 2 = appoint, 3 = service
    // alert(this.alertAppoint);
    let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;
    this.localStorage.get('token')
      .then(token => {
        this.settings.setAlert(url, token, '3', status)
          .then(() => {
            let toast = Toast.create({
              message: 'เรียบร้อย',
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          }, err => {
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          });
       });

  }

  toggleNews() {
    // type : 1 = news, 2 = appoint, 3 = service
    // alert(this.alertAppoint);
    let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;
    this.localStorage.get('token')
      .then(token => {
        this.settings.setAlert(url, token, '1', status)
          .then(() => {
            let toast = Toast.create({
              message: 'เรียบร้อย',
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          }, err => {
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          });
       });
  }

  getAlertSetting() {

    let url = `${this.url}/api/member/get-alert-setting`;
    this.localStorage.get('token')
      .then(token => {
        this.settings.getAlertSetting(url, token)
          .then(alert => {
            let _alert = <AlertData>alert;

            this.alertAppoint = _alert.alert_appoint == 'Y' ? true : false;
            this.alertNews = _alert.alert_news == 'Y' ? true : false;
            this.alertService = _alert.alert_service == 'Y' ? true : false;

          }, err => {
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'bottom'
            });

            this.nav.present(toast);
          });
       });
  }
  

}

