var loadBox = $('aside.loadBox')
var API = {
  // DOMAIN: "https://clarins.beats-digital.com",               //正式
  DOMAIN: 'http://clarins-test.beats-digital.com/ClarinsApi', // 测试
  DEBUG: true,
  collectDataType:'cny', //数据pv/uv收集活动类型
  OpenID:icom.getQueryString('openid'),
  SessionKey:icom.getQueryString('SessionKey'),

  _send: function (method, data, success, fail) {
    // 有自己的openid并且data里面不带openid才赋值
    if (API.OpenID && !data.hasOwnProperty('OpenID')) data.OpenID = API.OpenID
    if (API.SessionKey && !data.hasOwnProperty('SessionKey')) data.SessionKey = API.SessionKey
    if(API.collectDataType && data.hasOwnProperty('DataType')) data.DataType = API.collectDataType + data.DataType

    $.ajax({
      url: API.DOMAIN + '/Api/Handler.ashx?method=' + method,
      type: 'POST',
      data: data || {},
      dataType: 'json',
      // async: true,
      success: function (res) {
        if (API.DEBUG) {
          // console.log(method + "——success")
          // console.log(res)
        }

        if (res && res.errcode != 0) {
          loadBox.hide()
          icom.alert(res.errmsg)
          // if (success) success(res)
        }else {
          if (success) success(res)
        }
      },
      error: function (res) {
        if (API.DEBUG) {
          // console.log(method + "——fail")
          // console.log(res)
        }
        loadBox.hide()
        if (success) success(null)
        icom.alert(res.errmsg)
      }
    })
  },

  /**
   * 独家活动-申领页面留资
   * @params Function success 回调函数 如果回调为null说明服务器报错了或者errcod非0
   */
  AddOrder: function (data, success) {
    API._send('AddOrder', data, success)
  },
  /**
   * 独家活动-判断是否留过资
   * @params Function success 回调函数 如果回调为null说明服务器报错了或者errcod非0
   */
  IsOrder: function (data, success) {
    API._send('IsOrder', data, success)
  },
  /**
   * 判断是否核销
   @params Function success 回调函数 如果回调为null说明服务器报错了或者errcod非0
   */
  IsCancel: function (data, success) {
    API._send('IsCancel', data, success)
  },
  /**
   * 输入密码判断
   @params Function success 回调函数 如果回调为null说明服务器报错了或者errcod非0
   */
  IsPwd: function (data, success) {
    API._send('IsPwd', data, success)
  },
  /**
   * 数据pv
   */
  AddDataPv: function (data, success) {
    API._send('AddDataPv', data, success)
  },
  /**
   * 数据uv
   */
  AddDataUv: function (data, success) {
    API._send('AddDataUv', data, success)
  },
   /**
   * 拿最新活动的留资
   */
  GetUserActivity: function (data, success) {
    API._send('GetUserActivity', data, success)
  },
}
