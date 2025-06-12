"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orderList: null,
      phpsessid: null,
      rows: 10
    };
  },
  onLoad(options) {
    this.login();
  },
  methods: {
    get_lists() {
      common_vendor.index.request({
        url: `http://localhost/api/food/orderlist?row=${this.rows}`,
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/list/list.vue:44", "list", res.data);
          this.orderList = res.data.list;
        }
      });
    },
    login() {
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          common_vendor.index.request({
            url: "http://localhost/api/user/login",
            data: {
              js_code: loginRes.code
            },
            method: "GET",
            success: (res) => {
              const setCookie = res.header["Set-Cookie"];
              if (setCookie) {
                const match = setCookie.match(/PHPSESSID=([^;]+)/);
                if (match) {
                  this.phpsessid = match[1];
                  common_vendor.index.__f__("log", "at pages/list/list.vue:68", "PHPSESSID1111111:", this.phpsessid);
                  common_vendor.index.setStorageSync("PHPSESSID", this.phpsessid);
                }
              }
              common_vendor.index.__f__("log", "at pages/list/list.vue:73", "登录成功");
              this.get_lists();
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/list/list.vue:77", "登录请求失败", err);
              common_vendor.index.showModal({
                title: "登录失败，请重试",
                confirmText: "重试",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.login();
                  }
                }
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/list/list.vue:91", "获取微信登录code失败", err);
          common_vendor.index.showModal({
            title: "获取登录凭证失败",
            confirmText: "重试",
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.login();
              }
            }
          });
        }
      });
      return true;
    }
  },
  onReachBottom() {
    this.rows += 10;
    this.get_lists();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orderList, (order, index, i0) => {
      return {
        a: common_vendor.t(order.create_time),
        b: common_vendor.t(order.first_food_name),
        c: common_vendor.t(order.number),
        d: common_vendor.t(parseFloat(order.price).toFixed(2)),
        e: common_vendor.o(($event) => _ctx.goToDetails(order.order_id), index),
        f: common_vendor.t(order.is_taken ? "已取餐" : "未取餐"),
        g: common_vendor.n(order.is_taken ? "picked-up-button" : "not-picked-up-button"),
        h: index
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/list/list.js.map
