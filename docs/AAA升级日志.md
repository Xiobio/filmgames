# AAA 化升级日志（/loop 自主迭代）

> 目标：把 `guizhou/p4-splat.html` 推到「形似 AAA 大作」的观感，验证"网页 + 高斯泼溅实景 + DOM HUD + 真角色"这套技术方案可行。
> 每 10 分钟一轮（cron `5026f064`）。每轮**只做一件能验证的高价值升级**，改完用 Playwright 截图确认不破坏现有功能。
> 场景不限贵州——任何高级 3D 场景都行。

## 进度

### ✅ 迭代 1（完成）— 电影级后处理调色
把后处理 `inkPass` 从近似直通改成**电影级 grade**（写实不卡通）：镜头色差 + unsharp 锐化 + S 曲线对比 + 饱和 + 冷暖分离调色 + 暗角 + 动态胶片颗粒；bloom 0.22→0.28/阈值 0.85。
效果：garden（照片级）与 valley（风格化）都明显更"高级/电影感"，无过曝。Playwright 双场景验证通过。

### ✅ 迭代 2（完成）— 抗锯齿 FXAA + 角色接触阴影
加 `FXAAShader` pass（EffectComposer 默认无 MSAA → 边缘发毛，已修），resize 同步分辨率；角色脚下加 radial-gradient 柔和接触阴影圆片（player 子物体，随动），消除浮空感。Playwright 验证：0 报错、阴影可见角色接地、技能/动画/VFX 正常。

### ✅ 迭代 3（完成）— 电影级运镜
相机：动态 FOV（待机 55°→跑动 62°，跑动拉宽=速度感，已验证 55→59.2→回落）+ 沿速度方向前瞻 + 落地俯冲（FOV punch + 相机下沉）+ 待机手持微摆。纯 transform 数学，零渲染风险。与 loop() 的震屏叠加不冲突。Playwright 验证 FOV 随速度变化、画面协调、0 报错。

### ✅ 迭代 4（完成）— 角色"上传/换装"系统（auto-rig）
查证 three.js 的 Soldier(仅 idle/走/跑)、Xbot(idle/走/跑+几个姿态) 动画都不如现有 RobotExpressive(8 动作)，且免费可直链下载的"带完整战斗动画好角色"稀缺（好货在 itch.io 压缩包/Mixamo 登录）。→ 改做**通用换装系统**：把角色装配重构成 `setupCharacter(gltf)`，**模糊匹配动画名**（idle/walk/run + jump/attack/melee/slash/.../wave/dance/thumbs），自动归一化身高/落地/朝向。面板新增「⬆ 上传 .glb / 试·写实兵 / 机器人」。用户可拖入任意 Mixamo/KayKit/Quaternius/RPM 角色即用。Playwright 验证：机器人 8 动作、上传 Soldier 自动绑定 3 动作且跑动混合正常、按钮切换正常。本地存了 `assets/char/Soldier.glb` 作写实演示。
> 拿 AAA 角色的最简路：kaylousberg.itch.io/kaykit-adventurers（CC0）下载 zip → 取一个 .glb → 面板上传。

### ✅ 迭代 5（完成）— 名场景画廊（照片级实景泼溅）
面板新增「名场景画廊」：经典 Mip-NeRF360 照片级实景（HF cakewalk，CORS 流式 + PCA 自动校平）——**bicycle 单车花园**（PCA 上下判反→rot[π,0,0] 翻正，已验证：草径公园、地平线水平、写实）+ **treehill 山丘孤树**（已验证：大树前可探索）。loadSplatObj 增 remote/本地标签。stump 因捕捉本身杂乱（浮岛草地）已剔除。用户网络快，196MB 约 12-15s 流式（有加载浮层）。证明这套技术能扛各种高端 3D 世界。
> PCA 上下符号偶尔判反（garden/train/treehill 对、bicycle 反）→ rot[π,0,0] 逐场景翻正，或面板「翻转」手动修。

### ✅ 迭代 6（完成）— 程序化音效（Web Audio，零外部文件）
游戏原本全静音 → 加 Web Audio 合成音效引擎（无任何音频素材/CORS，离线可用）：环境氛围底噪（失谐低频锯齿+慢 LFO+低通，极轻）、剑气 whoosh+命中冲击、跳跃、落地 thud、手势 blip、切场景音；面板「🔊 声音/🔇 静音」开关。浏览器自动播放限制→任意 pointerdown/keydown 手势即 initAudio+resume。挂钩 doSkill/tick(跳/落)/loadSplatObj。Playwright 验证：__sfx 全函数可调不抛错、静音开关切换、技能未坏、0 报错。

### ✅ 迭代 7（完成）— 3D 大气粒子（浮尘/花粉）
THREE.Points 420 个软圆浮尘（径向渐变贴图 + 加性混合 + sizeAttenuation），缓慢上升+正弦微摆，**绕玩家盒子内回卷**（48×26×48，玩家移动时回收复用，始终环绕）。updateDust(dt) 挂在 tick。暗场景（igloo）里能见明显浮光微粒、纵深感强；亮场景自动变淡（加性）。Playwright 验证：420 点可见、随相机视差、0 报错。

### ✅ 迭代 8（完成）— 技能 VFX 升级（冲击波 + 命中爆闪）
spawnSlash 增加：**地面冲击波环**（RingGeometry 加性，向外扩散 6.5×、二次方渐隐）+ **命中爆闪**（朝相机的亮片 billboard，复用 dustTex 软圆，快速放大渐隐）；updateFx 增 'shock'/'flashbb' 两种。配合已有刀光环/刀刃/火花/命中音/顿帧/震屏/闪白，打击感更足。Playwright 验证（定格中段截图）：冲击波环+爆闪效果到位、单次放招干净无 bug。
> 注：自动化里"狂刷"剑气会出黑块——是无头浏览器 rAF 节流（特效不衰减）+ setInterval 不节流（一直新增）的堆叠假象，真人聚焦标签页正常放招不会出现。

### ✅ 迭代 9（完成）— 电影模式（信箱黑边 + 隐藏 HUD + 自动环绕）
面板「🎬 电影」一键：CSS 上下 2.39:1 信箱黑边（11.5vh，.7s 缓动）+ 隐藏 HUD + 面板淡出（hover 恢复）+ 相机**空闲时缓慢自动环绕**（cinematicMode && !dragging && !moving → camYaw 缓转）。便于无 UI 录制/展示。Playwright 验证：黑边 93px、HUD opacity→0、机位自动旋转、garden 电影剧照效果到位。
> 自动化里 CSS 过渡/读数偶尔滞后是无头标签页节流假象，真人即时生效。
> DoF 暂缓：splat 不一定写深度缓冲，BokehPass 风险高，留待确认深度可用后再做。

### ✅ 迭代 10（完成）— 实时 FPS + 自适应分辨率
HUD 顶部「60 FPS」改成**真·实时 FPS**（平滑）；新增**自适应分辨率**：FPS<45 自动降 pixelRatio（步长 0.2，下限 0.6），FPS>57 回升（上限 min(dpr,2)），1.6s 一调、3s 预热避免抖动。重场景（garden 580 万点）/弱机也能保流畅。`setQuality(pr)` 调 renderer.setPixelRatio+resize+updateFXAA。Playwright 验证：FPS 文本实时变化（34→12）、setQuality 升降双向精确（pr=1→1395px、pr=0.6→837px=0.60×）、渲染正常。`window.__setQuality(pr)` 可手动。
> 无头标签页 await 期间 rAF 节流 → 自适应"自动触发"在自动化里测不出，但 setQuality 机制已双向验证，真人聚焦页正常触发。

### ✅ 迭代 11（完成）— 可击打的妖靶（战斗从"对空气"变真战斗）
新增战斗目标 enemy（暗红 Icosahedron 核心 + 发光红环 + 头顶朝相机血条），剑气斩范围(<3.8)且朝向(dot>0.25)命中：掉血、**伤害数字浮字（25% 暴击×1.8）**、受击红闪、击退、命中音(_impact)+顿帧/震屏；HP 归零→粒子爆裂死亡 + 2.2s 玩家附近重生。updateEnemy 挂 tick，命中判定在 spawnSlash。Playwright 验证：一刀 100→78、伤害数字出现、连砍击杀、重生、0 报错。
> 修复：hitEnemy/deathBurst 误用未暴露的 __sfx.impact → 改调模块内 `_impact`（自带未初始化守卫）。

### ✅ 迭代 12（完成）— 多敌战斗遭遇（逼近 AI + 锁定 + 斩杀计数）
单妖靶重构成 enemies 数组（4 个）：每个独立 hp/flash/knock/respawn；**逼近 AI**（朝玩家缓移到 ~2.2 单位）；剑气斩用 nearestTarget(dir) 命中最近且朝向的活敌；**最近活敌锁定标记**（环变亮变大 1.2×）；**斩杀计数 HUD**（顶部「斩杀 × N」），击杀 +1 后 2s 在玩家附近重生（无限刷）。共享伤害数字/暴击/受击/死亡爆裂。Playwright 验证：4 敌、AI 逼近(8.9→8.7)、砍杀计数 +1、4 敌环绕战斗截图成立、0 报错。
> 调试钩子换成 __enemies/__hitNearest/__eneStates/__killCount。

### ✅ 迭代 13（完成）— 敌人威胁 + 玩家受伤（战斗有了赌注）
敌人加 atkCd：逼近到 <2.05 单位且冷却好（~1.5-2.4s）即扑击 → 调 `window.__damagePlayer` 扣玩家气血、震屏、命中音、互相击退。2D 脚本新增：气血缓回(+0.012/0.4s)、`__damagePlayer(dmg)`（扣血+刷条+受伤红屏 #dmgVig 闪+「受击」toast，归零→重伤 1.4s 后回 0.55）、`__isDowned`、低血(<0.3)红屏脉动。Playwright 验证：__damagePlayer 980→882、红屏闪、贴脸驱动 60 帧扣血 980→688(5 次受击)、低血红屏 + 4 敌环绕截图成立、0 报错。
> 注：受伤红屏与多敌战斗一起，完整动作游戏循环（清场×受威胁×低血警告×回气）成型。

### ✅ 迭代 14（完成）— 战斗手感：攻击自动转向 + 连击系统
**攻击自动转向**：doSkill 剑气前 nearestAny(5.5) 找最近活敌 → 立即把 player.rotation.y/facing 转向它，不用精确瞄准即可劈中（off-angle 也命中）。**连击系统**：hitEnemy→bumpCombo()，连续命中累积「N 连击」（金色大字，字号随连击增大、命中弹动 bump），2s 无命中 decayCombo 重置；连击伤害加成 real+=floor(combo/3)。Playwright 验证：rot 0→-1.57 自动面向侧面敌且命中、连击 1→3→18 累积显示、0 报错。

### ✅ 迭代 15（完成）— 移动端触屏（手机也能玩）
新增 #mobile：左下**虚拟摇杆**（Pointer Events，base+thumb，归一化向量 touchMove 喂进 tick 的 _w）+ 右下**斩/跃**大按钮（pointerdown→doSkill/跳）+ **触摸拖拽背景转视角**（canvas pointerdown pointerType==='touch'，不影响鼠标右键）。触屏设备(pointer:coarse / ontouchstart / maxTouchPoints)自动 enableMobile（显示控件 + 自动收起配置面板腾操作区）。Playwright 验证：控件齐全、摇杆推右上玩家移动 dz/dx≈±6、攻击键触发连击/掉血、手机横屏(844×390)布局成立、0 报错。`__forceMobile()`/`__joy(x,y)` 调试。

### ✅ 迭代 16（完成）— 程序化背景音乐（武侠 BGM）
原本只有环境底噪 → 加 Web Audio 程序化 BGM（零素材）：A 小调五声音阶**古筝拨弦**（triangle+sine 泛音 + 低通衰减包络，旋律随机游走）+ 每 8 拍**慢和弦铺底** + **回声 delay** 空间感；lookahead 调度器（setInterval 90ms，currentTime 前瞻 0.3s，落后即重置防爆音）。挂在 musicGain→masterGain，随「🔊 声音」开关一并静音。Playwright 验证：手势(keydown)→initAudio→AudioContext running、musicGain 创建、调度器 mStep 推进(=4)、0 报错。真人首次交互后可闻。
> 注：`.click()` 只触发 click 不触发 pointerdown，自动化里要用 dispatch keydown 才能触发音频初始化。

### ✅ 迭代 17（完成）— 操作指南 overlay（onboarding）
功能太多无人会玩 → 加居中操作指南卡 #help（金/墨 HUD 风格，列全 移动/视角/奔跑跳跃/剑气连击/技能2-5/面板功能/战斗提示）：进入后 2.6s 自动展示一次（7s 自动淡出）、按 **H** 随时切换、右侧常驻 **❔ helpBtn**（手机无键盘也能开）、关闭✕。Playwright 验证：自动显示、helpBtn 可见、H 切换（开→关→开，注意 H 处理在 document 上需 document 派发）、卡片渲染齐整、0 报错。把前 16 轮所有功能变得可发现、可上手。

### ✅ 迭代 18（完成）— Boss 战（妖王·影，大血条 + 蓄力预警 AoE）
新增 Boss 对象（大号 Icosahedron 核心 + 双发光环 + 地面预警环 warn）：HP 600 顶部专属红血条 #bossBar；剑气斩范围 4.7、伤害 40（含连击/暴击加成）；**状态机 idle→charge(1.2s 预警环扩大到 AoE 大小，给玩家时间躲)→slam(AoE 5.5 内 __damagePlayer 0.15 + 冲击波 + 强震屏)**；缓慢逼近；死亡双倍爆裂 + 「妖王·影 已斩」toast + 8s 重生。nearestAny/spawnSlash 已含 Boss。Playwright 验证：血条显示、砍掉血 600→560、sawCharge、砸地 AoE 扣玩家 980→833、截图 Boss+血条成立、0 报错。

### ✅ 迭代 19（完成）— 境界进程 + 难度递增（战斗有了成长曲线）
顶部计数从「斩杀×N」改成「境 R · 斩 K」：onKill(n) 累积击杀，每 8 杀 **境界 +1** 并弹「境界突破·第 R 重」横幅；bumpDiff()=1+(rank-1)*0.12 难度系数 → 妖靶逼近更快、扑击更频繁(atkCd 缩短)、伤害更高(×min(1.7,dm))；Boss 斩杀计 3 杀。Playwright 验证：连杀 10 → HUD「境 1·斩 0」→「境 2·斩 10」、第 8 杀弹境界突破 toast、kills=10、画面无异常、0 报错。无尽沙盒 → 有成长与压迫升级。

### ✅ 迭代 20（完成）— 整合 QA pass + 零报错
不堆新功能，做全流程整合验证（19 轮叠加后查回归）。Playwright 自动通玩全绿：载入/门控/进入、角色、实时FPS、音频+BGM(running)、小怪命中/击杀/境界、Boss 命中/血条、玩家受伤、键鼠+触屏移动、移动端控件、操作指南、**换地区(train)后敌人数组保留且仍能战斗**、Boss 跨场景保留。修掉唯一的 favicon 404（内联 SVG「黔」图标）→ **当前页 0 console 报错**。结论：整套 demo 端到端协同、无回归。

### ✅ 迭代 21（完成）— 电影封面（活的进入页）
进入页背景改半透明 → **实时 3D 山谷在标题背后渲染**（活封面）；文案重写体现动作游戏（kicker「高斯泼溅实景·武侠开放世界·动作」+ desc + 5 特性标签：实景3DGS/真角色可换装/连击暴击境界/妖王Boss战/桌面手机）+ 操作 hint；保留 #enterBtn 不破坏载入门控。战斗 HUD（斩杀计数 killEl、Boss 血条 bossBar）gate 在 started() → 封面隐藏、进入后恢复。Playwright 验证：封面 valley 渲染、5 标签、killEl opacity 0/bossBar 隐藏于封面、进入后恢复、门控正常、0 报错。

### ✅ 迭代 22（完成）— 闪避翻滚（Shift，带无敌帧）
Shift = 闪避冲刺：dodgeT 0.28s 冲刺(速度 12，盖过普通移动)+ **invuln 0.34s 无敌帧** + dodgeCd 0.62s + 冲刺拖尾(青蓝加性 plane) + whoosh + 相机 FOV kick；方向取当前移动输入(含触屏)，无输入则朝面向。妖靶扑击 & Boss 砸地 AoE 的伤害判定都加 `invuln<=0` 门控 → **能躲掉**。同时移除"Shift 走路"(移动恒为 RUN)。配合 Boss 蓄力预警 = 「看预警→翻滚躲」硬核手感。Playwright 验证：冲刺位移 3.36、闪避中敌人猛攻血量不变(980→980)、无敌结束后正常掉血(980→645)、拖尾可见、0 报错。help/封面提示已加 Shift 闪避。

### ✅ 迭代 23（完成）— 移动端闪避键（跨端补全）
上轮闪避只有键盘 Shift，手机玩家没法躲 Boss AoE → 加 #mbDodge「闪」按钮(青色，pointerdown→tryDodge)，与 斩/跃 三键聚在右下且互不重叠。手机端战斗三件套齐全：摇杆移动+斩+跃+闪。help/封面已标注手机闪键。Playwright 验证：按钮存在、点击触发闪避(invuln↑)、三键无重叠、手机横屏布局成立、0 报错。

### ✅ 迭代 24（完成）— 拾取增益（击杀掉落气血/内力球）
2D 加 `__healPlayer(hpAmt,qiAmt)`(回血/内+toast+刷条)。模块加 pickups 系统：球=发光 Sphere 核心+加性光晕，bob/旋转；**3.2 内磁吸吸附**、**1.2 内吸取**→ 回血(hp+0.18)/回内力(qi+0.25)+拾取音+爆光；13s 未拾自动消失。小怪 50% 掉落(60%血/40%内)，**Boss 必掉 4 个**。updatePickups 挂 tick。Playwright 验证：扣血后吸取治疗 637→813、连杀 14 掉 4 球、补给球渲染(红气血/青内力)、0 报错。形成"击杀→掉落→拾取恢复"风险回报循环。

### ✅ 迭代 25（完成）— 节奏平衡：Boss 里程碑式登场
原本开局就被 4 小怪+Boss 同时围攻，新手没摸清操作就被压垮。改：开局 boss.alive=false/不可见（bossSummoned=false）；onKill 里**斩满 6 妖 → placeBoss() 妖王降临**（含横幅+juice）；placeBoss 统一弹「妖王·影 降临！」。首次难度曲线：进入→打小怪练手感涨境界→6 杀迎 Boss 高潮。Playwright 验证：开局 boss alive=false、斩 6 后 alive=true + 降临横幅、0 报错。

> **阶段说明**：核心+战斗系统已饱和（25 轮），技术可行性早已充分验证。后续转入**打磨期**——平衡微调 / 跨端补全 / 小品质量，避免单文件继续膨胀。

### ✅ 迭代 26（完成）— 屏幕空间体积光 / 丁达尔光束（god rays）
回归视觉：inkPass 加体积光——loop 逐帧把"太阳方向"投影到屏幕(uSunPos)，shader 向 uSunPos 径向 24 次采样、只累积高亮(lum>0.7)部分、衰减叠加 → 暖调光束加回画面(uGod 1.6)；太阳背向相机(z>1)或出屏则自动关闭。太阳方向几经调参→定在相机常规视线 -z·近地平线(-0.24,0.02,-0.97)，使默认第三人称视角天空区就能见光柱。给明亮泼溅实景"阳光穿雾"氛围。Playwright 验证：shader 编译通过无黑屏、uSunPos 在屏(0.35,0.99)、截图见上方天空辉映光束、0 报错。`__p0.composer.passes` 里那个有 uGod 的 pass 可调强弱。

### ✅ 迭代 27（完成）— 时段氛围分级（日/黄昏/夜）+ 修复昼夜按钮
发现 bug：原「昼夜」按钮只改隐藏的 2D 视差层 CSS，对真 3D 泼溅世界无效。改：inkPass 加 uTint(vec3)+uExpo，末段 `c*=uTint*uExpo`；`window.__setMood(m)` 设三档——日(中性,uGod1.6)/黄昏(暖金 1.15/1/0.76·expo .97·uGod2.3 强光束)/夜(冷蓝 .62/.72/.98·expo .56·uGod .7 压暗)。2D dayBtn 改为循环 日→黄昏→夜 调 __setMood + 改标签。Playwright 验证：uTint/uExpo 三档切换、黄昏暖金截图、夜冷蓝截图、0 报错。一键给所有实景换电影时段氛围（黄昏配体积光尤其美）。

### ✅ 迭代 28（完成）— Boss 击败·胜利演出
原本斩 Boss 只有 toast，太平淡。加 #victory 横幅（金色毛笔大字「妖王·影·已斩」+ BOSS DEFEATED + 金线，淡入 .5s/展示 2.6s）+ bossDie 触发 `window.__victory()` + juice 慢动作拉满(slow 0.4→1.3) + 顿帧。位置上移到 26%/z10 避开连击显示，标题 nowrap 单行。Playwright 验证：斩 Boss→victoryShown=true/bossDead=true、强制可见截图见金色横幅、0 报错。（截图首拍空白是无头节流让 opacity 过渡没推进的假象，真人正常淡入。）

### ✅ 迭代 29（完成）— 自适应战斗音乐（dynamic music）
BGM 从单一氛围循环 → 随战斗紧张度变化。加 musicTension(0..1)，loop 每帧平滑趋近 (boss.alive?1:0)；_schedMusic 用 tension：节奏更快(step 0.46→0.33)、音更密(rest 阈值降)、音更响 + tension>0.25 时每 2 拍加 `_subPulse` 低频心跳(72→44Hz)。妖王在场→急促压迫，战斗结束→回归平静旋律。`__setTension/__tension` 调试。Playwright 验证：音频 running、调度器紧张模式持续推进(mStep 3→6)、__setTension 生效、Boss 在场自动升紧张(bossRaised)、0 报错（音频不可听但引擎/张力/调度全正常）。

### ✅ 迭代 30（完成）— 响应式旁白（向导阿黔对战斗做出反应）
向导原本只在进入念一句场景介绍 → 现在对事件反应。2D 加 `window.__narrate(txt,force)`(typeLine 包装 + 3.5s 防刷屏冷却，force 可绕过)。挂钩：妖王降临(onKill 召唤,force)「妖王·影 现身了——退避或迎战」、斩杀妖王(bossDie,force)「妖王已斩！黔山，暂得安宁。」、境界突破(onKill,冷却)「境界又进一层…」、气血<30%(__damagePlayer,首次,force)「气血将尽……快寻补给球续命！」(hp>0.45 复位，只警告一次)。Playwright 验证：三条 force 旁白文本正确出现在 #talkLine、低血旁白隔离测试通过、截图旁白栏显示、0 报错。世界对玩家行动有了反馈。

### ✅ 迭代 31（完成）— 移动反馈细节（脚步声 + 落地扬尘）
原本奔跑/落地静默。加 `_footstep()`（衰减噪点+低通，挂 __sfx.footstep）；tick 里按速度变频触发(grounded&&!dodge&&sp>2.5，stepT=max(.26,.62-sp*.035))。落地(impact>3)除震屏/音外加 `spawnLandPuff()`（18 个灰尘 Points 向外上爆 + 渐隐）。Playwright 验证：footstep 可调不抛错、跳跃落地 fxList +1 扬尘、奔跑驱动 20 帧无报错、0 报错。AAA 级移动临场感。

### ✅ 迭代 32（完成）— 名场景画廊加室内场景（户外/室内通吃）
回应"其他高级3D场景完全ok"：画廊加 Mip-NeRF360 **room**（HF cakewalk，51MB，照片级室内：沙发/绿植/家具/暖光）。室内对第三人称背景难框，调参：rot[π,0,0]+autolevel+size13+anchor[0,2.2,-5]（先 PCA 校平再翻正、缩小拉远避免埋进墙体）。Playwright 验证：6s 流式载入、调参后截图见真实室内房间、烘入参数复现一致(scale1.18)、3 画廊按钮、0 报错。证明这套技术不止户外山水，室内空间同样能渲染——场景类型更全。

### ✅ 迭代 33（完成）— 可行性总览 & 收口（不加功能，做整合）
32 轮后不再堆功能（避免单文件膨胀），做整合：写 `网页AAA动作游戏-可行性总览.md`（一句话结论=可行 / 技术方案怎么做到 / 完整能力清单 / 如何扩展 / 诚实边界 / 免费资源），把整个工作固化成可分享可复刻的技术报告，直答"技术方案是否可行"。主页 index.html 改版：成品游戏 P4-splat + 可行性总览置顶突出，旧 P 版本降为「演进版本」次要行，加 33 轮日志链接。Playwright 验证：主页含游戏/总览链接、总览文档 fetch 200 内容正确、主页渲染正常、0 报错。

## 路线图（打磨期·按需挑）
- [ ] **敌人多样化**：第二种敌人（远程/冲撞）丰富战斗。
- [ ] **结算/波次**：可选的波次模式 + 结算面板。
- [ ] **真贵州 C 方案**：用户实拍 → Scaniverse → 上传 .spz（管线已就绪，见真贵州实景泼溅管线.md）。
- [ ] **迭代 14 · 昼夜/光照联动 · 背景景深 DoF**（确认 splat 深度后再做）。

## 约定
- 不破坏：HUD、转场、任务联动、技能动画、5 地区切换、本地素材+CDN 回退、载入门控。
- 每轮更新本文件的"进度/路线图"勾选项。
