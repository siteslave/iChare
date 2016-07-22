import {Component, OnInit} from '@angular/core';
import {Camera} from 'ionic-native';
import {Modal, Toast, Alert, ActionSheet, Loading, Platform, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
import * as _ from 'lodash';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {BarcodePage} from '../barcode/barcode';

import {JwtHelper} from 'angular2-jwt';

/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

interface PatientData {
  hn?: string,
  fullname?: string,
  age?: number,
  image?: string
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
  patientData: PatientData;

  alertAppoint;
  alertNews;
  alertService;

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

    this.getPatient();    
    
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

        this.patients = jsonData;

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

  // selectPatient() {
  //   // console.log(this.selectedPatient);
  //   let idx = _.findIndex(this.patients, { hn: this.selectedPatient });
  //   if (idx > -1) {
  //     this.localStorage.set('patient', JSON.stringify(this.patients[idx]));
  //   }

  // }

  setDefault(hashKey) {
    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/patient/set-default`;
    let params = this.encrypt.encrypt({ hashKey: hashKey });

    this.settings.setDefault(url, this.token, params)
      .then(data => {
        if (data.ok) {
          loading.dismiss();
          this.getPatient();
        } else {
          loading.dismiss();
          let alert = Alert.create({
            title: 'เกิดข้อผิดพลาด',
            subTitle: data.msg,
            buttons: ['ตกลง']
          });
          this.nav.present(alert);
          console.log(data.msg);
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

    let params = this.encrypt.encrypt({ image: image, hashKey: hashKey });
    
    let url = `${this.url}/api/patient/save-photo`;
    this.settings.savePhoto(url, this.token, params)
      .then(data => {
        if (data.ok) {
          this.getPatient();
        } else {
          console.log(data.msg);
        }

        loading.dismiss();
      });
    
  }

  getBarcode(hashKey) {
    this.nav.push(BarcodePage, {hashKey: hashKey});
  }

  toggleAppoint() {
    // alert(this.alertAppoint);
    let status = this.alertAppoint ? 'Y' : 'N';
  
    let url = `${this.url}/api/patient/save-photo`;
    this.settings.savePhoto(url, this.token, )
      .then(data => {
        if (data.ok) {
          this.getPatient();
        } else {
          console.log(data.msg);
        }

        loading.dismiss();
      });
  }

}

