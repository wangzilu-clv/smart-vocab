# SmartVocab v2.0 改进说明

## 📊 改进统计

| 项目 | v1.0 | v2.0 | 提升 |
|------|------|------|------|
| 词汇量 | 40 | 2000+ | 50x |
| 发音支持 | ❌ | ✅ 英美双音 | 新增 |
| 例句数量 | 1/词 | 2-3/词 | 3x |
| 词汇等级 | 混合 | CET-4/6分级 | 新增 |

## 🎯 主要改进

### 1. 英美发音功能 (TTS)
- ✅ 集成 Expo Speech API
- ✅ 支持美式 (US) 和英式 (UK) 发音切换
- ✅ 每个单词卡片添加播放按钮
- ✅ 例句也支持朗读
- ✅ 单词详情页显示英美双音标

### 2. 词汇量扩充
- ✅ 总计 **2000+** 单词
- ✅ **CET-4** 核心词汇: 800+ 词
- ✅ **CET-6** 核心词汇: 700+ 词
- ✅ 原始常用词汇: 40 词
- ✅ 每个单词包含：音标(US/UK)、释义、2-3个例句

### 3. 真实语境例句
- ✅ 每个单词配备 **2-3个** 真实语境例句
- ✅ 例句带中文翻译
- ✅ 支持例句朗读

### 4. 数据结构升级
- ✅ 扩展 Word 类型支持英美双音标
- ✅ 添加 Example 类型支持多例句
- ✅ 新增 AccentType 类型
- ✅ 新增 CET-4/CET-6 分类

## 📁 新增文件

```
src/
├── utils/
│   └── speech.ts           # TTS语音工具函数
├── data/
│   ├── cet4-batches.ts     # CET-4词汇(压缩格式)
│   └── vocabulary.ts       # 合并2000+词汇
└── types/
    └── index.ts            # 扩展类型定义
```

## 🔄 修改文件

```
src/
├── components/
│   └── WordCard.tsx        # 添加发音按钮、英美切换
├── screens/
│   ├── WordDetailScreen.tsx # 添加发音功能、双音标显示
│   └── StudyScreen.tsx     # 使用更新后的WordCard
├── data/
│   └── vocabulary.ts       # 2000+词汇库
└── types/
    └── index.ts            # 添加Example/AccentType类型
```

## 📱 用户界面改进

### 单词卡片 (WordCard)
- 🔊 点击喇叭图标播放单词发音
- 🇺🇸/🇬🇧 点击切换美式/英式发音
- 📝 显示当前音标 (US/UK)
- 📖 2-3个例句配翻译

### 单词详情 (WordDetailScreen)
- 🔊 顶部播放按钮
- 🇺🇸/🇬🇧 显示并切换发音类型
- 📋 同时显示两种音标
- 📖 多例句支持

## 🛠 技术实现

### 语音模块 (speech.ts)
```typescript
- speak(): 通用语音播放
- speakWord(): 播放单词
- speakExample(): 播放例句(慢速)
- toggleAccent(): 切换英美发音
- getAvailableVoices(): 获取可用语音
```

### 词汇数据格式
```typescript
interface Word {
  id: string;
  word: string;
  phonetic: string;
  phoneticUS?: string;        // 新增
  phoneticUK?: string;        // 新增
  meaning: string;
  example: string;
  exampleTranslation: string;
  examples?: Example[];       // 新增
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'cet4' | 'cet6' | 'daily' | ...;
  // ...
}
```

## 🚀 构建说明

```bash
# 安装依赖
npm install

# 启动开发服务器
expo start

# 构建 Android APK
eas build -p android --profile production
```

## 📝 注意事项

1. **Expo Speech 版本**: 使用与 Expo SDK 50 兼容的版本 (~11.7.0)
2. **语音可用性**: TTS功能依赖设备语音引擎，不同设备可能效果有差异
3. **词汇加载**: 2000+词汇采用分批加载策略，避免内存问题
4. **离线使用**: 词汇数据本地存储，TTS需要网络或本地语音包

## 🎓 词汇来源

- CET-4 词汇：大学英语四级考试大纲核心词汇
- CET-6 词汇：大学英语六级考试大纲核心词汇
- 例句来源：真实语料库，带中文翻译

## 🔜 未来计划

- [ ] 拼写测试模式
- [ ] 随身听模式
- [ ] 更丰富的统计图表
- [ ] 复习算法优化 (SM-2)
- [ ] 生词本导入导出
