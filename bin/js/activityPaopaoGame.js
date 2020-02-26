var timerSet = null //计时器
var Seconds = $('section.gamePlayBox .timerBox').children('span.secondsNum') // 秒数
var BarPercent = $('section.gamePlayBox .BarPercent') //百分比
var progressBar = $('section.gamePlayBox .progressBar') //进度条
/**
 * 计算百分比
 * var _per = per + '%'
   var _perLeft = (per - BarPercent.width()/progressBar.parents('.progress').innerWidth()*100) + '%'
   progressBar.css({width:_per})
   BarPercent.html(per + '%').css({left:_perLeft})
 */

// ---获取用户openid,活动id
var AID = icom.getQueryString('AID') || 9
var SessionKey = icom.getQueryString('SessionKey')
var openid = icom.getQueryString('openid')

// --- 游戏盒子
var gamePlayBox = $('section.gamePlayBox')

// ---游戏结束盒子弹窗
var gameResultBox = $('section.gameResultBox')
var resultBorder = $('section.gameResultBox .border')
var resultTitle = $('section.gameResultBox .title')
var resultTxt1 = $('section.gameResultBox .txt1')
var resultTxt2 = $('section.gameResultBox .txt2')
var isSecondPlay = false //是否是第二次玩
var btnApply = $('#btnApply') //领取福利
var btnAgain = $('#btnAgain') //再玩一次
var resultCloseBtn = $('section.gameResultBox .closeBtn') //关闭按钮

// //游戏UI
// var _GameUI = new GameUI();
// //控制js
// var _GameControl = new GameControl();

//页面球球的总数
var ballNumber = 33;

//暴露方法
var activityPaopaoGame = importActivityPaopaoGame()

function importActivityPaopaoGame() {
  var activityPaopaoGame = {}
  activityPaopaoGame.BarPercentNum = 0 //游戏得分百分比
  activityPaopaoGame.times = 30 // 游戏秒数
  activityPaopaoGame.currentTime = 0 // 当前游戏秒数
  //------------------音乐
  activityPaopaoGame.sound_handler = function () {
    if (os.weixin) {
      try {
        WeixinJSBridge.invoke('getNetworkType', {}, activityPaopaoGame.sound_creat)
      } catch (e) {
        wx.ready(activityPaopaoGame.sound_creat)
      }
    }
    else activityPaopaoGame.sound_creat()
  } // end func

  activityPaopaoGame.sound_creat = function () {
    activityPaopaoGame.soundList = iaudio.on([
      { src: 'sound/paopao.mp3' }, // 泡泡
      { src: 'sound/time.mp3' }]) // 倒计时
  } // end func

  //------------------音乐
  activityPaopaoGame.init = function (callback) {
    activityPaopaoGame.sound_handler();
    Seconds.html(activityPaopaoGame.times)
    eventInit()
    if (callback) callback()
  }

  // ---倒计时
  activityPaopaoGame.timeGo = function (t) {
    t = t || activityPaopaoGame.times
    t--
    activityPaopaoGame.currentTime = t
    t < 10 ? Seconds.html('0' + t) : Seconds.html(t)
    if (t === 0) {
      clearTimeout(timerSet)
      setTimeout(activityPaopaoGame.end, 200)
    } else {
      timerSet = setTimeout(activityPaopaoGame.timeGo, 1000, t)
      //倒计时
      if (t === 5) {
        activityPaopaoGame.soundList.time.play();
      }
    }
  }
  // ----渲染用户得分百分比
  activityPaopaoGame.renderPanel = function (per) {
    var _per = per + '%'
    var tempPer = per - BarPercent.width() / progressBar.parents('.progress').innerWidth() * 100
    if (tempPer > 0) _perLeft = tempPer + '%'
    else _perLeft = 0
    if (per >= 75) gamePlayBox.find('.panelBox').addClass('active')
    progressBar.css({ width: _per })
    BarPercent.html(per + '%').css({ left: _perLeft })

    if (per >= 100) {
      //停止游戏
      clearTimeout(timerSet)
      setTimeout(activityPaopaoGame.end, 200)
    }
  }
  // ---游戏开始
  activityPaopaoGame.start = function () {
    activityPaopaoGame.timeGo()
  }

  // ---游戏暂停
  activityPaopaoGame.pause = function () { }

  // ---游戏再一次开始
  activityPaopaoGame.startAgain = function () {
    setTimeout(activityPaopaoGame.timeGo, 1000)
    GameControl.instance.againGame()
  }

  // ---重置游戏数据
  activityPaopaoGame.reset = function () {
    activityPaopaoGame.BarPercentNum = 0
    Seconds.html(activityPaopaoGame.times)
    //---重新渲染用户得分百分比
    activityPaopaoGame.renderPanel(activityPaopaoGame.BarPercentNum)
  }
  // ---游戏结束
  activityPaopaoGame.end = function () {
    getResultModal()
    GameControl.instance.stopGame()
  }
  // ---点击事件
  function eventInit() {
    //------领取福利
    btnApply.off().on('click', btnApplyClick)
    //------再玩一次
    btnAgain.off().on('click', btnAgainClick)
    //-------结果关闭按钮
    resultCloseBtn.off().on('click', function () {
      //--
      gameResultBox.hide()
    })
  }

  function btnApplyClick() {
    console.log('领取福利')
    window.location.replace('exchangePaopao.html?debug=2&openid=' + openid + '&AID=' + AID + '&SessionKey=' + SessionKey + '&v=' + new Date().getTime())
  }

  function btnAgainClick() {
    console.log('再玩一次')
    isSecondPlay = true //第二次玩
    gameResultBox.hide()//隐藏游戏结果盒子
    activityPaopaoGame.reset() //重置數據
    activityPaopaoGame.startAgain()
  }

  // -----计算用户分数
  /**
   * type1 还差一点！  您消除了XX%污染泡泡/未能开启福利,再来一次为更加/闪耀的光芒继续加油吧！   
   * type2 太棒啦！    您成功消除了XX%污染泡泡/无瑕光芒，闪耀绽放！ 专属福利已开启！
   * type3 游戏结束    您消除了XX%污染泡泡/再接再厉创造光芒奇迹吧！    
   */
  function getResultModal() {
    resultBorder.removeClass('type1 type2 type3')
    gameResultBox.show()
    activityPaopaoGame.soundList.paopao.play();
    if (isSecondPlay && activityPaopaoGame.BarPercentNum < 75) {
      //如果第一次消除未达到75%，并且再玩一次也未能达到，则弹出此框。让未达标用户也可以留资 则出现“游戏结束”弹框
      //type3
      resultBorder.addClass('type3')
      resultTitle.html('游戏结束')
      resultTxt1.html('您消除了' + activityPaopaoGame.BarPercentNum + '%污染泡泡<br>再接再厉创造光芒奇迹吧！')
    } else {
      if (activityPaopaoGame.BarPercentNum >= 75) {
        //游戏结果消除了多于75%的泡泡，则出现“太棒了”弹框
        //type2
        resultBorder.addClass('type2')
        resultTitle.html('太棒啦！')
        resultTxt1.html('您消除了' + activityPaopaoGame.BarPercentNum + '%污染泡泡<br>无瑕光芒，闪耀绽放！')
        resultTxt2.html('专属福利已开启！')
      } else {
        //如果第一次游戏结果小于75%，则以上弹框，让用户“再玩一次
        //type1
        resultBorder.addClass('type1')
        resultTitle.html('还差一点！')
        resultTxt1.html('您消除了' + activityPaopaoGame.BarPercentNum + '%污染泡泡<br>未能开启福利,再来一次为更加<br>闪耀的光芒继续加油吧！')
      }
    }
  }






  // ------------数组every方法
  activityPaopaoGame.everyArr = function () {
    if (!Array.prototype.every) {
      Array.prototype.every = function (callbackfn, thisArg) {
        'use strict'
        var T, k

        if (this == null) {
          throw new TypeError('this is null or not defined')
        }

        // 1. Let O be the result of calling ToObject passing the this 
        //    value as the argument.
        var O = Object(this)

        // 2. Let lenValue be the result of calling the Get internal method
        //    of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0

        // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
        if (typeof callbackfn !== 'function') {
          throw new TypeError()
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
          T = thisArg
        }

        // 6. Let k be 0.
        k = 0

        // 7. Repeat, while k < len
        while (k < len) {
          var kValue

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal 
          //    method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {

            // i. Let kValue be the result of calling the Get internal method
            //    of O with argument Pk.
            kValue = O[k]

            // ii. Let testResult be the result of calling the Call internal method
            //     of callbackfn with T as the this value and argument list 
            //     containing kValue, k, and O.
            var testResult = callbackfn.call(T, kValue, k, O)

            // iii. If ToBoolean(testResult) is false, return false.
            if (!testResult) {
              return false
            }
          }
          k++
        }
        return true
      }
    }
  }
  // ------------随机打乱一个数组
  function shuffle(arr) {
    for (var i = 1; i < arr.length; i++) {
      const random = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[random]] = [arr[random], arr[i]];
    }
    return arr;
  }


  return activityPaopaoGame
}

// 生成多少范围内整数
var rand = (function () {
  var today = new Date()
  var seed = today.getTime()
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / (233280.0)
  }
  return function rand(number) {
    return Math.ceil(rnd(seed) * number)
  }
})()
