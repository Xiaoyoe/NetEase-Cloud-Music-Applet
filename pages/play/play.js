// 我的思路
// 利用监听事件获取到传输过来的音乐数据 将音乐id进行存储 存储后调用音乐url的方法 再进行音频的播放  
// 引入全局app
const Myapp = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        //通过IDS获取到的歌曲详细信息
        MusicDetail:'',
        imageSrc:'https://img2.baidu.com/it/u=2299039335,4096275075&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
        // 歌曲详细
        musicUrl:"", //歌曲地址
        MusicName:'修炼爱情', //歌曲名字
        songerName:'小约', //歌手名字
        // 音乐数据
        isPlay:false,   //控制音乐播放 默认关闭
        musiclist:[], //歌曲列表
        IDlist:[], //歌曲ID列表
        nowMusicID:"", //歌曲ID
        musicIndex:"", //歌曲下标
        musicLyr:[], //歌曲歌词
        // 当前播放的音乐数据
        NowMusic:{},
        duration:'00:00', //音频的总时长
        currentTime: '00:00', //音频播放的时间,
        cNum:0, //进度条初始值
        dNum:100, //进度条最大值
        //当前歌词下标
        LrcIndex:-1,
        Header:0, //滚动歌词框初始值
        //模式切换
        IfSwitch:'normal',
        IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const eventChannel = this.getOpenerEventChannel()
        // 监听acceptDataFromOpenerPage事件
        // 获取上一页面通过eventChannel传送到当前页面的数据
        eventChannel.on('acceptDataFromOpenerPage', data=> {
            const musiclist = data.data.musiclist;
            const musicIndex = data.data.musicIndex;
            const songerName = data.data.musicSonger;
            // const searchPicUrl = data.data.musicpicUrl;
            // 获取当前歌曲的数据 并存入数据对象
            const NowMusic = musiclist[musicIndex];
            const NowMusicID = NowMusic.id;
            const MusicName = NowMusic.name;
            // console.log("这首歌的名字是"+NowMusic.name);
            console.log(NowMusic);
            // const NowMusicPicUrl = searchPicUrl||NowMusic.picUrl||NowMusic.al.picUrl;
            this.setData({
                musiclist:musiclist,
                musicIndex:musicIndex,
                NowMusic:NowMusic,
                nowMusicID:NowMusicID,
                // imageSrc:NowMusicPicUrl,
                songerName:songerName,
                MusicName:MusicName
            },()=>{
                this.getMusicDetail(()=>{
                    const NowMusicPicUrl = this.data.MusicDetail[0].al.picUrl
                    this.setData({
                        imageSrc:NowMusicPicUrl
                    })
                    console.log("已经设置完的"+this.data.imageSrc);
                })
            })
            // 动态修改窗口标题
            wx.setNavigationBarTitle({
              title: this.data.NowMusic.name,
            })
            // console.log(this.data.musicIndex);
            this.getMusicUrl(() => {
                // 歌曲 URL 获取后，执行回调函数并调用 playMusic() 函数
                this.playMusic();
                this.getMusicLyric();
              });
      })
    },
    // 获取歌曲的详细信息
    getMusicDetail(callback){
        const MusicID = this.data.nowMusicID;
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
                        console.log(MusicDetail);
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
    // 获取歌曲Url地址
    getMusicUrl(callback){
        const mid = this.data.nowMusicID;
        //cacheKey 是用来作为本地缓存的 key 的变量
        // 将本地缓存的 key 设计得有一定的规律性，以便于后续的读取和管理。这样，在需要获取或更新缓存数据时，可以使用相同的 key 进行操作。
        const cachekey = 'musicUrl_'+mid;
        // 2094075270 //测试歌曲id  http://m701.music.126.net/20231101212001/b95c4444e478c21a2d923c0160fbf54c/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/31118064430/49b3/9c73/31eb/07fc3a495f8ba78f16095bc6db4f99d7.mp3
        wx.getStorage({
            key:cachekey,
            success:(e)=>{
                console.log(e);
                //从缓存中获取歌曲的地址URL
                const musicUrlData = e.data;
                this.setData({
                    musicUrl:musicUrlData
                },()=>{
                    //歌曲URL更新后，执行回调函数
                    if(callback) callback();
                })
            },
            fail:()=>{
                //缓存中如果没有数据，发送请求获取歌曲地址URL
                wx.request({
                    // url:'/song/url?id=33894312',
                      url: 'http://localhost:3000/song/url?id='+mid,
                      success:(e)=>{
                        //   console.log(e);
                          const musicUrl = e.data.data[0].url;
                        //   console.log(musicUrl);
                          this.setData({
                            musicUrl:musicUrl
                          },()=>{
                            //获取到新的歌曲URL的时候 存储到本地缓存当中
                            wx.setStorage({
                                key:cachekey,
                                data:musicUrl,
                                //缓存两分钟(因为网易云给出的是两分钟的要求)
                                // expires:Date.now()+2*60*1000 //这个写反了，这个好像是两分钟后数据会过期的
                            })
                            //歌曲URL更新后，执行回调函数
                            if(callback) callback();
                          })
                      },
                    }) 
            }
        })
    },
    // 二分查找（Binary Search）算法
    binarySearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          if (arr[mid][0] === target) {
            return mid;
          } else if (arr[mid][0] < target) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
        // 如果没有找到匹配的元素，则返回最接近目标的索引
        return right;
      },
      //开始播放
      playMusic() {
        const srcURL = this.data.musicUrl;
        // console.log(srcURL);
        // console.log(this.data.musiclist);
        if (this.backgroundAudioManager) {
          if (this.data.isPlay) {
            this.backgroundAudioManager.pause();
            console.log("音频已暂停");
          } else {
            this.backgroundAudioManager.play();
            console.log("音频开始播放");
          }
          this.setData({
            isPlay: !this.data.isPlay
          });
          return;
        }
        this.backgroundAudioManager = wx.getBackgroundAudioManager();
        this.backgroundAudioManager.src = srcURL;
        this.backgroundAudioManager.title = this.data.NowMusic.name;
        this.backgroundAudioManager.singer = this.data.songerName;
        // console.log(this.backgroundAudioManager);
        this.backgroundAudioManager.play();
        console.log("音频开始播放");
        //监听音频的播放
        this.backgroundAudioManager.onPlay(() => {
            console.log("开始播放！")
          this.setData({
            isPlay: true,
            cNum: 0  //设置进度条的初始值为0
          })
        })
        //监听音频的暂停
        this.backgroundAudioManager.onPause(() => {
          this.setData({
            isPlay: false
          })
        })
        //监听音频停止
        this.backgroundAudioManager.onStop(()=>{
        this.setData({
           isPlay:false,
           duration:"00:00",
           currentTime:'00:00'
         })
       })
        // //监听音频播放的播放时长和总时长
        this.backgroundAudioManager.onTimeUpdate(()=>{
            let duration =this.backgroundAudioManager.duration;
            let currentTime =this.backgroundAudioManager.currentTime;
            const cNum = currentTime / this.backgroundAudioManager.duration * this.data.dNum;  // 计算进度条的值
            // console.log("总时长"+duration);
            // console.log("当前时间"+currentTime);
            this.setData({
              duration:this.formatTime(Math.ceil(duration)),
              currentTime:this.formatTime(Math.ceil(currentTime)),
              cNum: cNum  // 更新进度条的值
            })
             // 更新歌词追踪定位
            const playTime = this.backgroundAudioManager.currentTime;
            const musicLyr = this.data.musicLyr;
            const LrcIndex = this.binarySearch(musicLyr, playTime);
            const Header = Math.max(0, (LrcIndex - 5) * 15);
            this.setData({
              LrcIndex,
              Header,
            });
          })
           //监听到音频播放结束后触发BackgroundAudioManager.onEnded
           this.backgroundAudioManager.onEnded(()=>{
            console.log("播放结束,将自动播放下一首歌");
            //播放结束，根据当前的切换值切换歌曲顺序或默认
            this.IfSwitch();
            console.log("当前触发的方法顺序"+this.data.IfSwitch);
          })
      },

      //不同切换状态值触发对应的方法(默认(下一首)/循环loopMusic/随机randomMuSic)
      IfSwitch() {
        //用switch进行判断 判断切换的状态值，判断IfSwitch当前的状态，如果当前的状态值为Loop则触发loopMusic方法，如果当前状态值为normal则正常顺序播放歌曲触发PlaynextSong方法，如果当前状态值为randomMuSic则触发随机播放的方法
        const switchStatus = this.data.IfSwitch;
        switch (switchStatus) {
          case 'normal':
            this.setData({
                IfSwitch: 'normal', // 设置切换状态为normal
                IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
            });
            this.PlaynextSong(); // 触发正常顺序播放方法
            break;
          case 'loop':
            this.setData({
                IfSwitch: 'loop', // 设置切换状态为loop
                IfSwitchSvg:'../../icon/iconAll/svg/单曲循环1.svg',
            });
            this.loopMusic(); // 触发单曲循环播放的方法
            break;
          case 'randomMuSic':
            this.setData({
                IfSwitch: 'randomMuSic', // 设置切换状态为randomMuSic
                IfSwitchSvg:'../../icon/iconAll/svg/随机播放1.svg',
            });
            this.randomMuSic(); // 触发随机顺序播放的方法
            break;
          default:
            this.setData({
                IfSwitch: 'normal', // 默认设置切换状态为normal
                IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
            });
            this.PlaynextSong(); // 默认触发正常顺序播放的方法
            break;
        }
      },
      //点击改变切换状态值
      OnclickChangeIfSwitch(){
        // 思路:当点击切换svg图标后，根据当前的状态值，依次切换顺序播放，循环播放，随机播放的顺序的状态值，做到切换方法和图案的切换;
        const switchStatus = this.data.IfSwitch;
        switch (switchStatus) {
          case 'normal':
            this.setData({
                IfSwitch: 'loop', // 设置切换状态为loop
                IfSwitchSvg:'../../icon/iconAll/svg/单曲循环1.svg',
            });
            break;
          case 'loop':
            this.setData({
                IfSwitch: 'randomMuSic', // 设置切换状态为randomMuSic
                IfSwitchSvg:'../../icon/iconAll/svg/随机播放1.svg',
            });
            break;
          case 'randomMuSic':
            this.setData({
                IfSwitch: 'normal', // 设置切换状态为normal
                IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
            });
            break;
        }
        console.log("已经切换，当前的状态值为"+this.data.IfSwitch);
      },
      //播放上一首歌
      PlayBackSong(){
        const switchStatus = this.data.IfSwitch;
        switch (switchStatus) {
          case 'normal':
            this.setData({
                IfSwitch: 'normal', // 设置切换状态为normal
                IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
            });
            const musiclist = this.data.musiclist;
            const musicIndex = this.data.musicIndex;
            const IDlist = musiclist.map(item => item.id);
            const nowMusicID = this.data.nowMusicID;
            // console.log(IDlist);
            let prevIndex = musicIndex - 1;
            if (prevIndex < 0) {
              prevIndex = musiclist.length - 1;
            }
            const prevMusic = musiclist[prevIndex];
            // const prevName = musiclist[prevIndex].song.artists[0].name;
            //因为歌手热门歌曲的歌手id和最新歌曲的歌手id数据位置不一样 所以得进行一个判断
            // 检查musiclist[nextIndex]和musiclist[nextIndex].song是否存在以及artists数组是否有内容
            let prevName = '';
            if(prevMusic.song && prevMusic.song.artists && prevMusic.song.artists.length>0){
                // console.log("已经设置最新歌曲歌手名字")
                prevName = prevMusic.song.artists[0].name
            }
            else if(prevMusic.ar && prevMusic.ar.length>0)
            {
                // console.log("已经设置当前歌手热门歌曲的歌手名字")
                prevName = prevMusic.ar[0].name
            }
            
            this.setData({
              nowMusicID: prevMusic.id,
              NowMusic: prevMusic,
              musicIndex: prevIndex,
              MusicName: prevMusic.name,
            //   songerName: prevName,
            //   imageSrc: prevMusic.picUrl || prevMusic.al.picUrl
            },()=>{
                this.getMusicDetail(()=>{
                    const NowMusicPicUrl = this.data.MusicDetail[0].al.picUrl
                    const NowMusicSinger = this.data.MusicDetail[0].ar[0].name
                    this.setData({
                        imageSrc:NowMusicPicUrl,
                        songerName:NowMusicSinger
                    })
                    this.getMusicUrl(() => {
                        const srcURL = this.data.musicUrl;
                        this.backgroundAudioManager.stop();
                        this.backgroundAudioManager = null;
                        this.backgroundAudioManager = wx.getBackgroundAudioManager();
                        this.backgroundAudioManager.src = srcURL;
                        this.backgroundAudioManager.title = this.data.NowMusic.name;
                        this.backgroundAudioManager.singer = this.data.songerName;
                        //监听音频播放
                        this.backgroundAudioManager.onPlay(()=>{
                          this.setData({
                              isPlay:true,
                              cNum:0
                          })
                          })
                          // 监听音频播放的播放时长和总时长
                          // BackgroundAudioManager.onTimeUpdate
                          this.backgroundAudioManager.onTimeUpdate(()=>{
                          let duration =this.backgroundAudioManager.duration;
                          let currentTime =this.backgroundAudioManager.currentTime;
                          const cNum = currentTime / this.backgroundAudioManager.duration * this.data.dNum;  // 计算进度条的值
                          // console.log("总时长"+duration);
                          // console.log("当前时间"+currentTime);
                          this.setData({
                            duration:this.formatTime(Math.ceil(duration)),
                            currentTime:this.formatTime(Math.ceil(currentTime)),
                            cNum: cNum  // 更新进度条的值
                          })
                           // 更新歌词追踪定位
                          const playTime = this.backgroundAudioManager.currentTime;
                          const musicLyr = this.data.musicLyr;
                          const LrcIndex = this.binarySearch(musicLyr, playTime);
                          const Header = Math.max(0, (LrcIndex - 5) * 15);
                          this.setData({
                            LrcIndex,
                            Header,
                          });
                        })
                      });
                })
            });
            // console.log(prevMusic);
            this.getMusicLyric();
            wx.setNavigationBarTitle({
              title: this.data.MusicName
            });
            break;
          case 'loop':
            this.setData({
                IfSwitch: 'loop', // 设置切换状态为loop
                IfSwitchSvg:'../../icon/iconAll/svg/单曲循环1.svg',
            });
            this.loopMusic(); // 触发单曲循环播放的方法
            break;
          case 'randomMuSic':
            this.setData({
                IfSwitch: 'randomMuSic', // 设置切换状态为randomMuSic
                IfSwitchSvg:'../../icon/iconAll/svg/随机播放1.svg',
            });
            this.randomMuSic(); // 触发随机顺序播放的方法
            break;
        }
      },
      //循环播放单曲
      loopMusic() {
        console.log("循环播放中...");
        const musiclist = this.data.musiclist;
        const musicIndex = this.data.musicIndex;
        const currentMusic = musiclist[musicIndex];
        // console.log(currentMusic);
        // 设置后进行调用歌曲获取
        this.getMusicLyric();
        wx.setNavigationBarTitle({
          title: currentMusic.name
        });
        //请求歌曲的详细信息
        this.getMusicDetail(()=>{
             // 请求歌曲地址
        this.getMusicUrl(() => {
            const srcURL = this.data.musicUrl;
            this.backgroundAudioManager.stop();
            this.backgroundAudioManager = null;
            this.backgroundAudioManager = wx.getBackgroundAudioManager();
            this.backgroundAudioManager.src = srcURL;
            this.backgroundAudioManager.title = currentMusic.name;
            // let singer = '';
            // if(currentMusic.song && currentMusic.song.artists.length>0){
            //   singer = currentMusic.song.artists[0].name
            //   // console.log("最新歌曲歌手名字已经设置完毕")
            // }
            // else if(currentMusic.ar[0].name){
            //   singer = currentMusic.ar[0].name
            //   // console.log("歌手热门歌曲的名字已经设置完毕")
            // }
            this.backgroundAudioManager.singer = this.data.MusicDetail[0].ar[0].name;
            this.backgroundAudioManager.onPlay(() => {
              this.setData({
                isPlay: true,
                cNum: 0
              });
            });
            this.backgroundAudioManager.onTimeUpdate(() => {
              let duration = this.backgroundAudioManager.duration;
              let currentTime = this.backgroundAudioManager.currentTime;
              const cNum = currentTime / this.backgroundAudioManager.duration * this.data.dNum;
              this.setData({
                duration: this.formatTime(Math.ceil(duration)),
                currentTime: this.formatTime(Math.ceil(currentTime)),
                cNum: cNum
              });
              const playTime = this.backgroundAudioManager.currentTime;
              const musicLyr = this.data.musicLyr;
              const LrcIndex = this.binarySearch(musicLyr, playTime);
              const Header = Math.max(0, (LrcIndex - 5) * 15);
              this.setData({
                LrcIndex,
                Header
              });
            });
          });
        })
       
      },
      //随机播放方法
      randomMuSic() {
        console.log("随机播放中...")
        const musiclist = this.data.musiclist;
        const musicIndex = this.data.musicIndex;
        const randomIndex = Math.floor(Math.random() * musiclist.length);
        //进行判断确保不会重复选到当前的歌曲
        if (randomIndex === musicIndex)
        {
          randomIndex = (randomIndex + 1) % musiclist.length;
        }
        // console.log(musiclist);
        const randomMusic = musiclist[randomIndex];
        // console.log(randomMusic);
        // let singer = '';
        //   if(randomMusic.song && randomMusic.song.artists.length>0){
        //     singer = randomMusic.song.artists[0].name
        //     // console.log("最新歌曲歌手名字已经设置完毕")
        //   }
        //   else if(randomMusic.ar[0].name){
        //     singer = randomMusic.ar[0].name
        //     // console.log("歌手热门歌曲的名字已经设置完毕")
        //   }
        this.setData({
          nowMusicID: randomMusic.id,
          NowMusic: randomMusic,
          musicIndex: randomIndex,
          MusicName: randomMusic.name,
        //   songerName: singer,
        //   imageSrc: randomMusic.picUrl|| randomMusic.al.picUrl
        },()=>{
            this.getMusicDetail(()=>{
                const NowMusicPicUrl = this.data.MusicDetail[0].al.picUrl
                const NowMusicSinger = this.data.MusicDetail[0].ar[0].name
                this.setData({
                    imageSrc:NowMusicPicUrl,
                    songerName: NowMusicSinger,
                })
                this.getMusicUrl(() => {
                    const srcURL = this.data.musicUrl;
                    this.backgroundAudioManager.stop();
                    this.backgroundAudioManager = null;
                    this.backgroundAudioManager = wx.getBackgroundAudioManager();
                    this.backgroundAudioManager.src = srcURL;
                    this.backgroundAudioManager.title = this.data.NowMusic.name;
                    this.backgroundAudioManager.singer = this.data.songerName;
                    this.backgroundAudioManager.onPlay(() => {
                      this.setData({
                        isPlay: true,
                        cNum: 0
                      })
                    })
                    this.backgroundAudioManager.onTimeUpdate(() => {
                      let duration = this.backgroundAudioManager.duration;
                      let currentTime = this.backgroundAudioManager.currentTime;
                      const cNum = currentTime / this.backgroundAudioManager.duration * this.data.dNum;
                      this.setData({
                        duration: this.formatTime(Math.ceil(duration)),
                        currentTime: this.formatTime(Math.ceil(currentTime)),
                        cNum: cNum
                      })
                      const playTime = this.backgroundAudioManager.currentTime;
                      const musicLyr = this.data.musicLyr;
                      const LrcIndex = this.binarySearch(musicLyr, playTime);
                      const Header = Math.max(0, (LrcIndex - 5) * 15);
                      this.setData({
                        LrcIndex,
                        Header,
                      });
                    });
                  });
            })
        })
        this.getMusicLyric();
        wx.setNavigationBarTitle({
          title: this.data.MusicName
        });
      },
      //播放下一首歌
      PlaynextSong() {
        const switchStatus = this.data.IfSwitch;
        switch (switchStatus) {
          case 'normal':
            this.setData({
                IfSwitch: 'normal', // 设置切换状态为normal
                IfSwitchSvg:'../../icon/iconAll/svg/顺序播放1.svg',
            });
            //如果为默认的播放则正常运行下面的代码 然后返回结束
            console.log("正常播放中...")
            const musiclist = this.data.musiclist;
            const musicIndex = this.data.musicIndex;
            const IDlist = musiclist.map(item => item.id);
            const nowMusicID = this.data.nowMusicID;
            // console.log(IDlist);
            let nextIndex = musicIndex + 1;
            if (nextIndex >= musiclist.length) {
              nextIndex = 0;
            }
            const nextMusic = musiclist[nextIndex];
            // const nextName = nextMusic.song.artists[0].name && this.data.songerName;
            //因为歌手热门歌曲的歌手id和最新歌曲的歌手id数据位置不一样 所以得进行一个判断
            // 检查musiclist[nextIndex]和musiclist[nextIndex].song是否存在以及artists数组是否有内容
            let nextName = '';
            if(nextMusic.song && nextMusic.song.artists && nextMusic.song.artists.length>0){
                // console.log(1);
                nextName = nextMusic.song.artists[0].name
            }
            else if(nextMusic.ar && nextMusic.ar.length>0)
            {
                // console.log(2);
                nextName = nextMusic.ar[0].name
            }else{
                // console.log(3);
                // nextName = this.data.songerName
            }
            console.log(nextMusic);
            this.setData({
              nowMusicID: nextMusic.id,
              NowMusic: nextMusic,
              musicIndex: nextIndex,
              MusicName: nextMusic.name,
            //   songerName: nextName,
            //   imageSrc: nextMusic.picUrl || nextMusic.al.picUrl
            },()=>{
                this.getMusicDetail(()=>{
                    const NowMusicPicUrl = this.data.MusicDetail[0].al.picUrl
                    const NowMusicSinger = this.data.MusicDetail[0].ar[0].name
                    this.setData({
                        imageSrc:NowMusicPicUrl,
                        songerName: NowMusicSinger,
                    })
                    console.log("已经设置完的"+this.data.imageSrc);
                    this.getMusicUrl(()=>{
                        // 歌曲 URL 获取后，执行回调函数并更新 this.data.musicUrl 的值
                        const srcURL = this.data.musicUrl;
                        // 停止当前正在播放的音频
                        this.backgroundAudioManager.stop();
                        // 清除之前创建的音频播放器对象
                        this.backgroundAudioManager = null;
                        this.backgroundAudioManager = wx.getBackgroundAudioManager();
                        this.backgroundAudioManager.src = srcURL;
                        this.backgroundAudioManager.title = this.data.NowMusic.name;
                        this.backgroundAudioManager.singer = this.data.songerName;
                        //监听音频播放
                        this.backgroundAudioManager.onPlay(()=>{
                            this.setData({
                                isPlay:true,
                                cNum:0
                            })
                        })
                        // //监听音频播放的播放时长和总时长
                        // BackgroundAudioManager.onTimeUpdate
                        this.backgroundAudioManager.onTimeUpdate(()=>{
                        let duration =this.backgroundAudioManager.duration;
                        let currentTime =this.backgroundAudioManager.currentTime;
                        const cNum = currentTime / this.backgroundAudioManager.duration * this.data.dNum;  // 计算进度条的值
                        // console.log("总时长"+duration);
                        // console.log("当前时间"+currentTime);
                        this.setData({
                          duration:this.formatTime(Math.ceil(duration)),
                          currentTime:this.formatTime(Math.ceil(currentTime)),
                          cNum: cNum  // 更新进度条的值
                        })
                         // 更新歌词追踪定位
                        const playTime = this.backgroundAudioManager.currentTime;
                        const musicLyr = this.data.musicLyr;
                        const LrcIndex = this.binarySearch(musicLyr, playTime);
                        const Header = Math.max(0, (LrcIndex - 5) * 15);
                        this.setData({
                          LrcIndex,
                          Header,
                        });
                      })
                      });
                })
            })
            // console.log(nextMusic);
            this.getMusicLyric();
            // 动态修改窗口标题
            wx.setNavigationBarTitle({
                title: this.data.MusicName
              });
            break;
          case 'loop':
            this.setData({
                IfSwitch: 'loop', // 设置切换状态为loop
                IfSwitchSvg:'../../icon/iconAll/svg/单曲循环1.svg',
            });
            this.loopMusic(); // 触发单曲循环播放的方法
            break;
          case 'randomMuSic':
            this.setData({
                IfSwitch: 'randomMuSic', // 设置切换状态为randomMuSic
                IfSwitchSvg:'../../icon/iconAll/svg/随机播放1.svg',
            });
            this.randomMuSic(); // 触发随机顺序播放的方法
            break;
        }
      },
    // 销毁并回到上一页
    onClick() {
    // 停止当前正在播放的音频
    if (this.backgroundAudioManager) {
        this.backgroundAudioManager.stop();
        this.setData({
            isPlay:false,
            duration:"00:00",
            currentTime:'00:00'
          })
    }
    // 跳转回page/home.home页面
    // wx.navigateTo({
    //     url: '/pages/home/home'
    // });
        wx.navigateBack({
            delta: 1
        });
    },
    //进度条拖拽和改变
    changeSlider(e){
        const value = e.detail.value;  // 获取进度条的值
        const currentTime = value / this.data.dNum * this.backgroundAudioManager.duration;  // 计算当前时间
        this.backgroundAudioManager.seek(currentTime);  // 设置音频播放的当前时间
        this.setData({
        cNum: value,  // 更新进度条的值
        currentTime: this.formatTime(Math.ceil(currentTime))  // 更新当前播放时间
    });
    },

    //获取歌词  
    getMusicLyric(){
        const mid = this.data.nowMusicID
        const cachekey = 'musicLyric_'+mid;
        //从本地缓存读取歌词数据
        const cachedLyric = wx.getStorageSync(cachekey);
        if(cachedLyric){
            //缓存存在，直接使用缓存数据
            this.setData({
                musicLyr:cachedLyric
            })
        }else{
            wx.request({
                method:"GET",
                url: 'http://localhost:3000/lyric?id='+mid,
                success:(e)=>{
                    //   console.log(e)
                    const lrcStr = e.data.lrc.lyric;
                    // console.log(e.data.lrc);
                    // console.log(lrcStr);
                    //   const lyrArr = this.parseLyrics(lyricsContent);
                    // 存储最终分析成功的歌词
                    const lrctimelist = []
                    var lrcstrlist = lrcStr.split("\n");
                    var re = /\[\d{2}:\d{2}\.\d{2,3}\]/
                    for(var i =0 ;i<lrcstrlist.length;i++){
                        const date = lrcstrlist[i].match(re)
                        //判断时间数组不能为空
                        if(date!=null){
                            const lrc = lrcstrlist[i].replace(re,"")
                            const timestr = date[0]
                            if(timestr!=null){
                                var timestr_slice = timestr.slice(1,-1)
                                var splitlist = timestr_slice.split(":")
                                var f = splitlist[0]
                                var m = splitlist[1]
                                var time = parseFloat(f)*60+parseFloat(m)
                                // console.log(time)
                                lrctimelist.push([time,lrc]);
                            }
                        }
                    }
                      this.setData({
                        musicLyr:lrctimelist
                      })
                    //顺手将歌词数据存储起来
                    wx.setStorageSync(cachekey, lrctimelist);
                    }
                })
        }
            // console.log(this.data.musicLyr);
    },
      //时间解析 将时间格式化为分：秒的形式
    formatTime:function(s){
        let t ='';
        s=Math.floor(s);
        if(s>-1){
            let min = Math.floor(s/60)%60; // 计算分钟数
            let sec = s%60; // 计算剩余的秒数
            if(min<10){
                t += "0"; // 如果分钟数小于 10，在前面添加一个零
            }
            t+=min+":"; // 拼接分钟数和冒号
            if(sec<10){
                t += "0";   // 如果秒数小于 10，在前面添加一个零
            }
            t+=sec; // 拼接秒数
        }
        return t;
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