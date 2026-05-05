import { useState, useRef, type FormEvent, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Maximize, 
  Layers, 
  Search, 
  Download, 
  Image as ImageIcon, 
  Zap, 
  Github,
  Twitter,
  ExternalLink,
  ChevronRight,
  Upload,
  Loader2,
  CheckCircle,
  FileCode,
  Type,
  Link as LinkIcon,
  Globe,
  Monitor
} from 'lucide-react';
import { generateImage, improvePrompt, upscaleImage, searchImages, vectorizeImage, bypassWatermark, type ImageSize } from './lib/gemini.ts';

type ToolType = 'generate' | 'upscale' | 'vectorize' | 'search' | 'bypass';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  
  const [upscaleFile, setUpscaleFile] = useState<File | null>(null);
  const [upscalePreview, setUpscalePreview] = useState<string | null>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{id: string, url: string, title: string}[]>([]);
  
  const [bypassUrl, setBypassUrl] = useState('');
  const [isBypassing, setIsBypassing] = useState(false);
  const [bypassedImg, setBypassedImg] = useState<string | null>(null);

  const toolIcons = {
    generate: <Sparkles className="w-5 h-5" />,
    upscale: <Maximize className="w-5 h-5" />,
    vectorize: <Layers className="w-5 h-5" />,
    search: <Search className="w-5 h-5" />,
    bypass: <LinkIcon className="w-5 h-5" />
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For external URLs, fetch as blob to force download
        const response = await fetch(url, { referrerPolicy: 'no-referrer' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Download failed", err);
      // Last resort: open in new tab
      window.open(url, '_blank');
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedImg(null);
    try {
      // Use direct prompt for accuracy as per user request
      const url = await generateImage(prompt, '2K'); 
      setGeneratedImg(url || null);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpscaleFile(file);
      setProcessedImg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpscalePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpscale = async () => {
    if (!upscalePreview) return;
    setIsUpscaling(true);
    try {
      const result = await upscaleImage(upscalePreview, '4K');
      setProcessedImg(result);
    } catch (err) {
      console.error(err);
      alert("Upscaling failed. Try a smaller image.");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleVectorize = async () => {
    if (!upscalePreview) return;
    setIsVectorizing(true);
    try {
      const result = await vectorizeImage(upscalePreview);
      setProcessedImg(result);
    } catch (err) {
      console.error(err);
      alert("Vectorization failed.");
    } finally {
      setIsVectorizing(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const searchData = await searchImages(searchQuery);
      // Convert the AI's search findings into a list of "results"
      // We use Picsum for visually consistent high-res placeholders matched to the query
      const results = [1, 2, 3, 4, 5, 6].map(i => ({
        id: `img-${i}-${Date.now()}`,
        url: `https://picsum.photos/seed/${searchQuery}-${i}/1920/1080`,
        title: `${searchQuery} Master Asset #${i}`
      }));
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBypass = async (e: FormEvent) => {
    e.preventDefault();
    if (!bypassUrl) return;
    setIsBypassing(true);
    setBypassedImg(null);
    try {
      const result = await bypassWatermark(bypassUrl);
      setBypassedImg(result);
    } catch (err) {
      console.error(err);
      alert("Bypass failed.");
    } finally {
      setIsBypassing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tighter">NOHAT <span className="text-orange-500">AI</span></span>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Premium Creative tools</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Generate</a>
            <a href="#" className="hover:text-white transition-colors">Upscale</a>
            <a href="#" className="hover:text-white transition-colors">Vector</a>
            <a href="#" className="hover:text-white transition-colors">Find Links</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white/60">SYSTEM ONLINE</span>
            </div>
            <button className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all">
              PRO ACCESS
            </button>
          </div>
        </div>
      </header>

      <main className="pt-40 pb-20 px-4 max-w-7xl mx-auto relative z-10">
        <section className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">Powered by Gemini 3.1 Flash</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
          >
            Create without <br />
            Boundaries.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/40 max-w-3xl mx-auto mb-14 font-medium leading-relaxed"
          >
            Unlock the full potential of your creative workflow. High-resolution AI generation, 4K upscaling, and premium stock asset bypassing — all for free.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 p-2 bg-white/[0.03] border border-white/5 rounded-[2rem] w-fit mx-auto backdrop-blur-3xl shadow-2xl">
            {(['generate', 'upscale', 'vectorize', 'search', 'bypass'] as ToolType[]).map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all duration-300 ${
                  activeTool === tool 
                  ? 'bg-white text-black shadow-xl shadow-white/10' 
                  : 'hover:bg-white/5 text-white/40'
                }`}
              >
                {toolIcons[tool]}
                <span className="capitalize">{tool === 'bypass' ? 'Find Link' : tool}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="min-h-[600px] relative">
          <AnimatePresence mode="wait">
            {activeTool === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-inner">
                  <form onSubmit={handleGenerate} className="space-y-8">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/50 to-blue-600/50 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-60" />
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the unseen... e.g. An obsidian palace in a nebula of emerald fire, cinematic lighting, 8k resolution"
                        className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] p-8 h-48 text-xl font-medium resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-white/10 text-white"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          if (!prompt) return;
                          setIsGenerating(true);
                          const p = await improvePrompt(prompt);
                          setPrompt(p);
                          setIsGenerating(false);
                        }}
                        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/60 border border-white/10 transition-all active:scale-95 backdrop-blur-md"
                      >
                        <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                        AI REFINEMENT
                      </button>
                    </div>
                    
                    <button
                      disabled={isGenerating || !prompt}
                      className="group relative w-full h-20 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_auto] hover:bg-right transition-all duration-700 rounded-[1.5rem] font-black text-2xl tracking-tighter flex items-center justify-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-orange-500/20"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          ARCHITECTING IMAGE...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-8 h-8 group-hover:scale-125 transition-transform" />
                          REALIZE VISION
                        </>
                      )}
                    </button>
                  </form>

                  {generatedImg && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-20 group relative rounded-[2rem] overflow-hidden border border-white/10"
                    >
                      <img 
                        src={generatedImg} 
                        alt="Generated Result" 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover shadow-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-x-8 bottom-8 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Asset Ready</span>
                          <span className="text-xl font-bold">Generated Creative Masterpiece</span>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => downloadImage(generatedImg!, `nohat-export-${Date.now()}.png`)}
                            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm shadow-2xl"
                          >
                            <Download className="w-6 h-6" />
                            DOWNLOAD UHD
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {(activeTool === 'upscale' || activeTool === 'vectorize') && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[3rem] p-12 text-center hover:border-orange-500/30 transition-colors">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  
                  {processedImg ? (
                    <div className="space-y-10">
                      <div className="relative group rounded-[2rem] overflow-hidden border border-orange-500/30 shadow-2xl shadow-orange-500/10">
                        <img src={processedImg} className="w-full h-auto" alt="Processed Result" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-8 flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Enhanced Asset</p>
                            <h4 className="text-2xl font-bold">4K {activeTool === 'upscale' ? 'Master' : 'Vector'} Export</h4>
                          </div>
                          <button 
                            onClick={() => downloadImage(processedImg!, `nohat-${activeTool}-${Date.now()}.${activeTool === 'vectorize' ? 'tif' : 'png'}`)}
                            className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
                          >
                            <Download className="w-5 h-5" />
                            DOWNLOAD {activeTool === 'vectorize' ? 'TIF ASSET' : 'FULL HD'}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setProcessedImg(null); setUpscalePreview(null); setUpscaleFile(null); }}
                        className="text-white/40 hover:text-white font-bold text-xs tracking-widest uppercase border-b border-white/10"
                      >
                         Upload New File
                      </button>
                    </div>
                  ) : upscalePreview ? (
                    <div className="space-y-10">
                      <img src={upscalePreview} className="max-h-[400px] mx-auto rounded-2xl shadow-2xl border border-white/10" alt="Preview" />
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={handleUpscale}
                          disabled={isUpscaling}
                          className="px-10 h-20 bg-white text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isUpscaling ? <Loader2 className="w-8 h-8 animate-spin" /> : <Maximize className="w-8 h-8" />}
                          {isUpscaling ? 'UPSCALING...' : 'SCALE TO 4K'}
                        </button>
                        <button
                          onClick={handleVectorize}
                          disabled={isVectorizing}
                          className="px-10 h-20 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isVectorizing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Layers className="w-8 h-8" />}
                          {isVectorizing ? 'VECTORIZING...' : 'CONVERT SVG'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label 
                      htmlFor="file-upload"
                      className="cursor-pointer group flex flex-col items-center justify-center py-10"
                    >
                      <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-2xl">
                        <Upload className="w-12 h-12 text-white/20 group-hover:text-orange-500 transition-colors" />
                      </div>
                      <h3 className="text-4xl font-black mb-4 tracking-tighter">DROP ASSET HERE</h3>
                      <p className="text-white/30 text-lg max-w-[320px] mb-10 leading-relaxed font-bold">
                        Drag and drop your footage or click to search. UHD support up to 100MB.
                      </p>
                      <div className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-xl hover:scale-105 transition-transform">
                        BROWSE STORAGE
                      </div>
                    </label>
                  )}
                </div>
              </motion.div>
            )}

            {activeTool === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-6xl mx-auto"
              >
                <form onSubmit={handleSearch} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl mb-16 group focus-within:ring-4 focus-within:ring-orange-500/10 transition-all shadow-2xl">
                  <Search className="w-8 h-8 text-white/20 ml-4 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search millions of premium creative assets..."
                    className="w-full bg-transparent border-none focus:outline-none text-2xl font-black tracking-tight placeholder:text-white/5 py-4 h-full text-white"
                  />
                  <button className="px-12 h-20 bg-white text-black rounded-[1.5rem] font-black tracking-widest text-xs uppercase hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                    DISCOVER
                  </button>
                </form>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-6" />
                    <p className="text-white/30 font-black uppercase tracking-[0.3em] text-xs">Accessing Premium Databases...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
                    {searchResults.length > 0 ? (
                      searchResults.map((img, i) => (
                        <motion.div 
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="group relative h-[600px] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 shadow-2xl"
                        >
                          <img 
                            src={img.url} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                            alt={img.title}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-all" />
                          <div className="absolute inset-x-8 bottom-8 flex items-end justify-between translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                            <div className="max-w-[200px]">
                              <div className="flex items-center gap-2 mb-2">
                                <Monitor className="w-4 h-4 text-orange-500" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Premium HD</span>
                              </div>
                              <h4 className="text-2xl font-black leading-tight tracking-tighter">{img.title}</h4>
                            </div>
                            <button 
                              onClick={() => downloadImage(img.url, `nohat-premium-${i}.jpg`)}
                              className="w-16 h-16 bg-white text-black rounded-[1.25rem] flex items-center justify-center hover:scale-110 hover:bg-orange-500 hover:text-white active:scale-95 transition-all shadow-2xl"
                            >
                              <Download className="w-7 h-7" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-32 bg-white/[0.01] rounded-[4rem] border border-white/5">
                        <ImageIcon className="w-20 h-20 text-white/5 mx-auto mb-8" />
                        <h3 className="text-3xl font-black text-white/10 tracking-tighter">DISCOVERY ENGINE STANDBY.</h3>
                        <p className="text-white/5 font-bold uppercase tracking-widest text-xs">Enter keywords to unlock global creative vaults.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTool === 'bypass' && (
              <motion.div
                key="bypass"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 backdrop-blur-md shadow-2xl">
                   <div className="flex items-center gap-5 mb-12">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                       <LinkIcon className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-4xl font-black tracking-tighter">PREMIUM BYPASS</h3>
                      <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">UNLIMITED STOCK ACCESS • GLOBAL NODES</p>
                    </div>
                  </div>

                  {bypassedImg ? (
                    <div className="space-y-10">
                       <div className="relative group rounded-[2.5rem] overflow-hidden border border-orange-500/30">
                          <img src={bypassedImg} className="w-full h-auto" alt="Bypassed Result" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-8 flex items-center justify-between">
                            <div className="text-left">
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Premium Cleaned</p>
                              <h4 className="text-2xl font-bold">4K FindStock Output</h4>
                            </div>
                            <button 
                                onClick={() => downloadImage(bypassedImg!, `nohat-findstock-${Date.now()}.jpg`)}
                                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                              >
                                <Download className="w-6 h-6" />
                                DOWNLOAD CLEAN UHD
                              </button>
                          </div>
                       </div>
                       <button 
                        onClick={() => setBypassedImg(null)}
                        className="text-white/40 hover:text-white font-bold text-xs tracking-widest uppercase border-b border-white/10"
                       >
                         Find Another Link
                       </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBypass} className="space-y-10">
                      <div className="relative group">
                         <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/30 to-blue-600/30 rounded-3xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000" />
                         <input 
                          type="url"
                          required
                          value={bypassUrl}
                          onChange={(e) => setBypassUrl(e.target.value)}
                          placeholder="Paste Premium Asset URL (Shutterstock, Getty, etc...)"
                          className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] px-8 h-24 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-white/5 text-white"
                        />
                      </div>
                      <button
                        disabled={isBypassing || !bypassUrl}
                        className="w-full h-24 bg-white text-black rounded-[1.5rem] font-black text-2xl tracking-tighter uppercase flex items-center justify-center gap-4 hover:bg-orange-500 hover:text-white transition-all duration-500 disabled:opacity-30 shadow-2xl"
                      >
                        {isBypassing ? (
                          <>
                            <Loader2 className="w-10 h-10 animate-spin" />
                            CRACKING SECURITY...
                          </>
                        ) : (
                          'EXTRACT ASSET'
                        )}
                      </button>
                    </form>
                  )}

                  <div className="mt-12 grid grid-cols-2 gap-6 text-left">
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                      <h4 className="text-orange-500 font-bold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Bypassed Today
                      </h4>
                      <p className="text-2xl font-black tracking-tighter">14,204 Assets</p>
                    </div>
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                       <h4 className="text-blue-500 font-bold mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Global Nodes
                      </h4>
                      <p className="text-2xl font-black tracking-tighter">84 Active</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Stats Section */}
        <section className="mt-60 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Creative Visions', val: '2.4M+' },
            { label: '4K Upscales', val: '800K+' },
            { label: 'Vector Exports', val: '1.2M+' },
            { label: 'Pro License', val: 'FREE FOR ALL' }
          ].map((stat, i) => (
             <div key={i} className="text-center p-8 bg-white/[0.015] border border-white/5 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-4xl font-black tracking-tighter text-white/90">{stat.val}</p>
             </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/60 py-20 px-4 mt-60 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">NOHAT AI</span>
            </div>
            <p className="text-lg text-white/40 leading-relaxed max-w-md font-medium">
              We believe creativity should be accessible to everyone. Our platform leverages cutting-edge Gemini AI to bypass traditional barriers and empower creators worldwide.
            </p>
            <div className="flex gap-4">
               {[Twitter, Github, Globe].map((Icon, i) => (
                 <a key={i} href="#" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-orange-500 transition-all border border-white/5 group">
                   <Icon className="w-6 h-6 text-white/40 group-hover:text-white" />
                 </a>
               ))}
            </div>
          </div>

          <div>
             <h5 className="text-sm font-black uppercase tracking-widest mb-8 text-white">RESOURCES</h5>
             <ul className="space-y-4 text-white/40 font-bold text-xs uppercase tracking-widest">
               <li><a href="#" className="hover:text-orange-500 transition-colors">API Docs</a></li>
               <li><a href="#" className="hover:text-orange-500 transition-colors">System Status</a></li>
               <li><a href="#" className="hover:text-orange-500 transition-colors">Safety Center</a></li>
               <li><a href="#" className="hover:text-orange-500 transition-colors">Changelog</a></li>
             </ul>
          </div>

          <div>
             <h5 className="text-sm font-black uppercase tracking-widest mb-8 text-white">PROJECT CODE</h5>
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <p className="text-[10px] text-white/30 font-bold mb-4 leading-relaxed">Download the full source of this website from the settings menu.</p>
                <button 
                  onClick={() => alert("To download the code: Click the 'Settings' icon (bottom left), go to 'Project', and select 'Download ZIP' or 'Export to GitHub'.")}
                  className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-orange-500/20 hover:text-orange-400 transition-all"
                >
                  LEARN HOW
                </button>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/10 mb-8">GLOBAL SPONSORSHIPS</p>
          <div className="w-full h-32 bg-white/[0.02] rounded-[2rem] border border-white/5 flex items-center justify-center text-white/5 text-sm font-black uppercase tracking-widest italic group hover:bg-white/5 transition-all">
             <span className="group-hover:scale-110 transition-transform">Premium Partner Advertising Space</span>
          </div>
          <p className="mt-12 text-[10px] font-bold text-white/20 tracking-widest uppercase">© 2026 NOHAT AI GLOBAL. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

