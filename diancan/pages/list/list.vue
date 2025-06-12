<template>
	<view class="order-list-container">
		<view class="order-item-card" v-for="(order, index) in orderList" :key="index">
			<view class="order-time">下单时间: {{ order.create_time }}</view>
			<view class="order-details">
				<view class="food-info">
					<text class="food-name">{{ order.first_food_name }}</text>
					<text class="food-quantity">等{{ order.number }}件商品</text>
					<text class="food-price">￥{{ parseFloat(order.price).toFixed(2) }}</text>
				</view>
				<view class="action-buttons">
					<view class="view-details-button" @click="goToDetails(order.order_id)">查看详情</view>
					<view :class="[order.is_taken ? 'picked-up-button' : 'not-picked-up-button']">{{ order.is_taken ? '已取餐' :
						'未取餐' }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderList: null,
			phpsessid: null,
			rows:10
		}
	},
	onLoad(options) {
	this.login()
		

		
	},
	methods: {
		get_lists(){
			uni.request({
				url:`http://localhost/api/food/orderlist?row=${this.rows}`,
				header:{
					'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
				},
				success: (res) => {
					console.log('list',res.data);
					this.orderList=res.data.list
				}
			})
		},
	login() {
		uni.login({
			provider: 'weixin',
			success: (loginRes) => {
				// console.log(loginRes.code);
				uni.request({
					url: 'http://localhost/api/user/login',
					data: {
						js_code: loginRes.code
					},
					method: 'GET',
					success: (res) => {
						// 获取 Set-Cookie 头
						const setCookie = res.header['Set-Cookie'];
						if (setCookie) {
							// 解析 Set-Cookie 获取 PHPSESSID
							const match = setCookie.match(/PHPSESSID=([^;]+)/);
							if (match) {
								this.phpsessid = match[1];
								console.log('PHPSESSID1111111:', this.phpsessid);
								// 存储 PHPSESSID 到本地存储
								uni.setStorageSync('PHPSESSID', this.phpsessid);
							}
						}
						console.log('登录成功');
						this.get_lists();
					},
					fail: (err) => {
						console.error('登录请求失败', err);
						uni.showModal({
							title: '登录失败，请重试',
							confirmText: '重试',
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
				console.error('获取微信登录code失败', err);
				uni.showModal({
					title: '获取登录凭证失败',
					confirmText: '重试',
					success: (modalRes) => {
						if (modalRes.confirm) {
							this.login();
						}
					}
				});
			}
		});
		return true
	},
	},
	onReachBottom  () {
		this.rows+=10
		this.get_lists()
	}
}
</script>

<style>
page {
	background-color: #f8f8f8;
}

.order-list-container {
	padding: 20rpx;
}

.order-item-card {
	background-color: white;
	margin-bottom: 20rpx;
	padding: 20rpx;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-time {
	font-size: 28rpx;
	color: #999;
	margin-bottom: 15rpx;
}

.order-details {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.food-info {
	display: flex;
	flex-direction: column;
}

.food-name {
	font-size: 30rpx;
	color: #333;
	margin-bottom: 5rpx;
}

.food-quantity {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 10rpx;
}

.food-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #ff9c35;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
}

.view-details-button {
	border: 1rpx solid #ff9c35;
	color: #ff9c35;
	padding: 10rpx 20rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
}

.not-picked-up-button {
	background-color: #ffc107;
	color: white;
	padding: 10rpx 20rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
}

.picked-up-button {
	background-color: #cccccc;
	color: white;
	padding: 10rpx 20rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
}
</style>
