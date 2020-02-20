$(document).ready(function () {
  // -----------------------------------------定义和初始化变量----------------------------------------
  var loadBox = $('aside.loadBox')
  var articleBox = $('article')
  var windowScale = window.innerWidth / 750
  var swiperRule = null, swiperDutyStore = null
  var IsPrivacy = 0 // 是否查看隐私
  var IsUse = 0 // 是否用过
  var ActivityID = icom.getQueryString('AID') || 9
  var SessionKey = icom.getQueryString('SessionKey')
  var openid = icom.getQueryString('openid')

  // 上传图片
  var fileInput,
    ticketData = '',//base64路径
    ticketSrc = '';
  //测试用例
  var ticketSrc = 'http://upload.cdn.be-xx.com/clarins-wxapp/9598b06d-fea2-49b1-84b7-4c1d3840b556.jpg'; //cdn路径
  var btnCamera = $('section.pageRedBookEnter .btnCamera');
  var imgShell = $('section.pageRedBookEnter .shell');
  var imgCanvas = $('section.pageRedBookEnter .compresse');
  // var _secretkey = 'clarins-wxapp';//上传到cdn的目录名称，上线后要改为正式地址
  var _secretkey = 'clarins-wxapp-test';//上传到cdn的目录名称，上线后要改为正式地址

  // ----------------------------------------页面初始化----------------------------------------
  icom.init(init) // 初始化
  icom.screenScrollUnable() // 如果是一屏高度项目且在ios下，阻止屏幕默认滑动行为

  //设置样式
  function setpageCodeTipsH() {
    var middleBoxH = $('section.pageCodeTips .middleBox').height();
    var formBoxH = $('section.pageCodeTips .formBox').height();
    var titleBoxH = $('section.pageCodeTips .titleBox').height();
    var deH = (middleBoxH - (formBoxH + titleBoxH) - 100);
    $('section.pageCodeTips .formBox').css({
      marginTop: deH > 0 ? deH : 0
    })
  }

  function init() {
    requestAnimationFrame(function () {
      console.log('os.screenProp:' + os.screenProp)
      if (os.screenProp < 0.54) articleBox.addClass('screen189')
      if (os.screenProp > 0.54 && os.screenProp < 0.64)
        articleBox.addClass('screenNormal')
      if (os.screenProp > 0.64) articleBox.addClass('screen159')
      setpageCodeTipsH();
      loadBox.show()
      load_handler()
    })
  } // edn func

  // ----------------------------------------加载页面图片----------------------------------------
  function load_handler() {
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
  function load_timer(per) {
    per = per || 0
    per += imath.randomRange(1, 3)
    per = per > 100 ? 100 : per
    loadPer.html(per + '%')
    if (per == 100) {
      setTimeout(init_handler, 200)
    } else setTimeout(load_timer, 33, per)
  } // edn func
  // ----------------------------------------页面逻辑代码----------------------------------------
  function init_handler() {
    icom.fadeIn(articleBox)
    loadBox.hide()
    if (os.ios) IOSinput()
    initIsOrder() //判断用户有没有留资
    // initStoreList() //请求门店信息数据
    eventInit()
    monitor_handler()
    console.log('init handler')
  } // end func

  function eventInit() {
    // ---留资页面
    $('section.pageInfo .lookTerms').off().on('touchend', lookTermsClick)
    $('section.pageInfo .btnSure').off().on('touchend', btnSureClick)
    $('section.pageInfo .termsBox .txt').off().on('touchend', termsBoxClick)
    // ---条款页面
    $('section.pageTerms .close').off().on('touchend', closeClick)
  }
  /**
   * 泡泡龙活动
   * 如果用户参加过上一期的活动并且有申领记录，点击进入CNY的申请记录页面
   * 注意：CNY的活动和上一期其实属于一个类型，所以申领记录只会有一个
   */
  function initIsOrder() {
    loadBox.show()
    API.IsOrder({
      ActivityID: 9,
      SessionKey: SessionKey
    }, (res) => {
      if (res && res.result.Flag == 1) {
        // 如果活动8已留资,走后面的逻辑
        UserSubmitSuccess()
      } else {
        // 拿最新的留资
        API.GetUserActivity({}, (res) => {
          renderUserInfo(res.result[0])
        })
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
  // --------------------------------------留资页面
  //渲染资料
  function renderUserInfo(data) {
    if (data.Name != '') {
      $('input[name="name"]').val(data.Name)
    }
    if (data.Phone != '') {
      $('input[name="phone"]').val(data.Phone)
    }
    //显示留资
    $('section.pageInfo').fadeIn()
  }

  // ---勾选
  function termsBoxClick() {
    var type = $(this).data('type')
    var iconGou = $(this).children('.iconGou')
    if (!iconGou.hasClass('active')) {
      iconGou.addClass('active')
      if (type == 'isprivacy') IsPrivacy = 1
      if (type == 'isuse') IsUse = 1
    } else {
      iconGou.removeClass('active')
      if (type == 'isprivacy') IsPrivacy = 0
      if (type == 'isuse') IsUse = 0
    }
  }
  // ---提交表单按钮
  function btnSureClick() {
    var name = $('input[name="name"]').val() // name
    var phone = $('input[name="phone"]').val() // name
    var isPhone = icom.checkStr(phone, 0)
    var content = ''
    if (name == '') {
      content = '请输入姓名'
    } else if (phone == '') {
      content = '请输入手机'
    } else if (!isPhone) {
      content = '手机号码格式不正确'
    }
    else if (IsPrivacy == 0) {
      content = '请勾选已阅读用户协议'
    }
    if (content != '') {
      icom.alert(content)
    } else {
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
  function lookTermsClick() {
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
  function closeClick() {
    $('.pageTerms').fadeOut()
  }

  // --------------------------------------留资成功后页面
  /**
   * 留资成功后页面
   * 1.判断用户有没有线下兑换成功,成功则点击兑换按钮去==感谢参与页面
   * 2.没有兑换成功==去输入兑换码页面==感谢参与页面
   */
  function UserSubmitSuccess() {
    //判断用户有没有兑换成功
    API.IsCancel({
      ActivityID: ActivityID,
      SessionKey: SessionKey
    }, (data) => {
      if (data && data.errcode == 0) {
        $('section.pageCodeTips').addClass('active')
        $('section.pageCodeTips').fadeIn(400, function () {
          $('section.pageCodeTips .btnSumbit').off().on('click', btnCodeEnterClick)
          // ---初始化免税店页面
          $('section.pageCodeTips .btnDuty').off().on('touchend', btnDutyClick)
        })
        loadBox.hide()
        // Flag  [number]	是	3 未核销 4已核销
        if (data.result.Flag == 3) {
          //点击按钮去核销页
        } else {
          // 核销的话文案改成==已兑换==
          // $('section.pageCodeTips .btnCodeTips').addClass('active')
          //显示小红书ID输入页面
          initRedBook()
          $('section.pageCodeTips').removeClass('active')
          $('section.pageRedBookEnter').fadeIn()
        }
      }
    });
  }

  // ----------------------------------------初始化免税店页面
  // 去免税精选地图页
  function btnDutyClick() {
    wx.miniProgram.navigateTo({
      url: '/packageFree/pages/dutyFree_store/dutyFree_store'
    })
  }
  // ---------------------------------------核销页面
  //确认兑换按钮
  function btnCodeEnterClick() {
    var codeName = $('input[name="codeName"]').val() //codeName
    if (codeName == '') {
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
        if (data.result.Flag == 0) {
          //显示小红书ID输入页面
          initRedBook()
          $('section.pageCodeTips').removeClass('active')
          $('section.pageRedBookEnter').fadeIn()
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

  // ----------------------------------------小红书ID填写页面
  //----测试
  // initRedBook()
  function initRedBook() {
    $('section.pageRedBookEnter .btnSumbitRed').off().on('touchend', btnSumbitRedClick)
    fileInput = $('<input type="file" accept="image/*" name="imageInput" class="input" />').appendTo(btnCamera);
    fileInput.on('change', file_select);
  }

  function btnSumbitRedClick() {
    var userID = $('input[name="userID"]').val() // name
    var userLink = $('input[name="userLink"]').val() // name
    var content = ''
    if (userID == '') {
      content = '请输入小红书ID'
    } else if (userLink == '') {
      content = '请输入发布链接'
    } else if (ticketSrc == '') {
      content = '请上传发布截图'
    }
    if (content != '') {
      icom.alert(content)
    } else {
      var obj = {
        userID: userID,
        userLink: userLink,
        ticketSrc: ticketSrc
      }
      console.log(obj)
      // loadBox.show()
      // ajax写这里
      // icom.alert('提交成功');
      //显示提交成功弹窗
      $('section.pageRedBookEnter').hide()
      $('section.pageRedBookSuccess').fadeIn()
    }
  }

  //拍照或打开本地图片
  function file_select(e) {
    console.log('file_select触发了');
    var file = this.files[0];
    if (file) {
      loadBox.show();
      ireader.read({
        file: file, callback: function (resp, wd, ht) {
          if (resp) {
            //2种方式
            img_creat(resp, wd, ht);
            // img_canvas(resp, wd, ht);
          }
        }
      });
    }//end if
  }//end select

  //不压缩图片
  function img_creat(src, wd, ht) {
    ticketData = src.split(",")[1];
    // console.log(ticketData.length);
    imgShell.css({ backgroundImage: 'url(' + src + ')' });
    //隐藏上传图片提示符
    btnCamera.find('.iconAdd').hide();
    //为了防止图片变模糊，在这里上传到cdn的其实还是原始图片的大小，
    uolpadBase64();
  }//end func

  //压缩图片
  function img_canvas(src, wd, ht) {
    //隐藏上传图片提示符
    btnCamera.find('.iconAdd').hide();
    //canvas压缩图片
    var btnCameraW = btnCamera.width();
    var btnCameraH = btnCamera.height();
    var width = 640;
    var height = width * ht / wd;
    imgCanvas[0].height = height;
    imgCanvas[0].width = width;
    imgCanvas.removeLayers()
    imgCanvas.drawImage({
      layer: true,
      name: 'cps',
      source: src,
      width: width,
      height: height,
      x: width / 2,
      y: height * 0.5,
      scale: 1,
      fromCenter: true,
      intangible: false
    }).drawLayers()

    setTimeout(function () {
      var src = imgCanvas[0].toDataURL('image/jpeg', 1);
      imgShell.css({ backgroundImage: 'url(' + src + ')' });
      //为了防止图片变模糊，在这里上传到cdn的其实还是原始图片的大小，
      uolpadBase64()
    }, 500)
  }

  //上传到cdn
  function uolpadBase64() {
    base64_send(ticketData, image_combine_complete, _secretkey);
  }//edn func

  function base64_send(data, callback, secretkey) {
    $.post('http://upload.be-xx.com/upload', { data: data, key: secretkey }, function (resp) {
      callback(resp);
    })
  }//end func

  function image_combine_complete(src) {
    ticketSrc = src;
    console.log('ticketSrc:' + ticketSrc);
    loadBox.hide();
  }//end func












  // ------------------------工具类
  /**
   * 苹果输入框
   */
  function IOSinput() {
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
  function stripscript(s) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/@#￥&*（）—|{}【】‘；：”“']")
    var rs = ''
    for (var i = 0; i < s.length; i++) {
      rs = rs + s.substr(i, 1).replace(pattern, '')
    }
    return rs
  }
  // ----------------------------------------页面监测代码----------------------------------------
  function monitor_handler() {
    //		imonitor.add({obj:$('a.btnTest'),action:'touchstart',category:'default',label:'测试按钮'})
  } // end func
}) // end ready
