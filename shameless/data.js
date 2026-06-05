/* 真实剧照 + 中文文案（由调研工作流抓取/撰写；图片已下载到 assets/stills/）
   图片来源：角色海报 = Shameless Fandom；剧照/主视觉 = TMDB。仅供原型评估，正式发布需处理版权。 */
window.FILMGAME_DATA = {
  title:{ en:"SHAMELESS", zh:"无耻之徒", tagline:"用游戏的方式，走进南区" },
  hero:"assets/stills/hero.jpg",

  characters:[
    {key:"frank", zh:"弗兰克", en:"Frank", img:"assets/stills/frank.jpg",
      blurb:"全家最大的负债资产，把酗酒混成了一门玄学，永远在借钱、永远有歪理、永远是你最不想要的那个爹。",
      stats:{酒精:92, 现金:6, 麻烦:85}},
    {key:"fiona", zh:"菲奥娜", en:"Fiona", img:"assets/stills/fiona.jpg",
      blurb:"十几岁就当上全家的妈，自己的人生塞在弟妹的账单缝里，硬撑、嘴硬、心比谁都软。",
      stats:{责任:96, 现金:32, 睡眠:18}},
    {key:"lip", zh:"利普", en:"Lip", img:"assets/stills/lip.jpg",
      blurb:"天才长在了最不该出生的地方，聪明得能上名校，却总被原生家庭和自己的酒瓶拽回原点。",
      stats:{智商:97, 酒精:58, 前途:42}},
    {key:"ian", zh:"伊恩", en:"Ian", img:"assets/stills/ian.jpg",
      blurb:"嘴上最直、心里最轴的那个，一边和自己的脑子打仗，一边死心眼地认定的事就绝不松手。",
      stats:{纪律:82, 情绪:46, 体能:88}},
    {key:"carl", zh:"卡尔", en:"Carl", img:"assets/stills/carl.jpg",
      blurb:"从小区惯犯一路野蛮生长，先学会用拳头解决问题，再慢慢学怎么当个不那么糟糕的人。",
      stats:{胆量:90, 常识:35, 武力:80}},
    {key:"debbie", zh:"黛比", en:"Debbie", img:"assets/stills/debbie.jpg",
      blurb:"从乖巧小妹长成最敢豁出去的那个，一旦认准就横冲直撞，把好心和闯祸打包一起送到。",
      stats:{早熟:88, 固执:84, 现金:24}},
    {key:"kev", zh:"凯文", en:"Kevin", img:"assets/stills/kev.jpg",
      blurb:"心眼实得发光的酒吧老板，脑子转得慢半拍，但论谁会半夜冒雨来帮你，第一个想到的就是他。",
      stats:{人缘:92, 脑子:40, 力气:86}},
    {key:"veronica", zh:"维罗妮卡", en:"Veronica", img:"assets/stills/veronica.jpg",
      blurb:"嗓门大、主意正、毒舌里全是真情的邻家女王，骂你最狠的时候往往就是最护着你的时候。",
      stats:{嘴炮:96, 义气:90, 耐心:30}}
  ],

  scenes:[
    {id:"alibi", name:"Alibi 酒吧", en:"The Alibi Room", chapter:"第一章 · 酒吧门前",
     img:"assets/stills/scene_alibi.jpg",
     quest:{main:"在 Alibi 门前读懂这条街的规矩", side:"别让弗兰克又赊一杯酒"},
     achievement:"南区社交家",
     hotspots:[
      {x:30,y:30,label:"霓虹啤酒招牌",text:"门头那块霓虹啤酒招牌缺了一笔，亮了快二十年。它是这条街的灯塔——只要它还亮着，今晚就总有地方可去。"},
      {x:52,y:52,label:"酒吧大门",who:"kev",text:"凯文探出头来：里头是擦不完的杯子和一屋子各怀心事的熟客。进来吧，第一杯算我的——但也就第一杯。",
        choices:[{label:"推门进去",text:"门轴吱呀一声，像替你叹了口气。一屋子的喧闹和酒气把你裹住——欢迎来到南区的客厅。"},
                 {label:"在门口再站会儿",text:"你靠在门边点了根烟。有些夜晚，光是听着里面的笑声，就已经够暖和了。"}]},
      {x:76,y:62,label:"门口街角",text:"门口的街角蹲过谈生意的、躲债的、和单纯不想回家的。南区的故事，一半发生在屋里，一半发生在这几级台阶上。"},
      {x:18,y:56,label:"二楼的窗",text:"楼上那扇窗偶尔会亮——凯文和维罗妮卡就住在酒吧上头。楼下喝到打烊，楼上孩子还在哭，日子就这么叠着过。"}
    ]},

    {id:"home", name:"Gallagher 家 · 厨房", en:"The Gallagher Kitchen", chapter:"第二章 · 这就是家",
     img:"assets/stills/scene_home.jpg",
     quest:{main:"在这间厨房拼出这个家的真相", side:"查清冰箱里到底还有没有吃的"},
     achievement:"这就是家",
     hotspots:[
      {x:38,y:60,label:"厨房餐桌",who:"fiona",text:"菲奥娜把账单往桌上一拍：这张桌子是这个家的议会、法庭和急诊室。早饭十分钟能吵完三场架、报销两张假条，然后所有人照样赶着去上学上班。"},
      {x:80,y:46,label:"冰箱",text:"冰箱门上贴满过期缴费单和小孩的奖状，门一打开多半只有半瓶牛奶和一种倔强的乐观。谁要是真在里面找到了吃的，得喊全家一起庆祝。",
        choices:[{label:"打开冰箱",text:"半罐啤酒、一瓶临期牛奶、和不知道是谁的剩披萨。够了，这就是晚餐。"},
                 {label:"假装没看见",text:"你关上冰箱门。有些真相，空着肚子也不想面对。"}]},
      {x:22,y:50,label:"灶台",text:"灶台前永远有人在对付一锅勉强算早饭的东西。在这个家，会做饭不是技能，是生存——谁先起床，谁就负责喂饱全家。"},
      {x:60,y:30,label:"挤在厨房的孩子们",text:"这屋子穷得叮当响，可一到饭点，几个脑袋全挤在这方寸之间抢吐司、抢话头、抢那点少得可怜的关注。乱，但是热的。"}
    ]},

    {id:"school", name:"学校", en:"The School", chapter:"第三章 · 逃不掉的白天",
     img:null,
     quest:{main:"在学校找到 4 个青春的角落", side:"别被校长第三次叫家长"},
     achievement:"逃课艺术家",
     hotspots:[
      {x:28,y:46,label:"教室后排",text:"后排是给那些人均缺觉、午饭钱花在别处的孩子留的。他们趴着睡觉不是因为懒，是因为昨晚家里那点破事，比老师讲的任何东西都精彩。"},
      {x:58,y:38,label:"储物柜走廊",text:"一排铁皮柜，凹痕比名字多。有人在这儿藏了不该带来学校的东西，也有人就是把这儿当成全世界唯一一个属于自己的小空间。"},
      {x:46,y:64,label:"校长办公室门口",who:"carl",text:"卡尔熟门熟路地坐进长椅：被叫来的孩子嘴上一副无所谓，心里其实在算这次是叫家长，还是又一次没人会来。"},
      {x:78,y:56,label:"操场角落",text:"铁丝网后头那块没人管的角落，是逃课、初吻和重要人生谈话的官方场地。在这儿做的决定，往往比教室里学的东西更早派上用场。"}
    ]}
  ]
};
