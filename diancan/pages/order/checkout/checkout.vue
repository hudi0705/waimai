<template>
  <view class="container">
    <view class="header">
      <text>请确认您的订单</text>
    </view>

    <view class="section">
      <view class="section-title">订单详情</view>
      <view class="order-item" v-for="(item, index) in orderDetail.order_food" :key="index">
        <image class="item-image" :src="item.image_url"></image>
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-quantity">x {{ item.number }}</text>
        </view>
        <text class="item-price">￥{{ parseFloat(item.price).toFixed(2) }}</text>
      </view>
      <view class="subtotal">
        <text>小计</text>
        <text>￥{{ parseFloat(orderDetail.price).toFixed(2) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">备注</view>
      <textarea class="notes-textarea" v-model="orderDetail.comment" placeholder="如有其他要求，请输入备注"></textarea>
    </view>

    <view class="footer">
      <view class="total-price-info">
        <text>合计:</text>
        <text class="total-price">￥{{ (parseFloat(orderDetail.price) - parseFloat(orderDetail.promotion)).toFixed(2)
        }}</text>
      </view>
      <view class="pay-button" @click="goToPay()">去支付</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      orderDetail: {
      
      },
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
      uni.showLoading({
        title: '加载中'
      });
      uni.request({
        url: `http://localhost/api/food/order?id=${orderId}`,
        method: 'GET',
        header: {
          'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
        },
        success: (res) => {
          console.log('API Response:', res.data);
          if (res.data) {
            this.orderDetail = res.data;
            // 确保 order_food 是数组
          
          }
        },
        fail: (error) => {
          console.error('请求失败:', error);
          uni.showModal({
            title: '获取订单失败',
            content: '网络请求失败，请重试',
            showCancel: false
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    goToPay() {
      uni.request({
      	url:'http://localhost/api/food/pay',
		method:'POST',
		header: {
		  'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
		},
		data:{
			id:this.orderId
		},
		success: (res) => {
		if(res.data.msg=='支付成功'){
			uni.navigateTo({
				url:`/pages/one/one?order_id=${this.orderId}&phpsessid=${this.phpsessid}`
			})
		}
		}
      })
      uni.showLoading({
        title: '处理中'
      });
      // 这里添加支付相关的API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '支付功能开发中',
          icon: 'none'
        });
      }, 1000);
    }
  }
};
</script>

<style>
page {
  background-color: #f8f8f8;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 120rpx;
  /* Space for the fixed footer */
}

.header {
  background-color: white;
  padding: 30rpx;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}

.section {
  background-color: white;
  margin-top: 20rpx;
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.order-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-image {
  width: 100rpx;
  height: 100rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  object-fit: cover;
}

.item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 30rpx;
  color: #333;
}

.item-quantity {
  font-size: 24rpx;
  color: #999;
}

.item-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.notes-textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #333;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  background-color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  box-sizing: border-box;
  z-index: 100;
}

.total-price-info {
  display: flex;
  align-items: baseline;
  color: white;
}

.total-price {
  font-size: 40rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.pay-button {
  background-color: #ff9c35;
  color: white;
  padding: 20rpx 40rpx;
  border-radius: 60rpx;
  font-size: 36rpx;
  font-weight: bold;
}
</style>