// app.js
App({
    // 生命周期回调—监听小程序初始化 小程序初始化完成时触发，全局只触发一次。
    onLaunch(){
        // 进入小程序 创建背景音乐对象
        var thisBackgroundAudioManager =  wx.getBackgroundAudioManager();
        // console.log("全局变量的调试:"+this);
        this.globalData.BackgroundAudioManager = thisBackgroundAudioManager;
        // console.log(this);
        // console.log(this.globalData.BackgroundAudioManager);
    },
    globalData:{
        BackgroundAudioManager:''   //全局背景音频对象
    }
//   onLaunch() {
//     // 展示本地存储能力
//     const logs = wx.getStorageSync('logs') || []
//     logs.unshift(Date.now())
//     wx.setStorageSync('logs', logs)

//     // 登录
//     wx.login({
//       success: res => {
//         // 发送 res.code 到后台换取 openId, sessionKey, unionId
//       }
//     })
//   },
//   globalData: {
//     userInfo: null
//   }
})
