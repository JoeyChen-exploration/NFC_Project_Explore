# EditorPage.jsx 重构任务文档

## 📊 项目状态

### 当前文件

- **文件路径**: `linkhub-frontend/src/pages/EditorPage.jsx`
- **当前行数**: 789行
- **主要问题**: 功能混杂，维护困难，测试困难

### 已完成工作

1. ✅ **创建了组件目录**: `src/components/editor/`
2. ✅ **创建了Hook目录**: `src/hooks/editor/`
3. ✅ **创建了EditorNav组件**: 导航栏组件
4. ✅ **创建了EditorLayout组件**: 响应式布局组件
5. ✅ **创建了useEditorState Hook**: 状态管理Hook

### 现有代码结构

```
EditorPage.jsx (789行)
├── 重复的useScreenSize函数 (应删除，使用现有的useScreenSize.js)
├── 响应式样式对象 (应提取到EditorLayout组件)
├── 导航栏逻辑 (已提取到EditorNav组件)
├── 链接管理逻辑 (待提取)
├── 主题选择逻辑 (待提取)
├── 社交链接逻辑 (待提取)
├── 资料编辑逻辑 (待提取)
├── 设置面板逻辑 (待提取)
└── 预览区域 (使用现有ProfilePreview组件)
```

## 🎯 重构目标

### 技术目标

1. **组件化**: 将789行代码拆分为多个专注组件 (每个100-150行)
2. **可测试性**: 每个组件可独立单元测试
3. **可维护性**: 清晰的组件职责和接口
4. **性能**: 减少不必要的重渲染

### 业务目标

1. **功能不变**: 保持所有现有功能
2. **用户体验**: 保持现有界面和交互
3. **扩展性**: 便于添加新功能模块

## 📁 目标组件结构

### 主组件 (重构后)

```
src/pages/EditorPage.jsx (~150行)
├── 导入所有子组件和Hook
├── 高层状态管理
├── 数据获取和初始化
├── 组件组合和渲染
└── 高层事件处理
```

### 编辑器组件 (待创建)

```
src/components/editor/
├── EditorNav.jsx              # ✅ 已完成 (导航栏)
├── EditorLayout.jsx           # ✅ 已完成 (响应式布局)
├── LinkCard.jsx               # 单条链接编辑卡片
├── LinkList.jsx               # 链接列表管理
├── ThemeSelector.jsx          # 主题选择器
├── SocialLinksEditor.jsx      # 社交链接编辑
├── ProfileEditor.jsx          # 基本资料编辑
└── SettingsPanel.jsx          # 设置面板
```

### 自定义Hook (待创建/完善)

```
src/hooks/editor/
├── useEditorState.js          # ✅ 已完成 (编辑器状态)
├── useProfileData.js          # 用户资料管理 (待创建)
├── useLinksManagement.js      # 链接CRUD操作 (待创建)
├── useThemeManagement.js      # 主题切换逻辑 (待创建)
└── useSocialLinks.js          # 社交链接管理 (待创建)
```

## 🔧 具体重构任务

### 任务1: 创建LinkCard组件

**文件**: `src/components/editor/LinkCard.jsx`

**功能**: 单条链接的编辑卡片

- 链接标签输入
- URL输入和验证
- 开关控制 (激活/停用)
- 删除按钮
- 拖拽手柄 (用于排序)

**接口**:

```jsx
<LinkCard
  link={link} // 链接对象 { id, label, url, active }
  onUpdate={updates => {}} // 更新链接回调
  onDelete={() => {}} // 删除链接回调
  isDragging={false} // 是否正在拖拽
  dragHandleProps={null} // 拖拽手柄属性
/>
```

**设计要求**:

- 响应式设计 (移动端适配)
- 输入验证 (URL格式)
- 加载状态和错误处理
- 复用现有样式和主题

### 任务2: 创建LinkList组件

**文件**: `src/components/editor/LinkList.jsx`

**功能**: 链接列表管理和排序

- 显示所有链接卡片
- 添加新链接按钮
- 拖拽排序功能
- 空状态提示

**接口**:

```jsx
<LinkList
  links={links} // 链接数组
  onLinksChange={newLinks => {}} // 链接变化回调
  onAddLink={() => {}} // 添加链接回调
  maxLinks={20} // 最大链接数
/>
```

**设计要求**:

- 支持拖拽排序 (@dnd-kit库或类似)
- 移动端触摸友好
- 链接数量限制提示
- 加载和空状态

### 任务3: 创建ThemeSelector组件

**文件**: `src/components/editor/ThemeSelector.jsx`

**功能**: 主题选择和预览

- 显示所有可用主题
- 主题预览卡片
- 主题选择功能
- 实时预览更新

**接口**:

```jsx
<ThemeSelector
  currentTheme="midnight" // 当前主题ID
  onThemeSelect={themeId => {}} // 主题选择回调
  themes={THEMES} // 主题配置数组
/>
```

**设计要求**:

- 主题预览视觉效果
- 平滑的切换动画
- 移动端网格布局
- 复用现有的THEMES常量

### 任务4: 创建SocialLinksEditor组件

**文件**: `src/components/editor/SocialLinksEditor.jsx`

**功能**: 社交账号编辑

- 各平台输入框
- 平台图标显示
- 输入验证
- 实时保存

**接口**:

```jsx
<SocialLinksEditor
  socials={socials} // 社交账号对象
  onSocialsChange={updates => {}} // 社交账号变化回调
  platforms={SOCIAL_LIST} // 支持的平台列表
/>
```

**设计要求**:

- 平台图标显示
- 输入格式验证 (URL/用户名)
- 移动端垂直布局
- 复用现有的SOCIAL_ICONS

### 任务5: 创建ProfileEditor组件

**文件**: `src/components/editor/ProfileEditor.jsx`

**功能**: 基本资料编辑

- 姓名输入
- 个人简介编辑
- 头像管理 (DiceBear)
- 嵌入URL设置

**接口**:

```jsx
<ProfileEditor
  profile={profile} // 资料对象
  onProfileChange={updates => {}} // 资料变化回调
  onAvatarChange={() => {}} // 头像变化回调
/>
```

**设计要求**:

- 头像预览和随机生成
- 简介字数统计
- 嵌入URL验证
- 移动端表单布局

### 任务6: 创建SettingsPanel组件

**文件**: `src/components/editor/SettingsPanel.jsx`

**功能**: 账户设置

- 密码修改表单
- 账户信息显示
- 登出功能
- 危险操作确认

**接口**:

```jsx
<SettingsPanel
  user={user} // 用户信息
  onChangePassword={data => {}} // 修改密码回调
  onLogout={() => {}} // 登出回调
/>
```

**设计要求**:

- 密码强度验证
- 操作确认对话框
- 移动端适配
- 错误信息显示

### 任务7: 创建自定义Hook

#### 7.1 useProfileData Hook

**文件**: `src/hooks/editor/useProfileData.js`

**功能**: 用户资料数据管理

- 资料获取和缓存
- 资料更新和保存
- 头像管理逻辑
- 错误状态处理

#### 7.2 useLinksManagement Hook

**文件**: `src/hooks/editor/useLinksManagement.js`

**功能**: 链接数据管理

- 链接列表状态
- 链接CRUD操作
- 链接排序逻辑
- 链接验证和格式化

#### 7.3 useThemeManagement Hook

**文件**: `src/hooks/editor/useThemeManagement.js`

**功能**: 主题数据管理

- 当前主题状态
- 主题切换逻辑
- 主题配置管理
- 主题预览更新

#### 7.4 useSocialLinks Hook

**文件**: `src/hooks/editor/useSocialLinks.js`

**功能**: 社交链接数据管理

- 社交账号状态
- 平台验证逻辑
- 输入格式化
- 批量更新处理

### 任务8: 重构EditorPage主组件

**文件**: `src/pages/EditorPage.jsx`

**步骤**:

1. 删除重复的useScreenSize函数
2. 删除内联的响应式样式对象
3. 导入所有新组件和Hook
4. 重构状态管理逻辑
5. 更新组件渲染结构
6. 确保所有功能正常工作

**目标代码结构**:

```jsx
// EditorPage.jsx (重构后)
import { useEditorState, useEditorData } from '../hooks/editor/useEditorState';
import { useProfileData } from '../hooks/editor/useProfileData';
import { useLinksManagement } from '../hooks/editor/useLinksManagement';
import { useThemeManagement } from '../hooks/editor/useThemeManagement';
import { useSocialLinks } from '../hooks/editor/useSocialLinks';
import { useScreenSize } from '../hooks/useScreenSize';

// 导入组件
import EditorNav from '../components/editor/EditorNav';
import EditorLayout from '../components/editor/EditorLayout';
import LinkList from '../components/editor/LinkList';
import ThemeSelector from '../components/editor/ThemeSelector';
import SocialLinksEditor from '../components/editor/SocialLinksEditor';
import ProfileEditor from '../components/editor/ProfileEditor';
import SettingsPanel from '../components/editor/SettingsPanel';
import ProfilePreview from '../components/ProfilePreview';

export default function EditorPage() {
  // 使用自定义Hook管理状态
  const editorState = useEditorState();
  const editorData = useEditorData();
  const profileData = useProfileData();
  const linksManagement = useLinksManagement();
  const themeManagement = useThemeManagement();
  const socialLinks = useSocialLinks();
  const screenSize = useScreenSize();

  // 渲染逻辑
  return (
    <div style={containerStyle}>
      <EditorNav {...editorState.navProps} />
      <EditorLayout
        leftPanel={renderLeftPanel()}
        rightPanel={<ProfilePreview {...previewProps} />}
      />
    </div>
  );
}
```

## 🎯 实施要求

### 代码质量要求

1. **组件单一职责**: 每个组件只负责一个明确的功能
2. **可测试性**: 组件接口清晰，便于单元测试
3. **类型安全**: 使用PropTypes或TypeScript定义接口
4. **错误处理**: 完善的错误边界和用户提示
5. **性能优化**: 使用React.memo、useCallback、useMemo优化

### 用户体验要求

1. **功能不变**: 所有现有功能必须保持
2. **界面一致**: 视觉样式和交互保持一致
3. **响应式设计**: 移动端体验不能下降
4. **加载状态**: 所有异步操作有加载提示
5. **错误恢复**: 用户友好的错误提示和恢复

### 开发规范要求

1. **代码风格**: 遵循现有ESLint和Prettier配置
2. **文件命名**: 组件使用PascalCase，Hook使用camelCase
3. **注释文档**: 每个组件和Hook有清晰的注释
4. **提交规范**: 使用语义化提交消息
5. **测试覆盖**: 关键功能有基本测试

## 🚀 实施步骤

### 阶段1: 创建基础组件 (2-3小时)

1. 创建LinkCard、LinkList组件
2. 创建ThemeSelector组件
3. 创建SocialLinksEditor组件
4. 创建ProfileEditor、SettingsPanel组件

### 阶段2: 创建自定义Hook (1-2小时)

1. 创建useProfileData Hook
2. 创建useLinksManagement Hook
3. 创建useThemeManagement Hook
4. 创建useSocialLinks Hook

### 阶段3: 重构主组件 (1-2小时)

1. 更新EditorPage.jsx导入
2. 重构状态管理逻辑
3. 更新组件渲染结构
4. 确保功能完整性

### 阶段4: 测试和优化 (1小时)

1. 功能完整性测试
2. 性能测试和优化
3. 移动端体验测试
4. 代码质量检查

## 📋 验收标准

### 功能验收

- [ ] 所有现有编辑功能正常工作
- [ ] 数据保存和加载正确
- [ ] 移动端响应式正常
- [ ] 错误处理完善

### 代码验收

- [ ] 每个组件不超过150行代码
- [ ] 自定义Hook逻辑清晰
- [ ] 通过ESLint检查
- [ ] 代码注释完整

### 性能验收

- [ ] 页面加载时间不增加
- [ ] 交互响应流畅
- [ ] 内存使用合理
- [ ] 无不必要的重渲染

### 用户体验验收

- [ ] 界面视觉保持一致
- [ ] 交互体验不下降
- [ ] 移动端体验良好
- [ ] 错误提示友好

## 🔧 技术参考

### 现有代码参考

1. **NfcPage.jsx**: 参考其组件化结构
2. **useScreenSize.js**: 参考自定义Hook设计
3. **THEMES常量**: 主题配置参考
4. **SOCIAL_ICONS**: 社交图标参考

### 第三方库参考

1. **拖拽排序**: 考虑使用@dnd-kit库
2. **表单验证**: 使用现有验证工具
3. **图标库**: 复用现有图标系统

### 性能优化参考

1. **React.memo**: 避免不必要的重渲染
2. **useCallback**: 稳定回调函数引用
3. **useMemo**: 缓存计算结果
4. **代码分割**: 考虑组件懒加载

## 🎯 成功指标

### 技术指标

1. **代码行数**: EditorPage从789行减少到150行左右
2. **组件数量**: 拆分为8个专注组件
3. **Hook数量**: 创建5个专用自定义Hook
4. **测试覆盖率**: 关键组件有基本测试

### 业务指标

1. **功能完整性**: 100%现有功能保持
2. **用户体验**: 用户感知不到重构变化
3. **开发效率**: 新功能开发速度提升
4. **bug数量**: 重构后bug数量不增加

### 团队指标

1. **可协作性**: 多人可同时开发不同组件
2. **可维护性**: 问题定位和修复更快速
3. **知识传递**: 新成员更容易理解代码
4. **技术债务**: 代码结构更健康

## 💡 风险控制

### 技术风险

1. **功能丢失**: 逐步替换，频繁测试
2. **性能下降**: 性能监控和优化
3. **兼容性问题**: 全面测试不同设备和浏览器
4. **状态管理混乱**: 清晰的Hook设计和数据流

### 项目风险

1. **时间超支**: 分阶段实施，随时可暂停
2. **质量下降**: 严格的代码审查和测试
3. **团队协作**: 清晰的接口定义和文档
4. **用户影响**: 选择低峰期部署，准备回滚方案

### 应对策略

1. **渐进式重构**: 不要一次性重写所有代码
2. **版本控制**: 每个阶段单独提交，便于回退
3. **持续测试**: 自动化测试和手动测试结合
4. **用户反馈**: 让真实用户测试重构版本

## 🚀 开始实施

### 准备工作

1. **备份当前代码**
2. **创建Git分支**: `git checkout -b refactor/editorpage`
3. **启动开发环境**: `./start-linkhub.sh`
4. **验证现有功能**: 确保重构前一切正常

### 实施顺序

1. **先创建组件**: 从最简单的组件开始
2. **再创建Hook**: 提取通用逻辑
3. **逐步替换**: 一个一个功能模块替换
4. **频繁测试**: 每完成一个组件立即测试

### 监控指标

1. **功能测试**: 手动测试所有编辑功能
2. **性能监控**: 使用React DevTools分析性能
3. **代码质量**: 运行ESLint和类型检查
4. **用户体验**: 收集真实用户反馈

---

**任务创建时间**: 2026-04-19  
**预计完成时间**: 5-8小时 (分阶段实施)  
**优先级**: 高 (提高代码质量和可维护性)

**开始执行**: 请按照上述任务要求，逐步实施EditorPage重构。
