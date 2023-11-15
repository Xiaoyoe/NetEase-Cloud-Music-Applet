// pages/searchPage/searchPage.js
// 获取到当前点击的index 获取到当前音乐的id 进行歌曲的详细查询再将数据传到play界面
Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 视图切换隐藏
        IfSearch:false,
        IfHot:true,
        IFHistory:true,
        //当前视图的index
        currentIndex:'',
        // 搜索内容数据
        inputData:'',
        //获取到的搜索数据
        songList:[],
        playlists:[],
        albums:[],
        artists:[],
        //获取到的当前点击歌曲的ID
        MusicID:'',
        //通过IDS获取到的歌曲详细信息
        MusicDetail:'',
        // 将分类存储渲染
        SearchClass:["歌曲","歌单","专辑","歌手"],
        // 热搜列表
        HotList:[],
        // 搜索记录的列表
        searchHistoryList:["追光者","林俊杰"],
    },
    //点击对应分类进行改变对应的视图index
    OnclickChange(e){
        // console.log(e)
        const index = e.currentTarget.dataset.index;
        // console.log(index)
        if (this.data.currentIndex !== index) {
            this.setData({
                currentIndex: index
            })
        }
    },
     // 获取本地历史记录的函数
    getSearchHistory(){
        const historyData = wx.getStorageSync('搜索记录')
        if(historyData){
          this.setData({
            searchHistoryList:historyData
          })
        }
  },
    //清空搜索记录
    clearHistory(){
        const arr = this.data.searchHistoryList;
        arr.splice(0, arr.length);
        const clearArr = arr
        this.setData({
            searchHistoryList:clearArr,
            IFHistory:false
        })
        // 清空本地缓存中的搜索记录
        wx.removeStorageSync('搜索记录');
    },
    //获得搜索记录对应的下标并进行跳转搜索
    HistoryItem(e){
        // console.log(e.currentTarget.dataset.index)
        const name = e.currentTarget.dataset.name
        this.setData({
            inputData:name
        },()=>{
            this.getSearchAPI()
            this.setData({
                IfHot:false,
                IfSearch:true,
                IFHistory:false,
            })
        })
    },

    //输入框回调和自动搜索
    searchInput(e) {
        this.setData({
            inputData: e.detail.value
        });
        const text = e.detail.value;

        if (this.searchTimer){
            clearTimeout(this.searchTimer); // 如果之前有定时器，先清除掉
        }

        // 创建一个promise对象
        const searchPromise = new Promise((resolve,reject)=>{
            this.searchTimer = setTimeout(() => {
                if(text === ''){
                    // 如果内容为空，返回给promise成功调用后调用empty的方法，其他类似
                    resolve('empty')
                }else if(text == this.prevText){
                    resolve('searching')
                }else if(text != this.prevText){
                    setTimeout(() => {
                        resolve('SecondSearch')
                    }, 2000);
                }
            }, 1000);
        })
        this.prevText = text; // 保存当前输入，以便下次比较
        // 执行prmise对象的方法
        searchPromise.then((e) =>{
            if(e === 'empty')
            {
                console.log("输入内容为当前为空")
                this.handleEmptyInput()
            }
            else if(e === 'searching')
            {
                console.log('开始搜索...')
                this.getSearchAPI();
                this.setData({
                    IfHot: false,
                    IfSearch: true,
                    IFHistory: false
                })
            }
            else if(e === 'SecondSearch')
            {
                console.log('第二次搜索...')
                this.getSearchAPI()
                this.setData({
                    IfHot: false,
                    IfSearch: true,
                    IFHistory: false
                });
            }
        }).catch((error) => {
            console.error('发生错误:', error);
        });
    },
        // input空内容执行的方法
        handleEmptyInput(){
        // console.log('清除输入框内容，设置if切换');
        const inputdata = this.data.inputData;
        this.setData({
            IfHot: true,
            IfSearch: false,
            IFHistory: true,
            inputdata:''
        });
        // 在定时器结束后进行搜索历史记录的去重操作
        const historyList = this.data.searchHistoryList;
        const uniqueHistoryList = historyList.filter((item, index) => {
            return historyList.indexOf(item) === index;
        });
        this.setData({
            searchHistoryList: uniqueHistoryList  // 更新去重后的搜索历史记录
        });
        // 同时将去重后的搜索历史记录重新存储到本地缓存中
        wx.setStorageSync('搜索记录', uniqueHistoryList);
    },

    //点击将当前的内容进行搜索
    PostInput(e){
        // console.log(e)
        console.log(e.currentTarget.dataset.name);
        this.setData({
            inputData:e.currentTarget.dataset.name,
        },()=>{
            this.getSearchAPI();
            this.setData({
                IfHot:false,
                IfSearch:true,
                IFHistory:false
            })
        })
    },
    //获取热搜列表(根据热搜列表的名字直接赋值到input然后搜索,同时隐藏热搜列表蒙版打开滑动视图)
    getHotListAPI(){
        const HotListData = "热搜数据"+this.data.HotList;
        wx.getStorage({
            key:HotListData,
            success:(e)=>{
                this.setData({
                    HotList:e.data
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/search/hot/detail',
                    success:(e)=>{
                        console.log(e)
                        console.log(e.data.data);
                        const HotList = e.data.data;
                        this.setData({
                          HotList:HotList
                        },()=>{
                            wx.setStorage({
                                key:HotListData,
                                data:HotList
                            })
                        })
                    }
                  })
            }
        })
    },
    //获取滑动视图的index
    swiperChange(e){
    //   console.log("当前所在的swiper-item的index为：" + e.detail.current);
      this.setData({
        currentIndex:e.detail.current
      })
    },
    //搜索API
    getSearchAPI(){
        // 取值意义 : 1: 单曲,1000: 歌单, 10: 专辑 , 100:歌手
        const inputData = this.data.inputData
        const songListData = "SearchData:"+inputData
        const playlistsData = "歌单数据:"+inputData
        const albumsData = "专辑数据:"+inputData
        const artistsData = "歌手"+inputData
        // 获取搜索数组输入当前的字符串
        const searchHistoryList = this.data.searchHistoryList
        searchHistoryList.push(inputData)
        this.setData({
            searchHistoryList:searchHistoryList,
            IfSearch:true,
            IfHot:false,
            IFHistory:false,
        },()=>{
            const searchHistoryListData ="搜索记录"
            wx.setStorage({
                key:searchHistoryListData,
                data:searchHistoryList
            })
        })
        wx.getStorage({
            key:songListData,
            success:(e)=>{
                // console.log(e)
                this.setData({
                    songList:e.data
                })
            },
            fail:()=>{
                wx.request({
                    // +'&type=1'
                    url: 'http://localhost:3000/search?keywords='+inputData+'&type=1',
                    method:'GET',
                    success:(e)=>{
                        // console.log(e)
                        const songList = e.data.result.songs;
                        this.setData({
                          songList:songList
                        },()=>{
                            wx.setStorage({
                                key:songListData,
                                data:songList
                            })
                        })
                    },
                    fail:(e)=>{
                        console.log(e);
                    }
                  })

            }
        })
        wx.getStorage({
            key:playlistsData,
            success:(e)=>{
                // console.log(e)
                this.setData({
                    playlists:e.data
                })
            },
            fail:()=>{
                wx.request({
                    // +'&type=1000'
                    url: 'http://localhost:3000/search?keywords='+inputData+'&type=1000',
                    method:'GET',
                    success:(e)=>{
                        // console.log(e)
                        const playlists = e.data.result.playlists;
                        this.setData({
                          playlists:playlists
                        },()=>{
                            wx.setStorage({
                                key:playlistsData,
                                data:playlists
                            })
                        })
                    }
                  })

            }
        })
        wx.getStorage({
            key:albumsData,
            success:(e)=>{
                // console.log(e)
                this.setData({
                    albums:e.data
                })
            },
            fail:()=>{
                wx.request({
                    // +'&type=10'
                    url: 'http://localhost:3000/search?keywords='+inputData+'&type=10',
                    method:'GET',
                    success:(e)=>{
                        // console.log(e)
                        const albums = e.data.result.albums;
                        this.setData({
                          albums:albums
                        },()=>{
                            wx.setStorage({
                                key:albumsData,
                                data:albums
                            })
                        })
                    }
                  })
            }
        })
        wx.getStorage({
            key:artistsData,
            success:(e)=>{
                // console.log(e)
                this.setData({
                    artists:e.data
                })
            },
            fail:()=>{
                wx.request({
                    // +'&type=100'
                    url: 'http://localhost:3000/search?keywords='+inputData+'&type=100',
                    method:'GET',
                    success:(e)=>{
                        // console.log(e)
                        const artists = e.data.result.artists;
                        this.setData({
                            artists:artists
                        },()=>{
                            wx.setStorage({
                                key:artistsData,
                                data:artists
                            })
                        })
                    }
                  })
            }
        })

    },
    // 获取歌曲的详细信息
    getMusicDetail(callback){
        const MusicID = this.data.MusicID;
        const MusicDetailData = "MusicDetailData:"+MusicID;
        wx.getStorage({
            key:MusicDetailData,
            success:(e)=>{
                console.log(e)
                this.setData({
                    MusicDetail:e.data
                },()=>{
                    if(callback) callback();
                })
            },
            fail:()=>{
                wx.request({
                    url: 'http://localhost:3000/song/detail?ids='+MusicID,
                    success:(e)=>{
                        console.log(e)
                        const MusicDetail = e.data.songs;
                        this.setData({
                            MusicDetail:MusicDetail
                        },()=>{
                            wx.setStorage({
                                key:MusicDetailData,
                                data:MusicDetail
                            })
                            console.log(this.data.MusicDetail)
                            if(callback) callback();
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
        const songList = this.data.songList;
        console.log(musicIndex);
        console.log(songid);
        console.log(singer);
        this.setData({
            MusicID:songid
        },()=>{
            const MusicData_Obj = {}
            // MusicData_Obj.musicSongID = songid
            MusicData_Obj.musicSonger = singer;
            MusicData_Obj.musiclist = songList
            MusicData_Obj.musicIndex = musicIndex
            // console.log(this.data.MusicDetail);
            // MusicData_Obj.musicpicUrl = this.data.MusicDetail[0].al.picUrl;
            // console.log("已经设置完的"+MusicData_Obj.musicpicUrl);
            wx.navigateTo({
                url: '/pages/play/play',
                success:(e)=>{
                    e.eventChannel.emit('acceptDataFromOpenerPage',{
                      data:MusicData_Obj
                    })
                }
              })
        })
            
            
    },
    // 两个页面可以合并一下ListPage
    //跳转歌单页面
    GoPlayLists(e){
        // console.log(e);
        const PlayListsIndex = e.currentTarget.dataset.index
        const PlayListsid = e.currentTarget.dataset.playlistsid
        // 图片地址
        const imageurl = e.currentTarget.dataset.imageurl
        //歌单的名字
        const PlayListsname = e.currentTarget.dataset.name
        //歌单的内容说明 by内容
        const PlayListsdescription = e.currentTarget.dataset.description
        const PlayListsData_Obj = {}
        PlayListsData_Obj.idx = 1 //歌单和专辑分别用1和2表示 传过去后进行判断分别存储内容
        PlayListsData_Obj.ListImageurl = imageurl
        PlayListsData_Obj.ListIndex = PlayListsIndex
        PlayListsData_Obj.ListID = PlayListsid
        PlayListsData_Obj.Listname = PlayListsname
        PlayListsData_Obj.Listdescription = PlayListsdescription
        wx.navigateTo({
            url: '/pages/ListPage/ListPage',
            success:(e)=>{
                e.eventChannel.emit('acceptDataFromOpenerPage',{
                  data:PlayListsData_Obj
                })
            }
          })
    },
    // 跳转专辑页面
    GoAlbums(e){
    //   console.log(e)
      const AlbumsIndex = e.currentTarget.dataset.index;
      const Albumsid = e.currentTarget.dataset.albumsid;
      // 图片地址
      const imageurl = e.currentTarget.dataset.imageurl
      // 专辑名字
      const AlbumsName = e.currentTarget.dataset.name;
      //专辑作者
      const AlbumsSinger = e.currentTarget.dataset.singer; 
      const AlbumsData_Obj = {}
      AlbumsData_Obj.idx = 2 //歌单和专辑分别用1和2表示 传过去后进行判断分别存储内容
      AlbumsData_Obj.ListImageurl = imageurl
      AlbumsData_Obj.ListIndex = AlbumsIndex
      AlbumsData_Obj.ListID = Albumsid
      AlbumsData_Obj.Listname = AlbumsName
      AlbumsData_Obj.ListSinger = AlbumsSinger
    //   console.log(AlbumsData_Obj);
        wx.navigateTo({
            url: '/pages/ListPage/ListPage',
            success:(e)=>{
                e.eventChannel.emit('acceptDataFromOpenerPage',{
                  data:AlbumsData_Obj
                })
            }
          })
    },
    //跳转到歌手页面
    GoSingerMessage(e){
        console.log(e)
        // 获取当前的音乐人id传输到歌手信息页面
        const singerID = e.currentTarget.dataset.singerid
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
        this.setData({
            currentIndex:0
        })
        this.getHotListAPI();
        this.getSearchHistory();
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