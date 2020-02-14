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
        $('section.gamePlayBox .topBox').css({ height: '116px' });
      } else {
        $('section.gamePlayBox .topBox').css({ height: '111px' });
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
    guideMask.transition({ opacity: 1, delay: 100 }, 100, function () {
      guideTouch.off().on('touchend', throttle(guideTouchClick, 300))
      activityPaopaoGame.init()
    })
  }

  // 弹窗指引事件
  function guideTouchClick() {
    if (gameGuideBox.hasClass('limitTouch')) return //截取点击狂魔
    if (guideNum < 7) {
      guideNum++;
      guideMask.attr('src', 'images/activityPaopao/page/guide_' + guideNum + '.png')
    } else {
      gameGuideBox.addClass('limitTouch') //截取点击狂魔
      guideMask.transition({ opacity: 0 }, 100)
      gameGuideBox.hide()
      gamePlayBox.show()
      gameStartHandle()
      return
    }
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
