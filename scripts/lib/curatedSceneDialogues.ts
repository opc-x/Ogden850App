/** 人工精修场景故事 — 六要素饱满、Ogden 850 合规、中文口语化 */
import type { StoryBeat } from '../../src/data/sceneStoryScripts';
import { validateOgdenSentence } from './ogdenValidate';
import type { GeneratedLine } from './proceduralDialogue';

export interface CuratedLine {
  speaker: 'A' | 'B';
  en: string;
  zh: string;
  beat: StoryBeat;
}

/**
 * TOP1 超市买菜结账 — 完整故事弧（精修种子，禁止 LLM 在收束后再 append）
 * TOP3 打电话预约 — 同上
 * 六要素见 src/data/storyNarrative.ts
 */
export const CURATED_SCENE_STORIES: Record<string, CuratedLine[]> = {
  Shopping: [
    { speaker: 'A', beat: '开场', en: 'It is morning. My friend will come to my house at night.', zh: '早上。我朋友晚上要来我家吃饭。' },
    { speaker: 'B', beat: '开场', en: 'Good. The store is open now. I work at the store near your house.', zh: '好的，商店现在开门了。我就在你家附近这家超市上班。' },
    { speaker: 'A', beat: '开场', en: 'I come here on foot with a list and a bag.', zh: '我拿着清单和布袋子，步行过来的。' },
    { speaker: 'B', beat: '开场', en: 'Good morning. I am the woman here. May I help you today?', zh: '早上好，我是这边的店员。今天需要什么？' },
    { speaker: 'A', beat: '开场', en: 'Yes. There is no milk in my house. I will make soup before the meal.', zh: '要的。家里牛奶喝完了，开饭前得做汤。' },
    { speaker: 'B', beat: '开场', en: 'I see. Milk first, then food for the soup.', zh: '明白了，先拿牛奶，再买做汤的食材。' },
    { speaker: 'A', beat: '进行', en: 'Where is the milk? I do not see it on this shelf.', zh: '牛奶在哪？这个货架上我没看见。' },
    { speaker: 'B', beat: '进行', en: 'It is near the door, in the cold part. Come with me.', zh: '在门边冷藏那边，跟我来。' },
    { speaker: 'A', beat: '进行', en: 'Thank you. I will take this milk and some bread.', zh: '谢谢。我买这瓶牛奶，再要些面包。' },
    { speaker: 'B', beat: '进行', en: 'The bread is good today. The price is not high.', zh: '今天的面包很好，价格也不贵。' },
    { speaker: 'A', beat: '进行', en: 'Good. I need fruit and eggs for the soup too.', zh: '好。做汤我还得买水果和鸡蛋。' },
    { speaker: 'B', beat: '进行', en: 'The fruit is over there. Let me put it on the table for you.', zh: '水果在那边。我帮你放到台子上。' },
    { speaker: 'A', beat: '进行', en: 'This fruit looks good, but the price is a little high for me.', zh: '这水果看着不错，但对我来说有点贵。' },
    { speaker: 'B', beat: '进行', en: 'I have the same fruit here. The price is not so high.', zh: '这边有同样的水果，价格没那么高。' },
    { speaker: 'A', beat: '进行', en: 'That is good. I will take the fruit. Where are the eggs?', zh: '好，水果我要了。鸡蛋在哪儿？' },
    { speaker: 'B', beat: '进行', en: 'The eggs are in the cold part near the milk. Come with me.', zh: '鸡蛋在牛奶旁边的冷柜里，跟我来。' },
    { speaker: 'A', beat: '进行', en: 'I will take the eggs. The price is good.', zh: '我买这盒鸡蛋，价格合适。' },
    { speaker: 'B', beat: '进行', en: 'Good. You have milk, bread, fruit, and eggs now.', zh: '好。现在有牛奶、面包、水果和鸡蛋了。' },
    { speaker: 'A', beat: '进行', en: 'That is good. How do I give the money?', zh: '好。钱怎么给您？' },
    { speaker: 'B', beat: '进行', en: 'Give me the money, or put it on the machine by the table.', zh: '给现金，或者在柜台边上用机器付。' },
    { speaker: 'A', beat: '进行', en: 'I put the money on the machine. Is it good?', zh: '我在机器上付了。可以了吗？' },
    { speaker: 'B', beat: '进行', en: 'Yes, it is good. I will put the food in your bag.', zh: '可以了。我帮你把食物装进袋子里。' },
    { speaker: 'A', beat: '收束', en: 'Here is the bag. Is the amount right?', zh: '袋子给你。金额对吗？' },
    { speaker: 'B', beat: '收束', en: 'Yes, that is right. Here is your change.', zh: '对的，找您零钱。' },
    { speaker: 'A', beat: '收束', en: 'Thank you. I will go to my house and make the soup now.', zh: '谢谢。我得赶紧回家做汤了。' },
    { speaker: 'B', beat: '收束', en: 'Good. Your friend will have a good meal at night. Goodbye.', zh: '好，你朋友晚上一定能吃上顿好的。再见。' },
  ],
  'Making a Phone Call': [
    { speaker: 'B', beat: '开场', en: 'Good afternoon. This is the tooth office. How may I help you?', zh: '下午好，这里是看牙的地方。有什么事吗？' },
    { speaker: 'A', beat: '开场', en: 'It is afternoon. I need to talk to the man at the tooth office.', zh: '下午了。我得给牙科诊所打个电话。' },
    { speaker: 'A', beat: '开场', en: 'Hello. My mouth has pain. I have had pain for two days.', zh: '你好。我嘴巴疼，已经疼了两天。' },
    { speaker: 'B', beat: '开场', en: 'That is bad. Were you here before?', zh: '那不好。您之前来过吗？' },
    { speaker: 'A', beat: '开场', en: 'Yes. I was here last year. I need to see the man about my tooth.', zh: '来过，去年来的。这次牙疼，得尽快看。' },
    { speaker: 'B', beat: '开场', en: 'I see. Let us get a time for you tomorrow.', zh: '明白了。咱们给您约明天的时间。' },
    { speaker: 'A', beat: '进行', en: 'I have a long journey. I need to come tomorrow morning.', zh: '我明天要出差。最好明天上午能看上。' },
    { speaker: 'B', beat: '进行', en: 'Tomorrow morning at nine is free. Is that good for you?', zh: '明天上午九点有空，您看行吗？' },
    { speaker: 'A', beat: '进行', en: 'Nine is good. Where is the office again?', zh: '九点可以。诊所地址再说一下？' },
    { speaker: 'B', beat: '进行', en: 'It is on Green Street, near the long road. Do you see the place?', zh: '在绿街，靠近那条大路。能找到吗？' },
    { speaker: 'A', beat: '进行', en: 'Yes, I see the place. I was there last year.', zh: '能找到，我去年去过。' },
    { speaker: 'B', beat: '进行', en: 'Good. Please come ten minutes before nine.', zh: '好，请提前十分钟到。' },
    { speaker: 'A', beat: '进行', en: 'I will come early. Will the man see me tomorrow?', zh: '我会早到。明天能看上吗？' },
    { speaker: 'B', beat: '进行', en: 'Yes, he will look at your mouth and give you help.', zh: '能，他会检查您的口腔并给出处理。' },
    { speaker: 'A', beat: '进行', en: 'That is good. My pain is bad when I take food.', zh: '好。我一吃东西就疼得厉害。' },
    { speaker: 'B', beat: '进行', en: 'Do not take hard food at night. Take soft food and water.', zh: '今晚别吃硬的，吃点软的，多喝水。' },
    { speaker: 'A', beat: '进行', en: 'Put my name on the list again, please.', zh: '请再把我的名字记到预约名单上。' },
    { speaker: 'B', beat: '进行', en: 'Yes, tomorrow at nine. I will put you on the list now.', zh: '好的，明天九点。我现在就给您登记。' },
    { speaker: 'A', beat: '进行', en: 'If I am late, may I talk to you again on this number?', zh: '要是我晚了，还能打这个号码联系吗？' },
    { speaker: 'B', beat: '进行', en: 'Yes, give this number again if your time changes.', zh: '可以，时间有变就再打这个号。' },
    { speaker: 'A', beat: '进行', en: 'Good. I will put the time on my paper now.', zh: '好。我把时间记在纸上了。' },
    { speaker: 'B', beat: '进行', en: 'That is a good idea. The office is not open after five today.', zh: '这样很好。我们今天五点下班。' },
    { speaker: 'A', beat: '收束', en: 'Thank you for your help. I am better now.', zh: '谢谢帮忙，我心里踏实多了。' },
    { speaker: 'B', beat: '收束', en: 'You are welcome. We will see you tomorrow morning.', zh: '不客气，明天上午见。' },
    { speaker: 'A', beat: '收束', en: 'Goodbye. I will end the talk now.', zh: '再见，我这边挂电话了。' },
    { speaker: 'B', beat: '收束', en: 'Goodbye. Take care.', zh: '再见，保重。' },
  ],
};

export function curatedSeedLines(sceneKey: string): GeneratedLine[] {
  const raw = CURATED_SCENE_STORIES[sceneKey] ?? [];
  const out: GeneratedLine[] = [];
  for (const l of raw) {
    const v = validateOgdenSentence(l.en);
    if (!v.ok) {
      console.warn(`[curated] skip invalid [${sceneKey}]: ${l.en} → ${v.unknown.join(', ')}`);
      continue;
    }
    out.push({ ...l });
  }
  return out;
}
