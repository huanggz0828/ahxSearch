/* @date 2024/11/12 15:02:18 */
var Server = 'http://www.ahdexpress.com/api/hy_order_track.php';
var Language = 'zh';
var PageG = 'track';
var NowUTC = 0;
var $ = jQuery;
var menuArr = [];
var clipboard = new ClipboardJS('.copytext');
var package_item = null;
function loadProperties() {
  var i18nLanguage = 'zh';
  var navLang = navigator.language || 'zh';
  if (navLang.toLowerCase().indexOf('zh') != -1) {
    i18nLanguage = 'zh';
  }
  var LanguageLocal = localStorage.getItem('Language');
  if (LanguageLocal != null) {
    i18nLanguage = LanguageLocal;
  }
  Language = i18nLanguage;
  $('html').attr('lang', i18nLanguage);
  $.i18n.properties({
    name: 'string',
    path: 'language/',
    mode: 'map',
    language: i18nLanguage,
    callback: function () {
      $('[data-lang]').each(function () {
        $(this).html($.i18n.map[$(this).data('lang')]);
      });
      $('[data-i18n-placeholder]').each(function () {
        var key = $(this).data('i18n-placeholder');
        var translatedText = $.i18n.map[key];
        $(this).attr('placeholder', translatedText);
      });
      $('[data-i18n-title]').each(function () {
        var key = $(this).data('i18n-title');
        var translatedText = $.i18n.map[key];
        $(this).attr('title', translatedText);
      });
      $('[data-i18n-alt]').each(function () {
        var key = $(this).data('i18n-alt');
        var translatedText = $.i18n.map[key];
        $(this).attr('alt', translatedText);
      });
      var strRegex = /\{\{\{([^{}]+)\}\}\}/g;
      var strs = [];
      var htmlSel = $('.main');
      var html = htmlSel.html();
      var match;
      while ((match = strRegex.exec(html)) !== null) {
        var t_str = match[1];
        t_str = t_str.replace(/(^\s*)|(\s*$)/g, '');
        strs.push(t_str);
      }
      strs.forEach(function (str) {
        html = html.replace('{{{' + str + '}}}', $.i18n.map[str]);
      });
      menuArr = [
        {
          code: 'track',
          menu: 'track',
          text: $.i18n.propSel('track_title'),
          i18n: 'track_title',
          name: $.i18n.propSel('track_subtitle'),
        },
        {
          code: 'postcode',
          menu: 'postcode',
          text: $.i18n.propSel('area_title'),
          i18n: 'area_title',
          name: $.i18n.propSel('area_subtitle'),
        },
        {
          code: 'help',
          menu: 'help',
          text: $.i18n.propSel('help_title'),
          i18n: 'help_title',
          name: $.i18n.propSel('help_subtitle'),
        },
      ];
      htmlSel.html(html);
    },
  });
}
var $F = (function () {
  return {
    getUrlParam: function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    toStamp: function (date) {
      if (date.split('/').length >= 2) {
        var sp_arr = date.split(' ');
        var hms = sp_arr[1];
        var ymd_arr = sp_arr[0].split('/');
        var ymd = ymd_arr[2] + '/' + ymd_arr[1] + '/' + ymd_arr[0];
        date = ymd + ' ' + hms;
      }
      var myDate = new Date(date);
      var stmapEg = Date.parse(myDate) / 1e3;
      return stmapEg;
    },
    toDate: function (stamp) {
      var myStamp = new Date(stamp * 1e3);
      var YY = myStamp.getFullYear();
      var MM =
        myStamp.getMonth() + 1 < 10 ? '0' + (myStamp.getMonth() + 1) : myStamp.getMonth() + 1;
      var DD = myStamp.getDate() < 10 ? '0' + myStamp.getDate() : myStamp.getDate();
      var dateEg = YY + '/' + MM + '/' + DD;
      return dateEg;
    },
    toDateDetail: function (stamp) {
      var myStamp = new Date(stamp * 1e3);
      var YY = myStamp.getFullYear();
      var MM =
        myStamp.getMonth() + 1 < 10 ? '0' + (myStamp.getMonth() + 1) : myStamp.getMonth() + 1;
      var DD = myStamp.getDate() < 10 ? '0' + myStamp.getDate() : myStamp.getDate();
      var hh = myStamp.getHours() < 10 ? '0' + myStamp.getHours() : myStamp.getHours();
      var mm = myStamp.getMinutes() < 10 ? '0' + myStamp.getMinutes() : myStamp.getMinutes();
      var ss = myStamp.getSeconds() < 10 ? '0' + myStamp.getSeconds() : myStamp.getSeconds();
      var dateEg = YY + '/' + MM + '/' + DD + ' ' + hh + ':' + mm + ':' + ss;
      return dateEg;
    },
    testOrderId: function (OrderId) {
      var RE = /^[a-zA-Z0-9_-]{4,32}$/;
      return RE.test(OrderId);
    },
    trimAll: function (str) {
      return str.split(/[(\r\n\s)\r\n\s]+/).join('');
    },
    DOMLoading: function (type, title, text, btn) {
      if (type === void 0) {
        type = 1;
      }
      if (title === void 0) {
        title = $.i18n.propSel('html_loading_title');
      }
      if (text === void 0) {
        text = $.i18n.propSel('html_loading_msg');
      }
      if (btn === void 0) {
        btn = $.i18n.propSel('html_loading_button');
      }
      $('#loading ._btn').hide();
      $('#loading ._title').html(title);
      $('#loading ._text').html(text);
      $('#loading ._btn').html(btn);
      if (type) {
        $('#loading').show();
        disableScroll();
      } else {
        $('#loading').hide();
        enableScroll();
      }
    },
    TextLine: function () {
      var textarea = $('.textarea');
      var numbers = $('.numbers');
      function initLineNumbers() {
        var lines = calcLines();
        var lineDoms = lines.map(function (line) {
          return '<div>' + (line || '&nbsp;') + '</div>';
        });
        numbers.html(lineDoms.join(''));
      }
      var textareaStyles = window.getComputedStyle(textarea[0]);
      ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'padding'].forEach(
        function (property) {
          numbers.css(property, textareaStyles[property]);
        }
      );
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var font = textareaStyles.fontSize + ' ' + textareaStyles.fontFamily;
      context.font = font;
      function calcStringLines(sentence, width) {
        if (!width) return 0;
        var words = sentence.split('');
        var lineCount = 0;
        var currentLine = '';
        for (var i = 0; i < words.length; i++) {
          var wordWidth = context.measureText(words[i]).width;
          var lineWidth = context.measureText(currentLine).width;
          if (lineWidth + wordWidth > width) {
            lineCount++;
            currentLine = words[i];
          } else {
            currentLine += words[i];
          }
        }
        if (currentLine.trim() !== '') lineCount++;
        return lineCount;
      }
      function calcLines() {
        var lines = textarea.val().split('\n');
        var textareaWidth = textarea.outerWidth();
        var textareaScrollWidth = textareaWidth - textarea[0].clientWidth;
        var parseNumber = function (v) {
          return v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;
        };
        var textareaPaddingLeft = parseNumber(textareaStyles.paddingLeft);
        var textareaPaddingRight = parseNumber(textareaStyles.paddingRight);
        var textareaContentWidth =
          textareaWidth - textareaPaddingLeft - textareaPaddingRight - textareaScrollWidth;
        var numLines = lines.map(function (lineString) {
          return calcStringLines(lineString, textareaContentWidth);
        });
        var lineNumbers = [];
        var i = 1;
        while (numLines.length > 0) {
          var numLinesOfSentence = numLines.shift();
          lineNumbers.push(i);
          if (numLinesOfSentence > 1) {
            Array(numLinesOfSentence - 1)
              .fill('')
              .forEach(function (_) {
                return lineNumbers.push('');
              });
          }
          i++;
        }
        return lineNumbers;
      }
      if (isIE()) {
        console.log('IE');
        numbers.hide();
        return false;
      }
      var ro = new ResizeObserver(function () {
        var rect = textarea[0].getBoundingClientRect();
        numbers.css('height', rect.height + 'px');
        initLineNumbers();
      });
      ro.observe(textarea[0]);
      textarea.on('scroll', function () {
        numbers.scrollTop(textarea.scrollTop());
      });
      textarea.on('input', function () {
        numbers.scrollTop(textarea.scrollTop());
        initLineNumbers();
      });
    },
  };
})();
DOMinit();
function DOMinit() {
  $('.users').hide();
}
loadProperties();
$F.DOMLoading(1, 'loading', '...');
$(function () {
  console.log('页面已加载！');
  $F.DOMLoading(0);
  var getLanguage = $F.getUrlParam('language') || localStorage.getItem('Language');
  if (getLanguage != null && getLanguage.length > 0) {
    if (getLanguage == 'en') {
      Language = 'en';
    } else {
      Language = 'zh';
    }
    localStorage.setItem('Language', Language);
    loadProperties();
  }
  var connote = $F.getUrlParam('connote');
  if (connote != null) {
    console.log('检测到单号参数' + connote);
    if (connote.indexOf(',') != -1) {
      var connoteArr = connote.split(',');
      connote = connoteArr.join('\n');
    }
    localStorage.removeItem('inputTrack');
    $('.input_OrderId').val(connote);
  }
  var ServerLocal = localStorage.getItem('Server');
  if (ServerLocal == null) {
  } else {
    Server = ServerLocal;
  }
  var menuHtml = '';
  for (var i = 0; i < menuArr.length; i++) {
    menuHtml +=
      '<a href="#' +
      menuArr[i].menu +
      '" class="w3-bar-item w3-button btn_menu_' +
      menuArr[i].code +
      '" data-main="' +
      menuArr[i].code +
      '" data-lang="' +
      menuArr[i].i18n +
      '">' +
      menuArr[i].text +
      '</a>';
  }
  $('#menu').html(menuHtml);
  $('#menu a').eq(0).addClass('w3-light-grey');
  $('[data-page]').eq(0).removeClass('w3-hide');
  var inputTrack = localStorage.getItem('inputTrack');
  if (inputTrack != null && inputTrack.length > 0) {
    $('.input_OrderId').val(inputTrack);
  }
  var inputPostCode = localStorage.getItem('inputPostCode');
  if (inputPostCode != null && inputPostCode.length > 0) {
    $('input[name=searchPostCode]').val(inputPostCode);
  }
  $('.btn_clear').hide();
  if ($('.input_OrderId').val().length > 0) {
    $('.btn_clear').show();
    $('.input_OrderId').trigger('input');
    $('.input_OrderId').scrollTop(0);
  }
  if ($('.input_OrderId').val().length <= 6) {
    $('.input_OrderId').focus();
  }
  if (isIE() && getIEVersion() < 10) {
    $F.DOMLoading(
      1,
      $.i18n.propSel('tips_title_warning'),
      $.i18n.propSel('tips_nonsupport_browser'),
      $.i18n.propSel('tips_btn_close')
    );
    $('#loading ._btn').show();
  }
  package_item = $('.package_item').eq(0).clone();
  $F.TextLine();
});
function disableScroll() {
  var scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft =
    window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.documentElement.scrollTop = scrollTop;
  document.documentElement.scrollLeft = scrollLeft;
}
function enableScroll() {
  if (navigator.userAgent.indexOf('MSIE 10') !== -1) {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
}
function get_track1(OrderId) {
  if (OrderId.length == 0) {
    var msg = $.i18n.map['track_button_msg'];
    $F.DOMLoading(1, $.i18n.map['track_button_title'], msg);
    $('#loading ._btn').show();
    return false;
  }
  var orderIdArr = OrderId.split(/\r\n|\r|\n/g);
  var orderIdArrNew = new Array();
  var orderIdObj = {};
  var dom_input = $('.input_OrderId');
  var dom_input_text = '';
  for (var index in orderIdArr) {
    var T_str = orderIdArr[index] + '';
    if (notFind) {
      if (/(callback)/.test(T_str)) {
        continue;
      }
    }
    if (!/[a-zA-Z0-9]/.test(T_str)) {
      continue;
    }
    if (/\s/.test(T_str)) {
      var str = T_str + '';
      var T_arr = str.split(/[ =]+/);
      for (var index_1 in T_arr) {
        if (!$F.trimAll(T_arr[index_1])) {
          continue;
        } else {
          T_str = $F.trimAll(T_arr[index_1]);
          break;
        }
      }
    }
    T_str = $F.trimAll(T_str);
    if (orderIdArrNew.indexOf(T_str) === -1) {
      orderIdArrNew.push(T_str);
      orderIdObj[T_str] = { cid: T_str };
      dom_input_text += T_str + '\n';
    }
  }
  dom_input.val(dom_input_text);
  if (orderIdArrNew.length > 20) {
    var msg = $.i18n.propSel('track_button_msg2', orderIdArrNew.length);
    $F.DOMLoading(1, $.i18n.map['track_button_title'], msg);
    $('#loading ._btn').show();
    return false;
  }
  $('#list').html('');
  orderIdArrNew.forEach(function (item, index, arr) {
    var html =
      '\n<div class="box_' +
      index +
      ' w3-margin-bottom">\n    <div class="w3-rest  w3-round w3-border w3-border-light-gray">\n        <div class="w3-padding title w3-light-gray unselectable" title="点击我可以收起轨迹详细">\n            <span class="w3-large" ><strong>' +
      item +
      '</strong></span>\n            <div class="w3-right" style="line-height: 2em;">' +
      $.i18n.map['html_loading_title'] +
      '\n                <span class="w3-right-align w3-hide">复制</span>\n            </div>\n        </div>\n        <div class="w3-row w3-padding">\n            <div class="w3-col s12">\n                <div class="w3-padding1" ><div class="loader"></div></div>\n            </div>\n        </div>\n    </div>\n</div>\n\n        ';
    $('#list').append(html);
  });
  $('#info_box').show();
  var err = orderIdArrNew.some(function (item, index, arr) {
    if (!$F.testOrderId(item)) {
      renderTrackResult({ searchRef: item, status: 'refError' }, '.box_' + index);
      return true;
    }
  });
  if (err) return;
  $.ajax({
    type: 'POST',
    url: Server,
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({ "order_sn": orderIdArrNew.join() }),
    timeout: 16e3,
    success: function success(data) {
      if (data.error === 'F') {
        renderTrackResult({ searchRef: orderIdArrNew[0], status: 'error', msg: data.msg }, '.box_' + index);
        return false;
      }
      orderIdArrNew.forEach(function (item, index) {
        const itemData = data.data.find(it => it.order.rucang_no == item)
        if (itemData) {
          renderTrackResult({ searchRef: item, status: 'data', data: itemData }, '.box_' + index);
        } else {
          renderTrackResult({ searchRef: item, status: 'error', msg: '未查询到数据' }, '.box_' + index);
        }
      })
      if (orderIdArrNew.length > 2) {
        $('.box_' + index + ' .Detailed').hide();
      }
    },
    error: function error(xhr, type) {
      renderTrackResult(
        { searchRef: item, status: 'error', msg: $.i18n.propSel('track_pross_timeout', orderIdArrNew[0]) },
        '.box_' + index
      );
      return false;
    },
  });
}
function renderTrackResult(_data, _class) {
  var data_arr = {
    searchRef: _data.searchRef,
    status: _data.status,
    archiving: '',
    data: '',
    cref: '运单号',
    ref: '承运号',
    transType: '承运商',
    link: '承运商',
    country: '目的地',
    postcode: '邮编',
    tracking: [
      // ['时间', '地点', '状态', '备注'],
    ],
    trackingStatus: [],
    msg: '',
    sheetidinfo: '',
    rnote: '',
    rinnote: '',
    rucang_no: '入仓单号',
    sid: '快递单号',
    jianshu: '订单件数',
    ysfs: '运输方式'
  };
  /**
查询结果头部固定显示入仓单号，查询单号，件数和当前状态
下面和他这个一样，时间戳加物流信息，我先看看有没有对应字段
没有当前状态这个字段，直接根据类型显示一下海运就行
下面左边时间戳，右边就content
   */
  var ysfsMap = {}
  if (_data.data) {
    data_arr.data = _data.data;
    var order = _data.data.order;
    data_arr.tracking = _data.data.list;
    data_arr.rucang_no = order.rucang_no;
    data_arr.sid = order.sid;
    data_arr.ysfs = order.ysfs;
    data_arr.nums = order.nums;
    data_arr.zipcode = order.zipcode;
  }
  if (_data.msg) {
    data_arr.msg = _data.msg;
  }
  var errorHtmlTpl =
    '\n    <div class="w3-rest  w3-round w3-border w3-border-red">\n        <div class="w3-padding title w3-red unselectable" title="' +
    $.i18n.map['track_check_tips'] +
    '">\n            <span class="w3-large"><strong>' +
    data_arr['searchRef'] +
    '</strong></span>\n            <div class="w3-right" style="line-height: 2em;">\n                ' +
    $.i18n.map['Status_Error'] +
    '\n            </div>\n        </div>\n        <div class="w3-row w3-padding">\n            <div class="w3-col s12">\n                ' +
    data_arr['msg'] +
    '\n            </div>\n        </div>\n    </div>';
  var errorHtmlTplRef =
    '\n    <div class="w3-rest  w3-round w3-border w3-border-red">\n        <div class="w3-padding title w3-red unselectable" title="' +
    $.i18n.map['track_check_tips'] +
    '">\n            <span class="w3-large"><strong>' +
    data_arr['searchRef'] +
    '</strong></span>\n            <div class="w3-right" style="line-height: 2em;">\n                ' +
    $.i18n.map['Status_Error'] +
    '\n            </div>\n        </div>\n        <div class="w3-row w3-padding">\n            <div class="w3-col s12">\n                ' +
    $.i18n.map['track_button_msg3'] +
    '\n            </div>\n        </div>\n    </div>';
  var KeyLocal = localStorage.getItem('key');
  if (KeyLocal == null) {
  } else {
    if ($('.list_show2').length > 0) {
    } else {
      var btnHtml =
        '<span class="w3-button w3-round w3-tiny w3-border w3-light-grey w3-padding-small list_show2">显示</span>';
      $('.trackListBtn').after(btnHtml);
    }
  }
  console.log(data_arr);
  if (data_arr.status == 'refError') {
    $(_class).html(errorHtmlTplRef);
  } else if (data_arr.status == 'error') {
    $(_class).html(errorHtmlTpl);
  } else if (data_arr.status == 'data') {
    var newOne = data_arr.tracking[0] || {}
    var errorHtmlTplList =
      '\n        <div class="hoverShow2 w3-small">\n            <div>' +
      data_arr['sheetidinfo'] +
      '</div>\n            <div>' +
      data_arr['rnote'] +
      '</div>\n            <div>' +
      data_arr['rinnote'] +
      '</div>\n        </div>\n        <div class="w3-rest track w3-round w3-border w3-border-' +
     'blue' +
      '">\n            <div class="w3-padding title w3-' +
      'blue' +
      ' unselectable" title="' +
      $.i18n.map['track_check_tips'] +
      '">\n                <span class="w3-large"><strong>' +
      data_arr['searchRef'] +
      '</strong></span>\n                <div class="w3-right" style="line-height: 2em;">\n                ' +
      (ysfsMap[data_arr.ysfs] || '海运') +
      '\n                </div>\n            </div>\n            <div class="w3-row">\n                <div class="w3-col s12 w3-padding">\n                    <div class="w3-col l6 s12">\n                        <div> ' +
      $.i18n.propSel('OrderId') +
      ': <span class="copytext" data-clipboard-text="' +
      data_arr['rucang_no'] +
      '">' +
      data_arr['rucang_no'] +
      '</span></div>\n                    </div>\n                    <div class="w3-col l6 s12">\n                        <div>' +
      $.i18n.propSel('ExpressId') +
      ': ' +
      ' <span class="copytext" data-clipboard-text="' +
      data_arr['sid'] +
      '">' +
      data_arr['sid'] +
      '</span></div>\n                    </div>\n                    <div class="w3-col l6 s12">\n                        <div>' +
      $.i18n.propSel('calculation_postcode') +
      ': ' +
      ' <span class="copytext" data-clipboard-text="' +
      data_arr['zipcode'] +
      '">' +
      data_arr['zipcode'] +
      '</span></div>\n                    </div>\n                    <div class="w3-col l6 s12">\n                        <div>' +
      $.i18n.propSel('nums') +
      ': ' +
      data_arr['nums'] +
      '</div>\n                    </div>\n                </div>\n                <div class="w3-col s12">\n                    <hr style="margin: 5px 0;"/>\n                    <div class="w3-padding">\n                            ' +
      $.i18n.propSel('NewDetails') +
      (newOne.dates?$F.toDateDetail(newOne.dates) +
      ',\n                            ':'')  +
      newOne.content
       +
      '\n                    </div>\n                </div>\n                <div class="w3-col s12">\n                    {html}\n                </div>\n            </div>\n        </div>';
    var tempHtml_1 = '';
    tempHtml_1 += '\n<div class="w3-responsive">\n    <div class="timeline-list Detailed">\n    ';
    var Tracks = data_arr.tracking;
    Tracks.forEach(function (item, index, arr) {
      var oneClass = '';
      if (index == 0) {
        oneClass = 'w3-blue';
      }
      tempHtml_1 +=
        '\n            <div class="timeline-item ' +
        data_arr['searchRef'] +
        '_track ">\n                <div class="timeline-item_tail"></div>\n                <div class="timeline-item_node w3-border-' +
        'blue' +
        ' ' +
        oneClass +
        '" ></div>\n                <div class="timeline-item_wrapper">\n                    <div class="timeline-item_content">\n                        <div class="box">\n                        <span class="timeline-item_date">' +
        $F.toDateDetail(item.dates) +
        '</span>\n                        <span> ' +
        item.content +
        ' </span>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            ';
    });
    tempHtml_1 += '</div></div>';
    errorHtmlTplList = errorHtmlTplList.replace('{html}', tempHtml_1);
    errorHtmlTplList = errorHtmlTplList.replace(/undefined/g, '');
    $(_class).html(errorHtmlTplList);
  }
}
$('.input_OrderId').bind('keydown', function (e) {
  var theEvent = e || window.event;
  var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
  e = e ? e : window.event;
  if (e.ctrlKey && code == 13) {
    if ($('#loading').is(':hidden')) {
      $('.btn_search').click();
    }
  }
});
$(document).on('input propertychange', '.input_OrderId', function (e) {
  localStorage.setItem('inputTrack', $(this).val());
  if ($(this).val().length > 0) {
    $('.btn_clear').show();
  } else {
    $('.btn_clear').hide();
  }
});
$(document).on('input propertychange', "input[name='searchPostCode']", function (e) {
  localStorage.setItem('inputPostCode', $(this).val());
  if ($(this).val().length > 0) {
    $('.btn_clear').show();
  } else {
    $('.btn_clear').hide();
  }
});
$(document).on('input propertychange', 'input, textarea', function (e) {
  if ($(this).val().length > 0) {
    $(this).siblings('.inputclear').show();
  } else {
    $(this).siblings('.inputclear').hide();
  }
});
$('.inputclear').click(function () {
  $(this).siblings('input').val('');
  $(this).siblings('textarea').val('');
  $(this).hide();
});
$(document).on('keydown', '#searchPostCodeInput', function (e) {
  console.log('回车执行');
  var theEvent = e || window.event;
  var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
  e = e ? e : window.event;
  if (code == 13) {
    $('#searchPostCodeBtn').click();
  }
});
var calculation_price_check = 0;
$(document).on('click', '.btn_search', function (e) {
  var OrderId = $('.input_OrderId').val();
  get_track1(OrderId);
});
$(document).on('click', '#loading ._btn', function (e) {
  $F.DOMLoading(0);
});
$(document).on('click', '.btn_clear', function (e) {
  $('.input_OrderId').val('');
  $('.input_OrderId').focus();
  $('.input_OrderId').trigger('input');
  $(this).hide();
  localStorage.removeItem('inputTrack');
});
$(document).on('click', '.area_btn_clear', function (e) {
  $('input[name="searchPostCode"]').val('');
  $('input[name="searchPostCode"]').focus();
  localStorage.removeItem('inputPostCode');
});
$(document).on('click', '.track .title', function (e) {
  var $track = $(this).parent();
  $track.find('.Detailed').toggle();
});
var verNum = 0;
$(document).on('click', '#ver', function (e) {
  verNum++;
  if (verNum == 5) {
    verNum = 0;
    var val = prompt('服务器地址', Server);
    if (val != null && val != '') {
      localStorage.setItem('Server', val);
      Server = val;
    } else {
      localStorage.clear();
      location.reload();
    }
  }
});
var ListDetailed = true;
$(document).on('click', '.list_Collapse', function (e) {
  var str1 = $.i18n.propSel('track_button_expand');
  var str2 = $.i18n.propSel('track_button_collapse');
  if (ListDetailed) {
    ListDetailed = false;
    $('#list .Detailed').hide();
    $(this).text(str1);
  } else {
    $('#list .Detailed').show();
    ListDetailed = true;
    $(this).text(str2);
  }
});
function isIE() {
  var userAgent = navigator.userAgent;
  return userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1;
}
function getIEVersion() {
  var userAgent = navigator.userAgent;
  var isIE = userAgent.indexOf('MSIE') !== -1;
  var isIE11 = userAgent.indexOf('Trident') !== -1 && userAgent.indexOf('rv:11.0') !== -1;
  if (isIE) {
    return parseInt(userAgent.split('MSIE')[1]);
  } else if (isIE11) {
    return 11;
  } else {
    return -1;
  }
}
$(document).on('click', '.list_show2', function (e) {
  var status = $(this).text();
  if (status == '显示') {
    $(this).text('隐藏');
    $('.hoverShow2').addClass('w3-show');
  } else {
    $(this).text('显示');
    $('.hoverShow2').removeClass('w3-show');
  }
});
$(document).on('click', '.list_Screenshot', function (e) {
  if (isIE()) {
    $F.DOMLoading(
      1,
      $.i18n.propSel('tips_title_warning'),
      $.i18n.propSel('tips_nonsupport_browser'),
      $.i18n.propSel('tips_btn_close')
    );
    $('#loading ._btn').show();
    return false;
  }
  var status = false;
  var element = document.getElementById('list');
  html2canvas(element).then(function (canvas) {
    var ctx = canvas.getContext('2d');
    var watermark = 'ahxexpress.com';
    var fontSize = 14;
    var alpha = 0.01;
    var angle = -35;
    var blockWidth = 400;
    var blockHeight = 400;
    ctx.font = fontSize + 'px Arial';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#343434';
    var numX = Math.ceil(canvas.width / blockWidth) + 1;
    var numY = Math.ceil(canvas.height / blockHeight) + 1;
    console.log(canvas.height);
    console.log(canvas.width);
    for (var j = 0; j < numY; j++) {
      for (var i = 0; i < numX; i++) {
        var centerX = i * blockWidth + blockWidth / 2;
        var centerY = j * blockHeight + blockHeight / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((angle * Math.PI) / 180);
        var textWidth = ctx.measureText(watermark).width;
        var textHeight = fontSize;
        ctx.fillText(watermark, -textWidth / 2, textHeight / 2);
        ctx.restore();
      }
    }
    document.body.appendChild(canvas);
    document.body.removeChild(canvas);
    if (status) {
      var link = document.createElement('a');
      document.body.appendChild(link);
      link.download = 'TrackScreenshot_' + new Date().getTime() + '.png';
      link.href = canvas.toDataURL();
      link.target = '_blank';
      link.click();
    } else {
      var img = canvas.toDataURL();
      var msg =
        '\n            <div class="w3-center" style="max-height:500px;overflow: auto;">  \n                <div class=" w3-center w3-padding-16">\n                    <span class="w3-tag w3-yellow w3-round w3-medium">' +
        $.i18n.propSel('html_screenshot_subtitle') +
        '</span>\n                </div>\n                <img src="' +
        img +
        '" alt="Screenshot" style="max-width:100%;">\n            </div>\n            ';
      $F.DOMLoading(1, $.i18n.propSel('html_screenshot_title'), msg);
      $('#loading ._btn').show();
    }
  });
});
$(document).on('click', '.btn_searchPostcode', function (e) {});
$(document).on('click', '[data-message-text]', function (e) {
  var msg = '';
  msg = $(this).data('message-text');
  copytext = msg;
  msg = msg.replace(/\n/g, '<br>');
  msg += '<div class="w3-text-red w3-small">点击文字可复制</div>';
  $F.DOMLoading(
    1,
    $.i18n.propSel('calculation_title'),
    '<div class="w3-left-align copytext" data-clipboard-text="' + copytext + '">' + msg + '</div>'
  );
  $('#loading ._btn').show();
});
$(document).on('click', '.package_item_del', function (e) {
  $(this).parent().parent().parent().parent().parent().parent().remove();
  auto_calculation();
});
$(document).on('click', '.package_item_delall', function (e) {
  $('.package_item').remove();
  auto_calculation();
});
$(document).on('click', '.package_item_copy', function (e) {
  var $parent = $(this).parent().parent().parent().parent().parent().parent();
  var $clone = $parent.clone();
  $parent.after($clone);
  auto_calculation();
});
$(document).on('click', '.package_item_clear', function (e) {
  var $parent = $(this).parent().parent().parent().parent().parent().parent();
  $parent.find('input').val('');
  auto_calculation();
});
$(document).on('click', '.package_item_add', function (e) {
  var $clone = package_item.clone();
  $clone.appendTo('#package_group');
});
$(document).on('click', '.calculation_test', function (e) {
  $("[data-page='calculation'] input[name='postcode']").val('2000');
  $("[data-page='calculation'] input[name='weight']").val(Math.floor(Math.random() * 100) + 10);
  $("[data-page='calculation'] input[name='width']").val(Math.floor(Math.random() * 100) + 10);
  $("[data-page='calculation'] input[name='height']").val(Math.floor(Math.random() * 100) + 10);
  $("[data-page='calculation'] input[name='depth']").val(Math.floor(Math.random() * 100) + 10);
  $("[data-page='calculation'] input[name='packs']").val(Math.floor(Math.random() * 100) + 10);
  auto_calculation();
});
$(document).on('click', '[data-lang=calculation_package_import_copy]', function (e) {
  var msg = '尺寸 重量 件数 \n255*60*110 180 1';
  copytext = msg;
  msg = msg.replace(/\n/g, '<br>');
  msg += '<div class="w3-text-red w3-small">点击文字可复制</div>';
  $F.DOMLoading(
    1,
    $.i18n.propSel('calculation_package_import_tips'),
    '<div class="w3-left-align copytext" data-clipboard-text="' + copytext + '">' + msg + '</div>'
  );
  $('#loading ._btn').show();
});
$(document).on('change', '[name="warehouse"]', function (e) {
  console.log($(this).val());
  var postcode = $(this).find('option:selected').data('postcode');
  console.log(postcode);
  $('#calculation_form [name=postcode]').val(postcode);
});
$(document).on('keyup', '[name="postcode"]', function (e) {
  $('#calculation_form [name=warehouse]').val('');
});
$(document).on('keyup', '.package_item input', function (e) {
  auto_calculation();
});
function auto_calculation() {
  var weightAll = 0;
  $('.package_item').each(function (index, item) {
    var $item = $(item);
    var weight = $item.find('[name=weight]').val();
    weightAll += parseFloat(weight);
    var width = $item.find('[name=width]').val();
    var height = $item.find('[name=height]').val();
    var depth = $item.find('[name=depth]').val();
    var cbm = (width * height * depth) / 1e6;
    var pcs = $item.find('[name=packs]').val();
    var weightV = (width * height * depth) / 6e3;
    $item.find('[name=cbm]').val(cbm.toFixed(3));
    $item.find('[name=weightV]').val(weightV.toFixed(2));
    $item.find('[name=cbmAll]').val((cbm * pcs).toFixed(3));
  });
  $('#calculation_form [name=weight]').val(weightAll.toFixed(2));
  $('#calculation_price').html('');
}
$(document).on('click', '.package_item_import', function (e) {
  var msg = '请输入包裹数据';
  var input = prompt(msg, '');
  if (input == null || input == '') {
    return false;
  }
  var data = [];
  if (input.indexOf('\r\n') != -1) {
    data = input.split('\r\n');
  } else {
    data = input.split('\n');
  }
  console.log(data);
  var head;
  if (data[0].includes('\t')) {
    head = data[0].split('\t');
  } else if (data[0].includes(' ')) {
    head = data[0].split(' ');
  } else if (data[0].includes(',')) {
    head = data[0].split(',');
  }
  for (var i = 0; i < head.length; i++) {
    head[i] = head[i].toUpperCase();
  }
  data.shift();
  var dataArr = [];
  data.forEach(function (item) {
    var itemArr;
    if (item.includes('\t')) {
      itemArr = item.split('\t');
    } else if (item.includes(' ')) {
      itemArr = item.split(' ');
    } else if (item.includes(',')) {
      itemArr = item.split(',');
    }
    var itemObj = {};
    for (var i = 0; i < head.length; i++) {
      itemObj[head[i]] = itemArr[i];
    }
    dataArr.push(itemObj);
  });
  console.log(dataArr);
  $('.package_item').remove();
  dataArr.forEach(function (item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var width =
      (_c =
        (_b = (_a = item['宽']) !== null && _a !== void 0 ? _a : item['宽度']) !== null &&
        _b !== void 0
          ? _b
          : item['WIDTH']) !== null && _c !== void 0
        ? _c
        : 1;
    var height =
      (_f =
        (_e = (_d = item['高']) !== null && _d !== void 0 ? _d : item['高度']) !== null &&
        _e !== void 0
          ? _e
          : item['HEIGHT']) !== null && _f !== void 0
        ? _f
        : 1;
    var depth =
      (_j =
        (_h = (_g = item['深']) !== null && _g !== void 0 ? _g : item['深度']) !== null &&
        _h !== void 0
          ? _h
          : item['DEPTH']) !== null && _j !== void 0
        ? _j
        : 1;
    var weight =
      (_o =
        (_m =
          (_l = (_k = item['重量']) !== null && _k !== void 0 ? _k : item['重']) !== null &&
          _l !== void 0
            ? _l
            : item['重量']) !== null && _m !== void 0
          ? _m
          : item['WEIGHT']) !== null && _o !== void 0
        ? _o
        : 1;
    var pcs =
      (_s =
        (_r =
          (_q = (_p = item['数量']) !== null && _p !== void 0 ? _p : item['件数']) !== null &&
          _q !== void 0
            ? _q
            : item['PCS']) !== null && _r !== void 0
          ? _r
          : item['件']) !== null && _s !== void 0
        ? _s
        : 1;
    if (item['尺寸']) {
      var sizeArr = item['尺寸'].split('*');
      width = sizeArr[0];
      height = sizeArr[1];
      depth = sizeArr[2];
    }
    var cbm = (width * height * depth) / 1e6;
    var weightV = (width * height * depth) / 6e3;
    var $clone = package_item.clone();
    $clone.find('[name=width]').val(width);
    $clone.find('[name=height]').val(height);
    $clone.find('[name=depth]').val(depth);
    $clone.find('[name=weight]').val(weight);
    $clone.find('[name=packs]').val(pcs);
    $clone.find('[name=weightV]').val(weightV);
    $clone.find('[name=cbm]').val(cbm);
    $clone.appendTo('#package_group');
  });
  auto_calculation();
});
function getPageStatus(page) {
  var status = $('[data-page=' + page + ']').hasClass('w3-hide');
  return status;
}
$(document).on('click', '[data-main]', function (e) {
  $('[data-main]').removeClass('w3-light-grey');
  var val = $(this).attr('data-main');
  var menuArrNow = menuArr.find(function (item) {
    return item.code == val;
  });
  var name = menuArrNow === null || menuArrNow === void 0 ? void 0 : menuArrNow.name;
  $(this).addClass('w3-light-grey');
  $('[data-page]').addClass('w3-hide');
  $('[data-page=' + val + ']').removeClass('w3-hide');
});
$(document).on('click', '.appendC', function (e) {
  if ($(this).parent().find('.more').hasClass('w3-hide')) {
    $(this).parent().find('.more').removeClass('w3-hide');
  } else {
    $(this).parent().find('.more').addClass('w3-hide');
  }
});
var clickMore = 0;
$(document).on('click', '.clickMore', function (e) {
  clickMore++;
  if (clickMore >= 5) {
    $('.OA-none').removeClass('OA-none');
    clickMore = 0;
    message.info('SHOW');
  }
});
$(document).on('click', '.area_more', function (e) {
  $('.appendC').parent().find('.more').removeClass('w3-hide');
  $('.area_more').addClass('w3-hide');
  $('.area_more_close').removeClass('w3-hide');
});
$(document).on('click', '.area_more_close', function (e) {
  $('.appendC').parent().find('.more').addClass('w3-hide');
  $('.area_more').removeClass('w3-hide');
  $('.area_more_close').addClass('w3-hide');
});
clipboard.on('success', function (e) {
  message.info($.i18n.propSel('copy_success'));
});
clipboard.on('error', function (e) {});
function menu($type) {
  if ($type === void 0) {
    $type = true;
  }
  if ($type) {
    $('#Sidebar').show();
    $('#Overlay').show();
  } else {
    $('#Sidebar').hide();
    $('#Overlay').hide();
  }
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = earthRadiusKm * c;
  return distance;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
var ElMessage = {
  init: function () {
    var messageBox = document.createElement('div');
    messageBox.className = 'el-message-box';
    messageBox.style.cssText =
      'position: fixed; top: 0px; left: 50%; transform: translateX(-50%); z-index: 9999;';
    var defaultMessageClass = 'el-message el-message--info';
    var defaultDuration = 3e3;
    var messages = [];
    function showMessage(message, type, duration) {
      var msg = document.createElement('div');
      msg.className = defaultMessageClass + ' ' + type;
      msg.innerHTML = message;
      messageBox.appendChild(msg);
      messages.push(msg);
      msg.classList.add('show');
      setTimeout(function () {
        msg.classList.remove('show');
        setTimeout(function () {
          messageBox.removeChild(msg);
          messages.splice(messages.indexOf(msg), 1);
        }, 300);
      }, duration || defaultDuration);
    }
    return {
      info: function (message, duration) {
        if (duration === void 0) {
          duration = 3e3;
        }
        showMessage(message, 'el-message--info', duration);
      },
      success: function (message, duration) {
        if (duration === void 0) {
          duration = 3e3;
        }
        showMessage(message, 'el-message--success', duration);
      },
      warning: function (message, duration) {
        if (duration === void 0) {
          duration = 3e3;
        }
        showMessage(message, 'el-message--warning', duration);
      },
      error: function (message, duration) {
        if (duration === void 0) {
          duration = 3e3;
        }
        showMessage(message, 'el-message--error', duration);
      },
      clear: function () {
        messages.forEach(function (msg) {
          messageBox.removeChild(msg);
        });
        messages = [];
      },
      mount: function () {
        document.body.appendChild(messageBox);
      },
    };
  },
};
var message = ElMessage.init();
message.mount();
function UTCtoLocalTime(UTCtime, hour) {
  if (hour === void 0) {
    hour = 8;
  }
  if (UTCtime.toString().length == 10) {
    UTCtime = UTCtime * 1e3;
  }
  var UTCtime2 = new Date(UTCtime - hour * 60 * 60 * 1e3);
  var UTCtime3 = new Date(UTCtime2.getTime() + NowUTC * 60 * 60 * 1e3);
  UTCtime3 = UTCtime3.getTime() / 1e3;
  return UTCtime3;
}
function getUTCTime(type) {
  if (isIE()) {
    return '';
  }
  function addLeadingZero(number) {
    return number < 10 ? '0' + number : number;
  }
  var now = new Date();
  var DST = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    timeZoneName: 'shortOffset',
  }).format(now);
  var SydneyOffset = Number(DST.split(', GMT')[1]);
  var BeijingOffset = 8;
  switch (type) {
    case 'UTC':
      return addLeadingZero(now.getUTCHours()) + ':' + addLeadingZero(now.getUTCMinutes());
    case 'SydneyDST':
      if (SydneyOffset == 10) {
        return '+10';
      } else {
        return '+11(DST +1)';
      }
    case 'Sydney':
      var nowHour = now.getUTCHours() + SydneyOffset;
      if (nowHour >= 24) {
        nowHour = nowHour - 24;
      }
      return addLeadingZero(nowHour) + ':' + addLeadingZero(now.getUTCMinutes()) + ' (AU,Sydney)';
    case 'China':
      var nowHour2 = now.getUTCHours() + BeijingOffset;
      if (nowHour2 >= 24) {
        nowHour2 = nowHour2 - 24;
      }
      return addLeadingZero(nowHour2) + ':' + addLeadingZero(now.getUTCMinutes()) + ' (CN,Beijing)';
    default:
      return (
        addLeadingZero(now.getHours()) + ':' + addLeadingZero(now.getMinutes()) + ' (Location)'
      );
  }
}
$(document).on('click', '#nowTime,#nowTimeSYD,#nowTimeCN', function (e) {
  var msg =
    '<div class="w3-left-align w3-small" style="max-height:500px;overflow: auto;">\n    <h3>UTC: ' +
    getUTCTime('UTC') +
    '</h3>\n    <h3>Location: ' +
    getUTCTime() +
    '</h3>\n    <h3>Beijing,China: ' +
    getUTCTime('China') +
    '</h3>\n    <h3>Sydney,Australia: ' +
    getUTCTime('Sydney') +
    ' ' +
    getUTCTime('SydneyDST') +
    '</h3>\n\n    </div>';
  $F.DOMLoading(1, 'World Date / UTC', msg);
  $('#loading ._btn').show();
});
function updateTime() {
  $('#nowTime').text(getUTCTime(''));
  $('#nowTimeSYD').text(getUTCTime('Sydney'));
  $('#nowTimeCN').text(getUTCTime('China'));
  setTimeout(updateTime, 6e4);
}
updateTime();
var driver = window.driver.js.driver;
var driverObj = driver();
$(document).on('click', '.driver_search', function (e) {
  var driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: '下一步 →',
    prevBtnText: '← 上一步',
    doneBtnText: '完成',
    steps: [
      {
        element: '#textAreaLineBox',
        popover: { title: '输入运单号', description: '在这里输入您的运单号。', align: 'start' },
      },
      {
        element: '.btn_search',
        popover: { title: '点击查询', description: '开始查询轨迹！', align: 'start' },
      },
      { popover: { title: '大功告成！', description: '你已经完成了所有步骤，开始使用吧！' } },
    ],
  });
  driverObj.drive();
});
