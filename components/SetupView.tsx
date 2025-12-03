import React, { useState, useEffect } from 'react';
import { Project, Milestone } from '../types';
import { generateSuggestions, generateRewardIdeas } from '../services/geminiService';
import { Plus, Trash2, ArrowRight, Loader2, BrainCircuit, MapPin, Lightbulb, Wind, Fingerprint, PenLine, Coffee, Eye, Footprints, Box, RefreshCw, Dice5, Volume2, Droplets, Smile, Smartphone, ChevronLeft } from 'lucide-react';

interface SetupViewProps {
  onProjectCreated: (project: Project) => void;
  onBack: () => void;
}

// Extended pool of default inspirations
const ALL_DEFAULT_INSPIRATIONS = [
  "去便利店买支喜欢的冰淇淋 🍦",
  "在公园长椅发呆20分钟 🌳",
  "泡个热水澡并点上香薰 🛁",
  "整理相册重温美好回忆 📷",
  "去图书馆借本没看过的书 📚",
  "给自己煮一杯手冲咖啡 ☕",
  "听一集收藏很久的播客 🎧",
  "睡一个没有任何闹钟的午觉 💤",
  "去花店买一支当季的鲜花 🌷",
  "看一部宫崎骏的电影 🎬",
  "去附近的河边/湖边看夕阳 🌅",
  "买一张刮刮乐试试手气 🍀",
  "整理房间的一个角落 🧹",
  "用音箱大声放喜欢的歌 🎵",
  "去吃一顿舒适的早餐 🥐",
  "给最好的朋友打个电话 📞",
  "去逛逛文具店买支笔 ✏️",
  "在路边观察流浪猫/狗 🐈",
  "涂鸦或画一幅简单的画 🎨",
  "做10分钟的全身拉伸 🧘‍♀️",
  "去超市捏捏方便面（解压）🍜",
  "煮一碗加了荷包蛋的面 🍜",
  "删掉手机里不需要的APP 📱",
  "去闻闻雨后泥土的味道 🌧️"
];

// Extended pool of calm methods
const ALL_CALM_METHODS = [
  {
    icon: Wind,
    title: "4-4-4 盒式呼吸",
    desc: "吸气4秒，屏息4秒，呼气4秒，屏息4秒。在工位上盯着一个正方形物体做3轮，欺骗神经系统进入放松状态。"
  },
  {
    icon: Fingerprint,
    title: "触感锚点 (Se)",
    desc: "握住桌上的杯子或触摸衣物面料。将全部注意力集中在指尖的温度和纹理上持续30秒。切断大脑的过度预演。"
  },
  {
    icon: PenLine,
    title: "2分钟思绪倾倒",
    desc: "拿张废纸，不加思考地写下此刻脑中所有噪音。写完后将纸反扣或揉掉。物理清除大脑缓存。"
  },
  {
    icon: Eye,
    title: "全景软视线",
    desc: "不要聚焦于屏幕一点。尝试用余光感受房间的最左和最右侧。当视野变宽、眼神变软时，副交感神经会被激活。"
  },
  {
    icon: Footprints,
    title: "桌下隐形扫描",
    desc: "从脚趾开始，用力抓地5秒，然后瞬间彻底放松。并在小腿、大腿重复。通过肌肉紧张-放松释放压力。"
  },
  {
    icon: Box,
    title: "情绪集装箱",
    desc: "闭眼10秒，想象把让你烦躁的事情塞进一个厚重的集装箱，锁上锁，看着它被起重机吊走。"
  },
  {
    icon: Droplets,
    title: "冰感重置",
    desc: "去洗手间，用冷水冲洗手腕内侧（脉搏处）30秒。这是迷走神经的关键区域，能物理降温过热的情绪大脑。"
  },
  {
    icon: Smile,
    title: "下颚解锁",
    desc: "注意你的牙关是否紧咬？张嘴，左右活动下巴，然后将舌尖轻轻抵在上颚门牙后方。面部放松会直接反馈给大脑。"
  },
  {
    icon: Volume2,
    title: "听觉变焦",
    desc: "闭眼，先努力去听环境中最远的声音（如车流），再切换听最近的声音（如电脑风扇）。来回切换3次。"
  },
  {
    icon: Dice5,
    title: "五色搜寻",
    desc: "快速在视野中找到5种蓝色的东西，或4种圆形的物体。调动 Se 功能进行单纯的视觉搜索，让 Ti/Ni 暂停转动。"
  },
  {
    icon: Smartphone,
    title: "数字翻转",
    desc: "将手机屏幕朝下扣在桌面上。告诉自己：“接下来的20分钟，我是离线的自由人。”建立物理边界。"
  },
  {
    icon: Coffee,
    title: "液体冥想",
    desc: "喝水或咖啡时，不要看屏幕。含在嘴里感受它的温度和味道，分三口缓慢吞下。专注于喉咙吞咽的感觉。"
  }
];

// Utility to shuffle array
const getRandomSubset = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const SetupView: React.FC<SetupViewProps> = ({ onProjectCreated, onBack }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id' | 'isCompleted'>[]>([
    { title: '', reward: '' },
    { title: '', reward: '' },
    { title: '', reward: '' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingRewards, setIsRefreshingRewards] = useState(false);
  
  // State for displayed items
  const [inspirations, setInspirations] = useState<string[]>([]);
  const [displayedCalmMethods, setDisplayedCalmMethods] = useState<typeof ALL_CALM_METHODS>([]);
  
  const [statusMessage, setStatusMessage] = useState('');

  // Initial shuffle on mount
  useEffect(() => {
    setInspirations(getRandomSubset(ALL_DEFAULT_INSPIRATIONS, 10));
    setDisplayedCalmMethods(getRandomSubset(ALL_CALM_METHODS, 3));
  }, []);

  const addMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { title: '', reward: '' }]);
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 3) {
      const newMilestones = [...milestones];
      newMilestones.splice(index, 1);
      setMilestones(newMilestones);
    }
  };

  const updateMilestone = (index: number, field: 'title' | 'reward', value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const applyInspiration = (inspirationText: string) => {
    const text = inspirationText.split(' ').slice(0).join(' '); // Simple clone
    
    // Find the first empty reward slot
    const emptyIndex = milestones.findIndex(m => !m.reward.trim());
    
    if (emptyIndex !== -1) {
      updateMilestone(emptyIndex, 'reward', text);
    } else {
      if (milestones.length < 5 && milestones.every(m => m.reward.trim())) {
         setMilestones([...milestones, { title: '', reward: text }]);
      }
    }
  };

  const handleMagicFill = async () => {
    if (!name.trim()) {
      alert("请先输入项目名称，这样灵感之神才能降临。");
      return;
    }
    
    setIsGenerating(true);
    setStatusMessage('正在连接灵感...');

    try {
      const result = await generateSuggestions(name, city);
      const newMilestones = result.milestones.slice(0, 5).map(m => ({
        title: m.title,
        reward: m.reward
      }));
      setMilestones(newMilestones);
      setStatusMessage('');
    } catch (e) {
      alert("灵感暂时枯竭，请手动填写细节。");
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShuffleLocalRewards = () => {
     setInspirations(getRandomSubset(ALL_DEFAULT_INSPIRATIONS, 10));
  };

  const handleRefreshRewards = async () => {
    if (!city.trim()) {
      alert("请先输入城市名称，以便为你寻找本地灵感。");
      return;
    }
    setIsRefreshingRewards(true);
    try {
      const newIdeas = await generateRewardIdeas(city);
      if (newIdeas && newIdeas.length > 0) {
        setInspirations(newIdeas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingRewards(false);
    }
  };

  const handleShuffleCalmMethods = () => {
    setDisplayedCalmMethods(getRandomSubset(ALL_CALM_METHODS, 3));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || milestones.some(m => !m.title.trim() || !m.reward.trim())) {
      alert("请为每一步都赋予名字和奖励。");
      return;
    }

    const newProject: Project = {
      id: crypto.randomUUID(), // Generate ID here if not passed
      name,
      startedAt: new Date(),
      milestones: milestones.map((m, i) => ({
        ...m,
        id: crypto.randomUUID(),
        isCompleted: false,
      })),
    };
    onProjectCreated(newProject);
  };

  return (
    <div className="w-full max-w-4xl px-6 py-12 fade-in">
      <div className="relative mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-stone-400 hover:text-stone-800 transition-colors text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> 取消
        </button>
      </div>

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-800 tracking-tight">行旅</h1>
        <p className="text-stone-500 font-light tracking-wide text-sm md:text-base">
          将高山拆解为基石，从细微处寻自我。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Project Name & City */}
        <div className="space-y-8">
            <div className="border-b border-stone-300 focus-within:border-stone-800 transition-colors pb-2">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">愿景 / 项目</label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="在此写下你的目的地..."
                className="block w-full bg-transparent border-0 p-0 text-2xl font-serif text-stone-800 placeholder:text-stone-300 focus:ring-0"
                />
            </div>
            
            <div className="border-b border-stone-300 focus-within:border-stone-800 transition-colors pb-2 flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">当前驻地</label>
                    <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="例如：上海 / 京都"
                    className="block w-full bg-transparent border-0 p-0 text-lg text-stone-700 placeholder:text-stone-300 focus:ring-0"
                    />
                </div>
                <div className="text-stone-400">
                    <MapPin className="w-4 h-4" />
                </div>
            </div>
        </div>

        {/* AI Action - Minimalist Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
           <div className="text-sm text-stone-500 font-light">
              <span className="block">心绪纷乱？让 AI 协助你理清脉络。</span>
              {city && <span className="text-xs text-stone-400 mt-1 block">已关联 {city} 地域灵感。</span>}
           </div>
           <button
              type="button"
              onClick={handleMagicFill}
              disabled={isGenerating || !process.env.API_KEY}
              className="group flex items-center gap-2 px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm transition-all disabled:opacity-50 text-sm font-medium tracking-wide"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>获取拆解思路</span>
            </button>
        </div>
        
        {statusMessage && <p className="text-xs text-center text-stone-400 italic font-serif">{statusMessage}</p>}

        {/* Milestones */}
        <div className="space-y-8 mt-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
             <h3 className="text-lg font-serif text-stone-800">步履与馈赠</h3>
             <span className="text-xs text-stone-400 tracking-wider font-light">3-5 个阶段</span>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="group relative pl-8 border-l border-stone-200 hover:border-stone-400 transition-colors duration-500">
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-stone-200 rounded-full group-hover:bg-stone-500 transition-colors duration-500"></div>
                
                {milestones.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="absolute top-0 right-0 text-stone-200 hover:text-stone-500 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      placeholder={`第 ${index + 1} 步...`}
                      className="block w-full bg-transparent border-0 p-0 text-lg font-medium text-stone-800 placeholder:text-stone-300 focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-300 italic font-serif text-sm">Reward:</span>
                    <input
                      type="text"
                      value={milestone.reward}
                      onChange={(e) => updateMilestone(index, 'reward', e.target.value)}
                      placeholder="给自己一份微小的奖赏"
                      className="block w-full bg-transparent border-0 border-b border-stone-100 focus:border-stone-300 p-0 pb-1 text-sm text-stone-600 placeholder:text-stone-300 focus:ring-0 italic"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Manual Add Button */}
          {milestones.length < 5 && (
            <button
              type="button"
              onClick={addMilestone}
              className="w-full py-3 border border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 transition-colors flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <Plus className="w-4 h-4" /> 添加步骤
            </button>
          )}

          {/* Reward Inspirations Chips */}
          <div className="pt-8">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-stone-500">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">灵感拾遗</span>
               </div>
               
               <div className="flex gap-4 text-xs font-medium text-stone-400">
                 <button type="button" onClick={handleShuffleLocalRewards} className="hover:text-stone-700 flex items-center gap-1">
                   <Dice5 className="w-3 h-3" /> 换一批
                 </button>
                 {city.trim() && (
                   <button type="button" onClick={handleRefreshRewards} disabled={isRefreshingRewards} className="hover:text-stone-700 flex items-center gap-1 disabled:opacity-50">
                     {isRefreshingRewards ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />} 本地
                   </button>
                 )}
               </div>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {inspirations.map((insp, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => applyInspiration(insp)}
                        className="px-3 py-1.5 bg-[#F5F5F4] text-stone-600 text-xs hover:bg-[#E7E5E4] hover:text-stone-800 transition-colors rounded-sm"
                    >
                        {insp}
                    </button>
                ))}
             </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#292524] text-[#FAFAF9] shadow-md hover:bg-[#1C1917] hover:shadow-lg transition-all flex items-center justify-center gap-3 text-sm font-medium tracking-[0.2em] uppercase mt-8 rounded-sm"
        >
          启程 <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Calming / Grounding Section */}
      <div className="mt-24 pt-12 border-t border-stone-200">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-serif text-stone-700">
              静心 · 锚点
            </h3>
            
            <button
                type="button"
                onClick={handleShuffleCalmMethods}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
            >
                <RefreshCw className="w-3 h-3" />
                <span>刷新</span>
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedCalmMethods.map((method, i) => (
            <div key={i} className="group bg-white p-6 border border-stone-100 hover:border-stone-300 transition-all duration-500 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-3 text-stone-600 group-hover:text-stone-800 transition-colors">
                <method.icon className="w-4 h-4 stroke-[1.5]" />
                <span className="font-serif text-sm tracking-wide">{method.title}</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                {method.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};