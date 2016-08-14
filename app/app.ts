import {Component, enableProdMode} from "@angular/core";
import {Platform, ionicBootstrap, MenuController, Events} from 'ionic-angular';
import {StatusBar, SecureStorage, Dialogs, Toast} from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {AboutPage} from './pages/about/about';

enableProdMode();

@Component({
  templateUrl: 'build/app.html',
  // providers: []
})
export class MyApp {
  //rootPage: any = TabsPage;
  rootPage: any = LoginPage;
  secureStorage: SecureStorage;
  
  constructor(platform: Platform, public events: Events, menu: MenuController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.overlaysWebView(true);
      StatusBar.backgroundColorByHexString('#01508C');
      //StatusBar.styleBlackOpaque();
      // StatusBar.styleDefault();

      this.secureStorage = new SecureStorage();

    this.secureStorage.create('iChare')
      .then(
      () => console.log('Storage is ready!'),
      error => console.log(error)
      );

    });

    platform.registerBackButtonAction(() => {
      Dialogs.confirm('คุณต้องการออกจากระบบ?', 'ยืนยัน', ['ยกเลิก', 'ยืนยัน'])
        .then(btnIndex => {
          if (btnIndex == 2) {
            this.secureStorage.remove('token').then(() => { 
               platform.exitApp();
            });
          }
        });
    });    
  }
  
  openPage() {
    // Reset the nav controller to have just this page
    // we wouldn't want the back button to show in this scenario
    this.rootPage = AboutPage;
  }
  
}

ionicBootstrap(MyApp, [], {});