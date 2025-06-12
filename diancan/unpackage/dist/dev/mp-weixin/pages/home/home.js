"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phpsessid: "",
      isLogin: false,
      select: "0",
      classify: ["热销推荐", "特色小吃", "甜粥", "凉菜", "醇香奶茶", "主食", "小炒菜", "现磨咖啡", "鲜果奶茶"],
      list: null,
      loading: false,
      scrollTop: 0,
      cartList: {},
      // 购物车数据
      showCart: false,
      // 是否显示购物车详情
      totalPrice: 0,
      // 购物车总价
      totalQuantity: 0,
      // 购物车总数量
      originalPrice: 0,
      // 原价（未打折前）
      remainingForDiscount: null
      // 距离满减还差多少
    };
  },
  methods: {
    select_login() {
      common_vendor.index.request({
        url: "http://localhost/api/user/checkLogin",
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        }
      }).then((res) => {
        this.isLogin = res.data.isLogin;
      });
    },
    item_select(index) {
      this.select = index;
      this.$nextTick(() => {
        const query = common_vendor.index.createSelectorQuery().in(this);
        query.select("#section-" + index).boundingClientRect();
        query.select("#listCenter").boundingClientRect();
        query.exec((res) => {
          if (res[0] && res[1]) {
            const targetTop = res[0].top;
            const containerTop = res[1].top;
            this.scrollTop = targetTop - containerTop;
          }
        });
      });
    },
    onScroll(e) {
    },
    get_list() {
      this.loading = true;
      common_vendor.index.request({
        url: "http://localhost/api/food/list",
        method: "GET",
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        },
        timeout: 1e4,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 0) {
              common_vendor.index.showModal({
                title: res.data.msg || "请求失败",
                confirmText: "重试",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.get_list();
                  }
                }
              });
              return;
            }
            this.list = res.data.list;
            common_vendor.index.__f__("log", "at pages/home/home.vue:168", res.data.list);
          } else {
            common_vendor.index.showModal({
              title: "服务器异常",
              confirmText: "重试",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.get_list();
                }
              }
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/home.vue:182", "请求失败：", err);
          common_vendor.index.showModal({
            title: "网络异常，请检查网络连接",
            confirmText: "重试",
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.get_list();
              }
            }
          });
        },
        complete: () => {
          this.loading = false;
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
                  common_vendor.index.__f__("log", "at pages/home/home.vue:217", "PHPSESSID:", this.phpsessid);
                  common_vendor.index.setStorageSync("PHPSESSID", this.phpsessid);
                }
              }
              common_vendor.index.__f__("log", "at pages/home/home.vue:222", "登录成功");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/home/home.vue:225", "登录请求失败", err);
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
          common_vendor.index.__f__("error", "at pages/home/home.vue:239", "获取微信登录code失败", err);
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
    },
    add_to_cart(item) {
      if (!this.cartList[item.id]) {
        this.cartList[item.id] = {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          number: 1
        };
      } else {
        this.cartList[item.id].number++;
      }
      item.number = this.cartList[item.id].number;
      this.updateCartTotals();
    },
    remove_from_cart(item) {
      if (this.cartList[item.id]) {
        if (this.cartList[item.id].number > 1) {
          this.cartList[item.id].number--;
        } else {
          delete this.cartList[item.id];
        }
        item.number = this.cartList[item.id] ? this.cartList[item.id].number : 0;
        this.updateCartTotals();
      }
    },
    updateCartTotals() {
      let total = 0;
      let quantity = 0;
      Object.values(this.cartList).forEach((item) => {
        total += item.price * item.number;
        quantity += item.number;
      });
      this.totalPrice = total;
      this.totalQuantity = quantity;
      this.originalPrice = total;
      if (total < 50) {
        this.remainingForDiscount = (50 - total).toFixed(2);
      } else {
        this.remainingForDiscount = null;
        this.totalPrice = total - 10;
      }
    },
    toggleCart() {
      if (this.totalQuantity > 0) {
        this.showCart = !this.showCart;
      }
    },
    clearCart() {
      this.cartList = {};
      this.totalPrice = 0;
      this.totalQuantity = 0;
      this.originalPrice = 0;
      this.remainingForDiscount = null;
      this.showCart = false;
      if (this.list) {
        this.list.forEach((category) => {
          category.food.forEach((item) => {
            item.count = 0;
          });
        });
      }
    },
    checkout() {
      if (this.totalQuantity === 0)
        return;
      common_vendor.index.showLoading({
        title: "正在生成订单"
      });
      common_vendor.index.request({
        url: "http://localhost/api/food/order",
        method: "POST",
        data: {
          order: this.cartList
        },
        header: {
          "Cookie": this.phpsessid ? "PHPSESSID=" + this.phpsessid : ""
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/home/home.vue:335", res.data);
          common_vendor.index.showModal({
            title: "下单成功",
            showCancel: false,
            success: (modalRes) => {
              if (modalRes.confirm) {
                common_vendor.index.navigateTo({
                  url: `/pages/order/checkout/checkout?order_id=${res.data.order_id}&phpsessid=${this.phpsessid}`
                });
              }
            }
          });
        },
        fail: () => {
          common_vendor.index.showModal({
            title: "网络错误",
            content: "请检查网络连接后重试",
            showCancel: false
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    }
  },
  computed: {},
  mounted() {
    this.login();
    this.select_login();
    this.get_list();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.classify, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: (index == $data.select ? true : false) ? 1 : "",
        c: common_vendor.o(($event) => $options.item_select(index), index),
        d: index
      };
    }),
    b: common_vendor.f($data.list, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.f($data.list[0].food, (item2, index2, i1) => {
          return common_vendor.e({
            a: item2.image_url,
            b: common_vendor.t(item2.name),
            c: common_vendor.t(item2.price),
            d: item2.count > 0
          }, item2.count > 0 ? {
            e: common_vendor.o(($event) => $options.remove_from_cart(item2), index2)
          } : {}, {
            f: item2.count > 0
          }, item2.count > 0 ? {
            g: common_vendor.t(item2.count)
          } : {}, {
            h: common_vendor.o(($event) => $options.add_to_cart(item2), index2),
            i: index2
          });
        }),
        c: index,
        d: "section-" + index
      };
    }),
    c: $data.scrollTop,
    d: common_vendor.o((...args) => $options.onScroll && $options.onScroll(...args)),
    e: $data.remainingForDiscount !== null || $data.totalPrice >= 50
  }, $data.remainingForDiscount !== null || $data.totalPrice >= 50 ? common_vendor.e({
    f: $data.totalPrice < 50
  }, $data.totalPrice < 50 ? {
    g: common_vendor.t($data.remainingForDiscount)
  } : {}, {
    h: $data.totalPrice >= 50 ? 1 : ""
  }) : {}, {
    i: $data.totalQuantity > 0
  }, $data.totalQuantity > 0 ? {
    j: common_vendor.t($data.totalQuantity)
  } : {}, {
    k: $data.totalPrice > 0
  }, $data.totalPrice > 0 ? {
    l: common_vendor.t($data.totalPrice)
  } : {}, {
    m: $data.totalPrice > 0 && $data.totalPrice !== $data.originalPrice
  }, $data.totalPrice > 0 && $data.totalPrice !== $data.originalPrice ? {
    n: common_vendor.t($data.originalPrice)
  } : {}, {
    o: common_vendor.o((...args) => $options.toggleCart && $options.toggleCart(...args)),
    p: $data.totalPrice > 0 ? 1 : "",
    q: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    r: $data.showCart
  }, $data.showCart ? {
    s: common_vendor.o((...args) => $options.clearCart && $options.clearCart(...args)),
    t: common_vendor.f($data.cartList, (item, id, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.price),
        c: common_vendor.o(($event) => $options.remove_from_cart({
          id
        }), id),
        d: common_vendor.t(item.number),
        e: common_vendor.o(($event) => $options.add_to_cart({
          id
        }), id),
        f: id
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
