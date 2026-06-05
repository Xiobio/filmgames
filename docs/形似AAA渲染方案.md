# 把武侠 UI 做成「形似 AAA」网页游戏：渲染方案（2026）

> 针对 `guizhou/index.html` —— 你已有的水墨 HUD + 转场。本文回答：玩家移动 / 模型切换 / 技能释放 / 动画，怎么渲染到「形似 AAA（不求神似）」。
> 由多智能体并行调研 + 综合（6 agents）。

---

## 0. 一句话判断

**完全可行，但绝不要拼真·无缝开放世界**（那是工作室数月到半年级工程，个人硬刚必烂尾）。

最务实路线 = **「2.5D 合成 + 真 3D 角色近景 + 重后处理 + 水墨 NPR」混合架构**：你现有的 CSS/SVG HUD 与转场**原封不动当最上层**，在它底下塞一个全屏 `<canvas>` 做世界层。

两条核心认知：
1. **网页「像不像 AAA」八成靠后处理（bloom+AO+TAA+调色）和打击感的「时间设计」（顿帧+震屏+闪白），而不是几何精度。**
2. **武侠走水墨/卡通 NPR**，既贴气质，又天然遮盖网页几何/贴图精度不足的短板。把「开放世界」降级成「几个高完成度小场景 + 你已有的水墨转场串联」，假装无缝大世界。

> ⚠️ 你的 `arcade/games/runner3d.html` 用的是 Three.js **r128（太旧**，缺 WebGPU/TSL/新后处理）。新世界层必须直接上 **r171+**，别在 r128 上扩建。

---

## 1. 四层架构：你已经有了最难的那层

把游戏拆成四层叠加（2026 主流的「DOM 叠 canvas」做法）：

| 层 | 内容 | 技术 | 你的文件 |
|---|---|---|---|
| **UI 层** | 罗盘/坐标/技能槽/任务卷轴/对话/toast/水墨转场 | 原生 DOM + CSS/SVG | ✅ **已在此层，且做得很完整精美**——几乎不用动 |
| **VFX 层** | 技能粒子/刀光/水墨爆开/命中/轻功残影 | canvas 上的 WebGL pass + 后处理 | ⚠️ 只有 CSS 装饰氛围（飘字/灯笼），缺战斗 VFX |
| **角色层** | 主角模型/NPC/移动控制器/第三人称相机/骨骼动画 | Three.js | ❌ 完全缺 |
| **世界层** | 可漫游环境/地形/远景/氛围 | 底层全屏 `<canvas>`（Three.js） | ❌ 完全缺（现在的 SVG 远山只是假视差贴图） |

**关键：你已经有了最难「做精美」的 UI 层，缺的是让它变成「游戏」的下面三层。补齐顺序自下而上：先世界层(能走)→角色层(有人走)→VFX 层(打得帅)。**

接法（无痛）：`body` 最底放 `position:fixed;inset:0;z-index:0` 的全屏 canvas；HUD 保持 `z-index:2+`；**非交互区设 `pointer-events:none` 让操作穿透到 canvas，只按钮/摇杆设 `pointer-events:auto`**（这是最常见的坑：HUD 盖全屏没设穿透，会吃掉所有点击，角色没法操作）。世界里跟随角色的血条/名字用 `CSS2DRenderer` 把世界坐标投影到屏幕。

---

## 2. 你问的四个系统，怎么做

### 🏃 玩家移动
- **别从零写控制器**，直接用 **`pmndrs/ecctrl`**：浮动胶囊(自动平滑越台阶斜坡) + 加速度/惯性 + 转身 slerp + idle/walk/run/jump 状态机 + 点击移动，全封装好，**两三天出雏形**。
- 手感的 AAA 感八成在：①加速度逼近目标速度(松键滑行、有重量) ②转身用四元数 slerp 不瞬转 ③奔跑 sprintMult 倍率。
- 地形**不上物理**：对地形向下 raycast 取高度贴地，比 heightfield 物理便宜，单角色够用。
- **轻功/踏云** = 二段跳 + 空中 dash(水平冲量+短暂无重力) + 滑翔(重力衰减+体力条，参考 Genshin)。
- 必避坑：脚滑——动画 timeScale 要匹配实际位移速度；crossfade ~0.2s。

### 🔄 模型切换
- **切角色**：多角色共享同一套 Mixamo 骨架时用 `SkeletonUtils.clone` 克隆 SkinnedMesh，**一份动画喂所有角色，换角色只换皮**。
- **换装/切武器**：把装备网格 `attach` 到指定骨骼(如 hand bone)跟随动画，或显隐同角色的多套部件——不必为每种组合导出独立模型。
- VRM 路线(`three-vrm`)可直接控表情/裙摆头发 spring bone 物理，契合二次元武侠。
- 必避坑：别在前端运行时跨不同比例骨架 retarget(脚反手反)，要 retarget 就在 Blender 离线烘焙；AI 生模拓扑脏，务必 Blender 重拓扑 + `gltf-transform simplify`。

### ✨ 技能释放（形似 AAA 最关键的一环）
- **技能特效 = 分层叠加 + 时间设计，不是真物理。**
- 粒子用 **`three.quarks`**：剑气(ConeEmitter+沿运动方向拉伸+Trail)、内力(SphereEmitter+向心力+渐隐)、爆发(burst+径向力+收缩)。
- 刀光别用粒子：一条 **`meshline`** 弧形 ribbon 贴 alphaMap + 滚 UV，0.2s 播完即弃 + bloom 就很「快」。
- **发光全靠「颜色乘 2-5 拉出 0-1 区间 + SelectiveBloom」**，不要逐个手调材质。
- 武侠味：命中爆一团 noise 扰动的**水墨 alpha** 替代写实火花，既掩盖廉价感又强化国风。
- UI↔世界联动：点技能图标 → 图标弹性高亮 → 世界爆发 + bloom 冲高回落 + 震屏。
- 最省做法：用 AE/EmberGen/Blender **离线渲序列帧**，billboard 平面播放，远看和实时粒子无差别、成本低一个数量级。

### 🎬 动画
- 骨骼层全用 Three.js 内置：`mixer.clipAction` → 切状态 `newAction.reset().play()` + `oldAction.crossFadeTo(0.3, true)`(warp 自动对齐步频)。
- 待机呼吸/受击抖动用**加法动画**(`makeClipAdditive` + 低权重常驻)叠在 idle 上，**1 个 clip 复用全角色立刻「活着」**，不打断主循环。
- 状态机自己写 ~50 行 FSM：一次性动作(hit/skill)设 `LoopOnce` + `clampWhenFinished`，监听 `finished` 自动回 idle。前摇/后摇 = 把施法 clip 拆 windup/active/recovery 三段。
- UI/HUD 动效与转场用 **GSAP**(2025 起全免费)：timeline 错峰入场、数值滚动、连击跳字；继续驱动你已有的水墨 clip-path 转场。
- 必避坑：crossFade 没 `reset().play()` 或权重 0 会静默失效；加法动画忘 `makeClipAdditive` 会覆盖而非叠加导致姿势崩。

---

## 3. 分阶段 Roadmap（从你现在的文件出发）

| 阶段 | 时长 | 做什么 → 产出 |
|---|---|---|
| **P0 混合架构打通** | 0.5–1 周 | HUD 下塞全屏 canvas 跑 Three.js r171+(地板+灯光)；pointer-events 改好；一个胶囊用 ecctrl 能 WASD 走、相机跟随碰墙回拉。**「能在你精美的 HUD 里走起来」= 里程碑** |
| **P1 真主角 + 移动手感** | 1–2 周 | glTF/VRM 主角 + Mixamo idle/walk/run/jump，crossFade+warp；调 maxVel/turnSpeed/sprint；相机 lookahead + 奔跑动态拉 FOV；地形 raycast 贴地 |
| **P2 后处理 + 水墨 NPR** | 1 周 | SelectiveBloom + N8AO + TAA + 调色 + 暗角颗粒；MToon/toon ramp + 描边 + 水墨纸纹 pass；HDRI 给环境光。**开关前后判若两个项目** |
| **P3 打击感三件套 + 技能 VFX** | 1–2 周 | 先做顿帧+震屏+闪白+慢动作(感知 80%)；再 three.quarks 剑气/爆发、meshline 刀光、水墨爆开；技能槽冷却联动 |
| **P4 真实世界背景 + 场景串联** | 2–3 周 | 高斯泼溅(3DGS)拍贵州实景当可漫游底图(spark.js)+不可见碰撞网格；用你已有的水墨转场把苗寨/竹林/瀑布串成「假无缝大世界」 |
| **P5 模型切换 + 换装 + 打磨** | 按需 | SkeletonUtils 切角色、attach 切武器、显隐换装；按设备分质量档 + WebGL2 回退 |

---

## 4. 工具清单

| 工具 | 用途 |
|---|---|
| **Three.js r171+** | 世界/角色渲染核心；生态碾压，WebGPU-ready 但发布走 WebGL2 回退 |
| **pmndrs/ecctrl** | 第三人称控制器(浮动胶囊+相机碰撞+状态机)，省掉数周 |
| **spark.js / GaussianSplats3D** | 加载高斯泼溅 `.spz` 当真实可漫游背景，Spark 2.0 LoD 流式 |
| **three-vrm / GLTFLoader + AnimationMixer** | 加载风格化角色 + 骨骼动画混合 |
| **Mixamo + SkeletonUtils** | 免费动画库；clone 共享骨架做模型切换 |
| **Meshy / Tripo / 混元3D** | AI 8 秒出角色道具(自带 auto-rig)，生成后 Blender 清理 |
| **World Labs Marble** | 一句话/一张照片生成可探索 3D 世界并导出 splat |
| **three.quarks** | 技能粒子(剑气/内力/爆发)，TS、批渲染、内建 trail |
| **pmndrs/meshline** | 刀光/拖尾 |
| **pmndrs/postprocessing** | AAA 观感命门：SelectiveBloom + N8AO + TAA + 色差/暗角/DOF |
| **GSAP（全免费）** | UI 时间轴、数值滚动、连击跳字、驱动水墨转场 |
| **gltf-transform + KTX2 + Draco** | glTF 压缩管线，控首屏与显存 |
| **Blender** | AI 生模/Mixamo 二次清理(减面/重拓扑/烘焙) |

---

## 5. 「形似」造假取巧清单（最值钱的部分）

1. **高斯泼溅/实拍照片当世界** —— 背景天生照片级真实，省掉整个建模与光照管线。**投入产出比最高的一招。**
2. **重后处理轻几何** —— bloom+AO+TAA+调色+暗角，同一堆模型开关前后判若两个项目；预算优先砸后处理。
3. **NPR 水墨当遮羞布** —— 用「风格」掩盖几何/贴图精度不足；写实路线反而处处穿帮。
4. **纸片人/billboard 立绘** —— 远景角色全用面向相机的立绘，只给主角做真 3D。
5. **「开放世界」= 场景串联** —— 用你已有的水墨转场切几个小场景，假装无缝大世界。
6. **打击感三件套白嫖 80% AAA 感** —— 顿帧 + 震屏(trauma²衰减) + 命中闪白，几行代码零美术。
7. **慢动作零成本拉满电影感** —— 全局 timeScale 变量，暴击降到 0.2 维持 0.2s。
8. **发光不手调** —— 颜色乘 2-5，交给 SelectiveBloom 自动发光。
9. **技能特效离线渲序列帧** —— Blender/AE 渲好爆炸成 sprite sheet，billboard 播放。
10. **动画「活着」靠加法动画** —— 呼吸/张望低权重常驻叠 idle，1 clip 复用全角色。
11. **重复物全用 InstancedMesh** —— 千棵树 = 一次 draw call，视觉密度=AAA 开销极低。
12. **云海/流水用 VideoTexture 贴平面** —— 你现有 `#userVid` 思路升级版，动态感拉满成本几乎为零。
13. **色差/径向模糊只在命中/冲刺 0.1-0.2s 瞬时拉高再回落** —— 常驻会糊会廉价，瞬时叠加才高级。
14. **氛围压一切** —— 重雾/体积光/晨昏暖色/萤火落叶/景深，比几何更能骗出「大作感」。

> 完整六维原始分析见工作流输出。下一步建议直接干 **P0**：在你现有 guizhou 文件下塞一个能走动的小场景，把混合架构跑通。
