// pages/home/home.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        banners:[],  // banners轮播图数据
        HSinger:[], //热门歌手数据
        newDetail:[], //最新歌曲数据
        // 热门歌手板块
        SingerDatail:[] , //歌手的数据
    },
    // 获取banner轮播图
    getBannerAPI(){
        wx.request({
          url: 'http://localhost:3000/banner',
          method:"GET",
          success:(e)=>{
            // console.log(e);
            const banners = e.data.banners;
            this.setData({
                banners:banners,
            })
            // console.log(this.data.banners);
            // 请求成功后将数据存储到本地缓存
            wx.setStorage({
                key: 'bannerData',
                data: banners,
            })
          }
        })
    },
    // 获取热门歌手的API
    getHotSinger(){
        wx.request({
          url: 'http://localhost:3000/top/artists?limit=30',
          method:'GET',
          success:(e)=>{
            //console.log(e);
              const HotSinger = e.data.artists;
              this.setData({
                HSinger:HotSinger
              })
            // 请求成功后将数据存储到本地缓存
            wx.setStorage({
                key: 'HotSingerData',
                data: HotSinger,
            })
          }
        })
    },
    //获取最新歌曲的API
    getNewMusic(){
        wx.request({
          url: 'http://localhost:3000/personalized/newsong',
          method:'GET',
          success:(e)=>{
            // console.log(e);
            const newDetail = e.data.result;
              this.setData({
                newDetail : newDetail
              })
            //console.log(newDetail);
            //请求成功后将数据存储到本地缓存
              wx.setStorage({
                key: 'newDetailData',
                data: newDetail,
            })
          }
        })
    },
    //获取home页面传输过来的数据索引(热门歌手板块)
    getIndexdata(e){
        // console.log(e);
        // console.log(e.currentTarget.dataset.index);
        // 获取对应索引 匹配获得的热门歌手数组数据 匹配歌手详细数据
        const index = e.currentTarget.dataset.index;
        const HSinger = this.data.HSinger;
        // console.log(HSinger[index]);
        wx.navigateTo({
          url: '/pages/singerDetail/singerDetail',
          success:(res)=>{
            // 页面间事件通信通道
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('acceptDataFromOpenerPage', 
            {   
                // 把歌手匹配上的数据进行传输
                data: HSinger[index]
            })
          }
        })
    },
    /* ------------------------------------------------- */
    // 跳转到音乐播放器界面 并且传输当前点击歌曲的数据
    GoPlay(e){
        // 获取当前音乐列表的索引下标
        const index = e.currentTarget.dataset.index;
        // 然后比对一下获取到的音乐列表数据 首页是newDetail
        const newDetail = this.data.newDetail;
        //获取当前列表当前音乐ID
        const mid = newDetail[index].id;
        //获取当前列表当前音乐的音乐人
        // const musicdetailAll = newDetail[index];
        const musicsonger = newDetail[index].song.artists[0].name;
        // console.log(musicsonger);
        // console.log(musicdetailAll);
        // console.log(musicdetailAll.song.artists[0].name)
        // console.log(mid);
        // 进行数据整理后进行数据传输到play播放页面
         const MusicData_Obj = {}
         MusicData_Obj.musicSonger = musicsonger
         MusicData_Obj.musiclist = newDetail
         MusicData_Obj.musicIndex = index
        //  console.log(MusicData_Obj);
        wx.navigateTo({
            url: '/pages/play/play',
            success:(e)=>{
              e.eventChannel.emit('acceptDataFromOpenerPage',{
                  data:MusicData_Obj
              })
            }
          })
        // 判断获取的音频是否可以播放 因为有些是要vip或者版权的
        // wx.request({
        //   url: 'http://localhost:3000/check/music?id='+mid,
        //   method:"GET",
        //   success:(e)=>{
        //     console.log(e);
        //     if(e.data.message === "ok"){
        //         // console.log("可以播放")
        //         // 进行数据整理后进行数据传输到play播放页面
        //         const MusicData_Obj = {}
        //         MusicData_Obj.musiclist = newDetail
        //         MusicData_Obj.musicIndex = index
        //         // console.log(MusicData_Obj);
        //         wx.navigateTo({
        //           url: '/pages/play/play',
        //           success:(e)=>{
        //             e.eventChannel.emit('acceptDataFromOpenerPage',{
        //                 data:MusicData_Obj
        //             })
        //           }
        //         })
        //     }else{
        //         // console.log("不能播放")
        //         wx.showModal({
        //             content:'歌曲没有版权',
        //             showCancel:true,
        //             title:'提示'
        //         })
        //     }
        //   },
        // })
    },
    //测试接口
    getTest(){
        wx.request({
          url: 'http://localhost:3000/recommend/resource',
          method:"GET",
          success:(e)=>{
            console.log(e);
          }
        })
    },
    getTest1(){
        // console.log("点击");
        console.log(this.data.HSinger)
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 尝试从本地缓存中读取banner数据
        wx.getStorage({
            key: 'bannerData',
            success: (res) => {
                // console.log(res)
                // 使用缓存数据
                this.setData({
                    banners: res.data,
                })
            },
            fail: () => {
                // 未找到缓存数据，重新发起网络请求
                this.getBannerAPI();
            }
        })

        // 尝试从本地缓存中读取hotSinger数据
        wx.getStorage({
          key: 'HotSingerData',
          success: (res) => {
            // console.log(res)
            this.setData({
                HSinger: res.data,
            });
          },
          fail: () => {
            this.getHotSinger();
          },
        });
    
        // 尝试从本地缓存中读取newMusic数据
        wx.getStorage({
          key: 'newDetailData',
          success: (res) => {
            // console.log(res)
            this.setData({
                newDetail: res.data,
            });
          },
          fail: () => {
            this.getNewMusic();
          },
        });
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