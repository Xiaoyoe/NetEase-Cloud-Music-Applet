// pages/My/My.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userImg:'http://photo.chaoxing.com/p/201051431_80?temp=1699969422654',
        userName:'喜芸',
        recentlyPlayList:{
            img:["https://img0.baidu.com/it/u=189729508,2250841752&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500","https://img2.baidu.com/it/u=3866704393,3801099831&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500","https://img2.baidu.com/it/u=2708810287,2935753791&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"],
            Name:["江南","追光者","云芸"],
        },
        LoginStatc:true,
        LoginOrExit:"注销",
    },
    IfLogin(){
          if(this.data.LoginStatc){
              this.exit()
          }else{
              this.login()
          }
    },
    exit(){
        this.setData({
            LoginStatc: false,
            LoginOrExit:"登录",
            userName:"游客",
            userImg:"https://img0.baidu.com/it/u=2026524700,1997000925&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
        })
    },
    login(){
        this.setData({
            LoginStatc: true,
            LoginOrExit:"注销",
            userName:"喜芸",
            userImg:"http://photo.chaoxing.com/p/201051431_80?temp=1699969422654",
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})