// pages/ListPage/ListPage.js
Page({
    // id得分开存
    /**
     * 页面的初始数据
     */
    data: {
        ifKapian:false,
      // 传过来的当前索引
        ListIndex:'',
        // 传过来的id
        PlayListID:'', //歌单
        AlbumsID:'',    //专辑
        // 传过来的名字
        Listname:'',
        // 传过来的内容
        Listdescription:'',
        // 传过来的作者名字
        ListSinger:'',
        //传过来的图片地址
        ListImageurl:'',
        /////////////
        // 当前歌单的音乐列表
        MusicList:[],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const eventChannel = this.getOpenerEventChannel()
        // 监听acceptDataFromOpenerPage事件
        // 获取上一页面通过eventChannel传送到当前页面的数据
        eventChannel.on('acceptDataFromOpenerPage', data=> {
            console.log(data)
            // 获取对应的数据，进行存储
            const ListIndex = data.data.ListIndex;
            const ListID = data.data.ListID;
            const Listname = data.data.Listname;
            const ListImageurl = data.data.ListImageurl;
            if(data.data.idx == 1)
            {
              console.log("是歌单内容")
              // 歌单内容
              const text = data.data.Listdescription;
              const Listdescription = text.split("\n");
              this.setData({
                ListImageurl:ListImageurl,
                ListIndex:ListIndex,
                PlayListID:ListID,
                Listname:Listname,
                Listdescription:Listdescription,
              },()=>{
                  this.getPlayListsAPI(this.data.PlayListID);
              })
              
            }
            else if(data.data.idx == 2)
            {
              console.log("是专辑内容")
               // 专辑内容
              const ListSinger = data.data.ListSinger;
              this.setData({
                ListImageurl:ListImageurl,
                ListIndex:ListIndex,
                AlbumsID:ListID,
                Listname:Listname,
                ListSinger:ListSinger,
              },()=>{
                  this.getAlbumAPI(this.data.AlbumsID);
              })
            } 
            else if(data.data.idx == 3)
            {
                console.log("是排行榜内容")
                // 歌单内容
                const text = data.data.Listdescription;
                const Listdescription = text.split("\n");
                this.setData({
                ListImageurl:ListImageurl,
                ListIndex:ListIndex,
                PlayListID:ListID,
                Listname:Listname,
                Listdescription:Listdescription,
              },()=>{
                  this.getPlayListsAPI(this.data.PlayListID);
              })
            }
            // 动态修改窗口标题
            wx.setNavigationBarTitle({
              title: this.data.Listname,
            })
      })
    },
    // 获取歌单详细内容
    getPlayListsAPI(f){
        const MusicListData = "MusicListData歌单"+f
        wx.getStorage({
            key:MusicListData,
            success:(e)=>{
                this.setData({
                    MusicList:e.data
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/playlist/detail?id='+f,
                    //url:'http://localhost:3000/playlist/track/all?id='+f+'&limit=10&offset=1',
                    success:(e)=>{
                        // console.log(e)
                        // 因为歌单的数据太多了，所以我限制拿30个即可
                        const MusicList = e.data.playlist.tracks.slice(0, 30);
                        // console.log(MusicList);
                        this.setData({
                          MusicList:MusicList
                        },()=>{
                          wx.setStorage({
                              key:MusicListData,
                              data:MusicList
                          })
                      })
                    }
                  })
            }
        })
    },
    // 获得专辑详细内容
    getAlbumAPI(f){
        const MusicListData = "MusicListData专辑"+f
        const ListdescriptionData = "ListdescriptionData专辑内容"+f
        wx.getStorage({
            key:MusicListData,
            success:(e)=>{
                console.log("有缓存了")
                this.setData({
                    MusicList:e.data,
                    Listdescription:this.data.Listdescription
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/album?id='+f,
                    //url:'http://localhost:3000/playlist/track/all?id='+f+'&limit=10&offset=1',
                    success:(e)=>{
                        console.log(e)
                        const dataE = e;
                        const MusicList = dataE.data.songs;
                        console.log(MusicList);
                        this.setData({
                          MusicList:MusicList,
                        },()=>{
                          wx.setStorage({
                              key:MusicListData,
                              data:MusicList
                          })
                      })
                    }
                  })
            }
        })
        wx.getStorage({
            key:ListdescriptionData,
            success:(e)=>{
                console.log("有缓存了")
                this.setData({
                    Listdescription:e.data
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/album?id='+f,
                    success:(e)=>{
                        console.log(e)
                        const dataE = e;
                        const text = dataE.data.album.description;
                        const Listdescription = text.split("\n");
                        console.log(text);
                        console.log(Listdescription);
                        this.setData({
                          Listdescription:Listdescription
                        },()=>{
                          wx.setStorage({
                              key:ListdescriptionData,
                              data:Listdescription
                          })
                      })
                    }
                  })
            }
        })
    },

    //跳转播放界面
    GoPlay(e){
        // 获取当前的歌曲id和歌曲歌手的名字
        console.log(e);
        const songid = e.currentTarget.dataset.songid;
        const musicIndex = e.currentTarget.dataset.index;
        const singer = e.currentTarget.dataset.singer;
        const songList = this.data.MusicList;
        const MusicData_Obj = {}
        MusicData_Obj.musicSongID = songid
        MusicData_Obj.musicSonger = singer;
        MusicData_Obj.musiclist = songList
        MusicData_Obj.musicIndex = musicIndex
            wx.navigateTo({
                url: '/pages/play/play',
                success:(e)=>{
                    e.eventChannel.emit('acceptDataFromOpenerPage',{
                      data:MusicData_Obj
                    })
                }
              }) 
    },
    IFShow(){
        this.setData({
            ifKapian:!this.data.ifKapian
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