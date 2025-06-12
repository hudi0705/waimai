<template>
	<view class="content">
		<button class="button" @click="login()">点击开启点餐之旅——></button>
	</view>
	<view class="tabbar">
<view>首页</view>
<view @click="goto()">订单</view>
<view>我的</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			title: 'Hello'
		}
	},
	onLoad() {

	},
	methods: {
		goto(){
			uni.navigateTo({
				url:'/pages/list/list'
			})
		},
		login() {
			uni.login({
				provider: 'weixin',
				success: (loginRes) => {
					console.log(loginRes.code);
					uni.request({
						url: 'http://localhost/api/user/login',
						data: {
							js_code: loginRes.code
						},
						method: 'GET',
						success: (res) => {
							console.log(res.data);
							uni.navigateTo({
								url: '/pages/home/home'
							})
							console.log('登录成功');
						},
						fail: (err) => {
							console.error('登录请求失败', err);
							uni.showToast({
								title: '登录失败，请重试',
								icon: 'none'
							})
						}
					})
				},
				fail: (err) => {
					console.error('获取微信登录code失败', err);
					uni.showToast({
						title: '获取登录凭证失败',
						icon: 'none'
					})
				}
			})
		}
	},
	mounted() {
	
	}
}
</script>

<style>
.tabbar {
	width: 100%;
	height: 10vh;
	background-color: whitesmoke;
	display: flex;
	justify-content: space-evenly;
	align-items: center;
}

.button {
	border-radius: 40rpx;
	background-color: #ff9c35;
	color: white;
}

.content {
	width: 100%;
	height: 90vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.logo {
	height: 200rpx;
	width: 200rpx;
	margin-top: 200rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
}

.text-area {
	display: flex;
	justify-content: center;
}

.title {
	font-size: 36rpx;
	color: #8f8f94;
}
</style>
