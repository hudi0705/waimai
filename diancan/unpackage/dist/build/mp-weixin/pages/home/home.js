"use strict";
const e = require("../../common/vendor.js");
const app = getApp();

Page({
  data: {
    foodList: [],
    promotion: {},
    activeIndex: 0,
    tapIndex: 0,
    cartPrice: 0,
    cartNumber: 0,
    cartList: {},
    showCart: false,
    classify: ["热销推荐", "特色小吃", "甜粥", "凉菜", "醇香奶茶", "主食", "小炒菜", "现磨咖啡", "鲜果奶茶"]
  },

  onLoad: function () {
    wx.showLoading({
      title: '努力加载中'
    });
    wx.request({
      url: '/food/list',
      method: 'GET',
      success: (res) => {
        console.log(res.data);
        this.setData({
          foodList: res.data.list,
          promotion: res.data.promotion ? res.data.promotion[0] : {}
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  item_select(e) {
    this.setData({
      activeIndex: e
    });
  },

  addToCart(e) {
    const index = e.currentTarget.dataset.index;
    const category_index = e.currentTarget.dataset.category_index;
    const food = this.data.foodList[category_index].food[index];
    const cartList = this.data.cartList;

    if (cartList[index]) {
      ++cartList[index].number;
    } else {
      cartList[index] = {
        id: food.id,
        name: food.name,
        price: parseFloat(food.price),
        number: 1
      };
    }

    this.setData({
      cartList,
      cartPrice: this.data.cartPrice + cartList[index].price,
      cartNumber: this.data.cartNumber + 1
    });
  },

  showCartList() {
    if (this.data.cartNumber > 0) {
      this.setData({
        showCart: !this.data.showCart
      });
    }
  },

  cartNumberAdd(e) {
    var id = e.currentTarget.dataset.id;
    var cartList = this.data.cartList;
    ++cartList[id].number;
    this.setData({
      cartList: cartList,
      cartNumber: ++this.data.cartNumber,
      cartPrice: this.data.cartPrice + cartList[id].price
    });
  },

  cartNumberDec(e) {
    var id = e.currentTarget.dataset.id;
    var cartList = this.data.cartList;
    if (cartList[id]) {
      var price = cartList[id].price;
      if (cartList[id].number > 1) {
        --cartList[id].number;
      } else {
        delete cartList[id];
      }
      this.setData({
        cartList: cartList,
        cartNumber: --this.data.cartNumber,
        cartPrice: this.data.cartPrice - price
      });
      if (this.data.cartNumber <= 0) {
        this.setData({
          showCart: false
        });
      }
    }
  },

  cartClear() {
    this.setData({
      cartList: {},
      cartNumber: 0,
      cartPrice: 0,
      showCart: false
    });
  }
});