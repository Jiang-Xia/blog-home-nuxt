((e, n) => {
  'function' == typeof define && (define.amd || define.cmd)
    ? define(function () {
        return n(e);
      })
    : n(e, !0);
})(this, function (r, e) {
  var a, c, n, i, t, s, d, o, l, u, p, f, m, g, h, S, I, y, v, _, k, w;
  if (!r.jWeixin)
    return (
      (a = {
        config: 'preVerifyJSAPI',
        onMenuShareTimeline: 'menu:share:timeline',
        onMenuShareAppMessage: 'menu:share:appmessage',
        onMenuShareQQ: 'menu:share:qq',
        onMenuShareWeibo: 'menu:share:weiboApp',
        onMenuShareQZone: 'menu:share:QZone',
        previewImage: 'imagePreview',
        getLocation: 'geoLocation',
        openProductSpecificView: 'openProductViewWithPid',
        addCard: 'batchAddCard',
        openCard: 'batchViewCard',
        chooseWXPay: 'getBrandWCPayRequest',
        openEnterpriseRedPacket: 'getRecevieBizHongBaoRequest',
        startSearchBeacons: 'startMonitoringBeacons',
        stopSearchBeacons: 'stopMonitoringBeacons',
        onSearchBeacons: 'onBeaconsInRange',
        consumeAndShareCard: 'consumedShareCard',
        openAddress: 'editAddress',
      }),
      (c = (() => {
        var e,
          n = {};
        for (e in a) n[a[e]] = e;
        return n;
      })()),
      (i = (n = r.document).title),
      (t = navigator.userAgent.toLowerCase()),
      (f = navigator.platform.toLowerCase()),
      (s = !(!f.match('mac') && !f.match('win'))),
      (d = -1 != t.indexOf('wxdebugger')),
      (o = -1 != t.indexOf('micromessenger')),
      (l = -1 != t.indexOf('android')),
      (u = -1 != t.indexOf('iphone') || -1 != t.indexOf('ipad')),
      (p = (f = t.match(/micromessenger\/(\d+\.\d+\.\d+)/) || t.match(/micromessenger\/(\d+\.\d+)/))
        ? f[1]
        : ''),
      (m = { initStartTime: L(), initEndTime: 0, preVerifyStartTime: 0, preVerifyEndTime: 0 }),
      (g = {
        version: 1,
        appId: '',
        initTime: 0,
        preVerifyTime: 0,
        networkType: '',
        isPreVerifyOk: 1,
        systemType: u ? 1 : l ? 2 : -1,
        clientVersion: p,
        url: encodeURIComponent(location.href),
      }),
      (h = {}),
      (S = { _completes: [] }),
      (I = { state: 0, data: {} }),
      B(function () {
        m.initEndTime = L();
      }),
      (y = !1),
      (v = []),
      (_ = {
        config: function (e) {
          C('config', (h = e));
          var o = !1 !== h.check;
          (B(function () {
            if (o)
              (T(
                a.config,
                { verifyJsApiList: V(h.jsApiList) },
                ((S._complete = function (e) {
                  ((m.preVerifyEndTime = L()), (I.state = 1), (I.data = e));
                }),
                (S.success = function (e) {
                  g.isPreVerifyOk = 0;
                }),
                (S.fail = function (e) {
                  S._fail ? S._fail(e) : (I.state = -1);
                }),
                (t = S._completes).push(function () {
                  var n;
                  s ||
                    d ||
                    h.debug ||
                    p < '6.0.2' ||
                    g.systemType < 0 ||
                    ((n = new Image()),
                    (g.appId = h.appId),
                    (g.initTime = m.initEndTime - m.initStartTime),
                    (g.preVerifyTime = m.preVerifyEndTime - m.preVerifyStartTime),
                    _.getNetworkType({
                      isInnerInvoke: !0,
                      success: function (e) {
                        ((g.networkType = e.networkType),
                          (n.src =
                            'https://open.weixin.qq.com/sdk/report?v=' +
                            g.version +
                            '&o=' +
                            g.isPreVerifyOk +
                            '&s=' +
                            g.systemType +
                            '&c=' +
                            g.clientVersion +
                            '&a=' +
                            g.appId +
                            '&n=' +
                            g.networkType +
                            '&i=' +
                            g.initTime +
                            '&p=' +
                            g.preVerifyTime +
                            '&u=' +
                            g.url));
                      },
                    }));
                }),
                (S.complete = function (e) {
                  for (var n = 0, i = t.length; n < i; ++n) t[n]();
                  S._completes = [];
                }),
                S),
              ),
                (m.preVerifyStartTime = L()));
            else {
              I.state = 1;
              for (var e = S._completes, n = 0, i = e.length; n < i; ++n) e[n]();
              S._completes = [];
            }
            var t;
          }),
            _.invoke ||
              ((_.invoke = function (e, n, i) {
                r.WeixinJSBridge && WeixinJSBridge.invoke(e, P(n), i);
              }),
              (_.on = function (e, n) {
                r.WeixinJSBridge && WeixinJSBridge.on(e, n);
              })));
        },
        ready: function (e) {
          (0 != I.state || (S._completes.push(e), !o && h.debug)) && e();
        },
        error: function (e) {
          p < '6.0.2' || (-1 == I.state ? e(I.data) : (S._fail = e));
        },
        checkJsApi: function (e) {
          T(
            'checkJsApi',
            { jsApiList: V(e.jsApiList) },
            ((e._complete = function (e) {
              l && (i = e.checkResult) && (e.checkResult = JSON.parse(i));
              var n,
                i = e,
                t = i.checkResult;
              for (n in t) {
                var o = c[n];
                o && ((t[o] = t[n]), delete t[n]);
              }
            }),
            e),
          );
        },
        onMenuShareTimeline: function (e) {
          M(
            a.onMenuShareTimeline,
            {
              complete: function () {
                T(
                  'shareTimeline',
                  {
                    title: e.title || i,
                    desc: e.title || i,
                    img_url: e.imgUrl || '',
                    link: e.link || location.href,
                    type: e.type || 'link',
                    data_url: e.dataUrl || '',
                  },
                  e,
                );
              },
            },
            e,
          );
        },
        onMenuShareAppMessage: function (n) {
          M(
            a.onMenuShareAppMessage,
            {
              complete: function (e) {
                'favorite' === e.scene
                  ? T('sendAppMessage', {
                      title: n.title || i,
                      desc: n.desc || '',
                      link: n.link || location.href,
                      img_url: n.imgUrl || '',
                      type: n.type || 'link',
                      data_url: n.dataUrl || '',
                    })
                  : T(
                      'sendAppMessage',
                      {
                        title: n.title || i,
                        desc: n.desc || '',
                        link: n.link || location.href,
                        img_url: n.imgUrl || '',
                        type: n.type || 'link',
                        data_url: n.dataUrl || '',
                      },
                      n,
                    );
              },
            },
            n,
          );
        },
        onMenuShareQQ: function (e) {
          M(
            a.onMenuShareQQ,
            {
              complete: function () {
                T(
                  'shareQQ',
                  {
                    title: e.title || i,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href,
                  },
                  e,
                );
              },
            },
            e,
          );
        },
        onMenuShareWeibo: function (e) {
          M(
            a.onMenuShareWeibo,
            {
              complete: function () {
                T(
                  'shareWeiboApp',
                  {
                    title: e.title || i,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href,
                  },
                  e,
                );
              },
            },
            e,
          );
        },
        onMenuShareQZone: function (e) {
          M(
            a.onMenuShareQZone,
            {
              complete: function () {
                T(
                  'shareQZone',
                  {
                    title: e.title || i,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href,
                  },
                  e,
                );
              },
            },
            e,
          );
        },
        updateTimelineShareData: function (e) {
          T('updateTimelineShareData', { title: e.title, link: e.link, imgUrl: e.imgUrl }, e);
        },
        updateAppMessageShareData: function (e) {
          T(
            'updateAppMessageShareData',
            { title: e.title, desc: e.desc, link: e.link, imgUrl: e.imgUrl },
            e,
          );
        },
        startRecord: function (e) {
          T('startRecord', {}, e);
        },
        stopRecord: function (e) {
          T('stopRecord', {}, e);
        },
        onVoiceRecordEnd: function (e) {
          M('onVoiceRecordEnd', e);
        },
        playVoice: function (e) {
          T('playVoice', { localId: e.localId }, e);
        },
        pauseVoice: function (e) {
          T('pauseVoice', { localId: e.localId }, e);
        },
        stopVoice: function (e) {
          T('stopVoice', { localId: e.localId }, e);
        },
        onVoicePlayEnd: function (e) {
          M('onVoicePlayEnd', e);
        },
        uploadVoice: function (e) {
          T(
            'uploadVoice',
            { localId: e.localId, isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1 },
            e,
          );
        },
        downloadVoice: function (e) {
          T(
            'downloadVoice',
            { serverId: e.serverId, isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1 },
            e,
          );
        },
        translateVoice: function (e) {
          T(
            'translateVoice',
            { localId: e.localId, isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1 },
            e,
          );
        },
        chooseImage: function (e) {
          T(
            'chooseImage',
            {
              scene: '1|2',
              count: e.count || 9,
              sizeType: e.sizeType || ['original', 'compressed'],
              sourceType: e.sourceType || ['album', 'camera'],
            },
            ((e._complete = function (e) {
              if (l) {
                var n = e.localIds;
                try {
                  n && (e.localIds = JSON.parse(n));
                } catch (e) {}
              }
            }),
            e),
          );
        },
        getLocation: function (e) {},
        getLocation: function (e) {
          ((e = e || {}),
            T(
              a.getLocation,
              { type: e.type || 'wgs84' },
              ((e._complete = function (e) {
                delete e.type;
              }),
              e),
            ));
        },
        previewImage: function (e) {
          T(a.previewImage, { current: e.current, urls: e.urls }, e);
        },
        uploadImage: function (e) {
          T(
            'uploadImage',
            { localId: e.localId, isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1 },
            e,
          );
        },
        downloadImage: function (e) {
          T(
            'downloadImage',
            { serverId: e.serverId, isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1 },
            e,
          );
        },
        getLocalImgData: function (e) {
          !1 === y
            ? ((y = !0),
              T(
                'getLocalImgData',
                { localId: e.localId },
                ((e._complete = function (e) {
                  var n;
                  ((y = !1), 0 < v.length && ((n = v.shift()), wx.getLocalImgData(n)));
                }),
                e),
              ))
            : v.push(e);
        },
        getNetworkType: function (e) {
          T(
            'getNetworkType',
            {},
            ((e._complete = function (e) {
              var n = e,
                e = n.errMsg,
                i = ((n.errMsg = 'getNetworkType:ok'), n.subtype);
              if ((delete n.subtype, i)) n.networkType = i;
              else {
                var i = e.indexOf(':'),
                  t = e.substring(i + 1);
                switch (t) {
                  case 'wifi':
                  case 'edge':
                  case 'wwan':
                    n.networkType = t;
                    break;
                  default:
                    n.errMsg = 'getNetworkType:fail';
                }
              }
            }),
            e),
          );
        },
        openLocation: function (e) {
          T(
            'openLocation',
            {
              latitude: e.latitude,
              longitude: e.longitude,
              name: e.name || '',
              address: e.address || '',
              scale: e.scale || 28,
              infoUrl: e.infoUrl || '',
            },
            e,
          );
        },
        hideOptionMenu: function (e) {
          T('hideOptionMenu', {}, e);
        },
        showOptionMenu: function (e) {
          T('showOptionMenu', {}, e);
        },
        closeWindow: function (e) {
          T('closeWindow', {}, (e = e || {}));
        },
        hideMenuItems: function (e) {
          T('hideMenuItems', { menuList: e.menuList }, e);
        },
        showMenuItems: function (e) {
          T('showMenuItems', { menuList: e.menuList }, e);
        },
        hideAllNonBaseMenuItem: function (e) {
          T('hideAllNonBaseMenuItem', {}, e);
        },
        showAllNonBaseMenuItem: function (e) {
          T('showAllNonBaseMenuItem', {}, e);
        },
        scanQRCode: function (e) {
          T(
            'scanQRCode',
            {
              needResult: (e = e || {}).needResult || 0,
              scanType: e.scanType || ['qrCode', 'barCode'],
            },
            ((e._complete = function (e) {
              var n;
              u &&
                (n = e.resultStr) &&
                ((n = JSON.parse(n)), (e.resultStr = n && n.scan_code && n.scan_code.scan_result));
            }),
            e),
          );
        },
        openAddress: function (e) {
          T(
            a.openAddress,
            {},
            ((e._complete = function (e) {
              (((e = e).postalCode = e.addressPostalCode),
                delete e.addressPostalCode,
                (e.provinceName = e.proviceFirstStageName),
                delete e.proviceFirstStageName,
                (e.cityName = e.addressCitySecondStageName),
                delete e.addressCitySecondStageName,
                (e.countryName = e.addressCountiesThirdStageName),
                delete e.addressCountiesThirdStageName,
                (e.detailInfo = e.addressDetailInfo),
                delete e.addressDetailInfo);
            }),
            e),
          );
        },
        openProductSpecificView: function (e) {
          T(
            a.openProductSpecificView,
            { pid: e.productId, view_type: e.viewType || 0, ext_info: e.extInfo },
            e,
          );
        },
        addCard: function (e) {
          for (var n = e.cardList, i = [], t = 0, o = n.length; t < o; ++t) {
            var r = n[t],
              r = { card_id: r.cardId, card_ext: r.cardExt };
            i.push(r);
          }
          T(
            a.addCard,
            { card_list: i },
            ((e._complete = function (e) {
              if ((n = e.card_list)) {
                for (var n, i = 0, t = (n = JSON.parse(n)).length; i < t; ++i) {
                  var o = n[i];
                  ((o.cardId = o.card_id),
                    (o.cardExt = o.card_ext),
                    (o.isSuccess = !!o.is_succ),
                    delete o.card_id,
                    delete o.card_ext,
                    delete o.is_succ);
                }
                ((e.cardList = n), delete e.card_list);
              }
            }),
            e),
          );
        },
        chooseCard: function (e) {
          T(
            'chooseCard',
            {
              app_id: h.appId,
              location_id: e.shopId || '',
              sign_type: e.signType || 'SHA1',
              card_id: e.cardId || '',
              card_type: e.cardType || '',
              card_sign: e.cardSign,
              time_stamp: e.timestamp + '',
              nonce_str: e.nonceStr,
            },
            ((e._complete = function (e) {
              ((e.cardList = e.choose_card_info), delete e.choose_card_info);
            }),
            e),
          );
        },
        openCard: function (e) {
          for (var n = e.cardList, i = [], t = 0, o = n.length; t < o; ++t) {
            var r = n[t],
              r = { card_id: r.cardId, code: r.code };
            i.push(r);
          }
          T(a.openCard, { card_list: i }, e);
        },
        consumeAndShareCard: function (e) {
          T(a.consumeAndShareCard, { consumedCardId: e.cardId, consumedCode: e.code }, e);
        },
        chooseWXPay: function (e) {
          T(a.chooseWXPay, x(e), e);
        },
        openEnterpriseRedPacket: function (e) {
          T(a.openEnterpriseRedPacket, x(e), e);
        },
        startSearchBeacons: function (e) {
          T(a.startSearchBeacons, { ticket: e.ticket }, e);
        },
        stopSearchBeacons: function (e) {
          T(a.stopSearchBeacons, {}, e);
        },
        onSearchBeacons: function (e) {
          M(a.onSearchBeacons, e);
        },
        openEnterpriseChat: function (e) {
          T('openEnterpriseChat', { useridlist: e.userIds, chatname: e.groupName }, e);
        },
        launchMiniProgram: function (e) {
          T(
            'launchMiniProgram',
            {
              targetAppId: e.targetAppId,
              path: ((e) => {
                var n;
                if ('string' == typeof e && 0 < e.length)
                  return (
                    (n = e.split('?')[0]),
                    (n += '.html'),
                    void 0 !== (e = e.split('?')[1]) ? n + '?' + e : n
                  );
              })(e.path),
              envVersion: e.envVersion,
            },
            e,
          );
        },
        miniProgram: {
          navigateBack: function (e) {
            ((e = e || {}),
              B(function () {
                T(
                  'invokeMiniProgramAPI',
                  { name: 'navigateBack', arg: { delta: e.delta || 1 } },
                  e,
                );
              }));
          },
          navigateTo: function (e) {
            B(function () {
              T('invokeMiniProgramAPI', { name: 'navigateTo', arg: { url: e.url } }, e);
            });
          },
          redirectTo: function (e) {
            B(function () {
              T('invokeMiniProgramAPI', { name: 'redirectTo', arg: { url: e.url } }, e);
            });
          },
          switchTab: function (e) {
            B(function () {
              T('invokeMiniProgramAPI', { name: 'switchTab', arg: { url: e.url } }, e);
            });
          },
          reLaunch: function (e) {
            B(function () {
              T('invokeMiniProgramAPI', { name: 'reLaunch', arg: { url: e.url } }, e);
            });
          },
          postMessage: function (e) {
            B(function () {
              T('invokeMiniProgramAPI', { name: 'postMessage', arg: e.data || {} }, e);
            });
          },
          getEnv: function (e) {
            B(function () {
              e({ miniprogram: 'miniprogram' === r.__wxjs_environment });
            });
          },
        },
      }),
      (k = 1),
      (w = {}),
      n.addEventListener(
        'error',
        function (e) {
          var n, i, t;
          l ||
            ((t = (n = e.target).tagName),
            (i = n.src),
            'IMG' != t && 'VIDEO' != t && 'AUDIO' != t && 'SOURCE' != t) ||
            (-1 != i.indexOf('wxlocalresource://') &&
              (e.preventDefault(),
              e.stopPropagation(),
              (t = n['wx-id']) || ((t = k++), (n['wx-id'] = t)),
              w[t] ||
                ((w[t] = !0),
                wx.ready(function () {
                  wx.getLocalImgData({
                    localId: i,
                    success: function (e) {
                      n.src = e.localData;
                    },
                  });
                }))));
        },
        !0,
      ),
      n.addEventListener(
        'load',
        function (e) {
          var n;
          l ||
            ((n = (e = e.target).tagName),
            'IMG' != n && 'VIDEO' != n && 'AUDIO' != n && 'SOURCE' != n) ||
            ((n = e['wx-id']) && (w[n] = !1));
        },
        !0,
      ),
      e && (r.wx = r.jWeixin = _),
      _
    );
  function T(n, e, i) {
    r.WeixinJSBridge
      ? WeixinJSBridge.invoke(n, P(e), function (e) {
          A(n, e, i);
        })
      : C(n, i);
  }
  function M(n, i, t) {
    r.WeixinJSBridge
      ? WeixinJSBridge.on(n, function (e) {
          (t && t.trigger && t.trigger(e), A(n, e, i));
        })
      : C(n, t || i);
  }
  function P(e) {
    return (
      ((e = e || {}).appId = h.appId),
      (e.verifyAppId = h.appId),
      (e.verifySignType = 'sha1'),
      (e.verifyTimestamp = h.timestamp + ''),
      (e.verifyNonceStr = h.nonceStr),
      (e.verifySignature = h.signature),
      e
    );
  }
  function x(e) {
    return {
      timeStamp: e.timestamp + '',
      nonceStr: e.nonceStr,
      package: e.package,
      paySign: e.paySign,
      signType: e.signType || 'SHA1',
    };
  }
  function A(e, n, i) {
    ('openEnterpriseChat' == e && (n.errCode = n.err_code),
      delete n.err_code,
      delete n.err_desc,
      delete n.err_detail);
    var t = n.errMsg,
      e =
        (t ||
          ((t = n.err_msg),
          delete n.err_msg,
          (t = ((e, n) => {
            var i,
              t = c[e];
            return (
              t && (e = t),
              (t = 'ok'),
              n &&
                ((i = n.indexOf(':')),
                ('access denied' !=
                  (t = (t = (t =
                    -1 !=
                    (t =
                      -1 !=
                      (t =
                        'failed' == (t = 'confirm' == (t = n.substring(i + 1)) ? 'ok' : t)
                          ? 'fail'
                          : t).indexOf('failed_')
                        ? t.substring(7)
                        : t).indexOf('fail_')
                      ? t.substring(5)
                      : t).replace(/_/g, ' ')).toLowerCase()) &&
                  'no permission to execute' != t) ||
                  (t = 'permission denied'),
                '' == (t = 'config' == e && 'function not exist' == t ? 'ok' : t)) &&
                (t = 'fail'),
              (n = e + ':' + t)
            );
          })(e, t)),
          (n.errMsg = t)),
        (i = i || {})._complete && (i._complete(n), delete i._complete),
        (t = n.errMsg || ''),
        h.debug && !i.isInnerInvoke && alert(JSON.stringify(n)),
        t.indexOf(':'));
    switch (t.substring(e + 1)) {
      case 'ok':
        i.success && i.success(n);
        break;
      case 'cancel':
        i.cancel && i.cancel(n);
        break;
      default:
        i.fail && i.fail(n);
    }
    i.complete && i.complete(n);
  }
  function V(e) {
    if (e) {
      for (var n = 0, i = e.length; n < i; ++n) {
        var t = e[n],
          t = a[t];
        t && (e[n] = t);
      }
      return e;
    }
  }
  function C(e, n) {
    var i;
    !h.debug ||
      (n && n.isInnerInvoke) ||
      ((i = c[e]) && (e = i),
      n && n._complete && delete n._complete,
      console.log('"' + e + '",', n || ''));
  }
  function L() {
    return new Date().getTime();
  }
  function B(e) {
    o &&
      (r.WeixinJSBridge
        ? e()
        : n.addEventListener && n.addEventListener('WeixinJSBridgeReady', e, !1));
  }
});
