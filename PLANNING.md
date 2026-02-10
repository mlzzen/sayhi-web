# SayHi 前端 - Todo List

> 最后更新：2026-02-10

## 技术栈
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- WebSocket (STOMP over SockJS)

---

## Todo

### Phase 1: 用户系统（注册/登录/JWT） ✅ DONE
- [x] 创建登录页面
- [x] 创建注册页面
- [x] 实现 AuthContext 状态管理
- [x] 配置路由保护

---

### Phase 2: 好友系统 ✅ DONE
- [x] 创建通讯录页面
- [x] 创建搜索用户页面
- [x] 创建好友请求通知组件

---

### Phase 3: 单聊消息（WebSocket） ✅ DONE
- [x] 创建聊天列表页面
- [x] 实现 WebSocket 连接管理
- [x] 创建聊天窗口组件
- [x] 实现消息实时渲染

---

### Phase 4: 群聊
- [ ] 创建群聊管理页面
- [ ] 复用聊天窗口支持群聊模式

---

### Phase 5: 文件服务
- [ ] 实现头像上传功能
- [ ] 实现图片消息发送

---

## 页面结构
- `/login` - 登录页
- `/register` - 注册页
- `/` (Home) - 主页面（含导航）
  - 通讯录
  - 添加好友
  - 消息（聊天列表 + 聊天窗口）

## 组件
- `AuthProvider` - 认证状态管理
- `FriendProvider` - 好友状态管理
- `ChatProvider` - 聊天状态管理
- `ProtectedRoute` - 路由保护
- `FriendRequestNotification` - 好友请求通知

---

## 服务端口
| 服务 | 端口 |
|------|------|
| web | 5173 |
| backend-kotlin | 8080 |
