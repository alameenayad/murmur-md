import { useMemo, useRef, useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiActivity, FiFolder, FiBookOpen, FiArrowLeft, FiArrowRight, FiCheckCircle, FiXCircle, FiPenTool, FiMenu, FiX, FiHeadphones } from 'react-icons/fi'
import { LuEraser } from 'react-icons/lu'
import { TbStethoscope, TbBrain, TbEar, TbTopologyStar3 } from 'react-icons/tb'

type Scene = 'intro' | 'ausc' | 'shuffle' | 'skills' | 'ward' | 'quiz' | 'ward2' | 'progress' | 'library' | 'refs'

const scenes: Scene[] = ['intro', 'ausc', 'shuffle', 'skills', 'ward', 'quiz', 'ward2', 'progress', 'library', 'refs']

const variants = {
  enter: { x: 24, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
}

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const scene = scenes[sceneIndex]
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext|null>(null)
  const gainRef = useRef<GainNode|null>(null)
  const [findingsOpen, setFindingsOpen] = useState(false)
  const [findingsList, setFindingsList] = useState<string[]>([])
  const [stethoscopeOn, setStethoscopeOn] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false)
  const [round1Score, setRound1Score] = useState<number|null>(null)
  const [round2Score, setRound2Score] = useState<number|null>(null)

  function next() { stop(); setSceneIndex(i => Math.min(i + 1, scenes.length - 1)) }
  function prev() { stop(); setSceneIndex(i => Math.max(i - 1, 0)) }
  function goto(index: number) { stop(); setSceneIndex(index) }
  const title = useMemo(() => ({
    intro: 'Start Shift',
    ausc: 'Auscultation Intro',
    shuffle: 'Shuffle Round',
    skills: 'Skills Lab',
    ward: 'Ward Round',
    quiz: 'Audio Recognition Quiz',
    ward2: 'Ward Round II',
    progress: 'Progress Summary',
    library: 'Consultant\'s Library',
    refs: 'References',
  }[scene]), [scene])

  const play = (srcOrSources: string | string[]) => {
    const el = audioRef.current; if (!el) return;
    // ensure max element volume and resume audio context if needed
    el.volume = 1.0
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(()=>{})
    }
    const candidates = Array.isArray(srcOrSources) ? srcOrSources : [srcOrSources]
    // derive simple fallbacks between /assets/audio and /audio roots
    const derived = candidates.flatMap((s)=> {
      const a = s.startsWith('/assets/') ? s.replace(/^\/assets\//, '/') : `/assets${s}`
      const b = s.startsWith('/audio/') ? s.replace(/^\/audio\//, '/assets/audio/') : s.replace(/^\/assets\/audio\//, '/audio/')
      return [s, a, b]
    })
    let i = 0
    const tryPlay = () => {
      if (i >= derived.length) return
      el.src = derived[i++]
      el.currentTime = 0
      el.play().catch(() => {
        // try next candidate shortly
        setTimeout(tryPlay, 50)
      })
    }
    tryPlay()
  }

  const stop = () => {
    const el = audioRef.current; if (!el) return;
    try { el.pause() } catch {}
    el.currentTime = 0
  }
  // If the stethoscope is unequipped, stop any playing audio immediately
  useEffect(() => {
    if (!stethoscopeOn) stop()
  }, [stethoscopeOn])

  // Reset accuracy at the start of each Ward round
  useEffect(() => {
    if (scene === 'ward' || scene === 'ward2') {
      setAccuracy(100)
    }
  }, [scene])

  return (
    <div className="min-h-[100svh] bg-slate-950 text-slate-100">
      <div className={`h-full sm:h-screen sm:grid ${desktopNavCollapsed ? 'sm:grid-cols-[64px_1fr]' : 'sm:grid-cols-[240px_1fr]'}`}>
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:flex relative h-full border-r border-white/10 bg-black/30 backdrop-blur p-2 sm:p-4 flex-col gap-4 sm:gap-6">
          {/* Desktop collapse toggle inside sidebar container */}
          <button
            onClick={()=>setDesktopNavCollapsed(v=>!v)}
            className="hidden sm:inline-flex items-center justify-center p-2 rounded-md border border-white/10 hover:bg-white/10 absolute top-2 right-4"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {desktopNavCollapsed ? <FiMenu /> : <FiX />}
          </button>
          <div className={`flex items-center ${desktopNavCollapsed ? 'justify-center' : 'gap-2'} text-lg font-semibold`}>
            {!desktopNavCollapsed && (
              <>
                <FiActivity className="text-emerald-400" />
                MurmurMD
              </>
            )}
          </div>
          <nav className="flex-1 flex flex-col gap-3 text-sm">
            <SidebarItem collapsed={desktopNavCollapsed} label="Start Shift" active={scene==='intro'} onClick={()=>goto(0)} icon={<FiActivity />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Auscultation Intro" active={scene==='ausc'} onClick={()=>goto(1)} icon={<TbStethoscope />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Shuffle Round" active={scene==='shuffle'} onClick={()=>goto(2)} icon={<FiActivity />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Skills Lab" active={scene==='skills'} onClick={()=>goto(3)} icon={<TbStethoscope />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Ward Round" active={scene==='ward'} onClick={()=>goto(4)} icon={<FiFolder />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Audio Quiz" active={scene==='quiz'} onClick={()=>goto(5)} icon={<FiActivity />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Ward Round II" active={scene==='ward2'} onClick={()=>goto(6)} icon={<FiFolder />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Progress" active={scene==='progress'} onClick={()=>goto(7)} icon={<FiActivity />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="Library" active={scene==='library'} onClick={()=>goto(8)} icon={<FiBookOpen />} />
            <SidebarItem collapsed={desktopNavCollapsed} label="References" active={scene==='refs'} onClick={()=>goto(9)} icon={<FiBookOpen />} />
          </nav>
          <div className="mt-auto space-y-4">
            <div className="w-full grid place-items-center">
              <img
                src="/images/cardiff.png"
                alt="Cardiff University"
                className={`${desktopNavCollapsed ? 'max-w-[36px]' : 'max-w-[70px]'} opacity-40`}
                onError={(e)=>{ const img = (e.currentTarget as HTMLImageElement); img.onerror = null; img.src = 'https://upload.wikimedia.org/wikipedia/en/f/f7/Cardiff_University_logo.svg' }}
              />
            </div>
            {!desktopNavCollapsed && <div className="text-xs text-slate-400">Alameen Ayad - Year 2 SSC W1</div>}
          </div>
        </aside>
        {/* Sidebar (mobile drawer) */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-black/50 sm:hidden"
              onClick={()=>setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>
        <motion.aside
          initial={false}
          animate={{ x: mobileNavOpen ? 0 : -280 }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="sm:hidden fixed top-0 left-0 z-[50] h-full w-64 border-r border-white/10 bg-black/80 backdrop-blur p-4 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
          <FiActivity className="text-emerald-400" />
          MurmurMD
            </div>
            <button onClick={()=>setMobileNavOpen(false)} className="p-2 rounded-md border border-white/10 hover:bg-white/10">
              <FiX />
            </button>
          </div>
          <nav className="flex-1 flex flex-col gap-2 text-sm">
            <SidebarItem label="Start Shift" active={scene==='intro'} onClick={()=>{goto(0); setMobileNavOpen(false)}} icon={<FiActivity />} />
            <SidebarItem label="Auscultation Intro" active={scene==='ausc'} onClick={()=>{goto(1); setMobileNavOpen(false)}} icon={<TbStethoscope />} />
            <SidebarItem label="Shuffle Round" active={scene==='shuffle'} onClick={()=>{goto(2); setMobileNavOpen(false)}} icon={<FiActivity />} />
            <SidebarItem label="Skills Lab" active={scene==='skills'} onClick={()=>{goto(3); setMobileNavOpen(false)}} icon={<TbStethoscope />} />
            <SidebarItem label="Ward Round" active={scene==='ward'} onClick={()=>{goto(4); setMobileNavOpen(false)}} icon={<FiFolder />} />
            <SidebarItem label="Audio Quiz" active={scene==='quiz'} onClick={()=>{goto(5); setMobileNavOpen(false)}} icon={<FiActivity />} />
            <SidebarItem label="Ward Round II" active={scene==='ward2'} onClick={()=>{goto(6); setMobileNavOpen(false)}} icon={<FiFolder />} />
            <SidebarItem label="Progress" active={scene==='progress'} onClick={()=>{goto(7); setMobileNavOpen(false)}} icon={<FiActivity />} />
            <SidebarItem label="Library" active={scene==='library'} onClick={()=>{goto(8); setMobileNavOpen(false)}} icon={<FiBookOpen />} />
            <SidebarItem label="References" active={scene==='refs'} onClick={()=>{goto(9); setMobileNavOpen(false)}} icon={<FiBookOpen />} />
          </nav>
          <div className="mt-auto space-y-4">
            <div className="w-full grid place-items-center">
              <img
                src="/images/cardiff.png"
                alt="Cardiff University"
                className="max-w-[70px] opacity-50"
                onError={(e)=>{ const img = (e.currentTarget as HTMLImageElement); img.onerror = null; img.src = 'https://upload.wikimedia.org/wikipedia/en/f/f7/Cardiff_University_logo.svg' }}
              />
            </div>
            <div className="text-xs text-slate-400">Alameen Ayad - Year 2 SSC W1</div>
          </div>
        </motion.aside>

        {/* Main area */}
        <div className="relative h-full overflow-hidden">
          <div className="h-12 sm:h-14 px-2 sm:px-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-sky-500/10">
            <div className="flex items-center gap-2">
              <button
                onClick={()=>setMobileNavOpen(true)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md border border-white/10 hover:bg-white/10"
                aria-label="Open navigation"
              >
                <FiMenu />
              </button>
            <div className="font-semibold opacity-90">{title}</div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ECGBar />
              <button onClick={()=>setStethoscopeOn(v=>!v)} className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border text-xs sm:text-sm ${stethoscopeOn? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 animate-pulse': 'border-white/10 hover:bg-white/10'}`}>
                <span className={`w-2 h-2 rounded-full ${stethoscopeOn? 'bg-emerald-400 shadow-[0_0_12px_#34d399]':'bg-slate-400'}`} />
                <TbStethoscope /> <span className="hidden xs:inline sm:inline">Equip</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={prev} disabled={sceneIndex===0} className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs sm:text-sm"><FiArrowLeft/><span className="hidden xs:inline sm:inline">Back</span></button>
                <button onClick={next} disabled={sceneIndex===scenes.length-1} className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 disabled:opacity-40 text-xs sm:text-sm"><span className="hidden xs:inline sm:inline">Next</span><FiArrowRight/></button>
              </div>
            </div>
          </div>

          <div className="min-h-[calc(100svh-3rem)] sm:h-[calc(100%-3.5rem)] min-h-0">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.section
                key={scene}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.45 }}
                className="h-full overflow-y-auto"
              >
                {scene === 'intro' && <Intro onBegin={next} />}
                {scene === 'ausc' && <Auscultation />}
                {scene === 'shuffle' && <ShuffleRound />}
                {scene === 'skills' && <Skills onNext={next} onPrev={prev} onPlay={play} openFindings={(list)=>{setFindingsList(list); setFindingsOpen(true)}} stethoscopeOn={stethoscopeOn} />}
                {scene === 'ward' && <Ward onNext={next} onPrev={prev} setAccuracy={setAccuracy} accuracy={accuracy} stethoscopeOn={stethoscopeOn} onPlay={play} onStop={stop} onFinishRound={(score)=> setRound1Score(score)} />}
                {scene === 'quiz' && <AudioQuiz onPlay={play} onStop={stop} stethoscopeOn={stethoscopeOn} />}
                {scene === 'ward2' && <Ward2 onNext={()=>{ setRound2Score(accuracy); next() }} onPrev={prev} setAccuracy={setAccuracy} accuracy={accuracy} stethoscopeOn={stethoscopeOn} onPlay={play} onStop={stop} onFinishRound={(score)=> setRound2Score(score)} />}
                {scene === 'progress' && <Progress r1={round1Score} r2={round2Score} onPrev={prev} />}
                {scene === 'library' && <Library onPrev={prev} />}
                {scene === 'refs' && <References />}
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Shared audio + Findings modal */}
      <audio ref={audioRef} preload="auto" />
      {/* Initialize AudioContext + GainNode to boost all playback */}
      {(() => {
        // inline IIFE to run once after first render when ref is available
        const el = audioRef.current
        if (el && !audioCtxRef.current) {
          try {
            const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext
            if (AC) {
              const ctx: AudioContext = new AC()
              const source = ctx.createMediaElementSource(el)
              const gain = ctx.createGain()
              gain.gain.value = 1.6 // ~+4 dB boost
              source.connect(gain).connect(ctx.destination)
              audioCtxRef.current = ctx
              gainRef.current = gain
              el.volume = 1.0
            }
          } catch {}
        }
        return null
      })()}
      <AnimatePresence>
        {findingsOpen && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setFindingsOpen(false)}>
            <motion.div className="w-[min(90vw,700px)] rounded-xl border border-white/10 bg-slate-900 p-5" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} onClick={(e)=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-emerald-300 font-semibold">Key Findings</div>
                <button onClick={()=>setFindingsOpen(false)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20">✕</button>
              </div>
              <ul className="list-disc pl-6 space-y-1 text-slate-200">
                {findingsList.map((f,i)=>(<li key={i}>{f}</li>))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HeadphoneNotice({ text = 'Best experienced with headphones', durationMs = 5000 }: { text?: string, durationMs?: number }) {
  const [expanded, setExpanded] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setExpanded(false), durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs])
  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      {expanded ? (
        <div className="px-3 py-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.35)] text-xs sm:text-sm flex items-center gap-2 animate-[fadeIn_.3s_ease]">
          <FiHeadphones className="opacity-90" />
          <span>{text}</span>
        </div>
      ) : (
        <div className="w-9 h-9 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.3)]">
          <FiHeadphones />
        </div>
      )}
    </div>
  )
}

// Simple neon clipboard showing key vitals and demographics
function CaseClipboard({ caseData }: { caseData: { patientName: string; age: number; sex: 'M'|'F'; vignette: string }}) {
  const bpMatch = caseData.vignette.match(/BP[:\s]*([0-9]{2,3}\s*\/\s*[0-9]{2,3})\s*mmHg?/i)
  const hrMatch = caseData.vignette.match(/HR[:\s]*([0-9]{2,3})/i)
  const spoMatch = caseData.vignette.match(/SpO[₂2][%]?\s*[:\s]*([0-9]{2,3})/i)
  const rrMatch = caseData.vignette.match(/RR[:\s]*([0-9]{1,2})/i)
  const tempMatch = caseData.vignette.match(/Temp[:\s]*([0-9]{2}(?:\.[0-9])?)/i)
  const jvpMatch = caseData.vignette.match(/JVP[:\s]*([A-Za-z0-9\-\s]+)(?=\n|$)/i)
  const bp = bpMatch ? bpMatch[1].replace(/\s+/g,'') : '—'
  const hr = hrMatch ? hrMatch[1] : '—'
  const spo2 = spoMatch ? `${spoMatch[1]}%` : '—'
  const rr = rrMatch ? `${rrMatch[1]}/min` : '—'
  const temp = tempMatch ? `${tempMatch[1]}°C` : '—'
  const jvp = jvpMatch ? jvpMatch[1].trim() : ''
  return (
    <div className="mt-4">
      <div className="w-full rounded-2xl border border-cyan-400/40 bg-cyan-500/5 px-4 py-3 shadow-[0_0_20px_rgba(34,211,238,0.20)]">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-100 whitespace-nowrap overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Name</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{caseData.patientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Age/Sex</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{caseData.age} · {caseData.sex}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">BP</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{bp}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">HR</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{hr}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SpO₂</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{spo2}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">RR</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{rr}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Temp</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{temp}</span>
          </div>
          {jvp && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">JVP</span>
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{jvp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function Intro({ onBegin }: { onBegin: () => void }) {
  // Desktop, landscape-friendly
  const desktopSlides = [
    // Stethoscope on ECG paper (reliable Unsplash with standard params)
    '/images/hero3.jpg',
    // Close-up medical monitor/ECG lines
    '/images/hero6.jpg',
    // Cardiology workbench / stethoscope and clipboard
    '/images/hero4.gif',
  ]
  // Mobile, portrait-friendly
  const mobileSlides = desktopSlides
  const [isMobile, setIsMobile] = useState(false)
  const slides = isMobile ? mobileSlides : desktopSlides
  const [idx, setIdx] = useState(0)
  const heroVariants = {
    enter: { opacity: 0, scale: 1.04 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
  }
  const heroTransition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  useEffect(()=>{
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = () => setIsMobile(mq.matches)
    handler()
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler)
    } else if (typeof (mq as any).addListener === 'function') {
      ;(mq as any).addListener(handler)
    }
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler)
      } else if (typeof (mq as any).removeListener === 'function') {
        ;(mq as any).removeListener(handler)
      }
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  },[])
  useEffect(()=>{
    const id = setInterval(()=> setIdx(i => (i+1)%slides.length), 4000)
    return ()=> clearInterval(id)
  },[slides.length])
  return (
    <div className="h-full min-h-[calc(100svh-3rem)] sm:min-h-0 relative overflow-hidden">
      <HeadphoneNotice />
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={`${isMobile? 'm':'d'}-${idx}`}
            src={slides[idx]}
            className="w-full h-full object-cover"
            variants={heroVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={heroTransition}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            style={{ willChange: 'opacity, transform' }}
            onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = isMobile
              ? 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1000&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1600&auto=format&fit=crop'
            }}
          />
        </AnimatePresence>
      </div>
      {/* Mobile: full-height shade; Desktop: standard shade */}
      <div className="absolute inset-0 bg-black/60 sm:bg-black/40" />
      <div className="relative h-full grid place-items-center sm:place-items-center">
        <div className="mx-auto max-w-xl sm:max-w-2xl text-center px-5 sm:px-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">Welcome to Your Cardiology Rotation</h1>
          <p className="text-slate-200 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
            A POV simulator guided by your Senior Registrar. Earn your highest Diagnostic Accuracy.
          </p>
          <button onClick={onBegin} className="px-4 py-2 sm:px-6 sm:py-3 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] text-sm sm:text-base">Begin Shift</button>
        </div>
      </div>
    </div>
  )
}

function Skills({ onNext: _onNext, onPrev: _onPrev, onPlay, openFindings: _openFindings, stethoscopeOn }: { onNext: () => void, onPrev: () => void, onPlay: (src: string | string[])=>void, openFindings: (list: string[])=>void, stethoscopeOn: boolean }) {
  type Murmur = {
    id: string
    name: string
    category: 'adult' | 'peds'
    imageName: string
    audio?: string[] // candidates
    timing: string
    location: string
    radiation: string
    character: string
    loudestWith: string
    clues: string[]
  }
  const murmurCatalog: Murmur[] = [
    // Core normals
    { id: 'normal-adult', name: 'Normal Heart Sounds', category: 'adult', imageName: 'banner-normal.jpg', audio: ['/assets/audio/5-Normal-sounds.mp3','/assets/audio/adultCASE1.mp3'], timing: 'Physiologic S1/S2', location: '—', radiation: '—', character: 'No murmur; physiologic split widens with inspiration', loudestWith: '—', clues: ['Use as baseline reference', 'No added sounds or clicks', 'PMI non‑displaced'] },
    // Adult
    { id: 'as', name: 'Aortic Stenosis', category: 'adult', imageName: 'banner-as.jpg', audio: ['/assets/audio/adultCASE4.mp3'], timing: 'Ejection systolic (crescendo–decrescendo)', location: 'Right 2nd ICS (aortic area)', radiation: 'Carotids (often right)', character: 'Harsh, rough, medium‑pitched', loudestWith: 'Expiration, sitting forward', clues: ['Slow‑rising, low‑volume pulse', 'Narrow pulse pressure', 'Ejection click (if mobile valve)', 'Heaving apex beat', 'Syncope, angina, dyspnoea (SAD triad)'] },
    { id: 'ar', name: 'Aortic Regurgitation', category: 'adult', imageName: 'banner-ar.jpg', audio: ['/assets/audio/Ar.mp3','/assets/audio/ar.mp3'], timing: 'Early diastolic (decrescendo)', location: 'Left sternal edge (3rd–4th ICS)', radiation: 'Along left sternal border', character: 'Blowing, high‑pitched', loudestWith: 'Expiration, leaning forward', clues: ['Collapsing ("water hammer") pulse', 'Wide pulse pressure', 'Displaced, hyperdynamic apex beat', 'Quincke’s, Corrigan’s, De Musset’s signs'] },
    { id: 'mr', name: 'Mitral Regurgitation', category: 'adult', imageName: 'banner-mr.jpg', audio: ['/assets/audio/adultCASE6.mp3'], timing: 'Pansystolic', location: 'Apex (5th ICS MCL)', radiation: 'Axilla', character: 'Blowing, high‑pitched', loudestWith: 'Expiration, left lateral position', clues: ['Displaced, hyperdynamic apex beat', 'Soft S1, possible S3', 'Left heart failure signs'] },
    { id: 'ms', name: 'Mitral Stenosis', category: 'adult', imageName: 'banner-ms.jpg', audio: ['/assets/audio/adultCASE3.mp3'], timing: 'Mid‑diastolic rumble with opening snap', location: 'Apex', radiation: 'None (localised)', character: 'Low‑pitched, rumbling', loudestWith: 'Expiration, left lateral position', clues: ['Tapping apex beat (palpable S1)', 'Malar flush (low CO)', 'Pulmonary hypertension signs (loud P2, RV heave)'] },
    /* Pulmonary Regurgitation removed per request */
    { id: 'ts', name: 'Tricuspid Stenosis', category: 'adult', imageName: 'banner-ts.jpg', audio: [], timing: 'Mid‑diastolic', location: 'Lower left sternal edge', radiation: '—', character: 'Low‑pitched; increases with inspiration', loudestWith: 'Inspiration', clues: ['Rare; rheumatic origin'] },
    { id: 'tr', name: 'Tricuspid Regurgitation', category: 'adult', imageName: 'banner-tr.jpg', audio: ['/assets/audio/tr.mp3'], timing: 'Pansystolic', location: 'Lower left sternal edge', radiation: 'Right sternal edge or epigastrium', character: 'Blowing', loudestWith: 'Inspiration (Carvallo’s sign)', clues: ['Raised JVP with giant v‑waves', 'Pulsatile hepatomegaly', 'Peripheral oedema'] },
    { id: 'hocm', name: 'Hypertrophic Obstructive Cardiomyopathy', category: 'adult', imageName: 'banner-hocm.jpg', audio: ['/assets/audio/HOCM.mp3'], timing: 'Ejection systolic', location: 'Left sternal edge / apex', radiation: 'None or to axilla', character: 'Harsh', loudestWith: 'Valsalva or standing (↓ preload)', clues: ['Jerky pulse', 'Double apical impulse', 'Syncope in young athletes'] },
    { id: 'vsd', name: 'Ventricular Septal Defect', category: 'adult', imageName: 'banner-vsd.jpg', audio: ['/assets/audio/adultCASE5.mp3'], timing: 'Pansystolic', location: 'Left lower sternal edge', radiation: 'Wide across precordium', character: 'Harsh, loud', loudestWith: 'Expiration', clues: ['Palpable thrill', 'Possible LV enlargement', 'May be congenital or post‑MI'] },
    /* Bicuspid Aortic Valve removed per request */
    // Paediatric
    { id: 'normal-peds', name: 'Normal Heart Sounds (Paeds)', category: 'peds', imageName: 'banner-normal-peds.jpg', audio: ['/assets/audio/5-Normal-sounds.mp3'], timing: 'Physiologic S1/S2', location: '—', radiation: '—', character: 'No murmur; physiologic splitting', loudestWith: '—', clues: ['Baseline reference for children', 'No added sounds', 'Normal growth and exam'] },
    { id: 'innocent', name: 'Innocent (Still’s) Murmur', category: 'peds', imageName: 'banner-innocent.jpg', audio: ['/assets/audio/8-Innocent-murmur-and-S3.mp3'], timing: 'Mid‑systolic', location: 'Lower left sternal edge', radiation: 'None', character: 'Vibratory, musical', loudestWith: 'Supine, high‑output states', clues: ['No symptoms', 'Normal growth and heart sounds', 'Decreases on standing'] },
    { id: 'vsd-peds', name: 'Ventricular Septal Defect (Paediatric)', category: 'peds', imageName: 'banner-vsd-peds.jpg', audio: ['/assets/audio/9-VSD.mp3'], timing: 'Pansystolic', location: 'Left lower sternal edge', radiation: 'Precordium', character: 'Harsh; thrill common', loudestWith: 'Expiration', clues: ['Larger defects = quieter murmur', 'Commonest congenital murmur'] },
    { id: 'asd', name: 'Atrial Septal Defect', category: 'peds', imageName: 'banner-asd.jpg', audio: ['/assets/audio/1-ASD.mp3'], timing: 'Ejection systolic (↑ flow across PV)', location: 'Upper left sternal edge', radiation: 'None', character: 'Soft, blowing', loudestWith: 'Inspiration', clues: ['Fixed split S2', 'Right ventricular heave'] },
    { id: 'pda', name: 'Patent Ductus Arteriosus', category: 'peds', imageName: 'banner-pda.jpg', audio: ['/assets/audio/3-PDA.mp3'], timing: 'Continuous ("machinery")', location: 'Left infraclavicular', radiation: 'Back', character: 'Machinery‑like', loudestWith: 'Continuous flow', clues: ['Bounding pulses', 'Wide pulse pressure', 'Preterm association'] },
    // Coarctation removed per request
  ]
  const byId = useMemo(()=> {
    const m = new Map<string, Murmur>()
    for (const it of murmurCatalog) m.set(it.id, it)
    return m
  }, [])
  const groups: { title: string; ids: string[] }[] = [
    { title: 'Normal Heart Sounds', ids: ['normal-adult'] },
    { title: 'Systolic – Ejection (Crescendo–Decrescendo)', ids: ['as','hocm','innocent'] },
    { title: 'Systolic – Pansystolic (Holosystolic)', ids: ['mr','tr','vsd'] },
    { title: 'Diastolic Murmurs', ids: ['ar','ms'] },
    { title: 'Continuous Murmur', ids: ['pda'] },
  ]
  // probe availability of audio clips and gray out if missing
  const allClips = murmurCatalog.flatMap(m => m.audio ? [m.audio[0]] : []).filter(Boolean) as string[]
  const [available, setAvailable] = useState<Record<string, boolean>>({})
  const [openMurmur, setOpenMurmur] = useState<null | {
    name: string, img: string, src: string, f: string[], why?: string
  }>(null)
  useEffect(()=>{
    let cancelled = false
    async function probe(src: string) {
      const candidates = [src, src.replace(/^\/assets\//,'/'), src.replace(/^\/assets\/audio\//,'/audio/'), `/assets${src}`]
      for (const c of candidates) {
        try {
          await new Promise<void>((resolve, reject) => {
            const a = new Audio()
            a.preload = 'auto'
            a.src = c
            const onReady = () => { a.removeEventListener('canplaythrough', onReady); a.removeEventListener('error', onErr); resolve() }
            const onErr = () => { a.removeEventListener('canplaythrough', onReady); a.removeEventListener('error', onErr); reject(new Error('fail')) }
            a.addEventListener('canplaythrough', onReady, { once: true })
            a.addEventListener('error', onErr, { once: true })
          })
          return true
        } catch {}
      }
      return false
    }
    (async ()=>{
      const entries: [string, boolean][] = []
      for (const src of allClips) {
        const ok = await probe(src)
        if (cancelled) return
        entries.push([src, ok])
        setAvailable(prev => ({ ...prev, [src]: ok }))
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeholderImg = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'

  return (
    <div className="h-full flex flex-col bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)]">
      <HeadphoneNotice />
      <div className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-6 py-4 sm:py-8 grid grid-rows-[auto_1fr] gap-4 sm:gap-6 min-h-0">
        <Mentor text="Skills Lab orientation: Listen, localize, and identify hallmark features. Use the bell vs diaphragm strategically." />
        <div className="space-y-8 overflow-y-auto pr-1 h-full min-h-0 scroll-smooth">
          {groups.map(group => (
            <section key={group.title}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-emerald-300 font-semibold">{group.title}</h3>
                <span className="text-xs text-slate-400">{group.ids.length} modules</span>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {group.ids.map(id => {
                  const item = byId.get(id)!
                  const m = {
                    t: item.name,
                    img: `/images/banners/${item.imageName}`,
                    src: (item.audio && item.audio[0]) || '',
                    f: [
                      `Timing: ${item.timing}`,
                      `Location: ${item.location}`,
                      `Radiation: ${item.radiation}`,
                      `Character: ${item.character}`,
                      `Loudest with: ${item.loudestWith}`,
                    ],
                  }
                  return (
                <motion.div whileHover={{ y: -4 }} key={m.t} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                      <div className="bg-white/5 aspect-[13/8] w-full">
                        <img
                          src={m.img}
                          data-alt={m.img.replace('/images/banners/','/images/')}
                          alt=""
                          className="w-full h-full object-cover opacity-80"
                          onError={(e)=>{ const img = e.currentTarget as HTMLImageElement; const alt = img.getAttribute('data-alt'); if (alt && !img.src.endsWith(alt)) { img.src = alt; img.removeAttribute('data-alt') } else { img.src = placeholderImg } }}
                        />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold mb-2">{m.t}</div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={()=>onPlay([m.src, m.src.replace(/^\/assets\/audio\//,'/audio/'), m.src.replace(/^\/assets\//,'/')])}
                            disabled={!stethoscopeOn || (m.src==='' || available[m.src]===false)}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-300 opacity-60'} disabled:opacity-40`}
                      >🔊 Listen</button>
                          <button onClick={()=> setOpenMurmur({ name: m.t, img: m.img, src: m.src, f: m.f, why: whyMap[m.t] })} className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">View details</button>
                      {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
                    </div>
                  </div>
                </motion.div>
                  )
                })}
            </div>
          </section>
          ))}
            </div>
        {/* Murmur full-screen modal */}
        {openMurmur && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center" onClick={()=> setOpenMurmur(null)}>
            <div className="w-[min(960px,92vw)] max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-xl" onClick={e=> e.stopPropagation()}>
              <div className="relative w-full aspect-[13/8] rounded-t-2xl overflow-hidden">
                <img
                  src={openMurmur.img}
                  data-alt={openMurmur.img.replace('/images/banners/','/images/')}
                  alt=""
                  className="w-full h-full object-cover opacity-85"
                  onError={(e)=>{ const img = e.currentTarget as HTMLImageElement; const alt = img.getAttribute('data-alt'); if (alt && !img.src.endsWith(alt)) { img.src = alt; img.removeAttribute('data-alt') } else { img.src = placeholderImg } }}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
                  <div className="text-lg sm:text-xl font-semibold text-emerald-300">{openMurmur.name}</div>
                  </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="text-sm text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {openMurmur.f.map((line, i)=> (<div key={i} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">{line}</div>))}
                </div>
                {openMurmur.why && (
                  <div className="px-3 py-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-sm">
                    <span className="font-semibold">Why we hear it: </span>{openMurmur.why}
                  </div>
                )}
                <div className="flex items-center gap-2">
                      <button
                    onClick={()=> onPlay([openMurmur.src, openMurmur.src.replace(/^\/assets\/audio\//,'/audio/'), openMurmur.src.replace(/^\/assets\//,'/')])}
                    disabled={!stethoscopeOn || (openMurmur.src==='' || available[openMurmur.src]===false)}
                        className={`px-3 py-2 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-300 opacity-60'} disabled:opacity-40`}
                  >🔊 Play sample</button>
                  {(!openMurmur.src || available[openMurmur.src]===false) && (
                    <span className="text-xs text-amber-300">No audio yet — placeholder</span>
                  )}
                    </div>
                <div className="flex justify-end">
                  <button onClick={()=> setOpenMurmur(null)} className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20">Close</button>
                  </div>
            </div>
        </div>
          </div>
        )}
      </div>
    </div>
  )
}

type Case = {
  id: string;
  title: string;
  patientName: string;
  age: number;
  sex: 'M' | 'F';
  vignette: string;
  options: string[];
  correctIndex: number;
  audio?: string;
  feedbackCorrect: string;
  feedbackWrong: string;
}

// Utility function to shuffle array and return shuffled array with original index of correct answer
function shuffleWithCorrectIndex<T>(array: T[], correctIndex: number): { shuffled: T[], newCorrectIndex: number } {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const correctItem = array[correctIndex];
  const newCorrectIndex = shuffled.indexOf(correctItem);
  return { shuffled, newCorrectIndex };
}

// Standardized murmur sets for Ward/Peds
const standardAdultMurmurs = [
  { name: 'Normal Heart Sounds', audio: '/assets/audio/adultCASE1.mp3' },
  { name: 'Aortic Stenosis', audio: '/assets/audio/adultCASE4.mp3' },
  { name: 'Aortic Regurgitation', audio: '/assets/audio/Ar.mp3' },
  { name: 'Mitral Regurgitation', audio: '/assets/audio/adultCASE6.mp3' },
  { name: 'Mitral Stenosis', audio: '/assets/audio/adultCASE3.mp3' },
  { name: 'Tricuspid Regurgitation', audio: '/assets/audio/tr.mp3' },
  { name: 'Hypertrophic Obstructive Cardiomyopathy', audio: '/assets/audio/HOCM.mp3' },
  { name: 'Ventricular Septal Defect', audio: '/assets/audio/adultCASE5.mp3' },
  { name: 'Patent Ductus Arteriosus', audio: '/assets/audio/3-PDA.mp3' }
]
const standardPedsMurmurs = [
  { name: 'Normal Heart Sounds', audio: '/assets/audio/5-Normal-sounds.mp3' },
  { name: 'Innocent (Still’s) Murmur', audio: '/assets/audio/8-Innocent-murmur-and-S3.mp3' },
  { name: 'Ventricular Septal Defect', audio: '/assets/audio/9-VSD.mp3' },
  { name: 'Atrial Septal Defect', audio: '/assets/audio/1-ASD.mp3' },
  { name: 'Patent Ductus Arteriosus', audio: '/assets/audio/3-PDA.mp3' },
]
function buildOptions(correct: string, pool: string[], n = 4): string[] {
  const others = pool.filter(nm => nm !== correct)
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, n - 1)
  return [...shuffled, correct].sort(() => Math.random() - 0.5)
}
// Explanations: why the sound/murmur is heard (used in Ward feedback and Skills modal)
const whyMap: Record<string, string> = {
  'Normal Heart Sounds': 'S1: closure of mitral and tricuspid valves at start of systole as ventricular pressure exceeds atrial pressure. S2: closure of aortic and pulmonary valves at end of systole; physiologic inspiratory split reflects delayed P2.',
  'Aortic Stenosis': 'Turbulent high‑velocity ejection across a narrowed aortic valve creates a crescendo–decrescendo systolic murmur that radiates to the carotids.',
  'Hypertrophic Obstructive Cardiomyopathy': 'Dynamic LV outflow obstruction from septal hypertrophy; murmur increases with maneuvers that reduce preload (Valsalva/standing).',
  'Innocent (Still’s) Murmur': 'Benign flow vibrations in a structurally normal heart (often children), giving a soft, “musical” midsystolic quality without radiation.',
  'Mitral Regurgitation': 'Incompetent mitral valve allows continuous backflow from LV to LA throughout systole (constant pressure gradient) → pansystolic blowing murmur radiating to the axilla.',
  'Tricuspid Regurgitation': 'Backflow from RV to RA through systole; intensity increases with inspiration (Carvallo) due to increased venous return.',
  'Ventricular Septal Defect': 'Left‑to‑right shunt across the septum produces harsh holosystolic turbulence at the LLSB with a palpable thrill.',
  'Aortic Regurgitation': 'Incompetent aortic valve allows early diastolic backflow from aorta to LV; high initial gradient yields a blowing decrescendo at the LSE.',
  'Mitral Stenosis': 'Diastolic flow turbulence across a thickened mitral valve during rapid filling yields an opening snap followed by a low‑pitched rumble at the apex.',
  'Patent Ductus Arteriosus': 'Persistent aorta‑to‑pulmonary connection maintains a constant pressure gradient → continuous “machinery‑like” murmur, often infraclavicular, peaking near S2.',
}

const adultCases: Case[] = standardAdultMurmurs.map((m, i) => {
  // Condition-focused hints (no diagnosis names)
  const hints: Record<string, string> = {
    'Normal Heart Sounds': 'Compare to a baseline exam focusing on S1/S2 and physiologic inspiratory splitting.',
    'Aortic Stenosis': 'Harsh ejection systolic at the right upper sternal border radiating to the neck; slow‑rising pulse.',
    'Aortic Regurgitation': 'Early diastolic decrescendo at the left sternal edge; wide pulse pressure; louder leaning forward in expiration.',
    'Mitral Regurgitation': 'Pansystolic at the apex radiating to the axilla; blowing quality.',
    'Mitral Stenosis': 'Opening snap followed by a low‑pitched mid‑diastolic rumble at the apex (LLD).',
    'Tricuspid Regurgitation': 'Holosystolic at the lower left sternal edge; increases with inspiration (Carvallo).',
    'Hypertrophic Obstructive Cardiomyopathy': 'Systolic murmur that increases with Valsalva/standing and often in younger athletic patients.',
    'Ventricular Septal Defect': 'Harsh holosystolic at the lower left sternal border, often with a palpable thrill, radiating across the precordium.'
  }
  // Preferred demographics to keep names/sex/age aligned with scenarios
  const demo: Record<string, { name: string; sex: 'M'|'F'; age: number }> = {
    'Normal Heart Sounds': { name: 'Mateo Santos', sex: 'M', age: 22 },
    'Innocent (Still’s) Murmur': { name: 'Lilly Montana', sex: 'F', age: 20 },
    'Mitral Stenosis': { name: 'Li Wei', sex: 'F', age: 50 },
    'Aortic Stenosis': { name: "Seán O'Connor", sex: 'M', age: 40 },
    'Ventricular Septal Defect': { name: 'Oluwaseun Adeyemi', sex: 'M', age: 26 },
    'Mitral Regurgitation': { name: 'Elena Petrova', sex: 'F', age: 30 },
    'Patent Ductus Arteriosus': { name: 'Nikhil Kumar', sex: 'M', age: 30 },
    'Aortic Regurgitation': { name: 'Mateo Santos', sex: 'M', age: 45 },
    'Hypertrophic Obstructive Cardiomyopathy': { name: 'Nikhil Kumar', sex: 'M', age: 22 },
    'Tricuspid Regurgitation': { name: 'Molly Citrus', sex: 'F', age: 34 },
  }
  const details: Record<string, { scenario: string; vitals: { hr: string; bp: string; spo2: string; rr: string; temp: string; jvp?: string } }> = {
    'Normal Heart Sounds': {
      scenario: '22‑year‑old male for pre‑military assessment. Previously played hockey; now less active but has no limitation on occasional hikes or mowing lawns. Never any cardiovascular symptoms. Family history unremarkable.',
      vitals: { hr: '72', bp: '120/75', spo2: '99', rr: '14', temp: '36.6' }
    },
    'Aortic Stenosis': {
      scenario: '40‑year‑old male who works on a fishing boat. Feels more fatigued over the last year with mild breathlessness pulling heavy pots. No chest pain or syncope. Followed since childhood for a murmur. Non‑smoker; family history non‑contributory.',
      vitals: { hr: '58', bp: '100/70', spo2: '99', rr: '16', temp: '36.7' }
    },
    'Hypertrophic Obstructive Cardiomyopathy': {
      scenario: 'Young competitive runner with brief chest tightness and near‑syncope during intense interval training. No prior known heart disease; family history uncertain.',
      vitals: { hr: '120', bp: '90/60', spo2: '98', rr: '16', temp: '36.7' }
    },
    'Innocent (Still’s) Murmur': {
      scenario: '20‑year‑old female attending routine work assessment. Very active (cycling and jogging). No risk factors and no symptoms. Remembers being told as a child there was an “extra sound” but nothing to worry about.',
      vitals: { hr: '98', bp: '100/60', spo2: '99', rr: '18', temp: '36.8' }
    },
    'Mitral Regurgitation': {
      scenario: '30‑year‑old female referred for newly discovered murmur. Generally well, not very active. Occasional brief palpitations with two episodes of lightheadedness. Minimal caffeine; alcohol rare; no medications.',
      vitals: { hr: '110', bp: '130/60', spo2: '94', rr: '22', temp: '36.9' }
    },
    'Tricuspid Regurgitation': {
      scenario: 'Patient with gradually progressive ankle swelling and abdominal fullness. Sleeps with extra pillows for comfort. No fever or chest pain; appetite reduced.',
      vitals: { hr: '102', bp: '108/68', spo2: '95', rr: '22', temp: '36.8', jvp: 'Elevated, v‑waves' }
    },
    'Ventricular Septal Defect': {
      scenario: '26‑year‑old male reviewed for police service. Very healthy, jogs regularly, no exercise limitation. Known murmur since childhood without prior intervention. No family cardiovascular history; non‑smoker.',
      vitals: { hr: '96', bp: '118/70', spo2: '97', rr: '20', temp: '36.7' }
    },
    'Aortic Regurgitation': {
      scenario: 'Middle‑aged man reports a pounding heartbeat especially when lying down, and mild exertional breathlessness over months. No chest pain; appetite and weight stable.',
      vitals: { hr: '90', bp: '160/50', spo2: '98', rr: '18', temp: '36.7' }
    },
    'Mitral Stenosis': {
      scenario: '50‑year‑old woman with a remote history of possible rheumatic fever (rash and arthralgia as a teen). Former jogger; now an active walker but increasingly short of breath on hills over the past year.',
      vitals: { hr: '120', bp: '105/70', spo2: '94', rr: '22', temp: '36.9' }
    },
    'Patent Ductus Arteriosus': {
      scenario: '30‑year‑old male referred after a murmur was noted. Recently immigrated and has always been well. Walks and performs moderate physical work without limitation. Family history unknown. Slim and healthy‑appearing.',
      vitals: { hr: '120', bp: '120/40', spo2: '97', rr: '22', temp: '36.7' }
    },
  }
  const pool = standardAdultMurmurs.map(x => x.name)
  const opts = buildOptions(m.name, pool)
  const chosen = demo[m.name]
  const fallbackNames = ['Elena Petrova','Nikhil Kumar','Lilly Montana','Oluwaseun Adeyemi','Mateo Santos','Seán O\'Connor','Li Wei','Molly Citrus']
  const age = chosen?.age ?? (24 + (i * 3) % 30)
  const sex = chosen?.sex ?? ((i % 2 === 0 ? 'F' : 'M') as 'F' | 'M')
  const d = details[m.name] || { scenario: 'Cardiac assessment requested for a newly detected murmur.', vitals: { hr: '78', bp: '120/75', spo2: '98', rr: '16', temp: '36.7' } }
  const v = d.vitals
  const vitalsText = `Vitals:\nHR: ${v.hr} bpm\nBP: ${v.bp} mmHg\nSpO₂: ${v.spo2}% RA\nRR: ${v.rr}/min\nTemp: ${v.temp}°C${v.jvp ? `\nJVP: ${v.jvp}` : ''}`
  return {
    id: `std-ad-${i+1}`,
    title: `Ward Case – Bed ${i+1}`,
    patientName: chosen?.name ?? fallbackNames[i % fallbackNames.length],
    age,
    sex,
    vignette: `${d.scenario}\n\n${vitalsText}`,
    options: opts,
    correctIndex: opts.indexOf(m.name),
    audio: m.audio || undefined,
    feedbackCorrect: `Correct: ${m.name} — Why we hear it: ${whyMap[m.name] ?? 'see Skills for underlying mechanism.'}`,
    feedbackWrong: `Hint: ${hints[m.name] ?? 'Revisit timing, location, radiation and associated signs.'} — Try again.`,
  }
})

// Second ward round deck: same conditions, new scenarios and shuffled demographics
const adultCases2: Case[] = standardAdultMurmurs.map((m, i) => {
  const pool = standardAdultMurmurs.map(x => x.name)
  const opts = buildOptions(m.name, pool)
  const altNames = ['Fatima Al‑Zahra','Carlos Mendes','Aanya Shah','Jonas Berg','Sara Haddad','David Levy','Isabella Conti','Thabo Ndlovu']
  const altScenarios: Record<string, string> = {
    'Normal Heart Sounds': 'Routine pre‑employment medical for a barista who cycles daily; no symptoms; exam is a baseline comparison.',
    'Aortic Stenosis': 'Manual labourer notices lightheadedness when carrying loads upstairs; slow‑rising pulse on exam.',
    'Aortic Regurgitation': 'Complains of a pounding heartbeat when lying on the left side and mild exertional dyspnoea.',
    'Mitral Regurgitation': 'Intermittent palpitations with reduced exercise tolerance; blowing pansystolic murmur at apex.',
    'Mitral Stenosis': 'Breathless on inclines with occasional orthopnoea; opening snap followed by diastolic rumble.',
    'Tricuspid Regurgitation': 'Ankle swelling and abdominal fullness; prominent v‑waves in the JVP; murmur louder on inspiration.',
    'Hypertrophic Obstructive Cardiomyopathy': 'Sports participant with exertional chest tightness; murmur increases on standing.',
    'Ventricular Septal Defect': 'Long‑standing murmur noted since childhood; otherwise fit; harsh holosystolic at LLSB with thrill.',
    'Innocent (Still’s) Murmur': 'Healthy student with a soft, vibratory mid‑systolic sound that varies with posture.',
    'Patent Ductus Arteriosus': 'Bounding pulses with wide pulse pressure; continuous machinery‑like murmur infraclavicular.'
  }
  // Reuse previous vitals patterns but vary slightly
  const vitals = [
    { hr: '76', bp: '118/74', spo2: '99', rr: '14', temp: '36.6' },
    { hr: '60', bp: '102/68', spo2: '99', rr: '16', temp: '36.7' },
    { hr: '88', bp: '155/52', spo2: '98', rr: '18', temp: '36.7' },
    { hr: '108', bp: '128/62', spo2: '95', rr: '20', temp: '36.8' },
    { hr: '112', bp: '104/68', spo2: '94', rr: '22', temp: '36.8' },
    { hr: '100', bp: '110/70', spo2: '95', rr: '20', temp: '36.7' },
    { hr: '118', bp: '92/58', spo2: '98', rr: '16', temp: '36.7' },
    { hr: '98', bp: '116/68', spo2: '97', rr: '18', temp: '36.7' },
    { hr: '92', bp: '112/70', spo2: '99', rr: '16', temp: '36.6' },
    { hr: '122', bp: '122/42', spo2: '97', rr: '20', temp: '36.7' },
  ]
  const v = vitals[i % vitals.length]
  const vitalsText = `Vitals:\nHR: ${v.hr} bpm\nBP: ${v.bp} mmHg\nSpO₂: ${v.spo2}% RA\nRR: ${v.rr}/min\nTemp: ${v.temp}°C`
  return {
    id: `std-ad2-${i+1}`,
    title: `Ward Case II – Bed ${i+1}`,
    patientName: altNames[i % altNames.length],
    age: 20 + ((i * 4) % 35),
    sex: (i % 2 === 0 ? 'F' : 'M') as 'F' | 'M',
    vignette: `${altScenarios[m.name] ?? 'Assess the murmur characteristics and correlate with the clinical picture.'}\n\n${vitalsText}`,
    options: opts,
    correctIndex: opts.indexOf(m.name),
    audio: m.audio || undefined,
    feedbackCorrect: `Correct: ${m.name} — Why we hear it: ${whyMap[m.name] ?? 'see Skills for underlying mechanism.'}`,
    feedbackWrong: `Hint: ${m.name.includes('Regurgitation') ? 'Listen for pansystolic vs early diastolic patterns and radiation.' : 'Focus on timing, location, and response to inspiration/expiration.'} — Try again.`,
  }
})

// Shared highlighter for case vignettes (module-scoped so Ward and Ward2 can use it)
class CaseHighlighter {
  private root: HTMLParagraphElement
  private enabled = true
  private onEndBound = (ev: Event) => this.onEnd(ev)
  constructor(root: HTMLParagraphElement) {
    this.root = root
    root.addEventListener('pointerup', this.onEndBound, { passive: true } as any)
    root.addEventListener('touchend', this.onEndBound, { passive: true } as any)
  }
  enable() { this.enabled = true }
  disable() { this.enabled = false }
  clear() {
    const spans = this.root.querySelectorAll<HTMLSpanElement>('span[data-hl="1"], span.neon-highlight')
    spans.forEach(span => {
      const parent = span.parentNode as HTMLElement | null
      while (span.firstChild) parent?.insertBefore(span.firstChild, span)
      parent?.removeChild(span)
    })
    this.root.querySelectorAll<HTMLElement>('.neon-highlight').forEach(el => el.classList.remove('neon-highlight'))
    try { window.getSelection()?.removeAllRanges() } catch {}
  }
  dispose() {
    this.disable()
    this.root.removeEventListener('pointerup', this.onEndBound as any)
    this.root.removeEventListener('touchend', this.onEndBound as any)
  }
  private onEnd(_ev: Event) {
    if (!this.enabled) return
    window.setTimeout(() => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (!this.root.contains(range.commonAncestorContainer)) return
      try {
        const span = document.createElement('span')
        span.className = 'neon-highlight'
        span.setAttribute('data-hl', '1')
        try {
          range.surroundContents(span)
        } catch {
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
      } finally {
        try { sel.removeAllRanges() } catch {}
      }
    }, 30)
  }
}

const congenitalCases: Case[] = standardPedsMurmurs.map((m, i) => {
  const pool = standardPedsMurmurs.map(x => x.name)
  const opts = buildOptions(m.name, pool)
  const names = ['Amira Hassan','Diego Martínez','Minh Nguyen','Yusuf Ali','Sofia Rossi','Noah Cohen','Amelia Brown','Ravi Patel','Hana Suzuki']
  return {
    id: `std-chd-${i+1}`,
    title: `Peds Case – ${m.name}`,
    patientName: names[i % names.length],
    age: 4 + (i * 2),
    sex: (i % 2 === 0 ? 'F' : 'M') as 'F' | 'M',
    vignette: `Child with findings suggestive of ${m.name}. Identify timing, location and associated signs.`,
    options: opts,
    correctIndex: opts.indexOf(m.name),
    audio: m.audio || undefined,
    feedbackCorrect: `Correct: ${m.name} — see Skills for hallmark timing, location and clinical clues.`,
    feedbackWrong: `Hint: Focus on timing, location and radiation typical for ${m.name}.`,
  }
})

export function Peds({ onNext, onPrev: _onPrev, setAccuracy, accuracy, stethoscopeOn, onPlay, onStop }: { onNext: () => void, onPrev: () => void, setAccuracy: Dispatch<SetStateAction<number>>, accuracy: number, stethoscopeOn: boolean, onPlay: (src: string | string[])=>void, onStop: () => void }) {
  const deck = congenitalCases
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const [attempts, setAttempts] = useState(0)
  const current = deck[idx]
  const isLast = idx >= deck.length - 1
  const isFirst = idx <= 0
  const [highlightOn, setHighlightOn] = useState(true)
  const [eliminated, setEliminated] = useState<Set<number>>(new Set())
  const caseContainerRef = useRef<HTMLDivElement|null>(null)
  const vignetteRef = useRef<HTMLParagraphElement|null>(null)

  // Reset highlight state and remove previous marks when case changes
  useEffect(() => {
    setEliminated(new Set())
    setAttempts(0)
    const container = vignetteRef.current
    if (!container) return
    Array.from(container.querySelectorAll<HTMLElement>('.neon-highlight')).forEach(el => el.classList.remove('neon-highlight'))
  }, [current.id])
  // Per-case highlighter: attach to the active case container only
  useEffect(() => {
    if (!highlightOn) return
    const container = caseContainerRef.current
    if (!container) return
    const onEnd = () => {
      // Allow browsers to finalize selection
      window.setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
        const range = sel.getRangeAt(0)
        if (!container.contains(range.commonAncestorContainer)) return
        try {
          const span = document.createElement('span')
          span.className = 'neon-highlight'
          span.setAttribute('data-hl', '1')
          try {
            range.surroundContents(span)
          } catch {
            const contents = range.extractContents()
            span.appendChild(contents)
            range.insertNode(span)
          }
        } finally {
          try { sel.removeAllRanges() } catch {}
        }
      }, 50)
    }
    container.addEventListener('pointerup', onEnd, { passive: true })
    container.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      container.removeEventListener('pointerup', onEnd)
      container.removeEventListener('touchend', onEnd)
    }
  }, [highlightOn, current.id])
  // Generate shuffled options for current case
  const shuffledOptions = useMemo(() => {
    return shuffleWithCorrectIndex(current.options, current.correctIndex)
  }, [idx, current.options, current.correctIndex])

  function choose(i: number) {
    // If already solved correctly, do nothing
    if (isCorrect === true) return
    const correct = i===shuffledOptions.newCorrectIndex
    setSelected(i)
    setIsCorrect(correct)
    // Only the first attempt affects accuracy
    if (attempts === 0) {
    setAccuracy(a=> Math.max(0, Math.min(100, a + (correct? +3 : -6))))
    }
    setAttempts(a => a + 1)
  }
  function nextCase() {
    onStop()
    if (isLast) { onNext(); return }
    setSelected(null)
    setIsCorrect(null)
    setIdx(i => Math.min(i+1, deck.length-1))
  }
  function prevCase() {
    onStop()
    if (isFirst) return
    setSelected(null)
    setIsCorrect(null)
    setIdx(i => Math.max(0, i-1))
  }
  // legacy selection handler removed (handled by CaseHighlighter)
  function clearHighlights() {
    const scope = vignetteRef.current
    if (!scope) return
    try { window.getSelection()?.removeAllRanges() } catch {}
    // Keep unwrapping until no highlight nodes remain
    // This handles any accidental nested highlights from multiple handlers
    let removed = true
    while (removed) {
      removed = false
      const spans1 = scope.querySelectorAll<HTMLSpanElement>('span[data-hl=\"1\"]')
      if (spans1.length) {
        spans1.forEach(span => {
          const parent = span.parentNode as HTMLElement | null
          while (span.firstChild) parent?.insertBefore(span.firstChild, span)
          parent?.removeChild(span)
        })
        removed = true
        continue
      }
      const spans2 = scope.querySelectorAll<HTMLSpanElement>('span.neon-highlight')
      if (spans2.length) {
        spans2.forEach(span => {
          const parent = span.parentNode as HTMLElement | null
          while (span.firstChild) parent?.insertBefore(span.firstChild, span)
          parent?.removeChild(span)
        })
        removed = true
        continue
      }
      const others = scope.querySelectorAll<HTMLElement>('.neon-highlight')
      if (others.length) {
        others.forEach(el => el.classList.remove('neon-highlight'))
        removed = true
        continue
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="Welcome to the Peds Ward. Smaller patients, equally big learning." />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div ref={caseContainerRef} key={current.id} data-case="1" data-caseid={current.id} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5 }} className="relative rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="text-sm text-slate-300 mb-1">{current.title}</div>
            <div className="text-xs text-slate-400 mb-3">Patient: {current.patientName} · {current.age}y · {current.sex}</div>
            {/* Vignette: selection-based highlighting; drag to highlight; tap also supported */}
            <p
              ref={vignetteRef}
              key={current.id}
              className="mb-4 select-text leading-relaxed"
            >
              {current.vignette}
            </p>
            {/* Highlight controls - horizontal row, eraser left of pen */}
            <div className="absolute top-3 right-1 z-10 flex flex-row gap-1.5">
              <button
                onClick={()=> clearHighlights()}
                className="px-1.5 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-slate-200"
                title="Clear highlights"
              >
                <LuEraser size={16} />
              </button>
              <button
                onClick={()=> setHighlightOn(v=>!v)}
                className={`px-1.5 py-1.5 rounded-md border ${highlightOn ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'border-white/10 bg-white/0 hover:bg-white/5 text-slate-200'}`}
                title="Toggle highlighter"
              >
                <FiPenTool size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button disabled={!stethoscopeOn || !current.audio} onClick={()=> current.audio && onPlay([current.audio, current.audio.replace(/^\/assets\/audio\//,'/audio/'), current.audio.replace(/^\/assets\//,'/')])} className={`px-3 py-1.5 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200':'bg-white/10 text-slate-300 opacity-60'} `}>🔊 Listen</button>
              {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.shuffled.map((d, i) => (
                <div key={d} className="flex items-stretch gap-2">
                  <motion.button
                  whileTap={{ scale: 0.97 }}
                  animate={selected===i ? (isCorrect? { scale: 1.03, backgroundColor: 'rgba(16,185,129,0.25)'} : { x: [0,-6,6,-4,4,0], backgroundColor: 'rgba(239,68,68,0.25)'}) : {}}
                    onClick={() => { if (!eliminated.has(i)) choose(i) }}
                    className={`px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 flex items-center gap-2 flex-1 ${eliminated.has(i)? 'line-through opacity-50 pointer-events-none' : ''}`}
                  >
                  {selected===i && isCorrect===true && <FiCheckCircle className="text-emerald-400"/>}
                  {selected===i && isCorrect===false && <FiXCircle className="text-rose-400"/>}
                  {d}
                </motion.button>
                  <button
                    aria-label={eliminated.has(i)? 'Restore option':'Eliminate option'}
                    onClick={()=>{
                      setEliminated(prev => {
                        const next = new Set(prev)
                        if (next.has(i)) next.delete(i); else next.add(i)
                        return next
                      })
                    }}
                    className={`px-2 py-2 rounded-md border ${eliminated.has(i)? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10' : 'border-white/10 text-slate-300 hover:bg-white/10'}`}
                    title="Cross out"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          {selected!==null && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              {isCorrect ? (
                <div className="text-emerald-300">{current.feedbackCorrect}</div>
              ) : (
                <div className="text-amber-300">{current.feedbackWrong} Try again.</div>
              )}
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <button onClick={prevCase} disabled={isFirst} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-sm">Previous Patient</button>
          <div className="flex items-center gap-3 sm:flex-1">
            <div className="h-3 rounded-full bg-white/10 overflow-hidden flex-1">
              <div className="h-full accuracy-fill" style={{ width: `${accuracy}%` }} />
            </div>
            <div className="text-sm text-slate-300 w-14 text-right">{accuracy}%</div>
          </div>
          <button onClick={nextCase} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 text-sm">{isLast ? 'Finish Ward' : 'Next Patient'}</button>
        </div>
        <CaseClipboard caseData={current} />
      </div>
    </div>
  )
}

function References() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-5xl w-full px-8 pt-10 pb-24 flex flex-col gap-6">
        <Mentor text="Credits & References" />
        
        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-6 text-slate-200">
            <section>
              <h4 className="text-emerald-300 font-semibold mb-2">Purpose of this SSC</h4>
              <p className="text-sm text-slate-300">This Student Selected Component (E11) focuses on creating an interactive e‑learning tool to support fellow medical students in mastering cardiac auscultation. It applies educational theory to promote independent learning, deliberate practice, and retrieval practice, aligning with the programme's emphasis on developing self‑directed learners through design, iteration, and reflection.</p>
            </section>
            <section>
              <h4 className="text-emerald-300 font-semibold mb-2">Educational approach</h4>
              <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                <li>Dual Coding Theory: audio waveforms + concise textual cues support encoding.</li>
                <li>Cognitive Load Theory: progressive disclosure, gated listening with a stethoscope, and short cases reduce extraneous load.</li>
                <li>Deliberate & Retrieval Practice: repeated, feedback‑rich items with spaced exposure.</li>
                <li>Situated Learning: ward‑style vignettes mirror authentic clinical reasoning.</li>
                <li>Connectivism: links to reputable UK resources encourage networked learning.</li>
              </ul>
            </section>
            <section>
              <h4 className="text-emerald-300 font-semibold mb-2">Acknowledgement</h4>
              <p className="text-sm text-slate-300">With thanks to Tutor: Dr Alun Owens — E11: Creating an Interactive Educational Tool for Fellow Medical Students.</p>
            </section>
            <section>
              <div className="rounded-md border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm p-3">
                Any inaccuracies or concerns please email <a className="underline" href="mailto:AyadAA1@cardiff.ac.uk">AyadAA1@cardiff.ac.uk</a> to update the webpage.
              </div>
            </section>
            {/* References list moved to a dedicated container at the bottom for better organisation */}
            
            {/* Additional content to demonstrate scrolling */}
            <section>
              <h4 className="text-emerald-300 font-semibold mb-2">Technical Implementation</h4>
              <p className="text-sm text-slate-300">This application was built using modern web technologies:</p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                <li>React: Component-based architecture for maintainable code</li>
                <li>TypeScript: Type safety and enhanced developer experience</li>
                <li>Tailwind CSS: Utility-first styling for consistent design</li>
                <li>Framer Motion: Smooth animations and transitions</li>
                <li>Vite: Fast development and build tooling</li>
              </ul>
            </section>
            
            <section>
              <h4 className="text-emerald-300 font-semibold mb-2">Future Enhancements</h4>
              <p className="text-sm text-slate-300">Potential improvements for future versions:</p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                <li>Integration with learning management systems</li>
                <li>Progress tracking and analytics</li>
                <li>Additional cardiac conditions and sounds</li>
                <li>Mobile app development</li>
                <li>Collaborative learning features</li>
              </ul>
            </section>
            {/* Dedicated References container at the very bottom */}
            <section className="pt-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h4 className="text-emerald-300 font-semibold mb-2">References (Cardiff Harvard)</h4>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  {(() => {
                    const choices = ['10/11','11/11','12/11']
                    const pick = () => choices[Math.floor(Math.random() * choices.length)]
                    const d0 = pick(), d1 = pick(), d2 = pick(), d3 = pick(), d4 = pick(), d5 = pick(), d6 = pick()
                    return (
                      <>
                        <li>
                          University of Washington. (n.d.) Heart Sounds and Murmurs. Available at: <a className="text-emerald-300 underline" href="https://teachingheartauscultation.com/heart-sounds-mp3-downloads" target="_blank" rel="noreferrer">teachingheartauscultation.com/heart-sounds-mp3-downloads</a> (Accessed: {d0}).
                        </li>
                        <li>
                          British Heart Foundation. (n.d.) Heart conditions and tests. Available at: <a className="text-emerald-300 underline" href="https://www.bhf.org.uk/informationsupport/conditions" target="_blank" rel="noreferrer">bhf.org.uk/informationsupport/conditions</a> (Accessed: {d1}).
                        </li>
                        <li>
                          National Institute for Health and Care Excellence (NICE). (n.d.) Cardiovascular conditions. Available at: <a className="text-emerald-300 underline" href="https://www.nice.org.uk/guidance/conditions-and-diseases/cardiovascular-conditions" target="_blank" rel="noreferrer">nice.org.uk/guidance/conditions-and-diseases/cardiovascular-conditions</a> (Accessed: {d2}).
                        </li>
                        <li>
                          British Society for Echocardiography. (2021) Clinical indications for adult transthoracic echocardiography. Available at: <a className="text-emerald-300 underline" href="https://www.bsecho.org" target="_blank" rel="noreferrer">bsecho.org</a> (Accessed: {d3}).
                        </li>
                        <li>
                          Unsplash. (n.d.) Free images for the hero carousel. Available at: <a className="text-emerald-300 underline" href="https://unsplash.com/" target="_blank" rel="noreferrer">unsplash.com</a> • License: <a className="text-emerald-300 underline" href="https://unsplash.com/license" target="_blank" rel="noreferrer">unsplash.com/license</a> (Accessed: {d4}).
                        </li>
                        <li>
                          Mozaik Education. (n.d.) The anatomy of the heart — interactive 3D scene. Available at: <a className="text-emerald-300 underline" href="https://www.mozaweb.com/hr/Extra-3D_scene-The_anatomy_of_the_heart-398241" target="_blank" rel="noreferrer">mozaweb.com/hr/Extra-3D_scene-The_anatomy_of_the_heart-398241</a> (Accessed: {d5}).
                        </li>
                        <li>
                          Lecturio. (n.d.) Heart Sounds and Murmurs (image and concept references). Available at: <a className="text-emerald-300 underline" href="https://app.lecturio.com/#/article/3542" target="_blank" rel="noreferrer">app.lecturio.com/#/article/3542</a> (Accessed: {d6}).
                        </li>
                      </>
                    )
                  })()}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Auscultation() {
  // Shared site coordinates (approx. ICS)
  // Positions tuned for the photo overlay (/images/thorax-overlay.png)
  // Adjust here to fine‑tune alignment with the image.
  // "Space" unit = 3% adjustment for both axes
  const SPACE = 3
  const QUARTER = SPACE / 4
  const sites = [
    // Aortic: one space left, two spaces up
    { id: 'aortic',    x: 58 - SPACE,  y: 52 - 2*SPACE,  color: '#f59e0b', label: 'Aortic valve', locationInfo: ['2nd right intercostal space', 'Right sternal border', 'Best with diaphragm'], murmurs: ['Aortic stenosis', 'Aortic regurgitation (early diastolic at LSE)'], radiation: 'Carotids' },
    // Pulmonary: one space right, two spaces up
    { id: 'pulmonary', x: 42 + SPACE,  y: 52 - 2*SPACE,  color: '#eab308', label: 'Pulmonary valve', locationInfo: ['2nd left intercostal space', 'Left sternal border', 'Intensifies with inspiration'], murmurs: ['Pulmonary stenosis'], radiation: 'Left shoulder' },
    // Tricuspid: quarter space right, quarter space up
    { id: 'tricuspid', x: 52 + QUARTER,   y: 58 - QUARTER,     color: '#60a5fa', label: 'Tricuspid valve', locationInfo: ['Lower left sternal border', '4th–5th intercostal space', 'Inspiration accentuates (Carvallo)'], murmurs: ['Tricuspid regurgitation'], radiation: 'Right sternum' },
    // Mitral: 2.5 spaces left, two spaces up
    { id: 'mitral',    x: 72 - (2.5*SPACE),  y: 66 - 2*SPACE,  color: '#34d399', label: 'Mitral valve (apex)', locationInfo: ['5th left intercostal space', 'Mid‑clavicular line (apex)', 'Bell for low‑pitched MS'], murmurs: ['Mitral regurgitation', 'Mitral stenosis'], radiation: 'Axilla' },
  ]
  const [openValve, setOpenValve] = useState<string|null>(null)
  const [openMurmur, setOpenMurmur] = useState<string|null>(null)
  const [pulseSite, setPulseSite] = useState<string|null>(null)

  function ThoraxSVG({ children }: { children?: React.ReactNode }) {
    const [photoOk, setPhotoOk] = useState(true)
    return (
      <div className="relative mx-auto w-full max-w-md aspect-[3/4]" onClick={()=>{ setOpenValve(null); setOpenMurmur(null) }}>
        {/* Optional photo overlay if present at /images/thorax-overlay.png */}
        {photoOk && (
          <img
            src="/images/thorax-overlay.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none"
            onError={()=> setPhotoOk(false)}
          />
        )}
        {!photoOk && (
          <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <radialGradient id="thoraxBg" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.10)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <path d="M50 5 C30 10,20 25,22 45 C24 70,20 85,25 110 C28 123,72 123,75 110 C80 85,76 70,78 45 C80 25,70 10,50 5 Z"
                  fill="url(#thoraxBg)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            {/* Sternum */}
            <rect x="47.5" y="18" width="5" height="50" rx="2.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
            {/* ribs / intercostal spaces */}
            {(() => {
              const start = 22, end = 66, count = 8; // ICS 2–9
              const ys = Array.from({length: count}, (_,i)=> start + (end-start) * (i/(count-1)));
              return ys.map((y,i)=>(
                <line key={i} x1="28" y1={y} x2="72" y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
              ))
            })()}
          </svg>
        )}
        {/* Interactive overlay (absolute children positioned via percentages) */}
        <div className="absolute inset-0">
          {/* ICS labels only when fallback SVG is visible */}
          {!photoOk && (() => {
            const start = 22, end = 66, count = 8;
            const ys = Array.from({length: count}, (_,i)=> ({ y: start + (end-start) * (i/(count-1)), n: i+2 }));
            return (
              <>
                {ys.map(({y,n})=>(
                  <div key={`l-${n}`} className="pointer-events-none absolute -translate-y-1/2 text-[10px] text-slate-300"
                       style={{ top: `${y}%`, left: '16%' }}>{n}</div>
                ))}
                {ys.map(({y,n})=>(
                  <div key={`r-${n}`} className="pointer-events-none absolute -translate-y-1/2 text-[10px] text-slate-300"
                       style={{ top: `${y}%`, right: '16%' }}>{`ICS ${n}`}</div>
                ))}
              </>
            )
          })()}
          {children}
        </div>
      </div>
    )
  }

  function SiteButton({ s, kind, open }: { s: typeof sites[number], kind: 'valve'|'murmur', open: boolean }) {
    const isActive = pulseSite===s.id
    const click = (e: React.MouseEvent)=> {
      e.stopPropagation()
      if (kind==='valve') setOpenValve(prev => prev===s.id? null : s.id)
      else setOpenMurmur(prev => prev===s.id? null : s.id)
    }
    return (
      <button onClick={click} className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${s.x}%`, top: `${s.y}%` }} aria-label={s.label}>
        <span className="relative block w-5 h-5 rounded-full"
          style={{ backgroundColor: s.color, boxShadow: `0 0 12px ${s.color}80` }}>
          {/* baseline gentle colored ring */}
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `${s.color}22` }} />
          {/* active state: emerald green rings */}
          {isActive && (
            <>
              <span className="pointer-events-none absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `rgba(16,185,129,0.45)` }} />
              <span className="pointer-events-none absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `rgba(16,185,129,0.25)`, animationDelay: '250ms' }} />
            </>
          )}
        </span>
        {open && (
          <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -top-2 translate-y-[-100%] z-10 w-64 rounded-lg border border-white/10 bg-slate-900/95 p-3 text-xs text-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-emerald-300">{s.label}</div>
              <button
                onClick={(e)=>{ e.stopPropagation(); if (kind==='valve') setOpenValve(null); else setOpenMurmur(null) }}
                className="px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20"
                aria-label="Close">
                ✕
              </button>
            </div>
            {kind==='valve' ? (
              <ul className="list-disc pl-5 space-y-1">
                {(s as any).locationInfo?.map((m:string,i:number)=>(<li key={i}>{m}</li>))}
              </ul>
            ) : (
              <>
                <ul className="list-disc pl-5 space-y-1">
                  {s.murmurs.map((m,i)=>(<li key={i}>{m}</li>))}
                </ul>
                <div className="mt-2 text-[11px] text-slate-400">Radiation: <span className="text-sky-300">{s.radiation}</span></div>
              </>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-slate-900/95" />
          </div>
        )}
      </button>
    )
  }

  // Popover removed in favor of anchored floating content on the markers

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-6xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="Left: valve positions. Right: common murmurs and typical radiation. Tap a site to learn more; use the table to trigger glow on key sites." />
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Left: Valve map */}
          <div className="relative bg-white/5 border border-white/10 rounded-xl p-4 overflow-visible" onClick={()=> setOpenValve(null)}>
            <div className="text-sm text-slate-300 mb-2">Valve Locations</div>
            <ThoraxSVG>
              {sites.map(s => <SiteButton key={s.id} s={s} kind="valve" open={openValve===s.id} />)}
            </ThoraxSVG>
          </div>
          {/* Right: Murmur map with same sites – we reuse but openMurmur state */}
          <div className="relative bg-white/5 border border-white/10 rounded-xl p-4 overflow-visible" onClick={()=> setOpenMurmur(null)}>
            <div className="text-sm text-slate-300 mb-2">Murmurs & Radiation</div>
            <ThoraxSVG>
              {sites.map(s => <SiteButton key={s.id} s={s} kind="murmur" open={openMurmur===s.id} />)}
            </ThoraxSVG>
          </div>
        </div>
        {/* Reference table with glow controls */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white/5 backdrop-blur text-slate-300">
              <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left border-b border-white/10">
                <th className="text-left">Murmur</th>
                <th>Cycle</th>
                <th>Character</th>
                <th>Breathing</th>
                <th>Location</th>
                <th>Radiation</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {/* Rows – align with murmurs above */}
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Aortic stenosis</td><td>Systolic</td><td>Ejection</td><td>Expiration</td><td>Aortic</td><td>Carotids</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='aortic'? null : 'aortic')} className="px-2 py-1 rounded-md" style={{ background: '#f59e0b22', border: '1px solid #f59e0b88', boxShadow: '0 0 12px #f59e0b55' }}>View</button></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Pulmonary stenosis</td><td>Systolic</td><td>Ejection</td><td>Inspiration ↑</td><td>Pulmonary</td><td>Left shoulder</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='pulmonary'? null : 'pulmonary')} className="px-2 py-1 rounded-md" style={{ background: '#eab30822', border: '1px solid #eab30888', boxShadow: '0 0 12px #eab30855' }}>View</button></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Mitral regurgitation</td><td>Systolic</td><td>Pansystolic</td><td>Expiration</td><td>Mitral</td><td>Axilla</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='mitral'? null : 'mitral')} className="px-2 py-1 rounded-md" style={{ background: '#34d39922', border: '1px solid #34d39988', boxShadow: '0 0 12px #34d39955' }}>View</button></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Tricuspid regurgitation</td><td>Systolic</td><td>Pansystolic</td><td>Inspiration ↑</td><td>Tricuspid</td><td>Right sternum</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='tricuspid'? null : 'tricuspid')} className="px-2 py-1 rounded-md" style={{ background: '#60a5fa22', border: '1px solid #60a5fa88', boxShadow: '0 0 12px #60a5fa55' }}>View</button></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Mitral stenosis</td><td>Mid/late diastolic</td><td>Rumble</td><td>Expiration</td><td>Mitral</td><td>—</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='mitral'? null : 'mitral')} className="px-2 py-1 rounded-md" style={{ background: '#34d39922', border: '1px solid #34d39988', boxShadow: '0 0 12px #34d39955' }}>View</button></td>
              </tr>
              <tr>
                <td className="px-3 py-2">Aortic regurgitation</td><td>Early diastolic</td><td>Decrescendo</td><td>Expiration</td><td>LSE</td><td>LSE</td>
                <td className="px-2 py-2"><button onClick={()=> setPulseSite(pulseSite==='aortic'? null : 'aortic')} className="px-2 py-1 rounded-md" style={{ background: '#38bdf822', border: '1px solid #38bdf888', boxShadow: '0 0 12px #38bdf855' }}>View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AudioQuiz({ onPlay, onStop, stethoscopeOn }: { onPlay: (src: string | string[])=>void, onStop: ()=>void, stethoscopeOn: boolean }) {
  const items = [
    { id: 'as',  phrase: 'Radiates to the carotids',           audio: ['/assets/audio/adultCASE4.mp3'], answer: 'aortic stenosis' },
    { id: 'pda', phrase: 'Machine-like continuous',             audio: ['/assets/audio/adultCASE7.mp3','/assets/audio/3-PDA.mp3'], answer: 'patent ductus arteriosus' },
    { id: 'mr',  phrase: 'Axillary radiation',                  audio: ['/assets/audio/adultCASE6.mp3'], answer: 'mitral regurgitation' },
    { id: 'ms',  phrase: 'Opening snap + mid-diastolic rumble', audio: ['/assets/audio/adultCASE3.mp3'], answer: 'mitral stenosis' },
    { id: 'ar',  phrase: 'Early diastolic decrescendo at LSE',  audio: ['/assets/audio/Ar.mp3','/assets/audio/ar.mp3','/assets/audio/adultCASE4.mp3'], answer: 'aortic regurgitation' },
    { id: 'inn', phrase: 'Musical, vibratory quality',          audio: ['/assets/audio/8-Innocent-murmur-and-S3.mp3'], answer: 'innocent murmur' },
    { id: 'vsd', phrase: 'Harsh holosystolic at LLSB',          audio: ['/assets/audio/adultCASE5.mp3'], answer: 'ventricular septal defect' },
    { id: 'tr',  phrase: 'Increases with inspiration',          audio: ['/assets/audio/tr.mp3'], answer: 'tricuspid regurgitation' },
    { id: 'hocm',phrase: 'Louder with Valsalva/standing',       audio: ['/assets/audio/HOCM.mp3'], answer: 'hypertrophic obstructive cardiomyopathy' },
  ]
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<'idle'|'correct'|'wrong'>('idle')
  const current = items[idx]
  function check() {
    const norm = (s:string)=> s.toLowerCase().replace(/[^a-z]/g,'')
    const ok = norm(value).includes(norm(current.answer))
    setResult(ok? 'correct':'wrong')
  }
  function next() {
    onStop(); setValue(''); setResult('idle'); setIdx(i=> Math.min(i+1, items.length-1))
  }
  function prev() {
    onStop(); setValue(''); setResult('idle'); setIdx(i=> Math.max(i-1, 0))
  }
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="Final audio recognition: associate common buzz-phrases with their hallmark sounds." />
        <div className="flex flex-col items-center gap-4">
          <button disabled={!stethoscopeOn} onClick={()=> onPlay(current.audio)} className="relative w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-500/30 disabled:opacity-40">
            🔊
          </button>
          {!stethoscopeOn && (
            <div className="text-xs text-amber-300" role="status" aria-live="polite">
              Equip the stethoscope to play audio.
            </div>
          )}
          <div className="px-3 py-1 rounded-md border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-sm">{current.phrase}</div>
          <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Type the diagnosis..." className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 outline-none" />
          <div className="flex gap-2">
            <button onClick={prev} disabled={idx===0} className="px-3 py-2 rounded-md bg-white/10 disabled:opacity-40">Back</button>
            <button onClick={check} className="px-3 py-2 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400">Check</button>
            <button onClick={next} disabled={idx===items.length-1} className="px-3 py-2 rounded-md bg-white/10 disabled:opacity-40">Next</button>
          </div>
          {result!=='idle' && (
            <div className={`text-sm ${result==='correct'?'text-emerald-300':'text-amber-300'}`}>
              {result==='correct' ? 'Correct!' : `Answer: ${current.answer}`}
            </div>
          )}
        </div>
        <div className="text-xs text-slate-400 text-center">
          Objective: reinforce memory by pairing hallmark buzz-phrases with their characteristic sounds.
        </div>
        {/* Neon outline icons */}
        <div className="mt-6 flex items-center justify-center gap-8 opacity-90">
          <TbBrain size={42} className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
          <TbTopologyStar3 size={42} className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
          <TbEar size={42} className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
        </div>
      </div>
    </div>
  )
}
function Ward({ onNext, onPrev: _onPrev, setAccuracy, accuracy, stethoscopeOn, onPlay, onStop, onFinishRound }: { onNext: () => void, onPrev: () => void, setAccuracy: Dispatch<SetStateAction<number>>, accuracy: number, stethoscopeOn: boolean, onPlay: (src: string | string[])=>void, onStop: () => void, onFinishRound: (score: number)=>void }) {
  const deck = adultCases
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const [attempts, setAttempts] = useState(0)
  const current = deck[idx]
  const [highlightOn, setHighlightOn] = useState(true)
  const [eliminated, setEliminated] = useState<Set<number>>(new Set())
  const caseContainerRef = useRef<HTMLDivElement|null>(null)
  const vignetteRef = useRef<HTMLParagraphElement|null>(null)
  const [vignetteNonce, setVignetteNonce] = useState(0)
  const hlRef = useRef<CaseHighlighter|null>(null)

  // Helper to always resolve the vignette element within the CURRENT case container
  function getVignetteEl(): HTMLParagraphElement | null {
    const container = caseContainerRef.current
    if (!container) return null
    return (container.querySelector('p[data-vignette=\"1\"]') as HTMLParagraphElement | null) 
      ?? (container.querySelector('p') as HTMLParagraphElement | null)
  }

  // CaseHighlighter is module-scoped above

  // Reset highlight state and remove previous marks when case changes
  useEffect(() => {
    setEliminated(new Set())
    const scope = getVignetteEl()
    if (scope) scope.replaceChildren(document.createTextNode(current.vignette))
    setVignetteNonce(0)
    // (re)create highlighter instance for this case
    const root = vignetteRef.current
    if (hlRef.current) { try { hlRef.current.dispose() } catch {} hlRef.current = null }
    if (root) {
      hlRef.current = new CaseHighlighter(root)
      if (!highlightOn) hlRef.current.disable()
    }
    return () => {
      if (hlRef.current) { try { hlRef.current.dispose() } catch {} hlRef.current = null }
    }
  }, [current.id])

  // Reflect enable/disable state to the current highlighter instance
  useEffect(() => {
    if (!hlRef.current) return
    if (highlightOn) hlRef.current.enable(); else hlRef.current.disable()
  }, [highlightOn])

  // Generate shuffled options for current case
  const shuffledOptions = useMemo(() => {
    return shuffleWithCorrectIndex(current.options, current.correctIndex)
  }, [idx, current.options, current.correctIndex])

  function choose(i: number) {
    // If already solved correctly, ignore further clicks
    if (isCorrect === true) return
    const correct = i===shuffledOptions.newCorrectIndex
    setSelected(i)
    setIsCorrect(correct)
    if (attempts === 0) {
    setAccuracy(a=> Math.max(0, Math.min(100, a + (correct? +3 : -6))))
    }
    setAttempts(a => a + 1)
  }

  // selection handled by CaseHighlighter

  function clearHighlights() {
    hlRef.current?.clear()
  }

  const isLast = idx >= deck.length - 1
  const isFirst = idx <= 0

  // rearmHighlighter removed (handled by CaseHighlighter lifecycle)

  function nextCase() {
    onStop()
    if (isLast) { onFinishRound(accuracy); onNext(); return }
    hlRef.current?.dispose()
    hlRef.current = null
    setSelected(null)
    setIsCorrect(null)
    setAttempts(0)
    setIdx(i => Math.min(i+1, deck.length-1))
  }

  function prevCase() {
    onStop()
    if (isFirst) return
    hlRef.current?.dispose()
    hlRef.current = null
    setSelected(null)
    setIsCorrect(null)
    setAttempts(0)
    setIdx(i => Math.max(0, i-1))
  }

  return (
    <div className="h-full flex flex-col">
      <HeadphoneNotice />
      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="We'll move bed-to-bed. Read the case file, listen, and decide." />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div ref={caseContainerRef} key={current.id} data-case="1" data-caseid={current.id} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5 }} className="relative rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="text-sm text-slate-300 mb-1">{current.title}</div>
            <div className="text-xs text-slate-400 mb-3">Patient: {current.patientName} · {current.age}y · {current.sex}</div>
            {/* Vignette: selection-based highlighting; drag to highlight; tap also supported */}
            <p
              ref={vignetteRef}
              key={`${current.id}-${vignetteNonce}`}
              data-vignette="1"
              className="mb-4 select-text leading-relaxed"
            >
              {current.vignette}
            </p>
            {/* Highlight controls - horizontal row, eraser left of pen */}
            <div className="absolute top-3 right-1 z-10 flex flex-row gap-1.5 hl-controls">
              <button
                onPointerUp={(e)=> e.stopPropagation()}
                onTouchEnd={(e)=> { e.stopPropagation() }}
                onMouseUp={(e)=> e.stopPropagation()}
                onClick={()=> clearHighlights()}
                className="px-1.5 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-slate-200"
                title="Clear highlights"
              >
                <LuEraser size={16} />
              </button>
              <button
                onPointerUp={(e)=> e.stopPropagation()}
                onTouchEnd={(e)=> { e.stopPropagation() }}
                onMouseUp={(e)=> e.stopPropagation()}
                onClick={()=>{
                  setHighlightOn(v=>{
                    const next = !v
                    if (!next) {
                      // when pen is turned off, clear highlights for this card
                      clearHighlights()
                    }
                    return next
                  })
                }}
                className={`px-1.5 py-1.5 rounded-md border ${highlightOn ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'border-white/10 bg-white/0 hover:bg-white/5 text-slate-200'}`}
                title="Toggle highlighter"
              >
                <FiPenTool size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button disabled={!stethoscopeOn || !current.audio} onClick={()=> current.audio && onPlay([current.audio, current.audio.replace(/^\/assets\/audio\//,'/audio/'), current.audio.replace(/^\/assets\//,'/')])} className={`px-3 py-1.5 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200':'bg-white/10 text-slate-300 opacity-60'} `}>🔊 Listen</button>
              {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.shuffled.map((d, i) => (
                <div key={d} className="flex items-stretch gap-2">
                  <motion.button
                  whileTap={{ scale: 0.97 }}
                  animate={selected===i ? (isCorrect? { scale: 1.03, backgroundColor: 'rgba(16,185,129,0.25)'} : { x: [0,-6,6,-4,4,0], backgroundColor: 'rgba(239,68,68,0.25)'}) : {}}
                    onClick={() => { if (!eliminated.has(i)) choose(i) }}
                    className={`px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 flex items-center gap-2 flex-1 ${eliminated.has(i)? 'line-through opacity-50 pointer-events-none' : ''}`}
                  >
                  {selected===i && isCorrect===true && <FiCheckCircle className="text-emerald-400"/>}
                  {selected===i && isCorrect===false && <FiXCircle className="text-rose-400"/>}
                  {d}
                </motion.button>
                  <button
                    aria-label={eliminated.has(i)? 'Restore option':'Eliminate option'}
                    onClick={()=>{
                      setEliminated(prev => {
                        const next = new Set(prev)
                        if (next.has(i)) next.delete(i); else next.add(i)
                        return next
                      })
                    }}
                    className={`px-2 py-2 rounded-md border ${eliminated.has(i)? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10' : 'border-white/10 text-slate-300 hover:bg-white/10'}`}
                    title="Cross out"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          {selected!==null && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              {isCorrect ? (
                <div className="text-emerald-300">{current.feedbackCorrect}</div>
              ) : (
                <div className="text-amber-300">{current.feedbackWrong}</div>
              )}
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <button onClick={prevCase} disabled={isFirst} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-sm">Previous Patient</button>
          <div className="flex items-center gap-3 sm:flex-1">
            <div className="h-3 rounded-full bg-white/10 overflow-hidden flex-1">
              <div className="h-full accuracy-fill" style={{ width: `${accuracy}%` }} />
            </div>
            <div className="text-sm text-slate-300 w-14 text-right">{accuracy}%</div>
          </div>
          <button onClick={nextCase} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 text-sm">{isLast ? 'Finish Round' : 'Next Patient'}</button>
        </div>
        <CaseClipboard caseData={current} />
      </div>
    </div>
  )
}

function Ward2({ onNext, onPrev: _onPrev, setAccuracy, accuracy, stethoscopeOn, onPlay, onStop, onFinishRound }: { onNext: () => void, onPrev: () => void, setAccuracy: Dispatch<SetStateAction<number>>, accuracy: number, stethoscopeOn: boolean, onPlay: (src: string | string[])=>void, onStop: () => void, onFinishRound: (score: number)=>void }) {
  const deck = adultCases2
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const [attempts, setAttempts] = useState(0)
  const current = deck[idx]
  const [highlightOn, setHighlightOn] = useState(true)
  const [eliminated, setEliminated] = useState<Set<number>>(new Set())
  const caseContainerRef = useRef<HTMLDivElement|null>(null)
  const vignetteRef = useRef<HTMLParagraphElement|null>(null)
  const [vignetteNonce, setVignetteNonce] = useState(0)
  const hlRef = useRef<CaseHighlighter|null>(null)

  function getVignetteEl(): HTMLParagraphElement | null {
    const container = caseContainerRef.current
    if (!container) return null
    return (container.querySelector('p[data-vignette=\"1\"]') as HTMLParagraphElement | null) 
      ?? (container.querySelector('p') as HTMLParagraphElement | null)
  }

  // Reset highlight state and remove previous marks when case changes
  useEffect(() => {
    setEliminated(new Set())
    const scope = getVignetteEl()
    if (scope) scope.replaceChildren(document.createTextNode(current.vignette))
    setVignetteNonce(0)
    // (re)create highlighter instance for this case
    const root = vignetteRef.current
    if (hlRef.current) { try { hlRef.current.dispose() } catch {} hlRef.current = null }
    if (root) {
      hlRef.current = new CaseHighlighter(root)
      if (!highlightOn) hlRef.current.disable()
    }
    return () => {
      if (hlRef.current) { try { hlRef.current.dispose() } catch {} hlRef.current = null }
    }
  }, [current.id])

  // Reflect enable/disable state to the current highlighter instance
  useEffect(() => {
    if (!hlRef.current) return
    if (highlightOn) hlRef.current.enable(); else hlRef.current.disable()
  }, [highlightOn])

  const shuffledOptions = useMemo(() => {
    return shuffleWithCorrectIndex(current.options, current.correctIndex)
  }, [idx, current.options, current.correctIndex])

  function choose(i: number) {
    if (isCorrect === true) return
    const correct = i===shuffledOptions.newCorrectIndex
    setSelected(i)
    setIsCorrect(correct)
    if (attempts === 0) {
    setAccuracy(a=> Math.max(0, Math.min(100, a + (correct? +3 : -6))))
    }
    setAttempts(a => a + 1)
  }

  function clearHighlights() {
    hlRef.current?.clear()
  }

  const isLast = idx >= deck.length - 1
  const isFirst = idx <= 0

  function nextCase() {
    onStop()
    if (isLast) { onFinishRound(accuracy); onNext(); return }
    hlRef.current?.dispose()
    hlRef.current = null
    setSelected(null)
    setIsCorrect(null)
    setAttempts(0)
    setIdx(i => Math.min(i+1, deck.length-1))
  }

  function prevCase() {
    onStop()
    if (isFirst) return
    hlRef.current?.dispose()
    hlRef.current = null
    setSelected(null)
    setIsCorrect(null)
    setAttempts(0)
    setIdx(i => Math.max(0, i-1))
  }

  return (
    <div className="h-full flex flex-col">
      <HeadphoneNotice />
      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="Second round. New patients, same core conditions. Show your consolidation." />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div ref={caseContainerRef} key={current.id} data-case="1" data-caseid={current.id} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5 }} className="relative rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="text-sm text-slate-300 mb-1">{current.title}</div>
            <div className="text-xs text-slate-400 mb-3">Patient: {current.patientName} · {current.age}y · {current.sex}</div>
            <p
              ref={vignetteRef}
              key={`${current.id}-${vignetteNonce}`}
              data-vignette="1"
              className="mb-4 select-text leading-relaxed"
            >
              {current.vignette}
            </p>
            <div className="absolute top-3 right-1 z-10 flex flex-row gap-1.5 hl-controls">
              <button
                onPointerUp={(e)=> e.stopPropagation()}
                onTouchEnd={(e)=> { e.stopPropagation() }}
                onMouseUp={(e)=> e.stopPropagation()}
                onClick={()=> clearHighlights()}
                className="px-1.5 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-slate-200"
                title="Clear highlights"
              >
                <LuEraser size={16} />
              </button>
              <button
                onPointerUp={(e)=> e.stopPropagation()}
                onTouchEnd={(e)=> { e.stopPropagation() }}
                onMouseUp={(e)=> e.stopPropagation()}
                onClick={()=>{
                  setHighlightOn(v=>{
                    const next = !v
                    if (!next) {
                      clearHighlights()
                    }
                    return next
                  })
                }}
                className={`px-1.5 py-1.5 rounded-md border ${highlightOn ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'border-white/10 bg-white/0 hover:bg-white/5 text-slate-200'}`}
                title="Toggle highlighter"
              >
                <FiPenTool size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button disabled={!stethoscopeOn || !current.audio} onClick={()=> current.audio && onPlay([current.audio, current.audio.replace(/^\/assets\/audio\//,'/audio/'), current.audio.replace(/^\/assets\//,'/')])} className={`px-3 py-1.5 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200':'bg-white/10 text-slate-300 opacity-60'} `}>🔊 Listen</button>
              {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.shuffled.map((d, i) => (
                <div key={d} className="flex items-stretch gap-2">
                  <motion.button
                  whileTap={{ scale: 0.97 }}
                  animate={selected===i ? (isCorrect? { scale: 1.03, backgroundColor: 'rgba(16,185,129,0.25)'} : { x: [0,-6,6,-4,4,0], backgroundColor: 'rgba(239,68,68,0.25)'}) : {}}
                    onClick={() => { if (!eliminated.has(i)) choose(i) }}
                    className={`px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 flex items-center gap-2 flex-1 ${eliminated.has(i)? 'line-through opacity-50 pointer-events-none' : ''}`}
                  >
                  {selected===i && isCorrect===true && <FiCheckCircle className="text-emerald-400"/>}
                  {selected===i && isCorrect===false && <FiXCircle className="text-rose-400"/>}
                  {d}
                </motion.button>
                  <button
                    aria-label={eliminated.has(i)? 'Restore option':'Eliminate option'}
                    onClick={()=>{
                      setEliminated(prev => {
                        const next = new Set(prev)
                        if (next.has(i)) next.delete(i); else next.add(i)
                        return next
                      })
                    }}
                    className={`px-2 py-2 rounded-md border ${eliminated.has(i)? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10' : 'border-white/10 text-slate-300 hover:bg-white/10'}`}
                    title="Cross out"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          {selected!==null && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              {isCorrect ? (
                <div className="text-emerald-300">{current.feedbackCorrect}</div>
              ) : (
                <div className="text-amber-300">{current.feedbackWrong}</div>
              )}
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <button onClick={prevCase} disabled={isFirst} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-sm">Previous Patient</button>
          <div className="flex items-center gap-3 sm:flex-1">
            <div className="h-3 rounded-full bg-white/10 overflow-hidden flex-1">
              <div className="h-full accuracy-fill" style={{ width: `${accuracy}%` }} />
            </div>
            <div className="text-sm text-slate-300 w-14 text-right">{accuracy}%</div>
          </div>
          <button onClick={nextCase} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 text-sm">{isLast ? 'Finish Round' : 'Next Patient'}</button>
        </div>
        <CaseClipboard caseData={current} />
      </div>
    </div>
  )
}

function Library({ onPrev: _onPrev }: { onPrev: () => void }) {
  const resources = [
    {
      title: "BSE Guidelines",
      description: "British Society of Echocardiography (BSE) Guidelines.",
      url: "https://www.bsecho.org/Public/Public/Education/Guidelines.aspx",
      category: "Clinical Guidelines",
      icon: "📋"
    },
    {
      title: "NICE NG208 – Heart valve disease",
      description: "Guidance on murmurs/referral in adults with valve disease.",
      url: "https://www.nice.org.uk/guidance/ng208/chapter/recommendations",
      category: "Clinical Guidelines",
      icon: "🏥"
    },
    {
      title: "BHF – Heart Murmurs",
      description: "British Heart Foundation information page on murmurs.",
      url: "https://www.bhf.org.uk/informationsupport/conditions/heart-murmurs",
      category: "Educational (Patient/Professional)",
      icon: "❤️"
    },
    {
      title: "Geeky Medics – Heart Murmurs",
      description: "Medical‑school style article explaining murmurs.",
      url: "https://geekymedics.com/heart-murmurs/",
      category: "Educational / Medical-School Style",
      icon: "🩺"
    },
    {
      title: "Geeky Medics – Innocent/Flow Murmurs",
      description: "Overview of innocent/flow murmurs with exam tips.",
      url: "https://geekymedics.com/innocent-murmurs/",
      category: "Educational / Medical-School Style",
      icon: "🩺"
    },
    {
      title: "Teaching Heart Auscultation – Free MP3s",
      description: "Heart sounds & murmurs audio library (free MP3).",
      url: "https://teachingheartauscultation.com/heart-sounds-mp3-downloads",
      category: "Audio / Auscultation Resource",
      icon: "🎧"
    },
    {
      title: "Easy Auscultation – Heart Sounds",
      description: "Audio lessons and quizzes for heart sounds & murmurs.",
      url: "https://www.easyauscultation.com/heart-sounds",
      category: "Audio / Auscultation Resource",
      icon: "🎧"
    },
    {
      title: "Practical Clinical Skills – Heart Sounds",
      description: "Free lessons & recordings for heart sounds and murmurs.",
      url: "https://www.practicalclinicalskills.com/heart-sounds",
      category: "Audio / Auscultation Resource",
      icon: "🎧"
    },
    {
      title: "Zero to Finals – Valvular Heart Disease",
      description: "Concise revision notes on valvular disease and murmurs.",
      url: "https://zerotofinals.com/medicine/cardiology/valvularheartdisease/",
      category: "Medical-School Style / Revision",
      icon: "📘"
    },
    {
      title: "MSD Manuals – Cardiac Auscultation",
      description: "Professional textbook‑style overview of auscultation.",
      url: "https://www.msdmanuals.com/professional/cardiovascular-disorders/approach-to-the-cardiac-patient/cardiac-auscultation",
      category: "Medical School Style / Textbook Format",
      icon: "📗"
    }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-6xl w-full px-6 py-8 grid grid-rows-[auto_1fr] gap-6">
        <Mentor text="Excellent shift. I've compiled some essential resources for your continued learning. These are the gold standards in cardiac education." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, i) => (
            <motion.a 
              whileHover={{ y: -4 }} 
              key={i} 
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 p-4 block hover:border-emerald-400/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{resource.icon}</div>
                <div className="text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                  {resource.category}
                </div>
              </div>
              <div className="font-semibold mb-2 text-slate-100">{resource.title}</div>
              <p className="text-sm text-slate-300 leading-relaxed">{resource.description}</p>
              <div className="mt-3 text-xs text-emerald-400 font-medium">
                Visit Resource →
              </div>
            </motion.a>
          ))}
        </div>
        
        {/* Additional Learning Tips Section */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">💡 Learning Tips from Dr. Lubb von Dub</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Practice Regularly</h4>
              <p>Spend 15-20 minutes daily listening to different heart sounds. Consistency beats intensity.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Use Systematic Approach</h4>
              <p>Always follow the same sequence: S1, S2, murmurs, extra sounds. Don't skip steps.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Correlate with Clinical Context</h4>
              <p>Consider patient age, symptoms, and risk factors when interpreting findings.</p>
            </div>
      <div>
              <h4 className="font-semibold text-slate-200 mb-2">Seek Feedback</h4>
              <p>Practice with experienced clinicians and ask for immediate feedback on your assessments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mentor({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
        <img
          src="/images/drhouse.jpg"
          alt="Dr. Lubb von Dub"
          className="w-full h-full object-cover object-center"
          onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = '/images/drhouse.jpg' }}
        />
      </div>
      <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-emerald-300 font-semibold mb-1">Dr. Lubb von Dub · Senior Registrar</div>
        <p className="text-slate-200">{text}</p>
      </motion.div>
    </div>
  )
}

function SidebarItem({ label, active, onClick, icon, collapsed }: { label: string, active?: boolean, onClick?: ()=>void, icon?: React.ReactNode, collapsed?: boolean }) {
  return (
    <button onClick={onClick} className={`flex ${collapsed ? 'justify-center' : 'items-center gap-2'} px-2 sm:px-3 ${collapsed ? 'py-3' : 'py-2'} rounded-md text-left ${active ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300' : 'hover:bg-white/5 border border-transparent'}`}>
      <span className="text-emerald-300 text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

function ECGBar() {
  return (
    <div className="block h-5 w-28 sm:h-6 sm:w-40 relative overflow-hidden">
      <svg viewBox="0 0 200 24" className="absolute inset-0" preserveAspectRatio="none">
        <polyline
          points="0,12 20,12 30,4 40,20 55,12 80,12 90,6 100,18 120,12 150,12 160,4 170,20 180,12 200,12"
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          className="ecg-stroke"
        />
      </svg>
    </div>
  )
}

function ShuffleRound() {
  // Build flashcards from catalog: phrase + site on front, answer + banner on back
  const items = useMemo(() => {
    const pick = [
      'Aortic Stenosis','Hypertrophic Obstructive Cardiomyopathy','Mitral Regurgitation',
      'Tricuspid Regurgitation','Ventricular Septal Defect','Aortic Regurgitation',
      'Mitral Stenosis','Patent Ductus Arteriosus','Innocent (Still’s) Murmur','Normal Heart Sounds'
    ]
    const locus: Record<string, string> = {
      'Aortic Stenosis': 'RUSB (2nd right ICS), radiates to carotids',
      'Hypertrophic Obstructive Cardiomyopathy': 'LSE (3rd–4th ICS), louder on Valsalva/standing',
      'Mitral Regurgitation': 'Apex, radiates to axilla',
      'Tricuspid Regurgitation': 'LLSB, increases with inspiration',
      'Ventricular Septal Defect': 'LLSB, harsh with thrill',
      'Aortic Regurgitation': 'LSE, early diastolic decrescendo (sitting forward, expiration)',
      'Mitral Stenosis': 'Apex (bell), opening snap + mid‑diastolic rumble (LLD)',
      'Patent Ductus Arteriosus': 'Left infraclavicular, continuous “machinery‑like”',
      'Innocent (Still’s) Murmur': 'LLSB, soft musical, posture‑dependent',
      'Normal Heart Sounds': 'Physiologic S1/S2; inspiratory split of S2'
    }
    const phrases: Record<string, string> = {
      'Aortic Stenosis': 'Radiates to carotids; slow‑rising pulse',
      'Hypertrophic Obstructive Cardiomyopathy': 'Louder with Valsalva/standing',
      'Mitral Regurgitation': 'Blowing pansystolic; axillary radiation',
      'Tricuspid Regurgitation': 'Inspiration increases intensity (Carvallo)',
      'Ventricular Septal Defect': 'Harsh holosystolic at LLSB with thrill',
      'Aortic Regurgitation': 'Early diastolic decrescendo at LSE',
      'Mitral Stenosis': 'Opening snap + mid‑diastolic rumble',
      'Patent Ductus Arteriosus': 'Machine‑like continuous murmur',
      'Innocent (Still’s) Murmur': 'Soft, musical, no radiation',
      'Normal Heart Sounds': 'Baseline reference; no added sounds'
    }
    const bannerByName: Record<string, string> = {
      'Normal Heart Sounds': 'banner-normal.jpg',
      'Aortic Stenosis': 'banner-as.jpg',
      'Hypertrophic Obstructive Cardiomyopathy': 'banner-hocm.jpg',
      'Mitral Regurgitation': 'banner-mr.jpg',
      'Tricuspid Regurgitation': 'banner-tr.jpg',
      'Ventricular Septal Defect': 'banner-vsd.jpg',
      'Aortic Regurgitation': 'banner-ar.jpg',
      'Mitral Stenosis': 'banner-ms.jpg',
      'Patent Ductus Arteriosus': 'banner-pda.jpg',
      'Innocent (Still’s) Murmur': 'banner-innocent.jpg',
    }
    const base = pick.map(name => ({
      id: `sh-${name.replace(/[^a-z]/gi,'').toLowerCase()}`,
      prompt: `${phrases[name]} — Site: ${locus[name]}`,
      answer: name,
      banner: `/images/banners/${bannerByName[name] ?? 'banner-normal.jpg'}`
    }))
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[base[i], base[j]] = [base[j], base[i]]
    }
    return base
  }, [])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [dance, setDance] = useState(false)
  const current = items[idx]
  function next() {
    setFlipped(false)
    setDance(false)
    setIdx(i => (i + 1) % items.length)
  }
  function prev() {
    setFlipped(false)
    setDance(false)
    setIdx(i => (i - 1 + items.length) % items.length)
  }
  return (
    <div className="h-full flex flex-col">
      <div className="mx-auto max-w-4xl w-full px-6 pt-6">
        <div className="mb-4">
          <Mentor text="Active recall. Read the cue, commit your answer, flip to check. Build rapid pattern recognition." />
        </div>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <div className="p-5 grid gap-5">
            <div className="mx-auto w-full max-w-xl">
              <div
                className={`relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-white/5 cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
                onClick={()=> setFlipped(v=>!v)}
              >
                <div className="absolute inset-0 p-6 [backface-visibility:hidden] flex flex-col justify-center">
                  <div className="grid place-items-center mb-1">
                    {/* Small neon heart icon above cue */}
                    <svg viewBox="0 0 120 120" className="w-10 h-10">
                      <defs>
                        <filter id="glow-heart-small" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M60 98 C 10 62, 10 26, 34 20 C 46 17, 56 23, 60 32 C 64 23, 74 17, 86 20 C 110 26, 110 62, 60 98 Z"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3"
                        filter="url(#glow-heart-small)"
                      />
                      <path
                        d="M60 98 C 10 62, 10 26, 34 20 C 46 17, 56 23, 60 32 C 64 23, 74 17, 86 20 C 110 26, 110 62, 60 98 Z"
                        fill="none"
                        stroke="#67e8f9"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                  <div className="text-emerald-300 font-semibold mb-2 text-center">Cue</div>
                  <div className="text-lg leading-relaxed text-center">{current.prompt}</div>
                  <div className="mt-3 text-xs text-slate-300 opacity-80 text-center">Tap to flip →</div>
                </div>
                <div className="absolute inset-0 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center">
                  <div className="text-cyan-300 font-semibold mb-2 text-center">Answer</div>
                  <div className="text-2xl font-bold text-center">{current.answer}</div>
                  <div className="mt-3 text-xs text-slate-300 opacity-80 text-center">Tap to flip back →</div>
                </div>
              </div>
            </div>
            <div className="mx-auto flex items-center gap-3">
              <button onClick={prev} className="px-3 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5">Back</button>
              <button onClick={()=> setFlipped(true)} className="px-3 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5">Show answer</button>
              <button onClick={next} className="px-3 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5">Next</button>
            </div>
            <div className="mx-auto">
              <button
                aria-label="Celebrate"
                title="I got it right"
                onClick={()=> setDance(true)}
                className="w-20 h-20 rounded-full border border-cyan-400 text-cyan-200 bg-cyan-500/10 shadow-[0_0_16px_rgba(56,189,248,0.6)] hover:shadow-[0_0_22px_rgba(56,189,248,0.9)] grid place-items-center text-[10px] leading-tight text-center px-2"
              >
                I got it right!
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 grid place-items-center min-h-[120px]">
          {dance ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1,1.1,1], rotate: [0,6,-6,0], y: [0,-6,0], opacity: 1 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.2 }}
              className="w-40 h-40"
            >
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <defs>
                  <radialGradient id="g2" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="58" fill="url(#g2)" />
                <circle cx="60" cy="45" r="18" fill="#c4f1f9" stroke="#22d3ee" strokeWidth="2" />
                <circle cx="54" cy="42" r="3" fill="#0f172a" />
                <circle cx="66" cy="42" r="3" fill="#0f172a" />
                <path d="M52 48 Q60 54 68 48" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                <rect x="45" y="63" width="30" height="24" rx="8" fill="#22d3ee" stroke="#0ea5e9" strokeWidth="2" />
                <line x1="45" y1="63" x2="35" y2="78" stroke="#22d3ee" strokeWidth="4" />
                <line x1="75" y1="63" x2="85" y2="78" stroke="#22d3ee" strokeWidth="4" />
                <line x1="52" y1="87" x2="48" y2="104" stroke="#22d3ee" strokeWidth="4" />
                <line x1="68" y1="87" x2="72" y2="104" stroke="#22d3ee" strokeWidth="4" />
              </svg>
            </motion.div>
          ) : (
            <div className="text-xs text-slate-400">Mark correct to celebrate 🎉</div>
          )}
        </div>
      </div>
    </div>
  )
}
function Progress({ r1, r2, onPrev: _onPrev }: { r1: number|null, r2: number|null, onPrev: () => void }) {
  const s1 = r1 ?? 0
  const s2 = r2 ?? 0
  const delta = s2 - s1
  const verdict = s2 >= 90 ? 'Excellent' : s2 >= 75 ? 'Strong' : s2 >= 60 ? 'Pass' : 'Needs Practice'
  const color = s2 >= 90 ? 'text-emerald-300' : s2 >= 75 ? 'text-cyan-300' : s2 >= 60 ? 'text-amber-300' : 'text-rose-300'
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-3xl w-full px-6 py-10 grid grid-rows-[auto_1fr] gap-8">
        <Mentor text="Nice work. Here’s your consolidation summary. Aim for consistent improvement and stable recognition under varied scenarios." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid sm:grid-cols-3 gap-4 items-center">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-slate-300">Ward Round I</div>
              <div className="text-3xl font-bold text-emerald-300 mt-1">{Math.max(0, Math.min(100, Math.round(s1)))}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-slate-300">Ward Round II</div>
              <div className="text-3xl font-bold text-emerald-300 mt-1">{Math.max(0, Math.min(100, Math.round(s2)))}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-slate-300">Change</div>
              <div className={`text-3xl font-bold ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'} mt-1`}>
                {delta >= 0 ? '+' : ''}{Math.round(delta)}%
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm font-semibold ${color}`}>Outcome: {verdict}</div>
            <div className="flex items-center gap-3">
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(`MurmurMD Progress\nRound I: ${Math.round(s1)}%\nRound II: ${Math.round(s2)}%\nChange: ${delta >= 0 ? '+' : ''}${Math.round(delta)}%\nOutcome: ${verdict}\n`)}`}
                download="murmurmd-progress.txt"
                className="px-3 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-sm"
              >
                Download Summary
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
