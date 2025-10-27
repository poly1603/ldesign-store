import { BaseStore, State, Action, Getter, Cache, Debounce } from '@ldesign/store'

export interface PaginationItem {
  id: string
  title: string
  description: string
  author: string
  createdAt: string
  tags: string[]
}

export interface PaginationParams {
  page: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 分页列表 Store
 * 
 * 提供完整的分页功能，包括：
 * - 数据加载和缓存
 * - 分页控制
 * - 搜索和筛选
 * - 排序
 * - 加载状态管理
 */
export class PaginationStore extends BaseStore {
  constructor(storeId: string) {
    super(storeId, {
      persist: {
        enabled: true,
        key: `pagination-${storeId}`,
        storage: sessionStorage,
        paths: ['currentPage', 'pageSize', 'searchQuery', 'sortBy', 'sortOrder'],
      }
    })
  }

  // State - 数据
  @State({ default: [] })
  items: PaginationItem[] = []

  @State({ default: 0 })
  total: number = 0

  // State - 分页参数
  @State({ default: 1 })
  currentPage: number = 1

  @State({ default: 10 })
  pageSize: number = 10

  // State - 搜索和筛选
  @State({ default: '' })
  searchQuery: string = ''

  @State({ default: {} })
  filters: Record<string, any> = {}

  // State - 排序
  @State({ default: 'createdAt' })
  sortBy: string = 'createdAt'

  @State({ default: 'desc' })
  sortOrder: 'asc' | 'desc' = 'desc'

  // State - 状态
  @State({ default: false })
  isLoading: boolean = false

  @State({ default: null })
  error: string | null = null

  @State({ default: null })
  lastUpdated: number | null = null

  // Actions - 数据加载
  @Action()
  async fetchItems() {
    this.isLoading = true
    this.error = null

    try {
      const params: PaginationParams = {
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchQuery,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        filters: this.filters,
      }

      const result = await this.loadData(params)

      this.items = result.items
      this.total = result.total
      this.lastUpdated = Date.now()

      return { success: true }
    } catch (err) {
      this.error = err instanceof Error ? err.message : '加载失败'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  @Action()
  async refresh() {
    return this.fetchItems()
  }

  // Actions - 分页控制
  @Action()
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return
    }

    this.currentPage = page
    await this.fetchItems()
  }

  @Action()
  async nextPage() {
    if (this.hasNextPage) {
      await this.goToPage(this.currentPage + 1)
    }
  }

  @Action()
  async prevPage() {
    if (this.hasPrevPage) {
      await this.goToPage(this.currentPage - 1)
    }
  }

  @Action()
  async setPageSize(size: number) {
    this.pageSize = size
    this.currentPage = 1 // 重置到第一页
    await this.fetchItems()
  }

  // Actions - 搜索和筛选
  @Debounce(500) // 防抖 500ms
  @Action()
  async search(query: string) {
    this.searchQuery = query
    this.currentPage = 1 // 重置到第一页
    await this.fetchItems()
  }

  @Action()
  async setFilters(filters: Record<string, any>) {
    this.filters = filters
    this.currentPage = 1 // 重置到第一页
    await this.fetchItems()
  }

  @Action()
  async clearFilters() {
    this.filters = {}
    this.searchQuery = ''
    this.currentPage = 1
    await this.fetchItems()
  }

  // Actions - 排序
  @Action()
  async setSorting(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
    this.sortBy = sortBy
    this.sortOrder = sortOrder
    await this.fetchItems()
  }

  @Action()
  async toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    await this.fetchItems()
  }

  // Getters
  @Getter()
  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize)
  }

  @Getter()
  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages
  }

  @Getter()
  get hasPrevPage(): boolean {
    return this.currentPage > 1
  }

  @Getter()
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize
  }

  @Getter()
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.total)
  }

  @Getter()
  get isEmpty(): boolean {
    return this.items.length === 0
  }

  @Getter()
  get hasFilters(): boolean {
    return Object.keys(this.filters).length > 0 || this.searchQuery !== ''
  }

  @Cache({ ttl: 5000 })
  @Getter()
  get pageNumbers(): number[] {
    const pages: number[] = []
    const maxVisible = 7 // 最多显示7个页码
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, this.currentPage - halfVisible)
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  // 私有方法 - 模拟数据加载
  private async loadData(params: PaginationParams): Promise<PaginationResult<PaginationItem>> {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据生成
    const allItems = this.generateMockData(1000)

    // 应用搜索
    let filteredItems = allItems
    if (params.search) {
      const query = params.search.toLowerCase()
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query)
      )
    }

    // 应用筛选
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredItems = filteredItems.filter(item =>
            item[key as keyof PaginationItem] === value
          )
        }
      })
    }

    // 应用排序
    if (params.sortBy) {
      filteredItems.sort((a, b) => {
        const aVal = a[params.sortBy as keyof PaginationItem]
        const bVal = b[params.sortBy as keyof PaginationItem]

        if (aVal < bVal) return params.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return params.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    // 应用分页
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    const items = filteredItems.slice(start, end)

    return {
      items,
      total: filteredItems.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredItems.length / params.pageSize),
    }
  }

  private generateMockData(count: number): PaginationItem[] {
    const items: PaginationItem[] = []
    const authors = ['张三', '李四', '王五', '赵六', '钱七']
    const tags = ['技术', '生活', '旅游', '美食', '音乐', '电影']

    for (let i = 1; i <= count; i++) {
      items.push({
        id: `item-${i}`,
        title: `文章标题 ${i}`,
        description: `这是第 ${i} 篇文章的描述内容...`,
        author: authors[Math.floor(Math.random() * authors.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [tags[Math.floor(Math.random() * tags.length)]],
      })
    }

    return items
  }
}

export const usePaginationStore = (storeId = 'pagination') =>
  new PaginationStore(storeId)

