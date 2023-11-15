// pages/RankingList/RankingList.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 所有榜单数据
        RanKingALL: [],
    },
    GoListPage(e){
        console.log(e)
        const PlayListsIndex = e.currentTarget.dataset.index
        const PlayListsid = e.currentTarget.dataset.playlistid
        const imageurl = e.currentTarget.dataset.imageurl
        const PlayListsname = e.currentTarget.dataset.name
        //歌单的内容说明 by内容
        const PlayListsdescription = e.currentTarget.dataset.description
        const PlayListsData_Obj = {}
        PlayListsData_Obj.idx = 3
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
    // 获取所有排行榜api接口
    getRankingALL() {
        const RanKingALLData = "所有排行榜数据"
        wx.getStorage({
            key: RanKingALLData,
            success: (e) => {
                console.log(e)
                this.setData({
                    RanKingALL: e.data,
                })
            },
            fail: () => {
                wx.request({
                    url: 'http://localhost:3000/toplist/detail',
                    success: (e) => {
                        // console.log(e.data.list)
                        const RanKingAll = e.data.list.slice(0, 4)//获取了四个排行榜
                        for (let i = 0; i < RanKingAll.length; i++) {
                            //console.log(i) //把每个的i给遍历出来
                            const RanKingItemList = e.data.list[i].tracks
                            //console.log(RanKingItemList)
                            this.setData({
                                RanKingItemList: RanKingItemList
                            })
                        }
                        this.setData({
                            RanKingALL: RanKingAll,
                        }, () => {
                            wx.setStorage({
                                key: RanKingALLData,
                                data: RanKingAll
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
        this.getRankingALL();
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