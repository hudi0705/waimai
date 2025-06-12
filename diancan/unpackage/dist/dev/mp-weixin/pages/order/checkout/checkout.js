"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderDetail: {},
      phpsessid: null
    };
  },
  onLoad(options) {
    if (options.order_id) {
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
          common_vendor.index.__f__("log", "at pages/order/checkout/checkout.vue:71", "API Response:", res.data);
          if (res.data) {
            this.orderDetail = res.data;
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/order/checkout/checkout.vue:79", "请求失败:", error);
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
      common_vendor.index.request({
        url: "http://localhost/api/food/pay",
        method: "POST",
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        },
        data: {
          id: this.orderId
        },
        success: (res) => {
          if (res.data.msg == "支付成功") {
            common_vendor.index.navigateTo({
              url: `/pages/one/one?order_id=${this.orderId}&phpsessid=${this.phpsessid}`
            });
          }
        }
      });
      common_vendor.index.showLoading({
        title: "处理中"
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付功能开发中",
          icon: "none"
        });
      }, 1e3);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orderDetail.order_food, (item, index, i0) => {
      return {
        a: item.image_url,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.number),
        d: common_vendor.t(parseFloat(item.price).toFixed(2)),
        e: index
      };
    }),
    b: common_vendor.t(parseFloat($data.orderDetail.price).toFixed(2)),
    c: $data.orderDetail.comment,
    d: common_vendor.o(($event) => $data.orderDetail.comment = $event.detail.value),
    e: common_vendor.t((parseFloat($data.orderDetail.price) - parseFloat($data.orderDetail.promotion)).toFixed(2)),
    f: common_vendor.o(($event) => $options.goToPay())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/order/checkout/checkout.js.map
