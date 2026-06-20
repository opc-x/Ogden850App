/**
 * 50 场景故事脚本 — 标题、故事线、分幕大纲、插画主题
 * 排名依据现实世界口语使用频率（非语料句数）
 */
export type SceneTier = 'P0' | 'P1' | 'P2';
export type StoryBeat = '开场' | '进行' | '收束';

export interface StoryChapter {
  beat: StoryBeat;
  title: string;
  goal: string;
}

export interface SceneIllustration {
  label: string;
  motifs: string[];
  accent: string;
}

export interface SceneStoryScript {
  sceneKey: string;
  freqRank: number;
  tier: SceneTier;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: StoryChapter[];
  emoji: string;
  gradient: string;
  illustration: SceneIllustration;
}

function ch(beat: StoryBeat, title: string, goal: string): StoryChapter {
  return { beat, title, goal };
}

export const SCENE_STORY_SCRIPTS: SceneStoryScript[] = [
  { sceneKey: 'Shopping', freqRank: 1, tier: 'P0', titleZh: '超市买菜结账', titleEn: 'Grocery Checkout', storyHook: '列清单进超市，挑菜问价，付款装袋回家', storyOutline: [ch('开场', '进超市', '进店问好'), ch('进行', '挑选询价', '找食物看价格'), ch('进行', '付款装袋', '给钱装包'), ch('收束', '回家整理', '离开商店回家')], emoji: '🛒', gradient: 'linear-gradient(135deg,#fef3c7,#fdba74)', illustration: { label: '超市结账', motifs: ['cart', 'shelf', 'bag'], accent: '#f59e0b' } },
  { sceneKey: 'Restaurant', freqRank: 2, tier: 'P0', titleZh: '餐厅点菜买单', titleEn: 'Dining Out', storyHook: '入座看菜单，点餐上菜，吃完结账离开', storyOutline: [ch('开场', '入座看单', '找位子要菜单'), ch('进行', '点餐上菜', '点食物和饮料'), ch('进行', '用餐交流', '评价味道'), ch('收束', '结账告别', '付饭钱离开')], emoji: '🍽', gradient: 'linear-gradient(135deg,#ffedd5,#fb923c)', illustration: { label: '餐厅用餐', motifs: ['table', 'plate', 'menu'], accent: '#ea580c' } },
  { sceneKey: 'Making a Phone Call', freqRank: 3, tier: 'P0', titleZh: '打电话预约', titleEn: 'Booking by Phone', storyHook: '拨号问候，说明来意，确认时间后挂断', storyOutline: [ch('开场', '拨号问候', '拨号接听'), ch('进行', '说明来意', '说明要什么'), ch('进行', '确认细节', '约时间留名字'), ch('收束', '礼貌挂断', '道谢告别')], emoji: '📞', gradient: 'linear-gradient(135deg,#dbeafe,#3b82f6)', illustration: { label: '电话预约', motifs: ['phone', 'clock'], accent: '#2563eb' } },
  { sceneKey: 'Health', freqRank: 4, tier: 'P0', titleZh: '看医生讲症状', titleEn: 'At the Doctor', storyHook: '描述哪里痛，医生给建议，回家休息吃药', storyOutline: [ch('开场', '到达诊所', '说明不舒服'), ch('进行', '描述症状', '说疼痛部位'), ch('进行', '医嘱治疗', '给建议用药'), ch('收束', '回家休养', '道谢离开')], emoji: '🏥', gradient: 'linear-gradient(135deg,#dcfce7,#4ade80)', illustration: { label: '看病就医', motifs: ['bed', 'body'], accent: '#16a34a' } },
  { sceneKey: 'Transport', freqRank: 5, tier: 'P0', titleZh: '坐公交去目的地', titleEn: 'Taking the Bus', storyHook: '到车站买票上车，到站下车找路', storyOutline: [ch('开场', '到达车站', '问哪路车'), ch('进行', '上车验票', '买票上车'), ch('进行', '途中确认', '看站名'), ch('收束', '下车抵达', '下车往目的地')], emoji: '🚌', gradient: 'linear-gradient(135deg,#ccfbf1,#2dd4bf)', illustration: { label: '公交出行', motifs: ['bus', 'ticket', 'road'], accent: '#0d9488' } },
  { sceneKey: 'Travel', freqRank: 6, tier: 'P0', titleZh: '坐火车去旅行', titleEn: 'Train Journey', storyHook: '购票进站，车上对话，到站出站', storyOutline: [ch('开场', '购票进站', '买票看时间'), ch('进行', '上车就座', '上车放包'), ch('进行', '途中交谈', '聊风景'), ch('收束', '到站离开', '下车出站')], emoji: '🚆', gradient: 'linear-gradient(135deg,#e0f2fe,#38bdf8)', illustration: { label: '火车旅行', motifs: ['train', 'station', 'bag'], accent: '#0284c7' } },
  { sceneKey: 'Work', freqRank: 7, tier: 'P0', titleZh: '办公室一天', titleEn: 'A Day at Work', storyHook: '到岗交接任务，协作完成，下班告别', storyOutline: [ch('开场', '到岗问候', '进办公室'), ch('进行', '分配任务', '领工作做文件'), ch('进行', '协作沟通', '讨论问题'), ch('收束', '下班离开', '道别回家')], emoji: '💼', gradient: 'linear-gradient(135deg,#e0e7ff,#93c5fd)', illustration: { label: '上班工作', motifs: ['desk', 'paper', 'clock'], accent: '#4f46e5' } },
  { sceneKey: 'At School', freqRank: 8, tier: 'P0', titleZh: '课堂与作业', titleEn: 'School Day', storyHook: '上课听讲，做练习，放学回家', storyOutline: [ch('开场', '到校上课', '进教室'), ch('进行', '听讲练习', '学新词做作业'), ch('进行', '提问回答', '举手问答'), ch('收束', '放学回家', '收拾离开')], emoji: '🏫', gradient: 'linear-gradient(135deg,#dbeafe,#60a5fa)', illustration: { label: '在学校', motifs: ['book', 'pen', 'school'], accent: '#2563eb' } },
  { sceneKey: 'Asking Directions', freqRank: 9, tier: 'P0', titleZh: '街头问路', titleEn: 'Asking the Way', storyHook: '迷路求助，对方指路，找到目的地', storyOutline: [ch('开场', '迷路求助', '说明要找的地方'), ch('进行', '指路说明', '指方向说路名'), ch('进行', '确认理解', '重复路线'), ch('收束', '找到地点', '道谢到达')], emoji: '🧭', gradient: 'linear-gradient(135deg,#cffafe,#22d3ee)', illustration: { label: '问路指路', motifs: ['map', 'road', 'finger'], accent: '#0891b2' } },
  { sceneKey: 'Going to the Store', freqRank: 10, tier: 'P0', titleZh: '便利店买日用品', titleEn: 'Quick Errand', storyHook: '列清单买面包牛奶，付款回家', storyOutline: [ch('开场', '列清单出门', '看缺什么'), ch('进行', '选购商品', '拿面包牛奶'), ch('进行', '付款离开', '给钱装袋'), ch('收束', '回家放好', '放进厨房')], emoji: '🏪', gradient: 'linear-gradient(135deg,#fef3c7,#fbbf24)', illustration: { label: '便利店', motifs: ['store', 'bread', 'bag'], accent: '#d97706' } },
  { sceneKey: 'The Family', freqRank: 11, tier: 'P1', titleZh: '家人晚饭聊天', titleEn: 'Family Dinner', storyHook: '一家人吃饭，聊今天的事', storyOutline: [ch('开场', '回家团聚', '桌边准备吃'), ch('进行', '边吃边聊', '聊今天的事'), ch('收束', '收拾餐桌', '互道晚安')], emoji: '👨‍👩‍👧', gradient: 'linear-gradient(135deg,#ffedd5,#fdba74)', illustration: { label: '家庭晚餐', motifs: ['table', 'food', 'house'], accent: '#c2410c' } },
  { sceneKey: 'Social', freqRank: 12, tier: 'P1', titleZh: '朋友聚会见面', titleEn: 'Meeting Friends', storyHook: '约见朋友，寒暄聊天，告别约下次', storyOutline: [ch('开场', '见面寒暄', '问候近况'), ch('进行', '聊天喝茶', '谈计划趣事'), ch('收束', '告别再约', '约下次见面')], emoji: '🎉', gradient: 'linear-gradient(135deg,#ede9fe,#a78bfa)', illustration: { label: '朋友聚会', motifs: ['friends', 'drink', 'music'], accent: '#7c3aed' } },
  { sceneKey: 'The Weather', freqRank: 13, tier: 'P1', titleZh: '聊天气穿衣', titleEn: 'Talking Weather', storyHook: '看天出门，谈晴雨与穿衣', storyOutline: [ch('开场', '看窗外', '讨论晴雨'), ch('进行', '决定穿衣', '选外套带伞'), ch('收束', '出门准备', '按天气出门')], emoji: '🌤', gradient: 'linear-gradient(135deg,#e0f2fe,#7dd3fc)', illustration: { label: '天气变化', motifs: ['sun', 'cloud', 'coat'], accent: '#0ea5e9' } },
  { sceneKey: 'Time', freqRank: 14, tier: 'P1', titleZh: '约时间见面', titleEn: 'Making Plans', storyHook: '商量何时何地见面，确认准时', storyOutline: [ch('开场', '提出邀约', '说哪天见面'), ch('进行', '敲定时间', '对表定地点'), ch('收束', '确认提醒', '重复时间')], emoji: '⏰', gradient: 'linear-gradient(135deg,#f1f5f9,#94a3b8)', illustration: { label: '安排时间', motifs: ['clock', 'calendar'], accent: '#64748b' } },
  { sceneKey: 'Online Shopping', freqRank: 15, tier: 'P1', titleZh: '网购下单收货', titleEn: 'Online Order', storyHook: '网上选商品，付款，等货到签收', storyOutline: [ch('开场', '浏览选品', '看图片价格'), ch('进行', '下单付款', '确认地址付钱'), ch('进行', '等待物流', '问何时到'), ch('收束', '签收验货', '收货检查')], emoji: '🛍', gradient: 'linear-gradient(135deg,#fef3c7,#f59e0b)', illustration: { label: '网购收货', motifs: ['box', 'machine', 'money'], accent: '#b45309' } },
  { sceneKey: 'Banking', freqRank: 16, tier: 'P1', titleZh: '银行存取款', titleEn: 'At the Bank', storyHook: '进银行办业务，取号等候，办完离开', storyOutline: [ch('开场', '进门取号', '说明业务'), ch('进行', '办理业务', '填纸数钱'), ch('收束', '确认离开', '核对余额')], emoji: '🏦', gradient: 'linear-gradient(135deg,#e2e8f0,#64748b)', illustration: { label: '银行业务', motifs: ['building', 'money', 'paper'], accent: '#475569' } },
  { sceneKey: 'Renting a Room', freqRank: 17, tier: 'P0', titleZh: '租房看房签约', titleEn: 'Renting a Flat', storyHook: '看房问租金，谈条件，决定租下', storyOutline: [ch('开场', '预约看房', '约好到达'), ch('进行', '参观议价', '看房间问价'), ch('进行', '谈条件', '讨论租期'), ch('收束', '决定签约', '约定搬入')], emoji: '🏠', gradient: 'linear-gradient(135deg,#fae8ff,#c084fc)', illustration: { label: '租房看房', motifs: ['house', 'key', 'door'], accent: '#9333ea' } },
  { sceneKey: 'Emergency', freqRank: 18, tier: 'P0', titleZh: '紧急求助报警', titleEn: 'Emergency Help', storyHook: '突发状况，求助路人或报警，等待救援', storyOutline: [ch('开场', '发生意外', '说明需要帮助'), ch('进行', '求助应对', '安抚打电话'), ch('进行', '等待救援', '说明位置'), ch('收束', '危机解除', '情况受控')], emoji: '🚨', gradient: 'linear-gradient(135deg,#fee2e2,#f87171)', illustration: { label: '紧急求助', motifs: ['alert', 'phone', 'help'], accent: '#dc2626' } },
  { sceneKey: 'The House', freqRank: 19, tier: 'P1', titleZh: '居家一天', titleEn: 'Life at Home', storyHook: '在家各房间活动，做饭休息', storyOutline: [ch('开场', '回家进门', '开门放包'), ch('进行', '厨房客厅', '做饭休息'), ch('收束', '整理就寝', '收拾上床')], emoji: '🏡', gradient: 'linear-gradient(135deg,#ecfccb,#a3e635)', illustration: { label: '居家生活', motifs: ['house', 'kitchen', 'bed'], accent: '#65a30d' } },
  { sceneKey: 'Mailing', freqRank: 20, tier: 'P1', titleZh: '邮局寄包裹', titleEn: 'Sending a Parcel', storyHook: '打包填单，称重付费，拿到回执', storyOutline: [ch('开场', '到达邮局', '说明要寄'), ch('进行', '打包称重', '填地址付钱'), ch('收束', '拿到回执', '收好单据')], emoji: '📮', gradient: 'linear-gradient(135deg,#fef9c3,#facc15)', illustration: { label: '寄信寄件', motifs: ['box', 'letter', 'stamp'], accent: '#ca8a04' } },
  { sceneKey: 'Haircut', freqRank: 21, tier: 'P1', titleZh: '理发店剪发', titleEn: 'At the Hair Salon', storyHook: '预约剪发，沟通长度，剪完付款', storyOutline: [ch('开场', '进店预约', '说明剪发'), ch('进行', '沟通发型', '指长度'), ch('收束', '剪完付款', '照镜子付钱')], emoji: '💇', gradient: 'linear-gradient(135deg,#fce7f3,#f472b6)', illustration: { label: '理发', motifs: ['chair', 'mirror', 'scissors'], accent: '#db2777' } },
  { sceneKey: 'Gas Station', freqRank: 22, tier: 'P1', titleZh: '加油站加油', titleEn: 'Filling Up', storyHook: '停车加油，付款，继续上路', storyOutline: [ch('开场', '驶入加油站', '说明加油'), ch('进行', '加油付款', '选油付钱'), ch('收束', '继续行程', '开车离开')], emoji: '⛽', gradient: 'linear-gradient(135deg,#fef2f2,#ef4444)', illustration: { label: '加油', motifs: ['car', 'pump', 'road'], accent: '#b91c1c' } },
  { sceneKey: 'Moving House', freqRank: 23, tier: 'P1', titleZh: '搬家搬行李', titleEn: 'Moving Day', storyHook: '打包箱子，搬运装车，搬进新家', storyOutline: [ch('开场', '开始打包', '放进箱子'), ch('进行', '搬运装车', '抬重物上车'), ch('收束', '搬进新家', '卸货摆好')], emoji: '📦', gradient: 'linear-gradient(135deg,#fed7aa,#ea580c)', illustration: { label: '搬家', motifs: ['box', 'truck', 'house'], accent: '#c2410c' } },
  { sceneKey: 'Smartphone', freqRank: 24, tier: 'P2', titleZh: '手机日常用法', titleEn: 'Using a Phone', storyHook: '开机设铃声，拍照发图，查信息', storyOutline: [ch('开场', '拿出手机', '开机看电量'), ch('进行', '使用功能', '拍照发信'), ch('收束', '充电收好', '插电放回')], emoji: '📲', gradient: 'linear-gradient(135deg,#f3f4f6,#6b7280)', illustration: { label: '智能手机', motifs: ['phone', 'picture', 'message'], accent: '#4b5563' } },
  { sceneKey: 'WiFi', freqRank: 25, tier: 'P2', titleZh: '连接无线网络', titleEn: 'Connecting WiFi', storyHook: '找网络、输密码、连上上网', storyOutline: [ch('开场', '发现连不上', '说明没网'), ch('进行', '输入密码', '找名字重试'), ch('收束', '连接成功', '打开页面')], emoji: '📶', gradient: 'linear-gradient(135deg,#ecfdf5,#10b981)', illustration: { label: '无线网络', motifs: ['wifi', 'machine', 'lock'], accent: '#059669' } },
  { sceneKey: 'Video Call', freqRank: 26, tier: 'P2', titleZh: '视频通话见面', titleEn: 'Video Chat', storyHook: '发起视频，远程寒暄，结束通话', storyOutline: [ch('开场', '发起呼叫', '等接听'), ch('进行', '远程聊天', '看画面聊近况'), ch('收束', '结束通话', '道别挂断')], emoji: '📹', gradient: 'linear-gradient(135deg,#cffafe,#0891b2)', illustration: { label: '视频通话', motifs: ['screen', 'face', 'wave'], accent: '#0e7490' } },
  { sceneKey: 'Email', freqRank: 27, tier: 'P2', titleZh: '写邮件回复', titleEn: 'Writing Email', storyHook: '读信、回复、发送确认', storyOutline: [ch('开场', '收到邮件', '打开理解'), ch('进行', '撰写回复', '打字检查'), ch('收束', '发送确认', '点发送')], emoji: '✉️', gradient: 'linear-gradient(135deg,#f1f5f9,#cbd5e1)', illustration: { label: '电子邮件', motifs: ['letter', 'keyboard', 'send'], accent: '#64748b' } },
  { sceneKey: 'Online Banking', freqRank: 28, tier: 'P2', titleZh: '网银转账缴费', titleEn: 'Online Banking', storyHook: '登录账户，转账或缴费，确认余额', storyOutline: [ch('开场', '登录账户', '输密码'), ch('进行', '办理转账', '填金额'), ch('收束', '核对离开', '看余额退出')], emoji: '💳', gradient: 'linear-gradient(135deg,#e2e8f0,#475569)', illustration: { label: '网银', motifs: ['card', 'money', 'lock'], accent: '#334155' } },
  { sceneKey: 'Internet', freqRank: 29, tier: 'P2', titleZh: '上网查资料', titleEn: 'Browsing the Web', storyHook: '打开页面，搜索信息，保存结果', storyOutline: [ch('开场', '打开浏览器', '连上网络'), ch('进行', '搜索阅读', '输入看结果'), ch('收束', '保存关闭', '记下要点')], emoji: '🌐', gradient: 'linear-gradient(135deg,#e0e7ff,#6366f1)', illustration: { label: '上网', motifs: ['globe', 'search', 'page'], accent: '#4f46e5' } },
  { sceneKey: 'Social Media', freqRank: 30, tier: 'P2', titleZh: '社交媒体互动', titleEn: 'Social Media', storyHook: '发帖、看评论、回复朋友', storyOutline: [ch('开场', '打开应用', '看动态'), ch('进行', '发帖互动', '写文发图'), ch('收束', '下线休息', '关掉应用')], emoji: '📱', gradient: 'linear-gradient(135deg,#fce7f3,#db2777)', illustration: { label: '社交媒体', motifs: ['heart', 'photo', 'comment'], accent: '#be185d' } },
  { sceneKey: 'My Room', freqRank: 31, tier: 'P1', titleZh: '整理我的房间', titleEn: 'Tidying My Room', storyHook: '打扫房间，归置物品，休息', storyOutline: [ch('开场', '房间很乱', '决定整理'), ch('进行', '打扫归置', '扫地放书'), ch('收束', '休息满意', '坐干净房间')], emoji: '🛏', gradient: 'linear-gradient(135deg,#fff7ed,#fdba74)', illustration: { label: '我的房间', motifs: ['bed', 'shelf', 'broom'], accent: '#ea580c' } },
  { sceneKey: 'Sports', freqRank: 32, tier: 'P1', titleZh: '操场运动健身', titleEn: 'Sports and Exercise', storyHook: '热身锻炼，比赛或跑步，放松聊天', storyOutline: [ch('开场', '到运动场', '热身'), ch('进行', '开始锻炼', '跑步打球'), ch('收束', '放松回家', '拉伸聊赛果')], emoji: '⚽', gradient: 'linear-gradient(135deg,#d1fae5,#34d399)', illustration: { label: '运动健身', motifs: ['ball', 'run', 'water'], accent: '#059669' } },
  { sceneKey: 'The Body', freqRank: 33, tier: 'P1', titleZh: '认识身体部位', titleEn: 'Parts of the Body', storyHook: '指认头手脚，描述感觉与用途', storyOutline: [ch('开场', '看图指认', '头手脚'), ch('进行', '描述感觉', '哪里痛'), ch('收束', '小结记忆', '重复名称')], emoji: '🧍', gradient: 'linear-gradient(135deg,#ffe4e6,#fb7185)', illustration: { label: '身体部位', motifs: ['body', 'hand', 'head'], accent: '#e11d48' } },
  { sceneKey: 'Tech Support', freqRank: 34, tier: 'P2', titleZh: '报修技术支持', titleEn: 'Tech Support', storyHook: '描述故障，按指导操作，问题解决', storyOutline: [ch('开场', '报修求助', '机器不工作'), ch('进行', '逐步排查', '重启检查'), ch('收束', '恢复使用', '确认好了')], emoji: '🛠', gradient: 'linear-gradient(135deg,#e2e8f0,#1e293b)', illustration: { label: '技术支持', motifs: ['tool', 'machine', 'check'], accent: '#1e293b' } },
  { sceneKey: 'Password', freqRank: 35, tier: 'P2', titleZh: '设置找回密码', titleEn: 'Password Help', storyHook: '忘记密码，验证身份，设置新密码', storyOutline: [ch('开场', '无法登录', '忘了密码'), ch('进行', '验证重置', '收信设新密码'), ch('收束', '登录成功', '记住密码')], emoji: '🔐', gradient: 'linear-gradient(135deg,#fef2f2,#dc2626)', illustration: { label: '密码', motifs: ['lock', 'key', 'letter'], accent: '#b91c1c' } },
  { sceneKey: 'App', freqRank: 36, tier: 'P2', titleZh: '安装使用应用', titleEn: 'Using an App', storyHook: '下载安装，注册使用，学会基本操作', storyOutline: [ch('开场', '获取应用', '下载打开'), ch('进行', '注册使用', '填名字学按钮'), ch('收束', '熟练操作', '完成任务')], emoji: '📲', gradient: 'linear-gradient(135deg,#dbeafe,#2563eb)', illustration: { label: '应用', motifs: ['app', 'download', 'tap'], accent: '#1d4ed8' } },
  { sceneKey: 'Download', freqRank: 37, tier: 'P2', titleZh: '下载文件资料', titleEn: 'Downloading Files', storyHook: '找链接，下载等待，打开文件', storyOutline: [ch('开场', '找到资源', '点击下载'), ch('进行', '等待完成', '看进度'), ch('收束', '打开使用', '打开文件')], emoji: '⬇️', gradient: 'linear-gradient(135deg,#e0f2fe,#0284c7)', illustration: { label: '下载', motifs: ['arrow', 'file', 'machine'], accent: '#0369a1' } },
  { sceneKey: 'Search', freqRank: 38, tier: 'P2', titleZh: '搜索查信息', titleEn: 'Searching Online', storyHook: '输入关键词，筛选结果，找到答案', storyOutline: [ch('开场', '提出疑问', '要查某事'), ch('进行', '输入搜索', '看结果'), ch('收束', '找到答案', '阅读记下')], emoji: '🔍', gradient: 'linear-gradient(135deg,#f8fafc,#94a3b8)', illustration: { label: '搜索', motifs: ['magnifier', 'list', 'page'], accent: '#64748b' } },
  { sceneKey: 'Streaming', freqRank: 39, tier: 'P2', titleZh: '在线看视频', titleEn: 'Streaming Video', storyHook: '选片播放，暂停讨论，看完评价', storyOutline: [ch('开场', '选片播放', '点播放'), ch('进行', '观看讨论', '暂停聊情节'), ch('收束', '结束评价', '关播放器')], emoji: '📺', gradient: 'linear-gradient(135deg,#1e293b,#334155)', illustration: { label: '流媒体', motifs: ['screen', 'play', 'popcorn'], accent: '#475569' } },
  { sceneKey: 'Gaming', freqRank: 40, tier: 'P2', titleZh: '联机打游戏', titleEn: 'Playing Games', storyHook: '开局匹配，协作通关，结算告别', storyOutline: [ch('开场', '开始游戏', '进关卡'), ch('进行', '协作闯关', '互相帮助'), ch('收束', '结束复盘', '约下局')], emoji: '🎮', gradient: 'linear-gradient(135deg,#ede9fe,#7c3aed)', illustration: { label: '游戏', motifs: ['controller', 'screen', 'star'], accent: '#6d28d9' } },
  { sceneKey: 'Feelings', freqRank: 41, tier: 'P2', titleZh: '表达内心感受', titleEn: 'Sharing Feelings', storyHook: '说出心情，倾听回应，互相理解', storyOutline: [ch('开场', '倾诉心情', '说感觉'), ch('进行', '倾听回应', '安慰共鸣'), ch('收束', '情绪平复', '互相理解')], emoji: '💭', gradient: 'linear-gradient(135deg,#f5f3ff,#a78bfa)', illustration: { label: '情绪感受', motifs: ['heart', 'cloud', 'talk'], accent: '#7c3aed' } },
  { sceneKey: 'Happy', freqRank: 42, tier: 'P2', titleZh: '分享开心事', titleEn: 'Sharing Good News', storyHook: '报喜，对方祝贺，一起高兴', storyOutline: [ch('开场', '报喜', '有好消息'), ch('进行', '分享细节', '讲经过'), ch('收束', '一起庆祝', '约定庆祝')], emoji: '😊', gradient: 'linear-gradient(135deg,#fef9c3,#eab308)', illustration: { label: '开心', motifs: ['smile', 'sun', 'jump'], accent: '#ca8a04' } },
  { sceneKey: 'Sad', freqRank: 43, tier: 'P2', titleZh: '倾诉难过事', titleEn: 'When Feeling Sad', storyHook: '说出难过，获得安慰，慢慢好转', storyOutline: [ch('开场', '情绪低落', '心里难过'), ch('进行', '倾听安慰', '陪伴建议'), ch('收束', '稍感好转', '平静些')], emoji: '😢', gradient: 'linear-gradient(135deg,#e0e7ff,#818cf8)', illustration: { label: '难过', motifs: ['rain', 'tear', 'hug'], accent: '#6366f1' } },
  { sceneKey: 'Angry', freqRank: 44, tier: 'P2', titleZh: '生气与和解', titleEn: 'Anger and Peace', storyHook: '表达不满，说明原因，达成和解', storyOutline: [ch('开场', '表达不满', '为何生气'), ch('进行', '说明原因', '听解释'), ch('收束', '和解', '道歉谅解')], emoji: '😠', gradient: 'linear-gradient(135deg,#fee2e2,#b91c1c)', illustration: { label: '生气', motifs: ['storm', 'talk', 'handshake'], accent: '#991b1b' } },
  { sceneKey: 'Nervous', freqRank: 45, tier: 'P2', titleZh: '考前紧张缓解', titleEn: 'Feeling Nervous', storyHook: '考试前焦虑，朋友鼓励，镇定上场', storyOutline: [ch('开场', '承认紧张', '怕考不好'), ch('进行', '鼓励准备', '复习呼吸'), ch('收束', '镇定出发', '去考场')], emoji: '😰', gradient: 'linear-gradient(135deg,#f3e8ff,#9333ea)', illustration: { label: '紧张', motifs: ['clock', 'book', 'breath'], accent: '#7e22ce' } },
  { sceneKey: 'Surprised', freqRank: 46, tier: 'P2', titleZh: '意外惊喜反应', titleEn: 'What a Surprise', storyHook: '突然发现意外，表达惊讶，弄清缘由', storyOutline: [ch('开场', '意外发现', '没想到'), ch('进行', '追问缘由', '问怎么回事'), ch('收束', '接受结果', '笑或感慨')], emoji: '😲', gradient: 'linear-gradient(135deg,#fef3c7,#f97316)', illustration: { label: '惊讶', motifs: ['gift', 'wow', 'eyes'], accent: '#ea580c' } },
  { sceneKey: 'Disappointed', freqRank: 47, tier: 'P2', titleZh: '失望与调整', titleEn: 'Disappointment', storyHook: '期望落空，表达失望，重新计划', storyOutline: [ch('开场', '期望落空', '没如愿'), ch('进行', '表达失望', '谈原计划'), ch('收束', '调整计划', '换办法')], emoji: '😞', gradient: 'linear-gradient(135deg,#f1f5f9,#64748b)', illustration: { label: '失望', motifs: ['cloud', 'plan', 'retry'], accent: '#475569' } },
  { sceneKey: 'Animals', freqRank: 48, tier: 'P2', titleZh: '宠物与动物', titleEn: 'Pets and Animals', storyHook: '看动物、喂食、聊习性', storyOutline: [ch('开场', '遇见动物', '看狗鸟'), ch('进行', '互动喂食', '给水食物'), ch('收束', '告别离开', '说再见')], emoji: '🐕', gradient: 'linear-gradient(135deg,#fef3c7,#fcd34d)', illustration: { label: '动物', motifs: ['dog', 'bird', 'garden'], accent: '#d97706' } },
  { sceneKey: 'Nature', freqRank: 49, tier: 'P2', titleZh: '户外自然漫步', titleEn: 'Out in Nature', storyHook: '公园散步，看树花鸟，感受天气', storyOutline: [ch('开场', '走进公园', '看天空树'), ch('进行', '观察自然', '花鸟风'), ch('收束', '回家回味', '说今天很美')], emoji: '🌲', gradient: 'linear-gradient(135deg,#dcfce7,#86efac)', illustration: { label: '大自然', motifs: ['tree', 'flower', 'path'], accent: '#16a34a' } },
  { sceneKey: 'Dancing', freqRank: 50, tier: 'P2', titleZh: '学跳舞表演', titleEn: 'Learning to Dance', storyHook: '学舞步，练习，小型表演', storyOutline: [ch('开场', '进入舞室', '老师示范'), ch('进行', '跟练舞步', '数拍纠正'), ch('收束', '完成表演', '鼓掌休息')], emoji: '💃', gradient: 'linear-gradient(135deg,#fdf2f8,#ec4899)', illustration: { label: '跳舞', motifs: ['music', 'dance', 'stage'], accent: '#db2777' } },
];

const BY_KEY = new Map(SCENE_STORY_SCRIPTS.map((s) => [s.sceneKey, s]));

export {
  SCENE_TARGET_COUNT,
  DIALOGUE_TARGET_COUNT,
  DIALOGUE_MARKETING_LABEL,
  MARKETING_HEADLINE,
} from './marketing';

export function listTop50SceneKeys(): string[] {
  return SCENE_STORY_SCRIPTS.map((s) => s.sceneKey);
}

export function getSceneStory(sceneKey: string): SceneStoryScript | undefined {
  return BY_KEY.get(sceneKey);
}

export function slugifySceneKey(sceneKey: string): string {
  return sceneKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
