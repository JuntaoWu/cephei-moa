/**
 * 请在白鹭引擎的Main.ts中调用 platform.login() 方法调用至此处。
 */

import * as fileutil from 'library/file-util';

class WxgamePlatform {

    name = 'wxgame'

    login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    resolve(res)
                }
            })
        })
    }

    getUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                withCredentials: true,
                success: function (res) {
                    var userInfo = res.userInfo
                    var nickName = userInfo.nickName
                    var avatarUrl = userInfo.avatarUrl
                    var gender = userInfo.gender //性别 0：未知、1：男、2：女
                    var province = userInfo.province
                    var city = userInfo.city
                    var country = userInfo.country
                    resolve(userInfo);
                }
            })
        })
    }

    checkForUpdate() {
        console.log("wx checkForUpdate.");
        var updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            console.log("hasUpdate: " + res.hasUpdate);
            res.hasUpdate && fileutil.fs.remove("temp_text");
            res.hasUpdate && fileutil.fs.remove("temp_image");
        });
    }

    getVersion() {
        return wx.getStorageSync("apiVersion");
    }

    applyUpdate(version) {
        console.log("applyUpdate for cached resource.");
        try {
            fileutil.fs.remove("temp_text");
            fileutil.fs.remove("temp_image");
            wx.setStorage({
              key: 'apiVersion',
              data: version,
            });
        }
        catch (ex) {
            console.error(ex.message);
        }
    }

    openDataContext = new WxgameOpenDataContext();

    getOpenDataContext() {
        return this.openDataContext;
    }

    shareAppMessage() {
        wx.shareAppMessage({
            title: '转发标题'
        });
    }

    onNetworkStatusChange(callback) {
        wx.onNetworkStatusChange((res) => {
            this.showToast(`当前网络${res.isConnected ? '已连接' : '未连接'}`);
            callback(res);
        });
    }

    showToast(message) {
        wx.showToast({
            title: message,
            duration: 1500,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    }

    setStorage(key, value) {
      wx.setStorage({
        key: key,
        data: value,
      })
    }

    getStorage(key) {
      return wx.getStorageSync(key);
    }

    showModal(message, confirmText, cancelText) {
      return new Promise((resolve, reject) => {
        wx.showModal({
          title: '提示',
          content: message,
          showCancel: true,
          cancelText: cancelText || '取消',
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
      return wx.createVideo({src: src});
    }
	
    showPreImage(imgList) {
      wx.previewImage({
        urls: imgList,
      })
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