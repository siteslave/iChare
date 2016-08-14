import {Component, OnInit} from '@angular/core';
import {Camera, Toast, SecureStorage, ActionSheet, SpinnerDialog} from 'ionic-native';
import {ModalController, ToastController, ActionSheetController, AlertController, LoadingController, Platform, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
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
  rows?: any,
  data?: Object
}

@Component({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [],
  providers: [Configure, Settings, Encrypt]
})

export class SettingsPage implements OnInit {

  // localStorage: any;
  url: string;
  patients: any;
  token: any;
  selectedPatient;
  alertAppoint: boolean = false;
  alertNews: boolean = false;
  alertService: boolean = false;
  secureStorage: SecureStorage;

  constructor(public nav: NavController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    // this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();

    this.secureStorage = new SecureStorage();

    this.secureStorage.create('iChare')
      .then(
      () => console.log('Storage is ready!'),
      error => console.log(error)
      );

   }

  ngOnInit() {
  
  }

  ionViewDidEnter() {
    this.getPatient();  
    this.getAlertSetting();
  }

  getPatient() {
    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });

    // this.nav.present(loading);
    // loading.present();

    // this.localStorage.get('token')
    //   .then(token => {
    //     this.token = token;
        
    //     return ;
    //   })

    SpinnerDialog.show('ประมวลผล', 'กำลังโหลดข้อมูล...');


    this.secureStorage.get('token')
      .then(token => { 
        
        let url = `${this.url}/api/patient/members?token=${token}`;
        this.settings.getMemberPatients(url)
          .then(data => {
            // console.log(data);
            let _data = <httpData>data;
            let encryptedData = _data.data;
            // let secretKey = this.config.getSecretKey();

            this.secureStorage.get('sessionKey')
              .then(sessionKey => {
              
                let decryptText = this.encrypt.decrypt(encryptedData, sessionKey);
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

                SpinnerDialog.hide();
                // loading.dismiss();

                Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(
                  toast => {
                    // console.log(toast);
                  }
                );
                
              });

            
            
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            // loading.dismiss();
            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
            
          });
        
      },
       error => console.log(error)
    ); 
    
  }

  setDefault(hashKey) {

    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });

    // this.nav.present(loading);
    // loading.present();

    SpinnerDialog.show('ประมวลผล', 'กำลังดำเนินการ...')
    
    let url = `${this.url}/api/patient/set-default`;

    this.secureStorage.get('sessionKey')
      .then(sessionKey => {

        

        this.secureStorage.get('token')
          .then(token => {
            let data = this.encrypt.encrypt({ hashKey: hashKey, token: token }, sessionKey);

            this.settings.setDefault(url, data)
              .then(data => {
                let result = <httpData>data;
                if (result.ok) {
                  // loading.dismiss();
                  SpinnerDialog.hide();
                  Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(
                    toast => {
                      // console.log(toast);
                    });
                  this.getPatient();
                } else {
                  // loading.dismiss();
                  SpinnerDialog.hide();
                  Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
                    toast => {
                      // console.log(toast);
                    });
                  console.log(result.msg);
                }
              }, err => {
                // loading.dismiss();
                console.log(err);
                SpinnerDialog.hide();
                Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
                  toast => {
                    // console.log(toast);
                  });
              });
          });
        

      });
  
    
  }

  // show action sheet
  showTakePhotoAction(hashKey) {
    console.log(hashKey);

    let buttonLabels = ['แกลอรี่', 'กล้องถ่ายรูป'];
    ActionSheet.show({
      'title': 'เลือกที่มาของภาพ?',
      'buttonLabels': buttonLabels,
      'androidTheme': 3,
      'addCancelButtonWithLabel': 'ยกเลิก',
      'androidEnableCancelButton': true,
      // 'addDestructiveButtonWithLabel': 'Delete'
    }).then((buttonIndex: number) => {
      // console.log('Button pressed: ' + buttonIndex);
      if (buttonIndex == 1) {
        this.takePhotoWithGallery(hashKey)
      } else if (buttonIndex == 2) {
        this.takePhotoWithCamera(hashKey)
      } else {
        // no action
      }
      });
  


    // let idx = _.findIndex(this.patients, { hn: hn });
  //   let actionSheet = this.actionSheetCtrl.create({
  //     title: 'เลือกที่มาของภาพถ่าย',
  //     cssClass:'action-sheets-basic-page',
  //     buttons: [
  //       {
  //         text: 'แกลอรี่',
  //         icon: !this.platform.is('ios') ? 'image' : null,
  //         // role: 'destructive',
  //         handler: () => {
  //           this.takePhotoWithGallery(hashKey)
  //         }
  //       }, {
  //         text: 'กล้อง',
  //         icon: !this.platform.is('ios') ? 'camera' : null,
  //         handler: () => {
  //           this.takePhotoWithCamera(hashKey)
  //         }
  //       }, {
  //         text: 'ยกเลิก',
  //         // icon: !this.platform.is('ios') ? 'clear' : null,
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Cancel clicked');
  //         }
  //       }
  //     ]
  //   });

  // // this.nav.present(actionSheet);
  //   actionSheet.present();
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
        // alert(JSON.stringify(err));
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
        // alert(JSON.stringify(err))
      });
    });
  }

  savePhoto(hashKey, image) {
    // let loading = this.loadingCtrl.create({
    //   content: 'Saving...'
    // });

    // this.nav.present(loading);
    // loading.present();

    SpinnerDialog.show('ประมวลผล', 'กำลังบันทึกรูปภาพ...');

    let params = this.encrypt.encrypt({ image: image, hashKey: hashKey });
    
    let url = `${this.url}/api/patient/save-photo`;

    this.secureStorage.get('token')
      .then(token => {
        this.settings.savePhoto(url, token, params)
          .then(() => {
            this.getPatient();
            // loading.dismiss();
            SpinnerDialog.hide();
            
            Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          }, err => {
            SpinnerDialog.hide();
            console.log(err);

            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });

            // this.nav.present(toast);
            // toast.present();
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
    this.secureStorage.get('token')
      .then(token => {
        SpinnerDialog.show('บันทึก', 'กำลังบันทึก...');
        this.settings.setAlert(url, token, '2', status)
          .then(() => {
            
            SpinnerDialog.hide();
            Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          }, err => {
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          });
      });
  
  }

  toggleService() {
    // type : 1 = news, 2 = appoint, 3 = service
    // alert(this.alertAppoint);
    let status = this.alertService ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;
    SpinnerDialog.show('บันทึก', 'กำลังบันทึก...');

    this.secureStorage.get('token')
      .then(token => {
        this.settings.setAlert(url, token, '3', status)
          .then(() => {
            SpinnerDialog.hide();
            Toast.show("บันทึกเสร็จเรียบร้อย", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          }, err => {
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          });
      });
    
  }

  toggleNews() {
    // type : 1 = news, 2 = appoint, 3 = service
    // alert(this.alertAppoint);
    let status = this.alertNews ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;

    SpinnerDialog.show('บันทึก', 'กำลังบันทึก...');

    this.secureStorage.get('token')
      .then(token => {
        this.settings.setAlert(url, token, '1', status)
          .then(() => {
            SpinnerDialog.hide();
            Toast.show("บันทึกเสร็จเรียบร้อย", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          }, err => {
            SpinnerDialog.hide();
            console.log(err);
            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
          });
      });
    
  }

  getAlertSetting() {

    let url = `${this.url}/api/member/get-alert-setting`;
    this.secureStorage.get('token')
      .then(token => {
      
        this.settings.getAlertSetting(url, token)
          .then(alert => {
            let _alert = <AlertData>alert;

            this.alertAppoint = _alert.alert_appoint == 'Y' ? true : false;
            this.alertNews = _alert.alert_news == 'Y' ? true : false;
            this.alertService = _alert.alert_service == 'Y' ? true : false;

          }, err => {
            console.log(err);
          });
        
      });
  }
  

}

