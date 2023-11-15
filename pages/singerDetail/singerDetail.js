// pages/singerDetail/singerDetail.js
// 写的时候发现歌手热门歌曲返回的数据里面的歌曲图片是缩略图，所以要从歌曲的专辑id去请求专辑的详细详细接口进行调用，并把专辑详细的图片进行存储然后传输渲染.2023.11.06
//吐槽一下!!!!网易云工作人员这么懒的，只有林俊杰的没有收费的歌曲图片是缩略图，其他的不是,数据还放到其他地方去了,我还以为所有歌都是呢，整的我找了半天的专辑信息里面的图片发现没有用呜呜呜呜 2023.11.07
Page({
    /**
     * 页面的初始数据
     */
    data: {
        singerDatail:{}, //传过来的歌手数据
        singerSong:[], //歌手的热门歌曲
        MusicAlbum:'', //专辑信息
        MusicAlbumImg:'', //专辑图片
    },
    // 获取歌手的热门50首music
    getHotMusic(callback){
        const singerID = this.data.singerDatail.data.id;
        const cachekey = 'SingerID_'+singerID;
        //getHotMusicData 是用来作为本地缓存的 key 的变量
        // 将本地缓存的 key 设计得有一定的规律性，以便于后续的读取和管理。这样，在需要获取或更新缓存数据时，可以使用相同的 key 进行操作。
        console.log("歌手的ID为:"+singerID);
        wx.getStorage({
            key:'cachekey',
            success:(e)=>{
                console.log(e);
                console.log("有缓存")
                this.setData({
                    singerSong:e.data
                },()=>{
                    //更新之后执行回调函数 
                    if(callback) callback();
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/artist/top/song?id='+singerID,
                    method:'GET',
                    success:(e)=>{
                    //console.log(e);
                      this.setData({
                        singerSong:e.data.songs
                      },()=>{
                        const singerSong = this.data.singerSong;
                        wx.setStorage({
                            //key这里加了的"cachekey"反而会有问题（不会更新cachekey的值，但八双引号去掉了之后反而可以了)
                          key:cachekey,
                          data:singerSong,
                      })
                        if(callback) callback();
                      })
                    }
                  })
            }
        })
    },
    // 跳转到音乐播放器界面 并且传输当前点击歌曲的数据
    GoPlay(e){
        // 获取当前音乐列表的索引下标
        const index = e.currentTarget.dataset.index;
        // 然后比对一下获取到的音乐列表数据 singerSong
        const singerSong = this.data.singerSong;
        // console.log(singerSong);
        // 获取当前歌手名字
        const singer = this.data.singerDatail.data.name;
        // console.log(singer);
        //获取当前列表当前音乐ID
        const mid = singerSong[index].id;
        // console.log(mid);
        // 判断获取的音频是否可以播放 因为有些是要vip或者版权的 2023.11.1
        // 2023.11.7 感觉判断不是很有必要 因为会有试听 如果加版权判断可能会导致网络拥挤和api接口不稳定的问题
        // 进行数据整理后进行数据传输到play播放页面
            const MusicData_Obj = {}
            MusicData_Obj.musicSonger = singer;
            MusicData_Obj.musiclist = singerSong
            MusicData_Obj.musicIndex = index
            // console.log(MusicData_Obj);
            wx.navigateTo({
              url: '/pages/play/play',
              success:(e)=>{
                e.eventChannel.emit('acceptDataFromOpenerPage',{
                    data:MusicData_Obj
                })
              }
            })
        // wx.request({
        //   url: 'http://localhost:3000/check/music?id='+mid,
        //   success:(e)=>{
        //     console.log(e);
        //     if(e.data.message === "ok"){
        //         // console.log("可以播放")
        //         // 进行数据整理后进行数据传输到play播放页面
        //         const MusicData_Obj = {}
        //         MusicData_Obj.musicSonger = singer;
        //         MusicData_Obj.musiclist = singerSong
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
    GoSingerMessage(){
        // 获取当前的音乐人id传输到歌手信息页面
        const singerID = this.data.singerDatail.data.id;
        wx.navigateTo({
            url: '/pages/singerMessage/singerMessage',
            success:(e)=>{
              e.eventChannel.emit('acceptDataFromOpenerPage',{
                  data:singerID
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
        eventChannel.on('acceptDataFromOpenerPage', data=> {
            // console.log(data) 接收传过来的数据
            // console.log(data.data.id); 获取歌手id 并存储起来
            this.setData({
                singerDatail:data
            },()=>{
            // console.log(this.data.singerDatail.data.id);
            // 监听获取上个页面数据后，进行请求调用
            // 先尝试从本地缓存中读取数据，没有就进行网络请求的调用
            this.getHotMusic(()=>{
                //热门歌手歌曲数据获取之后进行回调函数并调用专辑详细信息的函数getMusicAlbum()
                // this.getMusicAlbum();
                //获取专辑信息暂时不用了2023.11.7
                console.log("已经获取到歌手的最新歌曲")
            });
            })
            // 动态修改窗口标题
            wx.setNavigationBarTitle({
                title: this.data.singerDatail.data.name
              });
      })
       
    },
    
    //获取专辑详细(2023.11.7 暂时不用)
    getMusicAlbum(){
        // http://localhost:3000/album?id=159400773
        //获取专辑id
        const MusicAlbumID = this.data.singerSong[0].al.id;
        // console.log(MusicAlbumID)
        wx.getStorage({
          key:'MusicAlbumData',
          success:(e)=>{
            console.log(e);
            console.log("找到缓存了，不用重新调用专辑接口");
            this.setData({
              MusicAlbum:e.data
            })
          },
          //如果没有，就通过专辑ID请求数据
          fail:()=>{
            wx.request({
              url: 'http://localhost:3000/album?id='+MusicAlbumID,
              method:"GET",
              success:(e)=>{
                // 存储一下专辑信息
                const MusicAlbum = e.data.album;
                this.setData({
                  MusicAlbum:MusicAlbum
                },()=>{
                  wx.setStorage({
                    key:'MusicAlbumData',
                    data:MusicAlbum,
                  })
                })
              }
            })
          },
          complete:()=>{
            //数据设置完毕之后，再继续找图片数据  /将详细数据中的高清图片找到
            const MusicAlbum = this.data.MusicAlbum;
            const MusicAlbumImg = MusicAlbum.info.commentThread.resourceInfo.imgUrl
            this.setData({
              MusicAlbumImg:MusicAlbumImg
            })
            // console.log(this.data.MusicAlbum)
            console.log(this.data.MusicAlbumImg)
          }
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