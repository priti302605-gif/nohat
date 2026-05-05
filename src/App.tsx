import { useState, useRef, type FormEvent } from 'react';
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
  Type
} from 'lucide-react';
import { generateImage, improvePrompt } from './lib/gemini.ts';

type ToolType = 'generate' | 'upscale' | 'vectorize' | 'search';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [upscaleFile, setUpscaleFile] = useState<File | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toolIcons = {
    generate: <Sparkles className="w-5 h-5" />,
    upscale: <Maximize className="w-5 h-5" />,
    vectorize: <Layers className="w-5 h-5" />,
    search: <Search className="w-5 h-5" />
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const enhanced = await improvePrompt(prompt);
      const url = await generateImage(enhanced, '1K');
      setGeneratedImg(url || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = () => {
    if (!upscaleFile) return;
    setIsUpscaling(true);
    setTimeout(() => {
      setIsUpscaling(false);
      // In a real app, we'd process the file. Here we simulate success.
      alert("Image upscaled to 4K successfully! (Simulation)");
    }, 3000);
  };

  const handleVectorize = () => {
    if (!upscaleFile) return;
    setIsVectorizing(true);
    setTimeout(() => {
      setIsVectorizing(false);
      alert("Image converted to Vector (SVG) successfully! (Simulation)");
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">NOHAT <span className="text-orange-500 self-start text-[10px] bg-orange-500/10 px-1 rounded ml-1 tracking-widest">AI</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">Tools</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium hover:text-white transition-colors text-white/70">Login</button>
            <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all flex items-center gap-2">
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative z-10">
        <section className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Creative tools <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              supercharged by AI
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10"
          >
            The world's most powerful AI toolkit for creators. Generate, upscale, and convert images with a single click. No limits, pure performance.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto backdrop-blur-md">
            {(['generate', 'upscale', 'vectorize', 'search'] as ToolType[]).map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTool === tool 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'hover:bg-white/5 text-white/60'
                }`}
              >
                {toolIcons[tool]}
                <span className="capitalize">{tool}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTool === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="relative group">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic cybernetic city with neon lights and flying cars, high resolution, 8k..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 h-40 text-lg resize-none focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-white/20"
                      />
                      <button 
                        type="button"
                        onClick={async () => setPrompt(await improvePrompt(prompt))}
                        className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white/60 border border-white/10 transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        Refine Prompt
                      </button>
                    </div>
                    
                    <button
                      disabled={isGenerating || !prompt}
                      className="w-full h-14 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-orange-500/20 active:scale-[0.99] transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Generating Masterpiece...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate Image
                        </>
                      )}
                    </button>
                  </form>

                  {generatedImg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 group relative"
                    >
                      <div className="absolute inset-0 bg-orange-500/20 blur-[80px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img 
                        src={generatedImg} 
                        alt="Generated" 
                        className="w-full rounded-2xl border border-white/10 relative z-10 shadow-2xl"
                      />
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = generatedImg;
                            a.download = `nohat-ai-${Date.now()}.png`;
                            a.click();
                          }}
                          className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-colors border border-white/10 text-white"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {(activeTool === 'upscale' || activeTool === 'vectorize') && (
              <motion.div
                key="process"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-xl mx-auto text-center"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-12 backdrop-blur-sm border-dashed">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => setUpscaleFile(e.target.files?.[0] || null)}
                    accept="image/*"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="cursor-pointer group flex flex-col items-center justify-center"
                  >
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {upscaleFile ? upscaleFile.name : 'Upload your image'}
                    </h3>
                    <p className="text-white/40 mb-8 max-w-[280px]">
                      Drag and drop your file here, or click to browse. Supports JPG, PNG up to 25MB.
                    </p>
                  </label>

                  <button
                    onClick={activeTool === 'upscale' ? handleUpscale : handleVectorize}
                    disabled={!upscaleFile || isUpscaling || isVectorizing}
                    className="w-full h-14 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 active:scale-[0.99] transition-all"
                  >
                    {isUpscaling || isVectorizing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {activeTool === 'upscale' ? <Maximize className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                        {activeTool === 'upscale' ? 'Upscale to 4K' : 'Convert to Vector'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTool === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4 mb-12">
                  <Search className="w-6 h-6 text-white/40 ml-2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search high-res premium assets (Shutterstock, Unsplash, Pexels...)"
                    className="w-full bg-transparent border-none focus:outline-none text-xl placeholder:text-white/20 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img 
                        src={`https://picsum.photos/seed/${i + 20}/600/800`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-100" 
                        alt="Search result"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 duration-300 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-white/60">Premium Asset</p>
                          <p className="text-sm font-bold">Nature Series #{i}00{i}</p>
                        </div>
                        <button className="p-2.5 bg-white text-black rounded-lg hover:bg-white/90 active:scale-90 transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Feature Grid */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-white/40 leading-relaxed">
              Proprietary AI models engineered for speed. Get your creative assets in seconds, not minutes.
            </p>
          </div>
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <Download className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">No Limits</h3>
            <p className="text-white/40 leading-relaxed">
              Download as many assets as you want. Our community-driven platform believes in free access.
            </p>
          </div>
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <Maximize className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Professional Grade</h3>
            <p className="text-white/40 leading-relaxed">
              Industrial strength upscalers and vectorizers ensuring billboard-ready quality for every file.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-12 px-4 mt-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">NOHAT AI</span>
            </div>
            <p className="text-sm text-white/30">
              The premium creative toolkit for a new generation of artists and designers. Empowered by Gemini AI.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            <a href="#" className="hover:text-white transition-colors">AI Ethics</a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/20 mb-4 font-bold">Advertisements</p>
          {/* AdSense Placement Placeholder */}
          <div className="w-full h-24 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-center text-white/10 text-xs italic">
            Your Premium Ads will appear here
          </div>
        </div>
      </footer>
    </div>
  );
}

