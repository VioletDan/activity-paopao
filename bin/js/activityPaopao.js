$(document).ready(function () {
  // -----------------------------------------定义和初始化变量----------------------------------------
  var loadBox = $('aside.loadBox')
  var articleBox = $('article')
  var windowScale = window.innerWidth / 750


  //游戏指引弹窗
  var gameGuideBox = $('section.gameGuideBox')
  var guideTouch = $('section.gameGuideBox .guideTouch');
  var guideMask = $('section.gameGuideBox .guideMask');
  var guideMaskB = $('section.gameGuideBox .guideMaskB');
  var guideNum = 1

  //游戏盒子
  var gamePlayBox = $('section.gamePlayBox')
  // var BarPercent = $('section.gamePlayBox .BarPercent') //百分比
  // var progressBar = $('section.gamePlayBox .progressBar') //进度条

  // ----------------------------------------页面初始化----------------------------------------
  icom.init(init) // 初始化
  icom.screenScrollUnable() // 如果是一屏高度项目且在ios下，阻止屏幕默认滑动行为
  function init() {
    requestAnimationFrame(function () {
      console.log('os.screenProp:' + os.screenProp)
      if (os.screenProp < 0.54) articleBox.addClass('screen189')
      if (os.screenProp > 0.54 && os.screenProp < 0.64)
        articleBox.addClass('screenNormal')
      if (os.screenProp > 0.64) articleBox.addClass('screen159')
      if (os.ios) {
        $('section.gamePlayBox .topBox').css({ height: '72px' });
      } else {
        $('section.gamePlayBox .topBox').css({ height: '67px' });
      }
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
    loader.addImage('images/activityPaopao/page/guide_1_m.png')
    loader.addImage('images/activityPaopao/page/guide_2_m.png')
    loader.addImage('images/activityPaopao/page/guide_3_m.png')
    loader.addImage('images/activityPaopao/page/guide_6_m.png')
    loader.addImage('images/activityPaopao/page/guide_7_m.png')
    loader.addImage('images/activityPaopao/page/guide_8_m.png')
    loader.addImage('images/activityPaopao/page/guide_1_p.png')
    loader.addImage('images/activityPaopao/page/guide_2_p.png')
    loader.addImage('images/activityPaopao/page/guide_3_p.png')
    loader.addImage('images/activityPaopao/page/guide_6_p.png')
    loader.addImage('images/activityPaopao/page/guide_7_p.png')
    loader.addImage('images/activityPaopao/page/guide_8_p.png')
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
  function sound_handler() {
    if (os.weixin) {
      try {
        WeixinJSBridge.invoke('getNetworkType', {}, game.sound_creat)
      } catch (e) {
        wx.ready(sound_creat)
      }
    }
    else sound_creat()
  } // end func

  function sound_creat() {
    soundList = iaudio.on([
      { src: 'sound/paopao.mp3' }, // 泡泡
      { src: 'sound/time.mp3' }]) // 倒计时
  } // end func

  // init
  function init_handler() {
    icom.fadeIn(articleBox)
    //-------------------------页面初始化
    pageInit()
    loadBox.hide()
    eventInit()
    monitor_handler()
    console.log('init handler')
  } // end func
  //-------------------------事件初始化
  function eventInit(params) { }
  function pageInit() {
    gameGuideBoxInit()
  }
  //-------------------------初始化游戏弹窗指引
  function gameGuideBoxInit() {
    activityPaopaoGame.init()
    if (window.localStorage.getItem('isGuide') && window.localStorage.getItem('isGuide') === '3') {
      //直接开始游戏
      gameGuideBox.hide()
      gamePlayBox.show()
      gameStartHandle()
    } else {
      guideTouch.off().on('touchend', throttle(guideTouchClick, 300))
    }
  }

  // 弹窗指引事件
  function guideTouchClick() {
    if (gameGuideBox.hasClass('limitTouch')) return //截取点击狂魔
    if (guideNum < 8) {
      guideNum++;
      guideMask.removeClass('guideMask' + (guideNum - 1)).addClass('guideMask' + guideNum);
      if (guideNum == 3 || guideNum == 4 || guideNum == 5) {
        guideMask.children('img').attr('src', 'images/activityPaopao/page/guide_' + 3 + '_m.png')
      } else {
        guideMask.children('img').attr('src', 'images/activityPaopao/page/guide_' + guideNum + '_m.png')
      }
      if (guideNum == 6) {
        $('section.gameGuideBox .arr').addClass('arr6');
      } else {
        $('section.gameGuideBox .arr').removeClass('arr6');
      }
    } else {
      gameGuideBox.addClass('limitTouch') //截取点击狂魔
      guideMask.transition({ opacity: 0 }, 100)
      gameGuideBox.hide()
      gamePlayBox.show()
      gameStartHandle()

      //标识指引出现了几次
      //存储 引导层只显示一次
      if (!window.localStorage.getItem('isGuide')) {
        window.localStorage.setItem('isGuide', '1')
      } else {
        var num = Number(window.localStorage.getItem('isGuide'))
        window.localStorage.setItem('isGuide', String(num + 1))
      }
      return
    }
    //播放音效
    activityPaopaoGame.soundList.paopao.play()
  }

  //----------------游戏开始事件
  function gameStartHandle() {
    Laya.Scene.open('gameBox.scene');
    $('section.gamePlayBox .topBox').addClass('active');
    setTimeout(activityPaopaoGame.start, 2000)
  }





  //----------------------------------------- 工具函数
  //节流 时间戳版本
  function throttle(func, wait) {
    var previous = 0;
    return function () {
      var now = Date.now();
      var context = this;
      var args = arguments;
      if (now - previous > wait) {
        func.apply(context, args);
        previous = now;
      }
    }
  }

  // ----------------------------------------页面监测代码----------------------------------------
  function monitor_handler() {
    //		imonitor.add({obj:$('a.btnTest'),action:'touchstart',category:'default',label:'测试按钮'})
  } // end func
}) // end ready
