"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orderDetail: {}
    };
  },
  onLoad(options) {
    if (options.order_id) {
      common_vendor.index.__f__("log", "at pages/one/one.vue:77", "id", options.order_id);
      this.orderId = options.order_id;
      if (options.phpsessid) {
        this.phpsessid = options.phpsessid;
      }
      this.getOrderDetails(this.orderId);
    }
  },
  methods: {
    getOrderDetails(orderId) {
      common_vendor.index.showLoading({
        title: "加载中"
      });
      common_vendor.index.request({
        url: `http://localhost/api/food/order?id=${orderId}`,
        method: "GET",
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/one/one.vue:97", "API Response:", res.data);
          if (res.data) {
            this.orderDetail = res.data;
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/one/one.vue:105", "请求失败:", error);
          common_vendor.index.showModal({
            title: "获取订单失败",
            content: "网络请求失败，请重试",
            showCancel: false
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    },
    goToPay() {
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.orderDetail.code || "--"),
    b: common_vendor.t($data.orderDetail.is_pay ? $data.orderDetail.is_taken ? "已取餐" : "正在精心制作中..." : "待支付"),
    c: common_vendor.t($data.orderDetail.is_pay ? $data.orderDetail.is_taken ? "感谢您的惠顾" : "美食制作中，尽快为您服务😊" : "请尽快完成支付"),
    d: common_vendor.f($data.orderDetail.order_food, (item, index, i0) => {
      return {
        a: item.image_url,
        b: common_vendor.t(item.name || "未知商品"),
        c: common_vendor.t(item.number || 0),
        d: common_vendor.t((parseFloat(item.price) || 0).toFixed(2)),
        e: index
      };
    }),
    e: common_vendor.t((parseFloat($data.orderDetail.price) || 0).toFixed(2)),
    f: common_vendor.t($data.orderDetail.sn || "--"),
    g: common_vendor.t($data.orderDetail.create_time || "--"),
    h: common_vendor.t($data.orderDetail.pay_time || "未支付"),
    i: $data.orderDetail.comment
  }, $data.orderDetail.comment ? {
    j: common_vendor.t($data.orderDetail.comment)
  } : {}, {
    k: $data.orderDetail.is_pay
  }, $data.orderDetail.is_pay ? {} : {
    l: common_vendor.t(((parseFloat($data.orderDetail.price) || 0) - (parseFloat($data.orderDetail.promotion) || 0)).toFixed(2)),
    m: common_vendor.o((...args) => $options.goToPay && $options.goToPay(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/one/one.js.map
