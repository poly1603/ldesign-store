# 购物车示例

完整的电商购物车实现，展示如何在实际项目中使用 @ldesign/store。

## 功能特性

- ✅ 添加/移除商品
- ✅ 修改商品数量
- ✅ 计算总价
- ✅ 优惠券支持
- ✅ 库存检查
- ✅ 持久化购物车
- ✅ 结算流程

## Store 实现

```typescript
import { BaseStore, State, Action, Getter, Cache } from '@ldesign/store'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  thumbnail: string
  maxQuantity: number // 库存数量
}

export interface Coupon {
  code: string
  discount: number // 折扣金额或百分比
  type: 'fixed' | 'percent'
  minAmount: number // 最低消费金额
}

export class ShoppingCartStore extends BaseStore {
  constructor() {
    super('shopping-cart', {
      persist: {
        enabled: true,
        key: 'shopping-cart',
        storage: localStorage,
        paths: ['items', 'appliedCoupon'],
      }
    })
  }

  @State({ default: [] })
  items: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  @State({ default: false })
  isCheckingOut: boolean = false

  @State({ default: null })
  checkoutError: string | null = null

  // Actions - 商品管理
  @Action()
  addItem(product: {
    id: string
    name: string
    price: number
    thumbnail: string
    maxQuantity: number
  }) {
    const existingItem = this.items.find(item => item.productId === product.id)

    if (existingItem) {
      // 商品已存在，增加数量
      if (existingItem.quantity < existingItem.maxQuantity) {
        existingItem.quantity++
      } else {
        throw new Error('超出库存数量')
      }
    } else {
      // 添加新商品
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        thumbnail: product.thumbnail,
        maxQuantity: product.maxQuantity,
      }
      this.items.push(newItem)
    }
  }

  @Action()
  removeItem(itemId: string) {
    this.items = this.items.filter(item => item.id !== itemId)
  }

  @Action()
  updateQuantity(itemId: string, quantity: number) {
    const item = this.items.find(item => item.id === itemId)
    
    if (!item) return

    // 检查数量范围
    if (quantity <= 0) {
      this.removeItem(itemId)
      return
    }

    if (quantity > item.maxQuantity) {
      throw new Error('超出库存数量')
    }

    item.quantity = quantity
  }

  @Action()
  incrementQuantity(itemId: string) {
    const item = this.items.find(item => item.id === itemId)
    if (item && item.quantity < item.maxQuantity) {
      item.quantity++
    }
  }

  @Action()
  decrementQuantity(itemId: string) {
    const item = this.items.find(item => item.id === itemId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        this.removeItem(itemId)
      }
    }
  }

  @Action()
  clear() {
    this.items = []
    this.appliedCoupon = null
  }

  // Actions - 优惠券
  @Action()
  async applyCoupon(code: string) {
    // 模拟验证优惠券
    try {
      const coupon = await this.validateCoupon(code)
      
      if (this.subtotal < coupon.minAmount) {
        throw new Error(`最低消费金额为 ¥${coupon.minAmount}`)
      }

      this.appliedCoupon = coupon
      return { success: true, coupon }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '优惠券无效' 
      }
    }
  }

  @Action()
  removeCoupon() {
    this.appliedCoupon = null
  }

  private async validateCoupon(code: string): Promise<Coupon> {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟优惠券数据
    const coupons: Record<string, Coupon> = {
      'SAVE10': {
        code: 'SAVE10',
        discount: 10,
        type: 'percent',
        minAmount: 0,
      },
      'SAVE50': {
        code: 'SAVE50',
        discount: 50,
        type: 'fixed',
        minAmount: 200,
      },
    }

    const coupon = coupons[code.toUpperCase()]
    if (!coupon) {
      throw new Error('优惠券不存在')
    }

    return coupon
  }

  // Actions - 结算
  @Action()
  async checkout() {
    if (this.isEmpty) {
      throw new Error('购物车为空')
    }

    this.isCheckingOut = true
    this.checkoutError = null

    try {
      // 再次检查库存
      for (const item of this.items) {
        const available = await this.checkStock(item.productId)
        if (item.quantity > available) {
          throw new Error(`${item.name} 库存不足`)
        }
      }

      // 创建订单
      const order = await this.createOrder()

      // 清空购物车
      this.clear()

      return { success: true, order }
    } catch (error) {
      this.checkoutError = error instanceof Error ? error.message : '结算失败'
      return { success: false, error: this.checkoutError }
    } finally {
      this.isCheckingOut = false
    }
  }

  private async checkStock(productId: string): Promise<number> {
    // 模拟检查库存
    await new Promise(resolve => setTimeout(resolve, 200))
    return 100 // 模拟库存数量
  }

  private async createOrder() {
    // 模拟创建订单
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      id: `order-${Date.now()}`,
      items: this.items,
      subtotal: this.subtotal,
      discount: this.discountAmount,
      total: this.total,
      coupon: this.appliedCoupon,
      createdAt: new Date().toISOString(),
    }
  }

  // Getters
  @Getter()
  get isEmpty(): boolean {
    return this.items.length === 0
  }

  @Getter()
  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount(): number {
    if (!this.appliedCoupon) return 0

    if (this.appliedCoupon.type === 'fixed') {
      return this.appliedCoupon.discount
    } else {
      return this.subtotal * (this.appliedCoupon.discount / 100)
    }
  }

  @Getter()
  get total(): number {
    return Math.max(0, this.subtotal - this.discountAmount)
  }

  @Getter()
  get hasDiscount(): boolean {
    return this.appliedCoupon !== null && this.discountAmount > 0
  }

  @Cache({ ttl: 1000 })
  @Getter()
  get itemsByCategory(): Record<string, CartItem[]> {
    // 按类别分组（这里简化了，实际应该从商品信息中获取类别）
    return {
      all: this.items
    }
  }
}

export const useShoppingCart = () => new ShoppingCartStore()
```

## 组件使用

### 购物车列表

```vue
<script setup lang="ts">
import { useShoppingCart } from '@/stores/shopping-cart'

const cart = useShoppingCart()

const handleQuantityChange = (itemId: string, quantity: number) => {
  try {
    cart.updateQuantity(itemId, quantity)
  } catch (error) {
    alert(error.message)
  }
}

const handleRemove = (itemId: string) => {
  if (confirm('确定要移除该商品吗？')) {
    cart.removeItem(itemId)
  }
}
</script>

<template>
  <div class="shopping-cart">
    <div v-if="cart.isEmpty" class="empty-cart">
      <p>购物车是空的</p>
      <router-link to="/products">去购物</router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div 
          v-for="item in cart.items" 
          :key="item.id"
          class="cart-item"
        >
          <img :src="item.thumbnail" :alt="item.name" />
          
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="price">¥{{ item.price }}</p>
          </div>

          <div class="quantity-control">
            <button @click="cart.decrementQuantity(item.id)">-</button>
            <input 
              type="number" 
              :value="item.quantity"
              @change="e => handleQuantityChange(item.id, Number(e.target.value))"
              min="1"
              :max="item.maxQuantity"
            />
            <button @click="cart.incrementQuantity(item.id)">+</button>
          </div>

          <div class="item-total">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <button 
            class="remove-button"
            @click="handleRemove(item.id)"
          >
            删除
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>订单摘要</h3>
        
        <div class="summary-row">
          <span>小计 ({{ cart.itemCount }} 件商品)</span>
          <span>¥{{ cart.subtotal.toFixed(2) }}</span>
        </div>

        <div v-if="cart.hasDiscount" class="summary-row discount">
          <span>优惠 ({{ cart.appliedCoupon?.code }})</span>
          <span>-¥{{ cart.discountAmount.toFixed(2) }}</span>
        </div>

        <div class="summary-row total">
          <span>总计</span>
          <span>¥{{ cart.total.toFixed(2) }}</span>
        </div>

        <CouponInput />

        <button 
          class="checkout-button"
          :disabled="cart.isCheckingOut"
          @click="handleCheckout"
        >
          {{ cart.isCheckingOut ? '处理中...' : '去结算' }}
        </button>

        <button 
          class="clear-button"
          @click="handleClear"
        >
          清空购物车
        </button>
      </div>
    </div>
  </div>
</template>
```

### 优惠券输入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useShoppingCart } from '@/stores/shopping-cart'

const cart = useShoppingCart()
const couponCode = ref('')
const isApplying = ref(false)
const error = ref('')

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return

  isApplying.value = true
  error.value = ''

  const result = await cart.applyCoupon(couponCode.value)

  if (result.success) {
    couponCode.value = ''
  } else {
    error.value = result.error || '应用失败'
  }

  isApplying.value = false
}
</script>

<template>
  <div class="coupon-input">
    <div v-if="cart.appliedCoupon" class="applied-coupon">
      <span>已应用: {{ cart.appliedCoupon.code }}</span>
      <button @click="cart.removeCoupon">移除</button>
    </div>

    <div v-else class="coupon-form">
      <input
        v-model="couponCode"
        type="text"
        placeholder="输入优惠券代码"
        @keyup.enter="applyCoupon"
      />
      <button 
        :disabled="isApplying || !couponCode.trim()"
        @click="applyCoupon"
      >
        应用
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>
```

### 商品卡片（添加到购物车）

```vue
<script setup lang="ts">
import { useShoppingCart } from '@/stores/shopping-cart'

const props = defineProps<{
  product: {
    id: string
    name: string
    price: number
    thumbnail: string
    stock: number
  }
}>()

const cart = useShoppingCart()

const addToCart = () => {
  try {
    cart.addItem({
      id: props.product.id,
      name: props.product.name,
      price: props.product.price,
      thumbnail: props.product.thumbnail,
      maxQuantity: props.product.stock,
    })
    
    // 显示成功提示
    alert('已添加到购物车')
  } catch (error) {
    alert(error.message)
  }
}

const isInCart = computed(() => 
  cart.items.some(item => item.productId === props.product.id)
)
</script>

<template>
  <div class="product-card">
    <img :src="product.thumbnail" :alt="product.name" />
    <h3>{{ product.name }}</h3>
    <p class="price">¥{{ product.price }}</p>
    <p class="stock">库存: {{ product.stock }}</p>
    
    <button 
      @click="addToCart"
      :disabled="product.stock === 0"
      :class="{ 'in-cart': isInCart }"
    >
      {{ isInCart ? '已在购物车' : '加入购物车' }}
    </button>
  </div>
</template>
```

## 特性说明

### 1. 持久化

购物车数据自动保存到 localStorage，页面刷新后数据不会丢失。

### 2. 库存检查

- 添加商品时检查库存
- 修改数量时限制最大数量
- 结算时再次验证库存

### 3. 优惠券系统

支持两种优惠券类型：
- **固定金额** - 减免固定金额
- **百分比** - 按百分比折扣

### 4. 性能优化

使用 `@Cache` 装饰器缓存计算结果，避免重复计算。

## 扩展功能

### 1. 添加收藏功能

```typescript
@State({ default: [] })
favorites: string[] = []

@Action()
toggleFavorite(productId: string) {
  const index = this.favorites.indexOf(productId)
  if (index > -1) {
    this.favorites.splice(index, 1)
  } else {
    this.favorites.push(productId)
  }
}
```

### 2. 添加商品推荐

```typescript
@Getter()
get recommendedProducts(): Product[] {
  // 基于购物车商品推荐相关商品
  return getRecommendations(this.items)
}
```

### 3. 添加批量操作

```typescript
@Action()
removeSelected(itemIds: string[]) {
  this.items = this.items.filter(item => !itemIds.includes(item.id))
}
```

## 相关示例

- [表单管理](./forms)
- [用户认证](./auth)
- [支付流程](./payment)

