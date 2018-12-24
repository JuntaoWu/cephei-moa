/**
 * 请在白鹭引擎的Main.ts中调用 platform.login() 方法调用至此处。
 */

import * as fileutil from 'library/file-util';

class WxgamePlatform {

  env = 'prod';
  name = 'wxgame';
  appVersion = '0.4.3';
  isConnected = true;

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          resolve(res)
        }
      });
    });
  }

  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        success: function(res) {
          var userInfo = res.userInfo
          var nickName = userInfo.nickName
          var avatarUrl = userInfo.avatarUrl
          var gender = userInfo.gender //性别 0：未知、1：男、2：女
          var province = userInfo.province
          var city = userInfo.city
          var country = userInfo.country
          resolve({
            ...res,
            ...userInfo
          });
        },
        fail: function(res) {
          reject(res);
        }
      });
    });
  }

  userInfoButton = null;

  authorizeUserInfo(imageUrl) {
    let systemInfo = wx.getSystemInfoSync();
    this.userInfoButton = this.userInfoButton || wx.createUserInfoButton({
      type: imageUrl ? 'image' : 'text',
      text: '微信登录',
      image: imageUrl,
      style: {
        left: (systemInfo.windowWidth - 300) / 2,
        top: (systemInfo.windowHeight - 100),
        width: 300,
        height: imageUrl ? 60 : 40,
        lineHeight: 40,
        backgroundColor: '#0084ff',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    });
    return new Promise((resolve, reject) => {

      this.userInfoButton.onTap((res) => {
        if (res.userInfo) {
          this.userInfoButton.destroy();
          resolve({
            ...res,
            ...res.userInfo
          });
        } else {
          console.error(res);
          reject(res);
        }
      });
    });
  }

  checkForUpdate() {
    console.log("wx checkForUpdate.");
    var updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {
      console.log("hasUpdate: " + res.hasUpdate);
      if (res.hasUpdate) {
        fileutil.fs.existsSync("http") && (console.log("remove http folder"), fileutil.fs.remove("http"));
        fileutil.fs.existsSync("https") && (console.log("remove https folder"), fileutil.fs.remove("https"));
        fileutil.fs.existsSync("temp_text") && (console.log("remove temp_text folder"), fileutil.fs.remove("temp_text"));
        fileutil.fs.existsSync("temp_image") && (console.log("remove temp_image folder"), fileutil.fs.remove("temp_image"));
      }
    });
  }

  getVersion() {
    return this.getStorage("apiVersion");
  }

  applyUpdate(version) {
    console.log("applyUpdate for cached resource.");
    try {
      fileutil.fs.existsSync("http") && (console.log("remove http folder"), fileutil.fs.remove("http"));
      fileutil.fs.existsSync("https") && (console.log("remove https folder"), fileutil.fs.remove("https"));
      fileutil.fs.existsSync("temp_text") && (console.log("remove temp_text folder"), fileutil.fs.remove("temp_text"));
      fileutil.fs.existsSync("temp_image") && (console.log("remove temp_image folder"), fileutil.fs.remove("temp_image"));

      wx.removeStorageSync("devapiVersion");
      wx.removeStorageSync("prodapiVersion");
      this.setStorage("apiVersion", version);
    } catch (ex) {
      console.error(ex.message);
    }
  }

  openDataContext = new WxgameOpenDataContext();

  getOpenDataContext() {
    return this.openDataContext;
  }

  shareAppMessage(message, imageUrl, query, callback) {
    wx.shareAppMessage({
      title: message,
      imageUrl: imageUrl,
      query: query,
      success: (res) => {
        console.log("shareAppMessage successfully.", res);
        callback && callback(res);
      }
    });
  }

  showShareMenu(imageurl) {
    wx.showShareMenu({
      withShareTicket: true,
      success: function(res) {
        wx.onShareAppMessage(function() {
          return {
            imageUrl: imageurl,
          };
        });
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  }

  onNetworkStatusChange(callback) {
    wx.onNetworkStatusChange((res) => {
      this.showToast(`当前网络${res.isConnected ? '已连接' : '未连接'}`);
      callback(res);
    });
  }

  onResume(res) {
    // default resumeHandler
  }

  registerOnResume(callback) {
    this.onResume = callback;
  }

  resume() {
    this.onResume && this.onResume({
      isConnected: this.isConnected
    });
  }

  showToast(message) {
    wx.showToast({
      title: message,
      duration: 1500,
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }

  setStorage(key, value) {
    wx.setStorageSync(`${this.env}${key}`, value);
  }

  getStorage(key) {
    return wx.getStorageSync(`${this.env}${key}`);
  }

  setStorageAsync(key, value) {
    wx.setStorage({
      key: `${this.env}${key}`,
      data: value,
    });
  }

  getStorageAsync(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: `${this.env}${key}`,
        success: function(res) {
          resolve(res.data);
        },
        fail: function(res) {
          resolve("");
        }
      });
    });
  }

  showModal(message, confirmText, cancelText) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: message,
        showCancel: !!cancelText,
        cancelText: cancelText || '',
        confirmText: confirmText || '确定',
        success: function(res) {
          resolve(res);
        },
        fail: function(res) {},
        complete: function(res) {},
      })
    });
  }

  showLoading(message) {
    wx.showLoading({
      title: message || '加载中',
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }

  hideLoading() {
    wx.hideLoading();
  }

  playVideo(src) {
    return wx.createVideo({
      src: src
    });
  }

  destroyVideo(videoContainer) {
    videoContainer && videoContainer.destroy && videoContainer.destroy();
  }

  showPreImage(imgList, currentIndex) {
    var urls = imgList.map(m => {
      return `${m}?v=${this.getVersion()}`;
    })
    var current = currentIndex ? urls[currentIndex] : urls[0];
    wx.previewImage({
      current: current,
      urls: urls,
    });
  }

  getLaunchInfo() {
    return wx.getLaunchOptionsSync();
  }

  createBannerAd(name, adUnitId, style) {
    this[`banner-${name}-config`] = {
      name: name,
      adUnitId: adUnitId,
      style: style
    };
    this.createBannerAdWithConfig(this[`banner-${name}-config`]);
  }

  createBannerAdWithConfig(config, show) {
    let {
      name,
      adUnitId,
      style
    } = config;
    let systemInfo = wx.getSystemInfoSync();
    if (systemInfo.SDKVersion >= "2.0.4") {
      let top = 0;
      let realWidth = wx.getSystemInfoSync().windowWidth * 0.8;

      this[`banner-${name}`] = wx.createBannerAd({
        adUnitId: adUnitId,
        style: {
          top: 0,
          left: 0,
          width: realWidth
        }
      });
      this[`banner-${name}`] && this[`banner-${name}`].onResize(e => {

        let windowWidth = wx.getSystemInfoSync().windowWidth;
        let width = e.width;
        this[`banner-${name}`].style.left = (windowWidth - width) / 2;

        if (style == "bottom") {
          let windowHeight = wx.getSystemInfoSync().windowHeight;
          let height = e.height;
          this[`banner-${name}`].style.top = windowHeight - height;
        }
      });

      this[`banner-${name}`] && this[`banner-${name}`].onError(e => {
        console.error(e);
      });

      show && this[`banner-${name}`].onLoad(() => {
        this[`banner-${name}`] && !this[`banner-${name}`]._destroyed && this[`banner-${name}`].show();
      });
    }
  }

  showBannerAd(name) {
    if (this[`banner-${name}`] && !this[`banner-${name}`]._destroyed) {
      this[`banner-${name}`].show();
    } else {
      this.createBannerAdWithConfig(this[`banner-${name}-config`], true);
    }
  }

  hideBannerAd(name) {
    if (this[`banner-${name}`]) {
      this[`banner-${name}`].hide();
      this[`banner-${name}`].destroy();
      this[`banner-${name}`].offResize();
      this[`banner-${name}`].offLoad();
    }
  }

  hideAllBannerAds() {
    this.hideBannerAd("top");
    this.hideBannerAd("bottom");
  }

  createRewardedVideoAd(name, adUnitId, callback) {
    this[`video-${name}`] = wx.createRewardedVideoAd({
      adUnitId: adUnitId
    });

    this[`video-${name}`].load().then(() => {
      console.log("createRewardedVideoAd load.");
    }).catch((error) => {
      console.error("createRewardedVideoAd error", error);
      this[`video-${name}`].offLoad();
    });

    this[`video-${name}`].onClose(res => {
      // 用户点击了【关闭广告】按钮
      // 小于 2.1.0 的基础库版本，res 是一个 undefined
      if (res && res.isEnded || res === undefined) {
        // 正常播放结束，可以下发游戏奖励
        callback && callback(name);
      } else {
        // 播放中途退出，不下发游戏奖励
      }
    });
  }

  showVideoAd(name) {
    if (this[`video-${name}`]) {
      this[`video-${name}`].show().catch(err => {
        console.error(err && err.message);
        this[`video-${name}`].load()
          .then(() => this[`video-${name}`].show());
      });
    } else {
      console.error("rewardedVideoAd never created.");
    }
  }
  
  navigateToMiniProgram() {
    return new Promise((resolve, reject) => {
      wx.navigateToMiniProgram({
        appId: 'wx20dd58f2f181fba7',
        envVersion: 'trial',
        success(res) {
          console.log("跳转成功");
        }
      })
    })
  }

  setClipboardData(data) {
    return new Promise((resolve, reject) => {
      wx.setClipboardData({
        data: data,
        success: function (res) {
          return resolve()
         },
        fail: function (res) { },
        complete: function (res) { },
      });
    });
  }

  openExternalLink(url) {
    let self = this;
    self.showModal(`请复制该链接并在外部浏览器打开\r\n${url}`, '复制').then(res => {
      self.setClipboardData(url).then(() => {
        self.showToast('复制成功');
      });
    });
  }

}

class WxgameOpenDataContext {

  createDisplayObject(type, width, height) {
    const bitmapdata = new egret.BitmapData(sharedCanvas);
    bitmapdata.$deleteSource = false;
    const texture = new egret.Texture();
    texture._setBitmapData(bitmapdata);
    const bitmap = new egret.Bitmap(texture);
    bitmap.width = width;
    bitmap.height = height;

    if (egret.Capabilities.renderMode == "webgl") {
      const renderContext = egret.wxgame.WebGLRenderContext.getInstance();
      const context = renderContext.context;
      ////需要用到最新的微信版本
      ////调用其接口WebGLRenderingContext.wxBindCanvasTexture(number texture, Canvas canvas)
      ////如果没有该接口，会进行如下处理，保证画面渲染正确，但会占用内存。
      if (!context.wxBindCanvasTexture) {
        egret.startTick((timeStarmp) => {
          egret.WebGLUtils.deleteWebGLTexture(bitmapdata.webGLTexture);
          bitmapdata.webGLTexture = null;
          return false;
        }, this);
      }
    }
    return bitmap;
  }


  postMessage(data) {
    const openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage(data);
  }
}


window.platform = new WxgamePlatform();