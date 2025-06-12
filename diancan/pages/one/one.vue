<template>
	<view>
		<view class="container">
			<view class="header-card">
				<view class="pickup-number-wrapper">
					<view class="pickup-label">取餐号</view>
					<view class="pickup-number">{{ orderDetail.code || '--' }}</view>
				</view>
				<view class="status-info">
					<text class="status-text">{{ orderDetail.is_pay ? (orderDetail.is_taken ? '已取餐' : '正在精心制作中...') : '待支付'
					}}</text>
					<text class="status-detail">{{ orderDetail.is_pay ? (orderDetail.is_taken ? '感谢您的惠顾' : '美食制作中，尽快为您服务😊') :
						'请尽快完成支付' }}</text>
				</view>
			</view>

			<view class="section order-details-section">
				<view class="section-title">订单详情</view>
				<view class="order-item" v-for="(item, index) in orderDetail.order_food" :key="index">
					<image class="item-image" :src="item.image_url"></image>
					<view class="item-info">
						<text class="item-name">{{ item.name || '未知商品' }}</text>
						<text class="item-quantity">x {{ item.number || 0 }}</text>
					</view>
					<text class="item-price">￥{{ (parseFloat(item.price) || 0).toFixed(2) }}</text>
				</view>
				<view class="subtotal">
					<text>小计</text>
					<text>￥{{ (parseFloat(orderDetail.price) || 0).toFixed(2) }}</text>
				</view>
			</view>

			<view class="section order-info-section">
				<view class="info-row">
					<text class="info-label">订单号码</text>
					<text class="info-value">{{ orderDetail.sn || '--' }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">下单时间</text>
					<text class="info-value">{{ orderDetail.create_time || '--' }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">付款时间</text>
					<text class="info-value">{{ orderDetail.pay_time || '未支付' }}</text>
				</view>
				<view class="info-row" v-if="orderDetail.comment">
					<text class="info-label">备注</text>
					<text class="info-value">{{ orderDetail.comment }}</text>
				</view>
			</view>

			<view class="footer-button-wrapper" v-if="orderDetail.is_pay">
				<view class="pickup-message-button">请凭此页面至取餐柜台领取美食</view>
			</view>
			<view class="footer-button-wrapper" v-else>
				<view class="total-price-info">
					<text>合计:</text>
					<text class="total-price">￥{{ ((parseFloat(orderDetail.price) || 0) - (parseFloat(orderDetail.promotion) ||
						0)).toFixed(2) }}</text>
				</view>
				<view class="pay-button" @click="goToPay">去支付</view>
			</view>

		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderDetail: {}
		}
	},
	onLoad(options) {
		if (options.order_id) {
			console.log('id', options.order_id);
			this.orderId = options.order_id;
			if (options.phpsessid) {
				this.phpsessid = options.phpsessid
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

		}
	}
}
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

.header-card {
	background-color: white;
	margin: 20rpx 15rpx;
	padding: 30rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.pickup-number-wrapper {
	background-color: #ff9c35;
	color: white;
	padding: 20rpx;
	border-radius: 8rpx;
	text-align: center;
	margin-right: 30rpx;
}

.pickup-label {
	font-size: 24rpx;
}

.pickup-number {
	font-size: 48rpx;
	font-weight: bold;
}

.status-info {
	flex-grow: 1;
}

.status-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #ff9c35;
}

.status-detail {
	font-size: 28rpx;
	color: #FFC107;
	margin-top: 10rpx;
}

.section {
	background-color: white;
	margin: 20rpx 15rpx;
	padding: 20rpx 30rpx;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	color: #666;
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
	border-radius: 50%;
	object-fit: cover;
}

.item-info {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

.item-name {
	font-size: 30rpx;
	color: #000;
	font-weight: bold;
}

.item-quantity {
	font-size: 24rpx;
	color: #666;
}

.item-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #000;
}

.subtotal {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 1rpx solid #eee;
	font-size: 32rpx;
	font-weight: normal;
	color: #666;
}

.order-info-section .info-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 15rpx;
	font-size: 28rpx;
}

.order-info-section .info-label {
	color: #666;
}

.order-info-section .info-value {
	color: #000;
	font-weight: bold;
}

.footer-button-wrapper {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 120rpx;
	background-color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 30rpx;
	box-sizing: border-box;
	z-index: 100;
}

.total-price-info {
	display: flex;
	align-items: baseline;
	color: white;
	margin-right: auto;
	/* Push pay button to right */
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

.pickup-message-button {
	background-color: #ff9c35;
	color: white;
	width: 100%;
	text-align: center;
	padding: 20rpx 0;
	border-radius: 60rpx;
	font-size: 36rpx;
	font-weight: bold;
}
</style>
