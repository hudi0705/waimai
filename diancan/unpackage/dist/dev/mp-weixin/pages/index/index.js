"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      title: "Hello"
    };
  },
  onLoad() {
  },
  methods: {
    goto() {
      common_vendor.index.navigateTo({
        url: "/pages/list/list"
      });
    },
    login() {
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:32", loginRes.code);
          common_vendor.index.request({
            url: "http://localhost/api/user/login",
            data: {
              js_code: loginRes.code
            },
            method: "GET",
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/index/index.vue:40", res.data);
              common_vendor.index.navigateTo({
                url: "/pages/home/home"
              });
              common_vendor.index.__f__("log", "at pages/index/index.vue:44", "登录成功");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:47", "登录请求失败", err);
              common_vendor.index.showToast({
                title: "登录失败，请重试",
                icon: "none"
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:56", "获取微信登录code失败", err);
          common_vendor.index.showToast({
            title: "获取登录凭证失败",
            icon: "none"
          });
        }
      });
    }
  },
  mounted() {
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.login()),
    b: common_vendor.o(($event) => $options.goto())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
