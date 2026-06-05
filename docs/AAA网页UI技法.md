# AAA 网页 UI 质感技法清单（通用）

> 纯 HTML/CSS/JS 也能接近 AAA 菜单观感。核心：**克制 + 缓慢 + 一致 + 多层叠加**。
> 适用于本仓库所有作品（guizhou 菜单、shameless、首页）。

## 八条原则

1. **菜单是世界的延伸，不是网页** —— 背后放缓慢循环的过场/景深场景，logo 浮在上面，四角暗角，按钮在顶层。
2. **一个深底色 + 一个点缀色** —— 暖近黑 + 单一金；金色只用在 hover/选中；全局不超过三色。
3. **大号衬线/书法标题 + 大字距** —— 标题占屏高 1/4 以上，宽字距；Cinzel/Cormorant + Ma Shan Zheng；正文用安静衬线。
4. **大量留白、单一轴线** —— 菜单项排一条轴、间距大、边距宽，菜单宽度 < 视口 1/3。
5. **闭环反馈：视觉 + 声音 + 动效** —— hover/选择给金色高亮 + 微缩放 + 短促音效；hover 与 confirm 分开两种声。
6. **氛围层：慢粒子 + 呼吸辉光 + 低音垫** —— 低透明度浮尘缓飘、辉光缓慢呼吸、低音环境垫（二胡/古筝/笛+合成），动得几乎察觉不到。
7. **错峰缓出入场** —— 子元素阶梯延迟、从下方淡入依次浮现，ease-out ~300ms。
8. **靠焦点与虚化造景深** —— 背景虚化，前景文字是唯一清晰层；进子菜单时加更多模糊与压暗。

## 字体推荐

| 字体 | 用途 |
|---|---|
| **Cinzel** | 史诗神话感大标题（全大写碑刻衬线，配大字距） |
| **Cormorant Garamond** | 大号副标题/单行金句（高对比，别用于小字） |
| **Marcellus** | 菜单项/按钮文字（古典碑文气，干净有格调） |
| **EB Garamond / Spectral** | 正文/说明（安静人文衬线，小字清晰） |
| **Noto Serif SC** | 中文正文（思源宋体，国风印刷质感） |
| **Ma Shan Zheng** | 中文大标题（行楷书法，接近黑神话笔锋） |
| **Long Cang** | 单字/极短标语（狂草，水墨爆发力） |

## 实现技法

- **循环视频背景**：`<video autoplay muted loop playsinline preload="metadata" poster="first-frame.jpg">`（四属性缺一不可）；`object-fit:cover` 铺满；**必盖暗化 scrim**（`linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.7))`）让文字可读。720p H.264 + WebM 双 source，码率 1–2Mbps，8–15s 无缝循环。
- **移动端兜底**：poster 指首帧防白屏；`@media(max-width:768px)` 不加载视频只留 poster 图；`loadeddata` 后淡入；reduced-motion 时暂停。
- **静图活起来（Ken Burns + 视差）**：图片 15–20s 极慢 `scale(1)→scale(1.12) translate3d(-2%,-1%,0)`（**慢且幅度小**=高级）；鼠标视差用 rAF 写 CSS 变量，前后景不同位移系数，`transform:translate3d()` 走 GPU。
- **氛围层**：canvas 浮尘（低 alpha、极慢漂移、`mix-blend-mode:screen`）+ SVG feTurbulence 颗粒（opacity .04–.08、`overlay`）+ 背景 `filter:blur(3–10px)` + `mask-image` 渐进虚化（blur 别做动画，很贵）。
- **高级排版**：可变字重拉开主次（细字重大标题最高级）；**字距是廉价感重灾区**——大写/导航 `letter-spacing:.08–.2em`，大标题收紧到 -0.02em，正文 ±0.01em；行高 1.6–1.8，`max-width:60ch`。
- **电影级转场**：先压黑再亮起（黑遮罩 0→1 出 400ms，切内容，1→0 入 600ms，中间留一拍黑场）；缓动统一 `cubic-bezier(0.16,1,0.3,1)`；内容 stagger（`transition-delay:calc(var(--i)*80ms)`）。
- **微交互 + UI 音效**：hover 叠 1.02 微缩放 + 辉光 + 扫光；声音用 **Web Audio 实时合成**（Oscillator+Gain，30–60ms 指数衰减），hover 高频轻、confirm 低频；**AudioContext 必须在用户手势里 resume()**；音量 0.05–0.15。
- **后处理感（区分网页 vs 游戏画面的关键）**：顶层盖 `pointer-events:none` 全屏层 —— 暗角 `box-shadow:inset 0 0 200px rgba(0,0,0,.7)`；泛光 bloom（亮元素复制层 `filter:blur(12px) brightness(1.5)` + `screen`）；统一色调（主题色 `mix-blend-mode:overlay` opacity .1–.2，或 `filter:contrast(1.08) saturate(1.1) brightness(.95)`）。
- **性能纪律**：**只动 transform/opacity**（GPU 合成），坚决不动 width/margin/top/left；`will-change` 用完即清；时间 token（微交互 150–250ms / 转场 400–700ms / 氛围 8–20s）；全站 `prefers-reduced-motion` 降级。

## 反面清单（一犯就廉价）

- 转场生硬瞬切，或反过来用 bounce/elastic 回弹（太玩具）。
- 动效太快太多：<200ms 大位移、满屏同时炸入、hover 立刻跳变。
- 背景视频不加暗化 scrim 直接压文字；未 muted/playsinline 致移动端不自动播放。
- 纯色平涂零层次：没暗角、没颗粒、没光影，干净得像后台管理系统。
- 排版默认值不打磨：标题不调字距、全大写不加 tracking、行宽过长、中英字体打架。
- 动 width/margin/top/left 掉帧；will-change 常驻；blur 逐帧动画重栅格卡顿。
- 滥用霓虹渐变/浓 box-shadow/玻璃拟态/过曝 bloom/高饱和——**特效堆砌恰恰显廉价，AAA 是减法**。
- 忽略 reduced-motion / 移动端硬塞大视频 / 音效未在手势内解锁 AudioContext。
- UI 音效过响、过强、每个 hover 都响——应极轻(<0.15)、极短(<60ms)、只关键交互触发。

---

## 附：免费可商用「氛围循环视频」素材（粗粝夜色/酒吧/霓虹，为影视互动备用）

> Pexels License / Mixkit Free License 均可商用。可直接喂 `guizhou` 或 `shameless` 的"上传视频当背景"功能。

| 画面 | 直链 | 来源 |
|---|---|---|
| 雨打车窗夜景（车内雨滴+街灯） | https://videos.pexels.com/video-files/11137519/11137519-hd_1920_1080_30fps.mp4 | Pexels |
| 雾夜街道霓虹（加油站霓虹迷雾） | https://videos.pexels.com/video-files/34964499/14811567_1920_1080_24fps.mp4 | Pexels |
| 忽明忽暗闪烁路灯（昏暗夜街） | https://videos.pexels.com/video-files/857146/857146-hd_1280_720_30fps.mp4 | Pexels |
| 水龙头滴水特写（暗调慢节奏） | https://videos.pexels.com/video-files/856403/856403-hd_1920_1080_24fps.mp4 | Pexels |
| 霓虹招牌黑暗街道闪烁 | https://assets.mixkit.co/videos/41154/41154-1080.mp4 | Mixkit |
| 昏暗酒吧氛围（木吧台啤酒暗黄灯） | https://assets.mixkit.co/videos/8711/8711-1080.mp4 | Mixkit |
| 日式街道霓虹灯牌（夜晚暗调） | https://assets.mixkit.co/videos/4447/4447-1080.mp4 | Mixkit |
| 霓虹停车场烟雾（彩色霓虹光） | https://assets.mixkit.co/videos/44544/44544-1080.mp4 | Mixkit |
| 夜店红光氛围（烟雾迷离） | https://assets.mixkit.co/videos/343/343-1080.mp4 | Mixkit |
