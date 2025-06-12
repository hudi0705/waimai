<template>
	<view class="big">

		<view class="jiandan">
			<view class="jian">减</view>
			<view class="jiandan_text">满50元减10元（在线支付专享）</view>
		</view>
		<view class="list">
			<view class="list_list">
				<view v-for="(item, index) in classify"
					:class="{ 'list_item': true, item_select: index == select ? true : false }" @click="item_select(index)"
					:key="index">
					{{ item }}
				</view>
			</view>
			<scroll-view class="list_center" id="listCenter" scroll-y :scroll-top="scrollTop" @scroll="onScroll">
				<view v-for="(item, index) in list" :key="index" :id="'section-' + index">
					<view class="header">
						{{ item.name }}
					</view>
					<view class="list_content" v-for="(item, index) in list[0].food" :key="index">
						<view class="left">
							<image class="img" :src="item.image_url"></image>
							<view class="left_text">
								<view class="font">{{ item.name }}</view>
								<view class="qian">￥{{ item.price }}</view>
							</view>
						</view>
						<view class="add_to_cart">
							<view class="remove_button" @click="remove_from_cart(item)" v-if="item.count > 0">-</view>
							<text class="item_count" v-if="item.count > 0">{{ item.count }}</text>
							<view class="add_button" @click="add_to_cart(item)">
								+
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="promo-text" :class="{ 'active': totalPrice >= 50 }"
			v-if="remainingForDiscount !== null || totalPrice >= 50">
			<template v-if="totalPrice < 50">
				满50立减10元，还差{{ remainingForDiscount }}元
			</template>
			<template v-else>
				已满50元可减10元
			</template>
		</view>
		<view class="car">
			<view class="car_left" @click="toggleCart">
				<view class="car_icon_wrapper">
					<view class="car_icon"></view>
					<view class="cart_badge" v-if="totalQuantity > 0">{{ totalQuantity }}</view>
				</view>
				<view class="price_info">
					<view class="car_total_price" v-if="totalPrice > 0">￥{{ totalPrice }}</view>
					<view class="car_original_price" v-if="totalPrice > 0 && totalPrice !== originalPrice">￥{{ originalPrice }}
					</view>
					<view class="car_text" v-else>购物车是空的</view>
				</view>
			</view>
			<view class="car_right">
				<view class="checkout_button" :class="{ 'active': totalPrice > 0 }" @click="checkout">选好了</view>
			</view>
		</view>

		<!-- 购物车详情弹窗 -->
		<view class="cart-detail" v-if="showCart">
			<view class="cart-header">
				<text>已选商品</text>
				<text class="clear-cart" @click="clearCart">清空购物车</text>
			</view>
			<scroll-view class="cart-list" scroll-y>
				<view class="cart-item" v-for="(item, id) in cartList" :key="id">
					<view class="item-info">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-price">￥{{ item.price }}</text>
					</view>
					<view class="item-control">
						<view class="remove_button" @click="remove_from_cart({ id: id })">-</view>
						<text class="item_count">{{ item.number }}</text>
						<view class="add_button" @click="add_to_cart({ id: id })">+</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			phpsessid: '',
			isLogin: false,
			select: '0',
			classify: ['热销推荐', '特色小吃', '甜粥', '凉菜', '醇香奶茶', '主食', '小炒菜', '现磨咖啡', '鲜果奶茶'],
			list: null,
			loading: false,
			scrollTop: 0,
			cartList: {}, // 购物车数据
			showCart: false, // 是否显示购物车详情
			totalPrice: 0, // 购物车总价
			totalQuantity: 0, // 购物车总数量
			originalPrice: 0, // 原价（未打折前）
			remainingForDiscount: null // 距离满减还差多少
		}
	},
	methods: {
		select_login() {
			uni.request({
				url: 'http://localhost/api/user/checkLogin',
				header: {
					'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
				}
			}).then(res => {
				this.isLogin = res.data.isLogin
			})
		},
		item_select(index) {
			this.select = index;
			// 使用 nextTick 确保 DOM 更新后再滚动
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('#section-' + index).boundingClientRect();
				query.select('#listCenter').boundingClientRect();
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
			// 可以在这里处理滚动事件
			// console.log('scroll', e);
		},
		get_list() {
			this.loading = true
			uni.request({
				url: 'http://localhost/api/food/list',
				method: 'GET',
				header: {
					'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
				},
				timeout: 10000,
				success: (res) => {
					// 处理 Set-Cookie
					if (res.statusCode === 200) {
						if (res.data.code === 0) {
							uni.showModal({
								title: res.data.msg || '请求失败',
								confirmText: '重试',
								success: (modalRes) => {
									if (modalRes.confirm) {
										this.get_list();
									}
								}
							});
							return;
						}

						// 这里可以处理返回的数据
						this.list = res.data.list
						console.log(res.data.list);
					} else {
						uni.showModal({
							title: '服务器异常',
							confirmText: '重试',
							success: (modalRes) => {
								if (modalRes.confirm) {
									this.get_list();
								}
							}
						});
					}
				},
				fail: (err) => {
					console.error('请求失败：', err);
					uni.showModal({
						title: '网络异常，请检查网络连接',
						confirmText: '重试',
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
									console.log('PHPSESSID:', this.phpsessid);
									// 存储 PHPSESSID 到本地存储
									uni.setStorageSync('PHPSESSID', this.phpsessid);
								}
							}
							console.log('登录成功');
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
		},
		add_to_cart(item) {
			if (!this.cartList[item.id]) {
				this.cartList[item.id] = {
					id: item.id,
					name: item.name,
					price: parseFloat(item.price),
					number: 1
				}
			} else {
				this.cartList[item.id].number++
			}
			item.number = this.cartList[item.id].number
			this.updateCartTotals()
		},
		remove_from_cart(item) {
			if (this.cartList[item.id]) {
				if (this.cartList[item.id].number > 1) {
					this.cartList[item.id].number--
				} else {
					delete this.cartList[item.id]
				}
				item.number = this.cartList[item.id] ? this.cartList[item.id].number : 0
				this.updateCartTotals()
			}
		},
		updateCartTotals() {
			let total = 0
			let quantity = 0
			Object.values(this.cartList).forEach(item => {
				total += item.price * item.number
				quantity += item.number
			})
			this.totalPrice = total
			this.totalQuantity = quantity
			this.originalPrice = total

			// 计算满减
			if (total < 50) {
				this.remainingForDiscount = (50 - total).toFixed(2)
			} else {
				this.remainingForDiscount = null
				this.totalPrice = total - 10 // 满50减10
			}
		},
		toggleCart() {
			if (this.totalQuantity > 0) {
				this.showCart = !this.showCart
			}
		},
		clearCart() {
			this.cartList = {}
			this.totalPrice = 0
			this.totalQuantity = 0
			this.originalPrice = 0
			this.remainingForDiscount = null
			this.showCart = false

			// 重置所有商品的count
			if (this.list) {
				this.list.forEach(category => {
					category.food.forEach(item => {
						item.count = 0
					})
				})
			}
		},
		checkout() {
			if (this.totalQuantity === 0) return

			uni.showLoading({
				title: '正在生成订单'
			})

			uni.request({
				url: 'http://localhost/api/food/order',
				method: 'POST',
				data: {
					order: this.cartList
				},
				header: {
					'Cookie': this.phpsessid ? 'PHPSESSID=' + this.phpsessid : ''
				},
				success: (res) => {
					console.log(res.data);

					uni.showModal({
						title: '下单成功',
						showCancel: false,
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.navigateTo({
									url: `/pages/order/checkout/checkout?order_id=${res.data.order_id}&phpsessid=${this.phpsessid}`
								})
							}
						}
					});

				},
				fail: () => {
					uni.showModal({
						title: '网络错误',
						content: '请检查网络连接后重试',
						showCancel: false
					})
				},
				complete: () => {
					uni.hideLoading()
				}
			})
		}
	},
	computed: {

	},
	mounted() {
		this.login()
		this.select_login()
		this.get_list()
	}
}
</script>

<style>
.remove_button {
	width: 50rpx;
	height: 50rpx;
	background-color: #f0f0f0;
	border-radius: 50%;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 40rpx;
	line-height: 1;
	margin-right: 10rpx;
}

.add_to_cart {
	display: flex;
	align-items: center;
	margin-right: 20rpx;
}

.font {
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

.item_count {
	font-size: 28rpx;
	margin: 0 10rpx;
}

.add_button {
	width: 50rpx;
	height: 50rpx;
	background-color: #ff9c35;
	border-radius: 50%;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 40rpx;
	line-height: 1;
}

.header-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 80rpx;
	background-color: #ff9c35;
	color: white;
	padding: 0 20rpx;
	font-size: 32rpx;
}

.back-button {
	/* font-size: 40rpx; */
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.right-icons {
	display: flex;
}

.menu-icon,
.user-icon {
	width: 40rpx;
	height: 40rpx;
	background-color: rgba(255, 255, 255, 0.3);
	/* Placeholder for icons */
	border-radius: 50%;
	margin-left: 20rpx;
}

.promo-text {
	width: 100%;
	height: 60rpx;
	background-color: #fef0c1;
	/* Lighter yellow as in image */
	color: #ff9c35;
	/* Orange text */
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 28rpx;
	z-index: 3;
}

.promo-text.active {
	background-color: #ff9c35;
	/* Orange when discount is met */
	color: white;
}

.left_text {
	margin-top: 20rpx;
	line-height: 1.5;
}

.left {
	display: flex;
	align-items: center;
}

.img {
	width: 150rpx;
	height: 150rpx;
	margin-right: 20rpx;
	border-radius: 8rpx;
	overflow: hidden;
	object-fit: cover;
}

.qian {
	color: #ff4d4f;
	font-size: 28rpx;
	font-weight: bold;
}

.list_content {
	width: 100%;
	height: 150rpx;
	background-color: white;
	margin-bottom: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	box-sizing: border-box;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.header {
	width: 100%;
	height: 50rpx;
	background-color: #f3f4f6;
	color: #ff9c35;
	font-size: 24rpx;
	line-height: 50rpx;
	padding-left: 10rpx;
	position: sticky;
	top: 0;
	z-index: 3;
}

.car {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 180rpx;
	background-color: #333;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	box-sizing: border-box;
	z-index: 100;
}

.car_left {
	display: flex;
	align-items: center;
}

.car_icon_wrapper {
	position: relative;
	margin-right: 15rpx;
}

.car_icon {
	width: 60rpx;
	height: 60rpx;
	background-color: #ff9c35;
	border-radius: 50%;
}

.cart_badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	background-color: red;
	color: white;
	border-radius: 50%;
	font-size: 20rpx;
	width: 30rpx;
	height: 30rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.price_info {
	display: flex;
	flex-direction: column;
}

.car_text {
	color: #999;
	font-size: 28rpx;
}

.car_total_price {
	color: white;
	font-size: 36rpx;
	font-weight: bold;
	line-height: 1;
}

.car_original_price {
	color: #999;
	font-size: 24rpx;
	text-decoration: line-through;
	margin-top: 5rpx;
}

.car_right {
	display: flex;
	align-items: center;
}

.checkout_button {
	background-color: #999;
	color: white;
	padding: 15rpx 30rpx;
	border-radius: 50rpx;
	font-size: 30rpx;
}

.checkout_button.active {
	background-color: #ff9c35;
}

.item_select {
	border-left: 3px solid #ff9c35;
	color: #ff9c35 !important;
}

.list_item {
	width: 100%;
	height: 50px;
	text-align: center;
	line-height: 50px;
	font-size: 30rpx;
	color: #a8a7a4;
	font-weight: bold;
}

.list {
	width: 100%;
	height: calc(100vh - 90rpx - 80rpx - 60rpx - 100rpx);
	display: flex;
	position: relative;
}

.list_list {
	flex: 1;
	background: #fcfcfc;
	overflow-y: auto;
	height: 100%;
	z-index: 1;
}

.list_center {
	flex: 2;
	overflow-y: auto;
	padding-bottom: 180rpx;
	position: relative;
	z-index: 2;
	height: calc(100vh - 90rpx - 80rpx - 60rpx - 180rpx);
}

.jian {
	width: 50rpx;
	height: 50rpx;
	background-color: red;
	color: white;
	text-align: center;
	margin-right: 20rpx;
}

.big {
	width: 100%;
	height: 100vh;
	background-color: whitesmoke;
	display: flex;
	flex-direction: column;
}

.jiandan {
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 90rpx;
	background-color: #fef9e6;
	display: flex;
}

.jiandan_text {
	font-size: 24rpx;
	/* Adjusted font size */
	color: #a8a7a4;
}

.cart-detail {
	position: fixed;
	bottom: 180rpx;
	left: 0;
	width: 100%;
	background-color: white;
	z-index: 99;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	max-height: 60vh;
	overflow-y: auto;
}

.cart-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
}

.clear-cart {
	color: #999;
	font-size: 28rpx;
}

.cart-list {
	height: auto;
	max-height: calc(60vh - 100rpx);
}

.cart-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
}

.item-info {
	display: flex;
	flex-direction: column;
}

.item-name {
	font-size: 28rpx;
	color: #333;
}

.item-price {
	font-size: 28rpx;
	color: #ff4d4f;
	margin-top: 10rpx;
}

.item-control {
	display: flex;
	align-items: center;
}
</style>
