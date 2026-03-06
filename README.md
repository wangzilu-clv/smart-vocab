# SmartVocab - 智能背单词 APP

一款基于 Expo (React Native) 开发的智能背单词应用，通过智能推荐算法帮助用户更高效地学习英语单词。

## ✨ 核心功能

### 1. 基础功能
- 📚 **单词卡片** - 美观的卡片展示，包含音标、释义、例句
- 🎯 **学习/复习模式** - 支持新词学习和复习巩固
- 🔥 **打卡记录** - 连续学习天数统计
- 📊 **学习统计** - 学习进度可视化
- 📖 **词库管理** - 按分类浏览所有单词

### 2. 创新功能：智能推荐算法
- **词根词缀关联** - 学过 "unhappy"，自动推荐 "unfair", "unknown"
- **主题关联** - 学过 "apple", "banana"，推荐其他水果类单词
- **难度递进** - 从简单到复杂逐步推荐
- **使用场景** - 根据偏好推荐（商务、旅游、学术、科技）
- **遗忘曲线复习** - 基于艾宾浩斯遗忘曲线智能安排复习

## 🛠 技术栈

- React Native + Expo
- TypeScript
- AsyncStorage (本地存储)
- React Navigation (导航)
- Expo Linear Gradient (渐变效果)

## 📁 项目结构

```
smart-vocab/
├── App.tsx                      # 应用入口
├── package.json                 # 依赖配置
├── tsconfig.json               # TypeScript 配置
├── app.json                    # Expo 配置
├── src/
│   ├── components/             # 可复用组件
│   │   ├── WordCard.tsx       # 单词卡片
│   │   ├── ActionButtons.tsx  # 操作按钮
│   │   ├── ProgressBar.tsx    # 进度条
│   │   └── StatCard.tsx       # 统计卡片
│   ├── screens/               # 页面组件
│   │   ├── HomeScreen.tsx     # 首页
│   │   ├── StudyScreen.tsx    # 学习页面
│   │   ├── DictionaryScreen.tsx # 词库页面
│   │   ├── StatisticsScreen.tsx # 统计页面
│   │   ├── WordDetailScreen.tsx # 单词详情
│   │   └── ProfileScreen.tsx  # 个人中心
│   ├── navigation/            # 导航配置
│   │   └── AppNavigator.tsx   # 应用导航
│   ├── types/                 # TypeScript 类型
│   │   └── index.ts
│   ├── data/                  # 数据
│   │   └── vocabulary.ts      # 单词数据
│   └── utils/                 # 工具函数
│       ├── storage.ts         # 本地存储
│       └── recommendation.ts  # 智能推荐算法
└── assets/                    # 静态资源
    ├── icon.png
    ├── splash.png
    └── ...
```

## 🚀 运行方法

### 前置要求
- Node.js 16+ 
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go App (iOS/Android)

### 安装依赖

```bash
cd smart-vocab
npm install
```

### 启动开发服务器

```bash
npm start
# 或
expo start
```

### 在手机上运行

1. 确保手机和电脑在同一 WiFi 网络
2. 打开 Expo Go App
3. 扫描二维码或输入 URL
4. 开始体验 SmartVocab!

### 在模拟器上运行

```bash
# iOS (需要 macOS)
npm run ios

# Android
npm run android
```

## 📱 主要功能演示

### 1. 首页
- 显示学习统计（已学单词、连续学习天数等）
- 快速开始学习或复习
- 每日目标进度追踪

### 2. 学习模式
- 卡片式学习界面
- 支持翻转查看释义
- 三级难度反馈（认识/模糊/不认识）
- 智能提示词根词缀

### 3. 复习模式
- 基于遗忘曲线算法
- 优先复习掌握度低的单词
- 自动安排复习间隔

### 4. 词库
- 分类浏览（日常/学术/商务/旅游/科技）
- 搜索功能
- 学习状态标记

### 5. 统计
- 学习趋势图表
- 学习成就系统
- 详细数据统计

### 6. 个人设置
- 每日学习目标设置
- 难度偏好
- 分类偏好
- 学习提醒开关

## 🔬 智能推荐算法详解

推荐算法综合考虑以下因素：

1. **词根词缀关联 (30%)**
   - 分析已学单词的词根、前缀、后缀
   - 推荐具有相同词根词缀的新单词

2. **主题关联 (25%)**
   - 根据已学单词的主题
   - 推荐同一主题下的相关单词

3. **难度递进 (20%)**
   - 新手优先推荐简单单词
   - 随着学习进度逐步增加难度

4. **场景偏好 (15%)**
   - 根据用户设置的使用场景偏好
   - 优先推荐相关分类单词

5. **多样性 (10%)**
   - 避免连续推荐同主题单词
   - 保证学习内容的多样性

## 📝 词库说明

当前版本包含 40 个示例单词，涵盖：
- 日常词汇 (日常)
- 学术词汇 (学术)
- 商务词汇 (商务)
- 旅游词汇 (旅游)
- 科技词汇 (科技)

每个单词包含：
- 音标
- 中文释义
- 例句（中英对照）
- 难度等级
- 词根/前缀/后缀（如有）
- 分类和主题标签

## 🔮 未来规划

- [ ] 导入更多单词数据
- [ ] 发音功能（TTS）
- [ ] 生词本功能
- [ ] 学习小组/排行榜
- [ ] AI 智能例句生成
- [ ] 单词测试模式

## 📄 License

MIT License

---

Made with ❤️ by DevAgent
