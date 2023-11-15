// pages/singerMessage/singerMessage.js
// 获取传送过来的歌手ID 进行歌手详情的查询 渲染数据
Page({
    // 获取歌手详情
    // http://localhost:3000/artist/detail?id=
    /**
     * 页面的初始数据
     */
    data: {
        // 歌手信息数据
        SingerMessage:'',
        // 歌手ID
        SingerID:'',
        // 歌手图片地址
        SingerImg:'',
        //歌手名字和别名
        SingerName:'',
        SingerName2:'',
        //音乐身份
        SingerStatus:'',
        //艺人简介
        SingerBriefDesc:''
    },
    // 获取到数据后设置渲染
    datas(){
        const datas = this.data.SingerMessage;
        // console.log(datas)
        const SingerImg = datas.artist.cover
        const SingerName = datas.artist.name
        const SingerID = datas.artist.id
        const SingerName2 = datas.artist.alias[0] || ''
        const imageDesc = (datas.identify && datas.identify.imageDesc) || '暂无'
        const SingerStatus = imageDesc
        const SingerBriefDesc = datas.artist.briefDesc
        this.setData({
            SingerID:SingerID,
            SingerImg:SingerImg,
            SingerName:SingerName,
            SingerName2:SingerName2,
            SingerStatus:"音乐身份:"+SingerStatus,
            SingerBriefDesc:SingerBriefDesc,
        })
        wx.setNavigationBarTitle({
          title: this.data.SingerName
        })
    },
    getSingerAPI(f){
        const SingerMessageData = '歌手信息'+f
        wx.getStorage({
            key:SingerMessageData,
            success:(e)=>{
                console.log(e)
                this.setData({
                    SingerMessage:e.data
                },()=>{
                    this.datas();
                    console.log("缓存数据渲染完毕")
                })
            },
            fail:()=>{
                console.log(f)
                wx.request({
                    url: 'http://localhost:3000/artist/detail?id='+f,
                    success:(e)=>{
                        console.log(e)
                        const SingerMessage = e.data.data
                        this.setData({
                            SingerMessage:SingerMessage
                        },()=>{
                            this.datas();
                            console.log("网络数据已经请求，开始渲染并进行本地存储");
                            wx.setStorage({
                                key:SingerMessageData,
                                data:SingerMessage
                            })
                        })
                    }
                  })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const eventChannel = this.getOpenerEventChannel()
          // 监听acceptDataFromOpenerPage事件
          // 获取上一页面通过eventChannel传送到当前页面的数据
          eventChannel.on('acceptDataFromOpenerPage', e=> {
            //   console.log(e);
              this.setData({
                SingerID:e.data
              },()=>{
                this.getSingerAPI(this.data.SingerID)
              })
        })
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