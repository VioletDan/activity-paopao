$(document).ready(function () {
  // -----------------------------------------定义和初始化变量----------------------------------------
  var loadBox = $('aside.loadBox')
  var articleBox = $('article')
  var windowScale = window.innerWidth / 750
  var swiperRule = null,swiperDutyStore = null
  var IsPrivacy = 0 // 是否查看隐私
  var IsUse = 0 // 是否用过
  var ActivityID = icom.getQueryString('AID') || 9
  var SessionKey = icom.getQueryString('SessionKey')
  var openid = icom.getQueryString('openid')

  // ----------------------------------------页面初始化----------------------------------------
  icom.init(init) // 初始化
  icom.screenScrollUnable() // 如果是一屏高度项目且在ios下，阻止屏幕默认滑动行为
  function init () {
    requestAnimationFrame(function () {
      console.log('os.screenProp:' + os.screenProp)
      if (os.screenProp < 0.54) articleBox.addClass('screen189')
      if (os.screenProp > 0.54 && os.screenProp < 0.64)
        articleBox.addClass('screenNormal')
      if (os.screenProp > 0.64) articleBox.addClass('screen159')
      loadBox.show()
      load_handler()
    })
  } // edn func

  // ----------------------------------------加载页面图片----------------------------------------
  function load_handler () {
    var loader = new PxLoader()
    loader.addImage('images/activityPaopao/page/arr.png')
    loader.addImage('images/activityPaopao/page/bg.jpg')
    loader.addImage('images/activityPaopao/page/bg3.jpg')
    loader.addImage('images/activityPaopao/page/btn_sure.png')
    loader.addImage('images/activityPaopao/page/guide_1.png')
    loader.addImage('images/activityPaopao/page/guide_2.png')
    loader.addImage('images/activityPaopao/page/guide_3.png')
    loader.addImage('images/activityPaopao/page/guide_4.png')
    loader.addImage('images/activityPaopao/page/guide_5.png')
    loader.addImage('images/activityPaopao/page/guide_6.png')
    loader.addImage('images/activityPaopao/page/guide_7.png')
    loader.addImage('images/activityPaopao/page/guide_bottom.png')
    loader.addImage('images/activityPaopao/page/guide_top.png')
    loader.addImage('images/activityPaopao/page/line.png')
    loader.addImage('images/activityPaopao/page/logo.png')
    loader.addImage('images/activityPaopao/page/paopao.png')
    loader.addImage('images/activityPaopao/page/result_againBtn.png')
    loader.addImage('images/activityPaopao/page/result_bg.png')
    loader.addImage('images/activityPaopao/page/result_border.png')
    loader.addImage('images/activityPaopao/page/result_colseBtn.png')
    loader.addImage('images/activityPaopao/page/result_prizeBtn.png')
    loader.addImage('images/activityPaopao/page/shine.png')
    loader.addImage('images/activityPaopao/page/shine2.png')
    loader.addImage('images/activityPaopao/page/time.png')
    loader.addImage('images/activityPaopao/page/titleBg.png')
    loader.addImage('images/activityPaopao/gamePaopao/ball1.png')
    loader.addImage('images/activityPaopao/gamePaopao/ball2.png')
    loader.addImage('images/activityPaopao/gamePaopao/bottle.png')
    loader.addImage('images/activityPaopao/gamePaopao/bottom.png')
    loader.addImage('images/activityPaopao/gamePaopao/pp1.png')
    loader.addImage('images/activityPaopao/gamePaopao/pp2.png')
    loader.addImage('images/activityPaopao/gamePaopao/progressBar.png')
    loader.addImage('images/activityPaopao/gamePaopao/progressBg.png')
    loader.addImage('images/activityPaopao/gamePaopao/txt.png')
    // 实际加载进度
    // loader.addProgressListener(function (e) {
    //   var per = Math.round(e.completedCount / e.totalCount * 10)
    //   loadPer.html(per + '%')
    // })

    loader.addCompletionListener(function () {
      // load_timer(50) // 模拟加载进度
      init_handler()
      loader = null
    })
    loader.start()
  } // end func

  // 模拟加载进度
  function load_timer (per) {
    per = per || 0
    per += imath.randomRange(1, 3)
    per = per > 100 ? 100 : per
    loadPer.html(per + '%')
    if (per == 100) {
      setTimeout(init_handler, 200)
    } else setTimeout(load_timer, 33, per)
  } // edn func
  // ----------------------------------------页面逻辑代码----------------------------------------
  function init_handler () {
    icom.fadeIn(articleBox)
    loadBox.hide()
    if (os.ios) IOSinput()
    initIsOrder() //判断用户有没有留资
    // initStoreList() //请求门店信息数据
    eventInit()
    monitor_handler()
    console.log('init handler')
  } // end func

  function eventInit () {
    // ---留资页面
    $('section.pageInfo .lookTerms').off().on('touchend', lookTermsClick)
    $('section.pageInfo .btnSure').off().on('touchend', btnSureClick)
    $('section.pageInfo .termsBox .txt').off().on('touchend', termsBoxClick)
    // ---条款页面
    $('section.pageTerms .close').off().on('touchend', closeClick)
    // // ---兑换码输入页面
    // $('section.pageCodeEnter .btnCodeEnter').off().on('touchend',btnCodeEnterClick)
    // // ---分享页面
    // $('section.pageShare .btnShare').off().on('touchend',btnShareClick)
    // $('section.sharecont').off().on('touchend',sharecontClick)
  }
  /**
   * 泡泡龙活动
   * 如果用户参加过上一期的活动并且有申领记录，点击进入CNY的申请记录页面
   * 注意：CNY的活动和上一期其实属于一个类型，所以申领记录只会有一个
   */
  function initIsOrder () {
    loadBox.show()
    API.IsOrder({
      ActivityID: 8,
      SessionKey: SessionKey
    }, (res) => {
      if (res && res.result.Flag == 1) {
        // 如果活动7已留资,走后面的逻辑
        UserSubmitSuccess()
      } else {
        //再判断活动8有没有留资,留过资走后面逻辑,否则显示留资窗口
        API.IsOrder({
          ActivityID: 9,
          SessionKey: SessionKey
        }, (res) => {
          if (res && res.result.Flag == 1) {
            // 如果活动8已留资,走后面的逻辑
            UserSubmitSuccess()
          } else {
            //显示留资
            $('section.pageInfo').fadeIn()
            API.AddDataPv({
              DataType: '留资页面'
            }, (data) => {
              // console.log(data)
            });
            API.AddDataUv({
              DataType: '留资页面'
            }, (data) => {
              // console.log(data)
            });
            loadBox.hide()
          }
        })
      }
    })
  }
  // --------------------------------------留资页面
  // ---勾选
  function termsBoxClick () {
    var type = $(this).data('type')
    var iconGou = $(this).children('.iconGou')
    if (!iconGou.hasClass('active')) {
      iconGou.addClass('active')
      if (type == 'isprivacy') IsPrivacy = 1
      if (type == 'isuse') IsUse = 1
    }else {
      iconGou.removeClass('active')
      if (type == 'isprivacy') IsPrivacy = 0
      if (type == 'isuse') IsUse = 0
    }
  }
  // ---提交表单按钮
  function btnSureClick () {
    var name = $('input[name="name"]').val() // name
    var phone = $('input[name="phone"]').val() // name
    var isPhone = icom.checkStr(phone, 0)
    var content = ''
    if (name == '') {
      content = '请输入姓名'
    }else if (phone == '') {
      content = '请输入手机'
    } else if (!isPhone) {
      content = '手机号码格式不正确'
    }
    else if (IsPrivacy == 0) {
      content = '请勾选已阅读用户协议'
    }
    if (content != '') {
      icom.alert(content)
    }else {
      loadBox.show()
      API.AddOrder({
        SessionKey: SessionKey,
        ActivityID: ActivityID,
        Name: name,
        Phone: phone,
        City: '-',
        Addresses: '-',
        Area: '-',
        Province: '-',
        Options: '-',
        IsUse: IsUse
      }, (res) => {
        console.log('AddOrder back')
        loadBox.hide()
        // 显示留资成功页面
        UserSubmitSuccess()
      })
    }
  }
  // ---查看隐私条款
  function lookTermsClick () {
    swiperRule = new Swiper('#swiperRule', {
      direction: 'vertical',
      slidesPerView: 'auto',
      freeMode: true,
      scrollbar: {
        el: '#swiperRule .swiper-scrollbar'
      },
      observer: true,
      observeParents: true,
      mousewheel: true
    })
    $('.pageTerms').fadeIn()
  }
  // ---关闭条款弹窗
  function closeClick () {
    $('.pageTerms').fadeOut()
  }

  // --------------------------------------留资成功后页面
  /**
   * 留资成功后页面
   * 1.判断用户有没有线下兑换成功,成功则点击兑换按钮去==感谢参与页面
   * 2.没有兑换成功==去输入兑换码页面==感谢参与页面
   */
  function UserSubmitSuccess(){
    //判断用户有没有兑换成功
    API.IsCancel({
      ActivityID: ActivityID,
      SessionKey: SessionKey
    }, (data) => {
      if (data && data.errcode == 0) {
        $('section.pageCodeTips').fadeIn(400,function(){
          // ---初始化免税店页面 上滑显示免税店页面
          $(document).on('swipeup', dutyStore_handler);
          $('section.pageCodeTips .btnCodeTips').off().on('click',btnCodeTipsClick)
          // ---初始化免税店页面
          $('section.pageCodeTips .dutyStore .arr').off().on('touchend',arrClick)
          $('section.pageCodeTips .dutyStore .btnDuty').off().on('touchend',btnDutyClick)
        })
        loadBox.hide()
        // Flag  [number]	是	3 未核销 4已核销
        if(data.result.Flag == 3){
          //点击按钮去核销页
        }else{
          // 核销的话文案改成==已兑换==
          $('section.pageCodeTips .btnCodeTips').addClass('active')
        }
      }
    });
  }

  // ----------------------------------------初始化免税店页面
  function dutyStore_handler(){
    $('section.pageCodeTips .CodeTips').fadeOut()
    $('section.pageCodeTips .dutyStore').fadeIn()
    // initStoreList()
  }
  //初始化免税店地址
  function initStoreList(){
    $.getJSON('data/dutylistA8.json?v='+new Date().getTime()+'', function (data) {
      // 显示免税店页面
      var list = data.list,html = ''
      list.forEach(function(ele,index){
        var listAdress = '',listDate = '', listOther = ''
        if(ele.info[0]){
          listAdress = '<div class="common listAdress">'+ele.info[0]+'</div>'
        }
        if(ele.info[1]){
          listDate = '<div class="common listDate">'+ele.info[1]+'</div>'
        }
        if(ele.other){
          listOther = '<div class="common listOther">'+ele.other.join("")+'</div>'
        }

        html += '<div class="listItem">\
                  <div class="listTitle">'+ele.title+'</div>\
                  <div class="listInfo">\
                    '+ listAdress +'\
                    '+ listDate +'\
                    '+ listOther +'\
                  </div>\
                </div>'
      });
      $('section.pageCodeTips .dutyStore .swiper-slide').html(html)
      swiperDutyStore = new Swiper('#swiperDutyStore', {
        direction: 'vertical',
        slidesPerView: 'auto',
        freeMode: true,
        scrollbar: {
          el: '#swiperDutyStore .swiper-scrollbar'
        },
        observer: true,
        observeParents: true,
        mousewheel: true
      })
    });
  }
  // 去免税精选地图页
  function btnDutyClick(){
    wx.miniProgram.navigateTo({
      url: '/packageFree/pages/dutyFree_store/dutyFree_store'
    })
  }
  // 隐藏免税店页面
  function arrClick(){
    $(this).parents('.dutyStore').fadeOut()
    $('section.pageCodeTips .CodeTips').fadeIn()
  }
  // ---------------------------------------核销页面
  function btnCodeTipsClick(){
    // active 类判断用户是否核销过
    if(!$(this).hasClass('active')){
      $('section.pageCodeEnter').fadeIn()
    }else{
      $('section.pageShare').fadeIn()
    }
  }

  //确认兑换按钮
  function btnCodeEnterClick(){
    var codeName = $('input[name="codeName"]').val() //codeName
    if(codeName == ''){
      icom.alert('请输入兑换码')
      return
    }
    API.IsPwd({
      Pwd: codeName,
      ActivityID: ActivityID,
      SessionKey: SessionKey
    }, (data) => {
      if (data && data.errcode == 0) {
        //Flag [number]	是	0 成功 1 密码错误 2重复领取
        if (data.result.Flag == 0){
          //领取成功 显示分享页面
          $('section.pageShare').fadeIn()
          return;
        }
        if (data.result.Flag == 1) {
          //密码错误
          icom.alert('兑换码错误');
          return;
        }
        if (data.result.Flag == 2) {
          //不能重复领取
          icom.alert('不能重复领取');
          return;
        }
      }
    });
  }

  // ----------------------------------------分享页面
  function btnShareClick(){
    $('section.sharecont').fadeIn()
    API.AddDataPv({
      DataType: '按钮-分享'
    }, (data) => {
      // console.log(data)
    });
    API.AddDataUv({
      DataType: '按钮-分享'
    }, (data) => {
      // console.log(data)
    });
  }
  function sharecontClick(){
    $(this).fadeOut()
  }

  // ------------------------工具类
  /**
   * 苹果输入框
   */
  function IOSinput () {
    $('.promotionPage').addClass('fixedInput')
    var itimer
    document.body.addEventListener('focusin', function () {
      clearTimeout(itimer)
    })
    document.body.addEventListener('focusout', function () {
      itimer = setTimeout(function () {
        var scrollHeight =
        document.documentElement.scrollTop || document.body.scrollTop || 0
        window.scrollTo(0, Math.max(scrollHeight - 1, 0))
      }, 100)
    })
  }
  /**
   * 
   * @param {*} s 过滤掉特殊字符
   */
  function stripscript (s) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/@#￥&*（）—|{}【】‘；：”“']")
    var rs = ''
    for (var i = 0; i < s.length; i++) {
      rs = rs + s.substr(i, 1).replace(pattern, '')
    }
    return rs
  }
  // ----------------------------------------页面监测代码----------------------------------------
  function monitor_handler () {
    //		imonitor.add({obj:$('a.btnTest'),action:'touchstart',category:'default',label:'测试按钮'})
  } // end func
}) // end ready
