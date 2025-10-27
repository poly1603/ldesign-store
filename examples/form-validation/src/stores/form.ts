import { BaseStore, State, Action, Getter, Debounce } from '@ldesign/store'

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom' | 'async'
  value?: any
  message: string
  validator?: (value: any) => boolean | Promise<boolean>
}

export interface FieldState {
  value: any
  errors: string[]
  touched: boolean
  dirty: boolean
  validating: boolean
}

export interface FormConfig {
  fields: {
    [key: string]: {
      defaultValue: any
      rules: ValidationRule[]
    }
  }
  persistDraft?: boolean
}

/**
 * 表单管理 Store
 * 
 * 提供完整的表单管理功能：
 * - 字段状态管理
 * - 实时验证
 * - 异步验证
 * - 错误信息管理
 * - 表单提交处理
 * - 草稿持久化
 */
export class FormStore extends BaseStore {
  private config: FormConfig
  private initialValues: Record<string, any> = {}

  constructor(storeId: string, config: FormConfig) {
    super(storeId, {
      persist: config.persistDraft ? {
        enabled: true,
        key: `form-draft-${storeId}`,
        storage: localStorage,
        paths: ['fields'],
      } : undefined
    })

    this.config = config
    this.initializeFields()
  }

  @State({ default: {} })
  fields: Record<string, FieldState> = {}

  @State({ default: false })
  isSubmitting: boolean = false

  @State({ default: null })
  submitError: string | null = null

  @State({ default: false })
  submitSuccess: boolean = false

  // 初始化表单字段
  private initializeFields() {
    Object.entries(this.config.fields).forEach(([name, field]) => {
      this.fields[name] = {
        value: field.defaultValue,
        errors: [],
        touched: false,
        dirty: false,
        validating: false,
      }
      this.initialValues[name] = field.defaultValue
    })
  }

  // Actions - 字段操作
  @Action()
  setFieldValue(fieldName: string, value: any) {
    if (!this.fields[fieldName]) return

    this.fields[fieldName].value = value
    this.fields[fieldName].dirty = true

    // 自动验证已触摸的字段
    if (this.fields[fieldName].touched) {
      this.validateField(fieldName)
    }
  }

  @Action()
  setFieldTouched(fieldName: string, touched: boolean = true) {
    if (!this.fields[fieldName]) return

    this.fields[fieldName].touched = touched

    // 触摸后验证
    if (touched) {
      this.validateField(fieldName)
    }
  }

  @Debounce(300)
  @Action()
  async validateField(fieldName: string) {
    const fieldState = this.fields[fieldName]
    if (!fieldState) return

    const fieldConfig = this.config.fields[fieldName]
    if (!fieldConfig) return

    fieldState.errors = []
    fieldState.validating = true

    try {
      for (const rule of fieldConfig.rules) {
        const isValid = await this.validateRule(fieldState.value, rule)

        if (!isValid) {
          fieldState.errors.push(rule.message)
          break // 一次只显示一个错误
        }
      }
    } finally {
      fieldState.validating = false
    }
  }

  @Action()
  async validateAllFields(): Promise<boolean> {
    const validations = Object.keys(this.fields).map(fieldName =>
      this.validateField(fieldName)
    )

    await Promise.all(validations)

    return this.isValid
  }

  // 验证规则
  private async validateRule(value: any, rule: ValidationRule): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== ''

      case 'minLength':
        return typeof value === 'string' && value.length >= rule.value

      case 'maxLength':
        return typeof value === 'string' && value.length <= rule.value

      case 'pattern':
        return rule.value instanceof RegExp && rule.value.test(value)

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)

      case 'custom':
        if (rule.validator) {
          return rule.validator(value)
        }
        return true

      case 'async':
        if (rule.validator) {
          return await rule.validator(value)
        }
        return true

      default:
        return true
    }
  }

  // Actions - 表单操作
  @Action()
  async submit(onSubmit: (values: Record<string, any>) => Promise<any>) {
    // 触摸所有字段
    Object.keys(this.fields).forEach(fieldName => {
      this.setFieldTouched(fieldName, true)
    })

    // 验证所有字段
    const isValid = await this.validateAllFields()

    if (!isValid) {
      return { success: false, error: '表单验证失败' }
    }

    this.isSubmitting = true
    this.submitError = null
    this.submitSuccess = false

    try {
      const values = this.getValues()
      await onSubmit(values)

      this.submitSuccess = true
      return { success: true }
    } catch (err) {
      this.submitError = err instanceof Error ? err.message : '提交失败'
      return { success: false, error: this.submitError }
    } finally {
      this.isSubmitting = false
    }
  }

  @Action()
  reset() {
    Object.entries(this.initialValues).forEach(([fieldName, value]) => {
      if (this.fields[fieldName]) {
        this.fields[fieldName].value = value
        this.fields[fieldName].errors = []
        this.fields[fieldName].touched = false
        this.fields[fieldName].dirty = false
        this.fields[fieldName].validating = false
      }
    })

    this.submitError = null
    this.submitSuccess = false
  }

  @Action()
  setValues(values: Record<string, any>) {
    Object.entries(values).forEach(([fieldName, value]) => {
      if (this.fields[fieldName]) {
        this.setFieldValue(fieldName, value)
      }
    })
  }

  // Getters
  @Getter()
  get isValid(): boolean {
    return Object.values(this.fields).every(field => field.errors.length === 0)
  }

  @Getter()
  get isInvalid(): boolean {
    return !this.isValid
  }

  @Getter()
  get isPristine(): boolean {
    return Object.values(this.fields).every(field => !field.dirty)
  }

  @Getter()
  get isDirty(): boolean {
    return !this.isPristine
  }

  @Getter()
  get isTouched(): boolean {
    return Object.values(this.fields).some(field => field.touched)
  }

  @Getter()
  get isValidating(): boolean {
    return Object.values(this.fields).some(field => field.validating)
  }

  @Getter()
  get canSubmit(): boolean {
    return !this.isSubmitting && !this.isValidating && this.isDirty && this.isValid
  }

  @Getter()
  getFieldValue(fieldName: string): any {
    return this.fields[fieldName]?.value
  }

  @Getter()
  getFieldErrors(fieldName: string): string[] {
    return this.fields[fieldName]?.errors || []
  }

  @Getter()
  hasFieldError(fieldName: string): boolean {
    return this.getFieldErrors(fieldName).length > 0
  }

  @Getter()
  shouldShowError(fieldName: string): boolean {
    const field = this.fields[fieldName]
    return field && field.touched && field.errors.length > 0
  }

  getValues(): Record<string, any> {
    const values: Record<string, any> = {}

    Object.entries(this.fields).forEach(([fieldName, field]) => {
      values[fieldName] = field.value
    })

    return values
  }
}

// 工厂函数
export function createFormStore(storeId: string, config: FormConfig) {
  return new FormStore(storeId, config)
}

