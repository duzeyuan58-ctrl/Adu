
import React, { useState, useEffect, useRef } from 'react';
import { ImageItem, Language } from './types';
import { editImage, fileToBase64 } from './services/geminiService';
import JSZip from 'jszip';
import { 
  Sparkles, 
  Trash2, 
  Download, 
  Wand2, 
  RefreshCw, 
  AlertCircle, 
  Film, 
  Palette, 
  Zap, 
  Languages,
  Store,
  Trees,
  Files,
  Plus,
  X,
  Maximize2,
  Archive,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Columns2,
  Coffee,
  Sun,
  Moon,
  Home,
  Laptop,
  Brush,
  Wind,
  Candy,
  User,
  ExternalLink,
  Layers,
  ZapOff,
  LayoutTemplate,
  HelpCircle,
  BookOpen,
  Rocket,
  Key,
  Image as ImageIcon 
} from 'lucide-react';

interface FilterPreset {
  id: string;
  category: 'artistic' | 'product';
  name: { en: string, zh: string };
  description: { en: string, zh: string };
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    category: 'artistic',
    name: { en: 'Original', zh: '原图' },
    description: { en: 'No style', zh: '无效果' },
    prompt: '',
    icon: <ImageIcon className="w-4 h-4" />,
    color: 'bg-slate-100 text-slate-600'
  },
  {
    id: 'prod_minimal',
    category: 'product',
    name: { en: 'Nordic', zh: '北欧简约' },
    description: { en: 'Minimalist', zh: '白净原木风' },
    prompt: 'Place the product in a bright, minimalist Scandinavian interior. Clean white walls, light wood surfaces, soft natural daylight from a side window.',
    icon: <Home className="w-4 h-4" />,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 'prod_luxury',
    category: 'product',
    name: { en: 'Studio Luxury', zh: '高端影棚' },
    description: { en: 'Premium Light', zh: '奢侈品级光影' },
    prompt: 'Place the product in a high-end professional studio setting. Exquisite lighting with soft key lights and sharp rim lights, subtle dark reflections, luxury product photography style with expensive atmosphere.',
    icon: <Store className="w-4 h-4" />,
    color: 'bg-slate-800 text-yellow-500'
  },
  {
    id: 'prod_macaron',
    category: 'product',
    name: { en: 'Macaron', zh: '梦幻马卡龙' },
    description: { en: 'Dreamy Colors', zh: '美妆护肤风' },
    prompt: 'Place the product in a soft, dreamy macaron-colored setting. Pastel pink, mint green, and lavender silk background with soft diffused lighting and gentle shadows.',
    icon: <Candy className="w-4 h-4" />,
    color: 'bg-pink-100 text-pink-500'
  },
  {
    id: 'art_oil',
    category: 'artistic',
    name: { en: 'Oil Painting', zh: '古典油画' },
    description: { en: 'Rich strokes', zh: '重彩笔触' },
    prompt: 'Transform the image into a classical oil painting with rich textures, visible brushstrokes, and Renaissance color palette.',
    icon: <Brush className="w-4 h-4" />,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'art_cyber',
    category: 'artistic',
    name: { en: 'Cyberpunk', zh: '赛博朋克' },
    description: { en: 'Neon vibe', zh: '幻彩霓虹' },
    prompt: 'Apply a futuristic cyberpunk aesthetic with vibrant pink, cyan, and purple lighting, rain reflections, and high contrast.',
    icon: <Zap size={16} className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700'
  }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', icon: <Square size={16} /> },
  { id: '4:3', label: '4:3', icon: <RectangleHorizontal size={16} /> },
  { id: '3:4', label: '3:4', icon: <RectangleVertical size={16} /> },
  { id: '16:9', label: '16:9', icon: <RectangleHorizontal size={16} className="scale-x-125" /> },
];

const TRANSLATIONS = {
  en: {
    title: 'Vision Editor',
    subtitle: 'Advanced AI Content Studio',
    authorName: 'Adu',
    createdBy: 'Engineered by ',
    processAll: 'Magic Batch Process',
    processing: 'AI Thinking...',
    step1: '1. Describe the Vision',
    step2: '2. Curate Style',
    artisticTab: 'Artist',
    productTab: 'Product',
    ratioLabel: 'Canvas Ratio',
    promptPlaceholder: 'e.g. Remove background and add cinematic glow...',
    promptHint: 'Pro Tip: Be descriptive for better AI understanding.',
    dropZone: 'Drop high-res images to start',
    fileSupport: 'Supports JPG, PNG, WebP • Batch Ready',
    noImagesTitle: 'Revolutionize Your Workflow',
    noImagesDesc: 'One-click professional background removal and scene generation powered by Gemini AI.',
    uploadFirst: 'Start Creating Now',
    done: 'DONE',
    readyForExport: 'Export Assets',
    download: 'Download',
    downloadAll: 'Save Gallery (ZIP)',
    zipping: 'Packaging...',
    clear: 'Reset Studio',
    defaultPrompt: 'Remove the background cleanly and enhance subjects details.',
    retry: 'Retry',
    statusProcessing: 'Generating magic...',
    promptLabel: 'AI Task',
    delete: 'Discard',
    dragOverlay: 'Ready to Import',
    compare: 'Hold to compare',
    compareSlider: 'Before & After',
    adjust: 'Fine-tune',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    reset: 'Reset',
    help: 'Help & Deploy',
    copyright: 'Vision Studio. Built for professionals.',
    helpTitle: 'Guide & Deploy',
    helpUsage: 'How to use?',
    helpDeploy: 'Publish to web',
    helpUsageStep1: 'Upload one or more photos.',
    helpUsageStep2: 'Describe the scene or use presets.',
    helpUsageStep3: 'Click "Magic Process" and download.',
    helpDeployStep1: 'Upload files to GitHub.',
    helpDeployStep2: 'Link to Vercel/Netlify.',
    helpDeployStep3: 'Add "API_KEY" in env variables.',
    getKey: 'Get your API Key here (Free)',
    gotIt: 'Got it'
  },
  zh: {
    title: 'Vision Editor',
    subtitle: 'Adu 专属 AI 图像实验室',
    authorName: 'Adu',
    createdBy: '开发者：',
    processAll: '一键开启批量魔法',
    processing: 'AI 正在创作...',
    step1: '1. 定义处理指令',
    step2: '2. 选择场景风格',
    artisticTab: '艺术风格',
    productTab: '电商实拍',
    ratioLabel: '画幅比例',
    promptPlaceholder: '例如：精准抠图并添加高级灰色背景...',
    promptHint: '专业建议：描述得越细致，生成效果越惊艳。',
    dropZone: '拖入图片即可开始批量创作',
    fileSupport: '支持 JPG, PNG, WebP • 批量处理无上限',
    noImagesTitle: '重新定义图片处理流程',
    noImagesDesc: '基于 Gemini AI 的全自动背景移除与电商级场景生成工具。告别繁琐抠图，一键完成。',
    uploadFirst: '立即开始创作',
    done: '已完成',
    readyForExport: '准备导出资源',
    download: '下载',
    downloadAll: '打包下载所有 (ZIP)',
    zipping: '正在打包中...',
    clear: '清空画布',
    defaultPrompt: '精准移除背景，仅保留主体并增强其纹理细节。',
    retry: '重试',
    statusProcessing: '魔法施法中...',
    promptLabel: 'AI 指令',
    delete: '删除',
    dragOverlay: '松开鼠标即可导入',
    compare: '按住对比',
    compareSlider: '前后效果对比',
    adjust: '专业后期微调',
    brightness: '亮度',
    contrast: '对比度',
    saturation: '饱和度',
    reset: '重置参数',
    help: '帮助与发布',
    copyright: 'Vision Studio. 为专业效率而生。',
    helpTitle: '使用与部署手册',
    helpUsage: '如何使用？',
    helpDeploy: '如何发布到网站？',
    helpUsageStep1: '上传一张或多张需要处理的照片。',
    helpUsageStep2: '输入需求（如“抠图”）或选择下方预设风格。',
    helpUsageStep3: '点击批量处理，完成后可单独或打包下载。',
    helpDeployStep1: '将代码上传到 GitHub 仓库。',
    helpDeployStep2: '在 Vercel 关联仓库进行托管。',
    helpDeployStep3: '在设置中添加 API_KEY 环境变量即可。',
    getKey: '在这里获取你的 API 密钥 (免费申请)',
    gotIt: '我知道了'
  }
};

const ImageCard: React.FC<{ 
  item: ImageItem; 
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onPreview: (item: ImageItem) => void;
  lang: Language;
}> = ({ item, onRemove, onRetry, onPreview, lang }) => {
  const t = TRANSLATIONS[lang];
  const [showOriginal, setShowOriginal] = useState(false);
  const displayUrl = showOriginal ? item.originalUrl : (item.processedUrl || item.originalUrl);
  
  return (
    <div className="relative group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-300">
      <div 
        className={`aspect-[4/5] relative overflow-hidden bg-checkerboard flex items-center justify-center ${item.status === 'completed' ? 'cursor-zoom-in' : ''}`}
        onClick={() => item.status === 'completed' && item.processedUrl && onPreview(item)}
      >
        {item.status === 'processing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="relative">
               <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
               <Sparkles className="w-5 h-5 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <span className="text-xs font-black text-slate-800 tracking-widest uppercase animate-pulse">{t.statusProcessing}</span>
          </div>
        )}

        {item.status === 'completed' && (
          <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
            <button 
              onMouseDown={(e) => { e.stopPropagation(); setShowOriginal(true); }}
              onMouseUp={(e) => { e.stopPropagation(); setShowOriginal(false); }}
              onMouseLeave={() => setShowOriginal(false)}
              className="w-11 h-11 bg-white shadow-xl rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all"
              title={t.compare}
            >
              <Eye size={20} />
            </button>
            <div className="w-11 h-11 bg-indigo-600 shadow-xl rounded-2xl flex items-center justify-center text-white border border-indigo-400">
              <Maximize2 size={20} />
            </div>
          </div>
        )}
        
        <img 
          src={displayUrl} 
          alt="Result" 
          className={`w-full h-full transition-all duration-700 ${
            item.status === 'processing' ? 'scale-125 opacity-20 blur-xl' : 'object-contain p-4'
          }`}
        />

        {showOriginal && (
          <div className="absolute bottom-4 left-4 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-lg backdrop-blur-md font-bold uppercase tracking-widest z-20">
            Original View
          </div>
        )}

        {item.status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50/95 text-red-600 p-8 text-center">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-sm font-black mb-6 leading-tight">{item.error || 'Connection Failed'}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onRetry(item.id); }}
              className="px-8 py-3 bg-red-600 text-white rounded-2xl text-xs font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
            >
              {t.retry}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-100 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.promptLabel}</p>
            <p className="text-sm text-slate-700 font-bold truncate leading-relaxed">{item.prompt}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title={t.delete}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonSlider: React.FC<{ before: string, after: string, adjustments: any }> = ({ before, after, adjustments }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const newPos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(newPos, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden cursor-ew-resize rounded-[2rem] bg-[#0a0a0a]"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 w-full h-full bg-checkerboard-dark opacity-40"></div>
      
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-contain p-8 z-1"
        style={{
          filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-[15px_0_40px_rgba(0,0,0,0.7)] z-10"
        style={{ width: `${position}%` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-contain p-8 bg-slate-800/20 backdrop-blur-sm"
          style={{ width: `${100 / (position / 100)}%` }}
        />
        <div className="absolute top-6 left-6 bg-black/60 text-white text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest backdrop-blur-md">Original</div>
      </div>

      <div 
        className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-2xl pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <Columns2 size={20} className="text-slate-900" />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [globalPrompt, setGlobalPrompt] = useState(TRANSLATIONS.zh.defaultPrompt);
  const [selectedFilterId, setSelectedFilterId] = useState('none');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [activeTab, setActiveTab] = useState<'product' | 'artistic'>('product');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });

  const imagesRef = useRef<ImageItem[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    const prevLang = lang === 'en' ? 'zh' : 'en';
    if (globalPrompt === TRANSLATIONS[prevLang].defaultPrompt) {
      setGlobalPrompt(TRANSLATIONS[lang].defaultPrompt);
    }
  }, [lang]);

  const t = TRANSLATIONS[lang];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const filter = FILTER_PRESETS.find(f => f.id === selectedFilterId);
    const combinedPrompt = `${globalPrompt} ${filter?.prompt || ''}`.trim();

    const newItems: ImageItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      originalUrl: URL.createObjectURL(file),
      status: 'idle',
      prompt: combinedPrompt,
    }));

    setImages(prev => [...prev, ...newItems]);
  };

  const processImage = async (id: string, currentPrompt?: string) => {
    const item = imagesRef.current.find(img => img.id === id);
    if (!item) return;

    const targetPrompt = currentPrompt || item.prompt;
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: 'processing', error: undefined, prompt: targetPrompt } : img
    ));

    try {
      const response = await fetch(item.originalUrl);
      const blob = await response.blob();
      const base64 = await fileToBase64(new File([blob], "image.png", { type: blob.type }));
      const processedUrl = await editImage(base64, blob.type, targetPrompt, selectedRatio);
      
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, processedUrl, status: 'completed' } : img
      ));
    } catch (err: any) {
      let errorMsg = err.message || 'API Error';
      if (errorMsg.includes('API_KEY')) {
        errorMsg = lang === 'zh' ? '检测到 API 密钥未配置，请检查环境变量。' : 'API Key not found. Please check env variables.';
      }
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'error', error: errorMsg } : img
      ));
    }
  };

  const processAll = async () => {
    const pending = imagesRef.current.filter(img => img.status === 'idle' || img.status === 'error');
    if (pending.length === 0) return;

    setIsProcessingAll(true);
    const filter = FILTER_PRESETS.find(f => f.id === selectedFilterId);
    const currentCombinedPrompt = `${globalPrompt} ${filter?.prompt || ''}`.trim();
    const pendingIds = pending.map(p => p.id);
    
    for (const id of pendingIds) {
      await processImage(id, currentCombinedPrompt);
    }
    setIsProcessingAll(false);
  };

  const handleBatchDownload = async () => {
    const completed = images.filter(img => img.status === 'completed' && img.processedUrl);
    if (completed.length === 0) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const promises = completed.map(async (img) => {
        const response = await fetch(img.processedUrl!);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1] || 'png';
        zip.file(`vision-edit-${img.id}.${extension}`, blob);
      });
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `vision-batch-adu-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(img => img.id === id);
      if (item?.originalUrl) URL.revokeObjectURL(item.originalUrl);
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#F8FAFC]"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-100 overflow-hidden relative">
              <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                   <HelpCircle size={28} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.helpTitle}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h3 className="text-lg font-black text-indigo-600 flex items-center gap-2">
                       <BookOpen size={18} /> {t.helpUsage}
                    </h3>
                    <ul className="space-y-3">
                       {[t.helpUsageStep1, t.helpUsageStep2, t.helpUsageStep3].map((step, i) => (
                         <li key={i} className="flex gap-3 text-sm font-bold text-slate-600">
                           <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                           {step}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-black text-purple-600 flex items-center gap-2">
                       <Rocket size={18} /> {t.helpDeploy}
                    </h3>
                    <ul className="space-y-3">
                       {[t.helpDeployStep1, t.helpDeployStep2, t.helpDeployStep3].map((step, i) => (
                         <li key={i} className="flex gap-3 text-sm font-bold text-slate-600">
                           <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${i === 2 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100'}`}>{i+1}</span>
                           {step}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="mt-10 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                 <div className="flex items-start gap-4">
                    <Key className="text-indigo-400 shrink-0 mt-1" />
                    <p className="text-xs font-bold text-indigo-600 leading-relaxed italic">
                       {lang === 'zh' ? '特别注意：API Key 是工具的“心脏”。发布到 Vercel 时，请务必在 "Environment Variables" 里添加名为 API_KEY 的变量。' : 'Important: API Key is the heart of the tool. When deploying to Vercel, ensure you add "API_KEY" in the Environment Variables section.'}
                    </p>
                 </div>
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-indigo-200 rounded-xl text-indigo-600 text-xs font-black hover:bg-indigo-50 transition-colors shadow-sm"
                 >
                   <ExternalLink size={14} />
                   {t.getKey}
                 </a>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                {t.gotIt}
              </button>
           </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/98 backdrop-blur-3xl transition-all animate-in fade-in duration-500"
          onClick={() => { setPreviewItem(null); setAdjustments({ brightness: 100, contrast: 100, saturation: 100 }); }}
        >
          <button className="absolute top-8 right-8 p-5 bg-white/5 hover:bg-red-500/20 text-white rounded-full transition-all z-[110] group">
            <X size={32} className="group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="w-full h-full flex flex-col lg:flex-row p-6 lg:p-12 gap-10" onClick={e => e.stopPropagation()}>
            <div className="flex-1 relative flex items-center justify-center bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)]">
              <ComparisonSlider before={previewItem.originalUrl} after={previewItem.processedUrl!} adjustments={adjustments} />
            </div>

            <div className="lg:w-96 flex flex-col gap-8 bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl h-fit self-center">
              <div>
                <h4 className="text-white text-xl font-black flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <SlidersHorizontal size={20} />
                  </div>
                  {t.adjust}
                </h4>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">{t.compareSlider}</p>
              </div>

              <div className="space-y-8">
                {[{ key: 'brightness', label: t.brightness }, { key: 'contrast', label: t.contrast }, { key: 'saturation', label: t.saturation }].map(({ key, label }) => (
                  <div key={key} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                      <span className="text-sm font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-lg">{(adjustments as any)[key]}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={(adjustments as any)[key]} 
                      onChange={e => setAdjustments({...adjustments, [key]: parseInt(e.target.value)})}
                      className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100 })}
                  className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black transition-all border border-white/5 active:scale-95"
                >
                  <RotateCcw size={16} />
                  {t.reset}
                </button>
                <a 
                  href={previewItem.processedUrl} 
                  download="vision-export.png"
                  className="py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
                >
                  <Download size={20} />
                  {t.download}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-indigo-600/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="text-center p-16 border-4 border-dashed border-white/40 rounded-[5rem] scale-110">
             <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white animate-bounce shadow-2xl">
               <Layers size={56} />
             </div>
             <p className="text-5xl font-black text-white tracking-tighter">{t.dragOverlay}</p>
          </div>
        </div>
      )}

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-6 transition-transform hover:rotate-0 cursor-pointer group">
              <Sparkles size={32} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 bg-clip-text text-transparent tracking-tighter leading-none">
                  {t.title}
                </h1>
                <span className="px-2.5 py-1 bg-slate-900 text-[10px] font-black text-white rounded-md tracking-tighter">BETA</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{t.subtitle}</p>
                 <div className="flex items-center gap-2 px-2.5 py-0.5 bg-indigo-50 rounded-full text-[9px] font-black text-indigo-600 border border-indigo-100/50 hover:bg-indigo-100 transition-colors">
                    <User size={10} className="text-indigo-400" />
                    {t.createdBy}<span className="underline decoration-indigo-200 uppercase">{t.authorName}</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-indigo-600 font-black text-xs active:scale-95 shadow-sm"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline">{t.help}</span>
            </button>

            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all text-slate-700 font-black text-xs active:scale-95 shadow-sm"
            >
              <Languages size={18} className="text-slate-400" />
              <span className="hidden sm:inline">{lang === 'en' ? 'SWITCH TO ZH' : '切换中文版'}</span>
            </button>

            {images.length > 0 && (
              <button 
                onClick={processAll}
                disabled={isProcessingAll}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-200 ${
                  isProcessingAll
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 hover:-translate-y-1'
                }`}
              >
                {isProcessingAll ? <><RefreshCw className="w-5 h-5 animate-spin" /> {t.processing}</> : <><Wand2 className="w-5 h-5" /> {t.processAll}</>}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        {images.length === 0 ? (
          /* Professional Landing Page State */
          <div className="space-y-24 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black tracking-widest uppercase border border-indigo-100 mb-8 animate-bounce">
                <Zap size={14} /> New: Studio Scenes v2.0
              </div>
              <h2 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                {t.noImagesTitle}
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                {t.noImagesDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <input type="file" id="hero-upload" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <label htmlFor="hero-upload" className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-4">
                  <Files size={24} />
                  {t.uploadFirst}
                </label>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" /></div>)}
                  </div>
                  <p className="text-sm font-bold text-slate-400 italic">Trusted by creators worldwide</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: <ZapOff className="text-amber-500" />, title: "Instant Removal", desc: "No manual brushing. Our AI isolates subjects in milliseconds." },
                { icon: <LayoutTemplate className="text-indigo-500" />, title: "Batch Efficiency", desc: "Process 50+ photos at once while you focus on creativity." },
                { icon: <Store className="text-emerald-500" />, title: "E-Commerce Ready", desc: "Transform snapshots into professional studio listings." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 32 })}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">{f.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Editor Main State */
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-200">
              <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* Step 1: Prompt */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm"><Wand2 size={20} /></div>
                      {t.step1}
                    </h2>
                    <textarea 
                      value={globalPrompt}
                      onChange={(e) => setGlobalPrompt(e.target.value)}
                      rows={3}
                      className="w-full px-8 py-7 rounded-[2.5rem] border border-slate-200 bg-slate-50 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 resize-none font-bold text-xl leading-relaxed shadow-inner"
                      placeholder={t.promptPlaceholder}
                    />
                    <div className="flex items-center gap-3 text-slate-400">
                      <Sparkles size={14} className="text-indigo-400" />
                      <p className="text-xs font-bold italic">{t.promptHint}</p>
                    </div>
                  </div>

                  {/* Step 2: Styles & Ratio */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm"><Palette size={20} /></div>
                        {t.step2}
                      </h2>
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        {['product', 'artistic'].map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 rounded-[1.2rem] text-[11px] font-black tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                            {(t as any)[tab + 'Tab']}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Dense Filter Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-3 custom-scrollbar">
                      {FILTER_PRESETS.filter(f => f.category === activeTab || f.id === 'none').map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedFilterId(filter.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 group ${
                            selectedFilterId === filter.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${filter.color}`}>
                            {React.cloneElement(filter.icon as React.ReactElement<any>, { size: 20 })}
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-[12px] font-black leading-tight truncate ${selectedFilterId === filter.id ? 'text-indigo-900' : 'text-slate-900'}`}>{filter.name[lang]}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-tighter">{filter.description[lang]}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Ratio Selector */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio.id}
                          onClick={() => setSelectedRatio(ratio.id)}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-all font-black text-xs active:scale-95 ${
                            selectedRatio === ratio.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {React.cloneElement(ratio.icon as React.ReactElement<any>, { size: 14 })} {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Area */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                 <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><ImageIcon size={20} /></div>
                   Studio Gallery <span className="text-slate-300 ml-2">[{images.length}]</span>
                 </h3>
                 <div className="flex items-center gap-4">
                    <button onClick={handleBatchDownload} disabled={isZipping} className="px-8 py-4 bg-indigo-50 text-indigo-600 font-black hover:bg-indigo-100 rounded-2xl transition-all text-xs flex items-center gap-3 shadow-sm border border-indigo-200 active:scale-95">
                      {isZipping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Archive size={18} />} {isZipping ? t.zipping : t.downloadAll}
                    </button>
                    <button onClick={() => setImages([])} className="px-6 py-4 text-red-500 font-black hover:bg-red-50 rounded-2xl transition-colors text-xs flex items-center gap-3 active:scale-95">
                      <Trash2 size={18} /> {t.clear}
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {images.map(item => (
                  <ImageCard key={item.id} item={item} onRemove={removeImage} onRetry={processImage} onPreview={setPreviewItem} lang={lang} />
                ))}
                <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <label htmlFor="file-upload" className="aspect-[4/5] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] hover:bg-white hover:border-indigo-400 transition-all cursor-pointer group bg-slate-100/30">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl shadow-slate-200/50 group-hover:rotate-12 group-hover:scale-110"><Plus size={36} /></div>
                  <span className="mt-6 text-sm font-black text-slate-400 group-hover:text-indigo-600 tracking-widest uppercase">Import Assets</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full bg-white border-t border-slate-200 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <Sparkles size={20} />
                 </div>
                 <span className="text-2xl font-black tracking-tighter">{t.title}</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Empowering the next generation of digital creators with Gemini AI technology. Professional tools for every workflow.
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-6">
               <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.createdBy}</span>
                  <a href="#" className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-black text-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-3 group">
                    <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] uppercase">{t.authorName.charAt(0)}</div>
                    {t.authorName}
                    <ExternalLink size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </a>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>© {new Date().getFullYear()} {t.copyright}</span>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>Powered by Gemini 2.5</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Batch Control */}
      {images.some(img => img.status === 'completed') && !previewItem && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/90 backdrop-blur-3xl px-12 py-7 rounded-[3.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                 <span className="text-white text-2xl font-black tracking-tight uppercase"> {images.filter(img => img.status === 'completed').length} {t.done}</span>
              </div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t.readyForExport}</span>
            </div>
            <button onClick={handleBatchDownload} disabled={isZipping} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-3xl font-black text-sm transition-all flex items-center gap-4 shadow-xl active:scale-95 group">
              {isZipping ? <RefreshCw className="animate-spin" /> : <Archive size={20} className="group-hover:scale-110" />}
              {isZipping ? t.zipping : t.downloadAll}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        .bg-checkerboard {
          background-color: #ffffff;
          background-image: 
            linear-gradient(45deg, #f8fafc 25%, transparent 25%), 
            linear-gradient(-45deg, #f8fafc 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f8fafc 75%), 
            linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        .bg-checkerboard-dark {
          background-image: 
            linear-gradient(45deg, #18181b 25%, transparent 25%), 
            linear-gradient(-45deg, #18181b 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #18181b 75%), 
            linear-gradient(-45deg, transparent 75%, #18181b 75%);
          background-size: 32px 32px;
          background-position: 0 0, 0 16px, 16px -16px, -16px 0px;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
