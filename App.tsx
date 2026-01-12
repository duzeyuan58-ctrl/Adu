
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
  // --- 电商核心场景 (Product Scenes) ---
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
    id: 'prod_tech',
    category: 'product',
    name: { en: 'Industrial', zh: '工业风格' },
    description: { en: 'Cool & Hard', zh: '硬核水泥感' },
    prompt: 'Place the product on a cool gray concrete surface in an industrial setting. Raw textures, metallic accents, and dramatic high-contrast lighting.',
    icon: <Laptop className="w-4 h-4" />,
    color: 'bg-zinc-200 text-zinc-700'
  },
  {
    id: 'prod_nature',
    category: 'product',
    name: { en: 'Outdoor', zh: '户外自然' },
    description: { en: 'Forest Glow', zh: '森林晨光感' },
    prompt: 'Place the product in an outdoor natural setting. On a sun-drenched wooden platform surrounded by blurred green foliage and soft morning bokeh.',
    icon: <Trees className="w-4 h-4" />,
    color: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'prod_night',
    category: 'product',
    name: { en: 'Late Night', zh: '深夜氛围' },
    description: { en: 'Urban Glow', zh: '静谧霓虹感' },
    prompt: 'Place the product in a moody late-night urban setting. On a dark sleek surface with deep blue shadows and warm bokeh city lights in the background.',
    icon: <Moon className="w-4 h-4" />,
    color: 'bg-indigo-900 text-indigo-100'
  },
  {
    id: 'prod_cafe',
    category: 'product',
    name: { en: 'Cafe', zh: '午后咖啡' },
    description: { en: 'Cozy Vibe', zh: '生活化场景' },
    prompt: 'Place the product on a rustic coffee shop table. Warm sunlight, a blurred coffee cup nearby, and a cozy bokeh background.',
    icon: <Coffee className="w-4 h-4" />,
    color: 'bg-amber-100 text-amber-800'
  },
  // --- 艺术创意滤镜 (Artistic Styles) ---
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
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'art_vintage',
    category: 'artistic',
    name: { en: 'Vintage', zh: '复古胶片' },
    description: { en: 'Film Grain', zh: '怀旧电影感' },
    prompt: 'Apply a warm 1980s film aesthetic with slight grain, vintage color shift, and soft bloom on highlights.',
    icon: <Film className="w-4 h-4" />,
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    id: 'art_watercolor',
    category: 'artistic',
    name: { en: 'Watercolor', zh: '清新水彩' },
    description: { en: 'Soft colors', zh: '透明渲染' },
    prompt: 'Transform the image into a beautiful watercolor painting with soft bleeding edges and vibrant transparent colors.',
    icon: <Wind className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-700'
  }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', icon: <Square size={16} /> },
  { id: '4:3', label: '4:3', icon: <RectangleHorizontal size={16} /> },
  { id: '3:4', label: '3:4', icon: <RectangleVertical size={16} /> },
  { id: '16:9', label: '16:9', icon: <RectangleHorizontal size={16} className="scale-x-125" /> },
  { id: '9:16', label: '9:16', icon: <RectangleVertical size={16} className="scale-y-125" /> },
];

const TRANSLATIONS = {
  en: {
    title: 'Gemini Vision Pro',
    subtitle: 'AI Photo & Product Editor',
    authorName: 'Adu',
    createdBy: 'Created by ',
    processAll: 'Process All Images',
    processing: 'Processing Batch...',
    step1: '1. What should we do?',
    step2: '2. Style & Ratio',
    artisticTab: 'Artistic Filters',
    productTab: 'Product Scenes',
    ratioLabel: 'Aspect Ratio',
    promptPlaceholder: 'e.g. Remove background or Add dynamic lighting...',
    promptHint: 'Tip: Describe the background you want for your product!',
    dropZone: 'Upload Photos to Start',
    fileSupport: 'Supports Bulk Upload: JPG, PNG, WebP',
    noImagesTitle: 'Batch AI Magic',
    noImagesDesc: 'Upload multiple photos at once and let Gemini transform them into professional assets simultaneously.',
    uploadFirst: 'Select Multiple Images',
    done: 'COMPLETE',
    readyForExport: 'Ready to Download',
    download: 'Download',
    downloadAll: 'Download All (ZIP)',
    zipping: 'Creating ZIP...',
    clear: 'Clear Gallery',
    defaultPrompt: 'Remove the background and keep only the subject sharp and clear.',
    retry: 'Retry',
    statusProcessing: 'Magic in progress...',
    promptLabel: 'AI Task',
    delete: 'Delete',
    dragOverlay: 'Drop to Upload Batch',
    compare: 'Hold to compare',
    compareSlider: 'Before & After',
    adjust: 'Fine-tune',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    reset: 'Reset',
    copyright: 'All Rights Reserved.'
  },
  zh: {
    title: 'Gemini 智能视觉',
    subtitle: 'AI 创意与电商编辑器',
    authorName: 'Adu',
    createdBy: '作者：',
    processAll: '批量处理所有图片',
    processing: '批量处理中...',
    step1: '1. 输入处理指令',
    step2: '2. 风格与比例',
    artisticTab: '艺术滤镜',
    productTab: '电商场景',
    ratioLabel: '画幅比例',
    promptPlaceholder: '例如：移除背景 或 增加自然光影效果...',
    promptHint: '提示：详细描述你希望商品出现的场景。',
    dropZone: '上传图片开始批量处理',
    fileSupport: '支持多图上传: JPG, PNG, WebP',
    noImagesTitle: '批量 AI 编辑魔法',
    noImagesDesc: '一次性上传多张照片，Gemini 将同时为您生成专业级的电商展示图或艺术作品。',
    uploadFirst: '选择多张图片上传',
    done: '已完成',
    readyForExport: '可以导出',
    download: '下载',
    downloadAll: '批量下载 (ZIP)',
    zipping: '正在打包 ZIP...',
    clear: '清空列表',
    defaultPrompt: '移除背景，仅保留主体并使其清晰锐利。',
    retry: '重试',
    statusProcessing: '批量魔法施法中...',
    promptLabel: 'AI 任务',
    delete: '删除',
    dragOverlay: '松开即可批量上传',
    compare: '按住对比',
    compareSlider: '前后对比',
    adjust: '后期微调',
    brightness: '亮度',
    contrast: '对比度',
    saturation: '饱和度',
    reset: '重置',
    copyright: '版权所有。'
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
    <div className="relative group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-xl hover:border-indigo-200">
      <div 
        className={`aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center ${item.status === 'completed' ? 'cursor-zoom-in' : ''}`}
        onClick={() => item.status === 'completed' && item.processedUrl && onPreview(item)}
      >
        {item.status === 'processing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="relative">
               <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
               <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-sm font-bold text-slate-700 animate-pulse">{t.statusProcessing}</span>
          </div>
        )}

        {item.status === 'completed' && (
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onMouseDown={(e) => { e.stopPropagation(); setShowOriginal(true); }}
              onMouseUp={(e) => { e.stopPropagation(); setShowOriginal(false); }}
              onMouseLeave={() => setShowOriginal(false)}
              onTouchStart={(e) => { e.stopPropagation(); setShowOriginal(true); }}
              onTouchEnd={() => setShowOriginal(false)}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-600 shadow-lg border border-slate-200 hover:bg-white active:scale-90 transition-transform"
              title={t.compare}
            >
              <Eye size={18} />
            </button>
            <div className="w-10 h-10 bg-indigo-600/90 backdrop-blur rounded-xl flex items-center justify-center text-white shadow-lg border border-indigo-400">
              <Maximize2 size={18} />
            </div>
          </div>
        )}
        
        <img 
          src={displayUrl} 
          alt="Result" 
          className={`w-full h-full transition-all duration-300 ${
            item.status === 'processing' ? 'scale-110 opacity-30 blur-lg' : 'object-contain p-2'
          }`}
        />

        {showOriginal && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md font-bold uppercase tracking-widest shadow-lg z-20">
            Original
          </div>
        )}

        {item.status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50/95 text-red-600 p-6 text-center">
            <AlertCircle className="w-10 h-10 mb-3" />
            <p className="text-sm font-bold mb-4">{item.error || 'Connection Failed'}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onRetry(item.id); }}
              className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-all active:scale-95"
            >
              {t.retry}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
        <div className="flex-1 truncate pr-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.promptLabel}</p>
          <p className="text-sm text-slate-700 font-semibold truncate leading-relaxed">{item.prompt}</p>
        </div>
        <div className="flex gap-1.5">
          {item.processedUrl && (
            <a 
              href={item.processedUrl} 
              download={`gemini-edit-${item.id}.png`}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title={t.download}
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title={t.delete}
          >
            <Trash2 className="w-5 h-5" />
          </button>
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
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newPos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(newPos, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden cursor-ew-resize rounded-2xl bg-slate-900"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-contain p-4"
        style={{
          filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-xl z-10"
        style={{ width: `${position}%` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-contain p-4 bg-slate-100/50 backdrop-blur-sm"
          style={{ width: `${100 / (position / 100)}%` }}
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Original</div>
      </div>

      <div 
        className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-lg pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
          <Columns2 size={16} className="text-slate-900" />
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
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'error', error: err.message || 'API Error' } : img
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
        zip.file(`gemini-edit-${img.id}.${extension}`, blob);
      });
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `gemini-batch-export-${Date.now()}.zip`;
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
      {/* Lightbox Preview */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/98 backdrop-blur-2xl transition-all animate-in fade-in duration-300"
          onClick={() => { setPreviewItem(null); setAdjustments({ brightness: 100, contrast: 100, saturation: 100 }); }}
        >
          <button className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]">
            <X size={28} />
          </button>
          
          <div className="w-full h-full flex flex-col lg:flex-row p-4 lg:p-10 gap-8" onClick={e => e.stopPropagation()}>
            <div className="flex-1 relative flex items-center justify-center bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <ComparisonSlider before={previewItem.originalUrl} after={previewItem.processedUrl!} adjustments={adjustments} />
            </div>

            <div className="lg:w-80 flex flex-col gap-6 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl h-fit self-center">
              <div>
                <h4 className="text-white font-black flex items-center gap-3 mb-2">
                  <SlidersHorizontal size={20} className="text-indigo-400" />
                  {t.adjust}
                </h4>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{t.compareSlider}</p>
              </div>

              <div className="space-y-6">
                {[{ key: 'brightness', label: t.brightness }, { key: 'contrast', label: t.contrast }, { key: 'saturation', label: t.saturation }].map(({ key, label }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{label}</label>
                      <span className="text-xs font-black text-indigo-400">{(adjustments as any)[key]}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={(adjustments as any)[key]} 
                      onChange={e => setAdjustments({...adjustments, [key]: parseInt(e.target.value)})}
                      className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100 })}
                className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/5"
              >
                <RotateCcw size={14} />
                {t.reset}
              </button>

              <div className="mt-4 pt-6 border-t border-white/10">
                <a 
                  href={previewItem.processedUrl} 
                  download="gemini-edited.png"
                  className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-600/90 backdrop-blur-sm">
          <div className="text-center p-12 border-4 border-dashed border-white/50 rounded-[4rem] scale-110">
             <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-white animate-bounce">
               <Files size={48} />
             </div>
             <p className="text-4xl font-black text-white">{t.dragOverlay}</p>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-none">
                {t.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.subtitle}</p>
                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                 <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded-full text-[9px] font-bold text-indigo-500 border border-indigo-100/50 transition-transform hover:scale-105">
                    <User size={8} className="text-indigo-400" />
                    {t.createdBy}{t.authorName}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 font-bold text-sm bg-white"
            >
              <Languages size={18} />
              <span className="hidden sm:inline">{lang === 'en' ? '中文' : 'English'}</span>
            </button>

            <button 
              onClick={processAll}
              disabled={isProcessingAll || images.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all shadow-xl ${
                isProcessingAll || images.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200 hover:-translate-y-0.5'
              }`}
            >
              {isProcessingAll ? <><RefreshCw className="w-5 h-5 animate-spin" /> {t.processing}</> : <><Wand2 className="w-5 h-5" /> {t.processAll}</>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Step 1: Prompt */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    {t.step1}
                  </h2>
                  <textarea 
                    value={globalPrompt}
                    onChange={(e) => setGlobalPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-6 py-5 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 resize-none font-bold text-lg leading-relaxed shadow-inner"
                    placeholder={t.promptPlaceholder}
                  />
                  <p className="text-sm text-slate-400 font-semibold italic">{t.promptHint}</p>
                </div>

                {/* Step 2: Styles & Ratio */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                      {t.step2}
                    </h2>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                      {['product', 'artistic'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                          {(t as any)[tab + 'Tab']}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dense Filter Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {FILTER_PRESETS.filter(f => f.category === activeTab || f.id === 'none').map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilterId(filter.id)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all active:scale-95 group ${
                          selectedFilterId === filter.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${filter.color}`}>
                          {filter.icon}
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-black leading-tight truncate w-full ${selectedFilterId === filter.id ? 'text-indigo-900' : 'text-slate-800'}`}>{filter.name[lang]}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase truncate opacity-70">{filter.description[lang]}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Ratio Selector */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setSelectedRatio(ratio.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all font-bold text-[10px] ${
                          selectedRatio === ratio.id ? 'bg-white border-indigo-600 text-indigo-600 shadow-md' : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {ratio.icon} {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Area */}
        {images.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <ImageIcon className="text-indigo-600" /> Gallery ({images.length})
               </h3>
               <div className="flex items-center gap-3">
                  <button onClick={handleBatchDownload} disabled={isZipping} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 rounded-2xl transition-all text-sm flex items-center gap-2 shadow-sm border border-indigo-200 active:scale-95">
                    {isZipping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Archive size={16} />} {isZipping ? t.zipping : t.downloadAll}
                  </button>
                  <button onClick={() => setImages([])} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm flex items-center gap-2">
                    <Trash2 size={16} /> {t.clear}
                  </button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map(item => (
                <ImageCard key={item.id} item={item} onRemove={removeImage} onRetry={processImage} onPreview={setPreviewItem} lang={lang} />
              ))}
              <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <label htmlFor="file-upload" className="aspect-square flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-2xl hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group bg-slate-50/30">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm"><Plus size={24} /></div>
                <span className="mt-3 text-sm font-bold text-slate-400 group-hover:text-indigo-600">Add More</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[4rem] shadow-sm transition-all">
            <input type="file" id="main-upload" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <label htmlFor="main-upload" className="flex flex-col items-center justify-center py-24 cursor-pointer hover:bg-slate-50/50 transition-all group">
              <div className="w-32 h-32 bg-indigo-600 text-white rounded-[3rem] flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform shadow-2xl shadow-indigo-200">
                <Files size={56} />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24} className="text-indigo-500" /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4">{t.noImagesTitle}</h3>
              <p className="text-slate-500 text-center max-w-md mb-8 px-10 font-bold text-lg leading-relaxed">{t.noImagesDesc}</p>
              <div className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 group-hover:bg-indigo-700 transition-all">{t.uploadFirst}</div>
              <span className="text-xs text-slate-400 mt-6 font-bold uppercase tracking-widest">{t.fileSupport}</span>
            </label>
          </div>
        )}
      </main>

      {/* Footer Signature */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
               <ImageIcon size={20} />
             </div>
             <div>
                <p className="text-slate-900 font-black text-sm">{t.title}</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} {t.copyright}</p>
             </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.createdBy}</span>
                <span className="px-3 py-1.5 bg-white border border-indigo-100 rounded-lg text-indigo-600 font-black text-xs shadow-sm shadow-indigo-50/50 flex items-center gap-2">
                  {t.authorName}
                  <ExternalLink size={10} className="text-indigo-300" />
                </span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span>POWERED BY</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                   <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span className="text-slate-600 tracking-tighter">Gemini 2.5 Flash</span>
                </div>
             </div>
          </div>
        </div>
      </footer>

      {images.some(img => img.status === 'completed') && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-6">
          <div className="bg-slate-900/95 backdrop-blur-2xl px-10 py-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl border border-white/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-white text-lg font-black tracking-tight uppercase"> {images.filter(img => img.status === 'completed').length} {t.done}</span>
              </div>
              <span className="text-white/40 text-xs font-black uppercase tracking-widest">{t.readyForExport}</span>
            </div>
            <button onClick={handleBatchDownload} disabled={isZipping} className="text-white hover:text-indigo-400 text-sm font-black transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all group-hover:scale-110">
                {isZipping ? <RefreshCw size={20} className="animate-spin" /> : <Archive size={20} />}
              </div>
              {isZipping ? t.zipping : t.downloadAll}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
