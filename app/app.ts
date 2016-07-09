import {Component} from "@angular/core";
import {Platform, ionicBootstrap, MenuController, Events} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {LoginPage} from './pages/login/login';

@Component({
  templateUrl: 'build/app.html'
})
export class MyApp {
  //rootPage: any = TabsPage;
  
  rootPage: any = LoginPage;

  constructor(platform: Platform, public events: Events) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.overlaysWebView(true);
      StatusBar.backgroundColorByHexString('#01508C');
      //StatusBar.styleBlackOpaque();
      // StatusBar.styleDefault();
    });
  }

  menuOpened() {
    console.log('Menu open');
  }
}

ionicBootstrap(MyApp, [], {
  menuType: 'push',
    platforms: {
      ios: {
        menuType: 'overlay',
      }
  }
});