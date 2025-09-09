# 使用示例

现在你可以在任何组件中使用全局状态：

```typescript
import { useAppStore } from '@/lib/stores/app-store'

export function ExampleComponent() {
  const { userDID, currentDataSpaceId } = useAppStore()
  
  const callAPI = async () => {
    if (!userDID || !currentDataSpaceId) {
      console.log('用户信息或数据空间未初始化')
      return
    }

    const response = await fetch(`/api/some-endpoint?userDID=${userDID}&dataSpaceId=${currentDataSpaceId}`)
    const data = await response.json()
    return data
  }

  return (
    <div>
      <p>当前用户 DID: {userDID || '未设置'}</p>
      <p>当前数据空间 ID: {currentDataSpaceId || '未选择'}</p>
      <button onClick={callAPI}>调用 API</button>
    </div>
  )
}
```

## 主要功能

1. **自动持久化**: userDID 和 currentDataSpaceId 会自动保存到 localStorage
2. **客户端环境变量**: USER_DID 通过 `NEXT_PUBLIC_USER_DID` 环境变量获取
3. **全局访问**: 在任何组件中都可以轻松获取这两个关键参数
4. **类型安全**: 完整的 TypeScript 类型支持

## 环境变量配置

在 `.env` 或 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_USER_DID=your_did_here
```

## 注意事项

⚠️ **安全警告**: 
- `NEXT_PUBLIC_` 前缀的环境变量会暴露在客户端代码中
- 任何人都可以在浏览器开发者工具中查看这些值
- 确保不要在 `NEXT_PUBLIC_USER_DID` 中放置敏感信息

## 使用流程

1. 应用启动时自动初始化用户 DID
2. 用户切换数据空间时自动更新全局状态
3. 状态自动持久化到 localStorage