import { useMemo, useRef, useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiActivity, FiFolder, FiBookOpen, FiArrowLeft, FiArrowRight, FiCheckCircle, FiXCircle, FiPenTool, FiMenu, FiX } from 'react-icons/fi'
import { LuEraser } from 'react-icons/lu'
import { TbStethoscope } from 'react-icons/tb'

type Scene = 'intro' | 'skills' | 'ward' | 'peds' | 'library' | 'refs'

const scenes: Scene[] = ['intro', 'skills', 'ward', 'peds', 'library', 'refs']

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

  function next() { stop(); setSceneIndex(i => Math.min(i + 1, scenes.length - 1)) }
  function prev() { stop(); setSceneIndex(i => Math.max(i - 1, 0)) }
  function goto(index: number) { stop(); setSceneIndex(index) }
  const title = useMemo(() => ({
    intro: 'Start Shift',
    skills: 'Skills Lab',
    ward: 'Ward Round',
    peds: 'Paeds Ward',
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

  return (
    <div className="min-h-[100svh] bg-slate-950 text-slate-100">
      <div className="h-full sm:h-screen sm:grid sm:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:flex h-full border-r border-white/10 bg-black/30 backdrop-blur p-4 flex-col gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
          <FiActivity className="text-emerald-400" />
          MurmurMD
          </div>
          <nav className="flex-1 flex flex-col gap-2 text-sm">
            <SidebarItem label="Start Shift" active={scene==='intro'} onClick={()=>goto(0)} icon={<FiActivity />} />
            <SidebarItem label="Skills Lab" active={scene==='skills'} onClick={()=>goto(1)} icon={<TbStethoscope />} />
            <SidebarItem label="Ward Round" active={scene==='ward'} onClick={()=>goto(2)} icon={<FiFolder />} />
            <SidebarItem label="Paeds Ward" active={scene==='peds'} onClick={()=>goto(3)} icon={<FiFolder />} />
            <SidebarItem label="Library" active={scene==='library'} onClick={()=>goto(4)} icon={<FiBookOpen />} />
            <SidebarItem label="References" active={scene==='refs'} onClick={()=>goto(5)} icon={<FiBookOpen />} />
          </nav>
          <div className="mt-auto space-y-4">
            <div className="w-full grid place-items-center">
              <img
                src="/images/cardiff.png"
                alt="Cardiff University"
                className="max-w-[70px] opacity-40"
                onError={(e)=>{ const img = (e.currentTarget as HTMLImageElement); img.onerror = null; img.src = 'https://upload.wikimedia.org/wikipedia/en/f/f7/Cardiff_University_logo.svg' }}
              />
            </div>
            <div className="text-xs text-slate-400">™ Alameen Ayad - Year 2 SSC W1</div>
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
            <SidebarItem label="Skills Lab" active={scene==='skills'} onClick={()=>{goto(1); setMobileNavOpen(false)}} icon={<TbStethoscope />} />
            <SidebarItem label="Ward Round" active={scene==='ward'} onClick={()=>{goto(2); setMobileNavOpen(false)}} icon={<FiFolder />} />
            <SidebarItem label="Paeds Ward" active={scene==='peds'} onClick={()=>{goto(3); setMobileNavOpen(false)}} icon={<FiFolder />} />
            <SidebarItem label="Library" active={scene==='library'} onClick={()=>{goto(4); setMobileNavOpen(false)}} icon={<FiBookOpen />} />
            <SidebarItem label="References" active={scene==='refs'} onClick={()=>{goto(5); setMobileNavOpen(false)}} icon={<FiBookOpen />} />
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
            <div className="text-xs text-slate-400">™ Alameen Ayad - Year 2 SSC W1</div>
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
              <motion.section key={scene} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween', duration: 0.45 }} className="h-full">
                {scene === 'intro' && <Intro onBegin={next} />}
                {scene === 'skills' && <Skills onNext={next} onPrev={prev} onPlay={play} openFindings={(list)=>{setFindingsList(list); setFindingsOpen(true)}} stethoscopeOn={stethoscopeOn} />}
                {scene === 'ward' && <Ward onNext={next} onPrev={prev} setAccuracy={setAccuracy} accuracy={accuracy} stethoscopeOn={stethoscopeOn} onPlay={play} onStop={stop} />}
                {scene === 'peds' && <Peds onNext={next} onPrev={prev} setAccuracy={setAccuracy} accuracy={accuracy} stethoscopeOn={stethoscopeOn} onPlay={play} onStop={stop} />}
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

function Intro({ onBegin }: { onBegin: () => void }) {
  const slides = [
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581089781785-603411fa81e5?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop',
  ]
  const [idx, setIdx] = useState(0)
  useEffect(()=>{
    const id = setInterval(()=> setIdx(i => (i+1)%slides.length), 4000)
    return ()=> clearInterval(id)
  },[])
  return (
    <div className="h-full min-h-[calc(100svh-3rem)] sm:min-h-0 relative overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img key={idx} src={slides[idx]} className="w-full h-full object-cover" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 0.85, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
        </AnimatePresence>
      </div>
      <div className="relative h-full grid place-items-center bg-black/40">
        <div className="mx-auto max-w-2xl text-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">Welcome to Your Cardiology Rotation</h1>
          <p className="text-slate-200 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">A POV simulator guided by your Senior Registrar. Earn your highest Diagnostic Accuracy.</p>
          <button onClick={onBegin} className="px-4 py-2 sm:px-6 sm:py-3 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] text-sm sm:text-base">Begin Shift</button>
        </div>
      </div>
    </div>
  )
}

function Skills({ onNext: _onNext, onPrev: _onPrev, onPlay, openFindings, stethoscopeOn }: { onNext: () => void, onPrev: () => void, onPlay: (src: string | string[])=>void, openFindings: (list: string[])=>void, stethoscopeOn: boolean }) {
  const adultTraining = [
    { t: 'Normal heart sounds', img: 'https://images.unsplash.com/photo-1581594693700-22d3b1a9e5a1?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE1.mp3', f: [ 'Physiological split of S2 varies with inspiration', 'No added sounds or murmurs; PMI non‑displaced', 'Use as a baseline to compare intensity, timing and quality' ]},
    { t: 'Innocent (functional) flow murmur', img: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE2.mp3', f: [ 'Soft, midsystolic, grade ≤2/6; best at LLSB or apex', 'Often decreases with standing/Valsalva; increases with supine state', 'No radiation; normal S2; normal examination otherwise' ]},
    { t: 'Mitral valve stenosis', img: 'https://images.unsplash.com/photo-1600959907703-125ba1374d3f?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE3.mp3', f: [ 'Opening snap after S2 (shorter A2–OS when severe)', 'Low‑pitched diastolic rumble at the apex (bell), louder in LLD', 'Loud S1; consider rheumatic aetiology in appropriate context' ]},
    { t: 'Bicuspid aortic valve with aortic stenosis and regurgitation', img: 'https://images.unsplash.com/photo-1576765608642-b5d3c9c9b931?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE4.mp3', f: [ 'Crescendo–decrescendo systolic murmur at right upper sternal border radiating to the carotids (aortic stenosis)', 'Early diastolic decrescendo at left sternal border (aortic regurgitation component)', 'Ejection click suggests a bicuspid valve; check for unequal pulses' ]},
    { t: 'Ventricular septal defect', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE5.mp3', f: [ 'Harsh pansystolic murmur at the LLSB; often with a palpable thrill', 'Intensity may increase with handgrip (↑ afterload)', 'Smaller restrictive defects can be louder; assess for RV volume/pressure load' ]},
    { t: 'Mitral valve prolapse with mitral regurgitation', img: 'https://images.unsplash.com/photo-1594824476967-48c8b9642737?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE6.mp3', f: [ 'Midsystolic click followed by a late systolic murmur at the apex', 'Standing/↓ preload moves the click earlier and lengthens the murmur', 'Axillary radiation if significant mitral regurgitation; consider Marfan/EDS context if syndromic' ]},
    { t: 'Patent ductus arteriosus', img: 'https://images.unsplash.com/photo-1583846717393-4b8f1b4bc1d7?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/adultCASE7.mp3', f: [ 'Continuous “machinery” murmur (systole + diastole) beneath the left clavicle', 'Bounding pulses with wide pulse pressure', 'Consider differential: AV fistulae can also produce continuous murmurs' ]},
  ]
  const pedsTraining = [
    { t: 'Atrial septal defect', img: 'https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/1-ASD.mp3', f: [ 'Fixed split S2 (little respiratory variation)', 'Systolic ejection flow murmur at the left upper sternal border from ↑ pulmonary flow', 'Parasternal impulse may be prominent with right ventricular volume load' ]},
    { t: 'Pulmonary valve stenosis', img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/2-Pulmonary-stenosis.mp3', f: [ 'Systolic ejection murmur at left upper sternal border with an ejection click', 'Murmur may increase with inspiration (right‑sided)', 'Assess for thrill at the upper left sternal border' ]},
    { t: 'Patent ductus arteriosus', img: 'https://images.unsplash.com/photo-1516542076529-1ea3854896e1?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/3-PDA.mp3', f: [ 'Continuous "machinery" murmur under the left clavicle', 'Bounding pulses; wide pulse pressure', 'Differentiate from venous hum and arteriovenous fistulae' ]},
    { t: 'Aortic stenosis and regurgitation', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/4-Aortic-stenosis-and-regurgitation.mp3', f: [ 'Right upper sternal border ejection murmur radiating to the carotids (aortic stenosis)', 'Early diastolic decrescendo at the left sternal border (aortic regurgitation)', 'Evaluate pulses and blood pressure for severity' ]},
    { t: 'Normal heart sounds', img: 'https://images.unsplash.com/photo-1584467735871-1f2d4c4309f8?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/5-Normal-sounds.mp3', f: [ 'Normal S1/S2 without murmurs', 'No clicks or extra heart sounds', 'Use as a paediatric baseline reference' ]},
    { t: 'Bicuspid aortic valve', img: 'https://images.unsplash.com/photo-1583912267552-9230a1a996a8?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/6-Bicuspid-aortic-valve.mp3', f: [ 'Ejection click; systolic ejection murmur at the base (often right upper sternal border)', 'Variable severity; may progress over time', 'Screen first‑degree relatives if clinically indicated' ]},
    { t: 'Atrial septal defect', img: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/7-ASD.mp3', f: [ 'Fixed split S2', 'Flow murmur at left upper sternal border from ↑ pulmonary flow', 'Electrocardiogram may show right axis/right ventricular conduction delay in secundum atrial septal defect' ]},
    { t: 'Innocent Still\'s murmur with physiological S3', img: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/8-Innocent-murmur-and-S3.mp3', f: [ 'Soft, musical/vibratory left lower sternal border murmur in healthy child', 'Physiological S3 at the apex can be normal in children', 'No pathological signs: growth, pulses and exam otherwise normal' ]},
    { t: 'Ventricular septal defect', img: 'https://images.unsplash.com/photo-1581056771105-24e2fe6f5d5b?q=80&w=1200&auto=format&fit=crop', src: '/assets/audio/9-VSD.mp3', f: [ 'Harsh holosystolic murmur at the left lower sternal border; possible thrill', 'Smaller restrictive defects can be loud; consider heart failure signs if large', 'Handgrip may increase intensity by ↑ afterload' ]},
  ]
  // probe availability of audio clips and gray out if missing
  const allClips = [...adultTraining, ...pedsTraining].map(m => m.src)
  const [available, setAvailable] = useState<Record<string, boolean>>({})
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
      <div className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-6 py-4 sm:py-8 grid grid-rows-[auto_1fr] gap-4 sm:gap-6 min-h-0">
        <Mentor text="Skills Lab orientation: Listen, localize, and identify hallmark features. Use the bell vs diaphragm strategically." />
        <div className="space-y-8 overflow-y-auto pr-1 h-full min-h-0 scroll-smooth">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-emerald-300 font-semibold">Adult Set</h3>
              <span className="text-xs text-slate-400">7 modules</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {adultTraining.map((m) => (
                <motion.div whileHover={{ y: -4 }} key={m.t} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="h-24 sm:h-28 bg-white/5">
                    <img src={m.img} alt="" className="w-full h-full object-cover opacity-80" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = placeholderImg }} />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold mb-2">{m.t}</div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={()=>onPlay([m.src, m.src.replace(/^\/assets\/audio\//,'/audio/'), m.src.replace(/^\/assets\//,'/')])}
                        disabled={!stethoscopeOn || available[m.src]===false}
                        className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-300 opacity-60'} disabled:opacity-40`}
                      >🔊 Listen</button>
                      <button onClick={()=>openFindings(m.f)} className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">Reveal Findings</button>
                      {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-emerald-300 font-semibold">Paeds Set</h3>
              <span className="text-xs text-slate-400">9 modules</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {pedsTraining.map((m) => (
                <motion.div whileHover={{ y: -4 }} key={m.t} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="h-24 sm:h-28 bg-white/5">
                    <img src={m.img} alt="" className="w-full h-full object-cover opacity-80" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = placeholderImg }} />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold mb-2">{m.t}</div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={()=>onPlay([m.src, m.src.replace(/^\/assets\/audio\//,'/audio/'), m.src.replace(/^\/assets\//,'/')])}
                        disabled={!stethoscopeOn || available[m.src]===false}
                        className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-300 opacity-60'} disabled:opacity-40`}
                      >🔊 Listen</button>
                      <button onClick={()=>openFindings(m.f)} className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">Reveal Findings</button>
                      {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
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

const adultCases: Case[] = [
  {
    id: 'adult-1',
    title: 'Adult Case 1',
    patientName: 'Mateo Santos',
    age: 22,
    sex: 'M',
    vignette: `22-year-old male for pre-military assessment. Previously active (hockey), currently less active; no cardiovascular symptoms. Family history unremarkable. BMI 28, HR 70 regular, BP 122/80. Pulses and precordial impulse normal. Auscultation in the usual areas; this recording is from the left upper sternal edge.`,
    options: ['Normal','Innocent murmur','Mitral stenosis','Aortic stenosis'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE1.mp3',
    feedbackCorrect: 'Correct: Normal S1/S2 with a physiologic split of S2; no murmurs. Use this as your baseline reference.',
    feedbackWrong: 'Hint: A normal exam has no murmurs or extra sounds. Compare intensity/timing against this baseline.'
  },
  {
    id: 'adult-2',
    title: 'Adult Case 2',
    patientName: 'Lilly Montana',
    age: 20,
    sex: 'F',
    vignette: `20-year-old female with routine work assessment. Very active (cycles/jogs), asymptomatic. No CV risk factors; recalls being told of an 'extra sound' in childhood. BMI 23, HR 60 regular, BP 112/75. Pulses normal. Listen in standard areas, especially apical region with the bell.`,
    options: ['Innocent murmur','Mitral regurgitation','VSD','PDA'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE2.mp3',
    feedbackCorrect: 'Correct: Innocent (functional) murmurs are soft, midsystolic, with no radiation and often diminish with standing/Valsalva.',
    feedbackWrong: 'Hint: Innocent murmurs are mid-systolic, low grade, non-radiating, and often change with preload (e.g., standing).'
  },
  {
    id: 'adult-3',
    title: 'Adult Case 3',
    patientName: 'Li Wei',
    age: 50,
    sex: 'F',
    vignette: `50-year-old woman with remote rheumatic-type illness as a teen. Active walker; mild DOE, a bit worse over the last year. BMI 24, exam otherwise normal with undisplaced apex. BP 125/80. Auscultate carefully at the apex for an opening snap and low-pitched diastolic rumble.`,
    options: ['Mitral stenosis','Aortic regurgitation','Tricuspid regurgitation','Aortic stenosis'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE3.mp3',
    feedbackCorrect: 'Correct: Mitral stenosis—opening snap after S2 with a low-pitched diastolic rumble at the apex (bell), louder in LLD.',
    feedbackWrong: 'Hint: Focus at the apex with the bell; listen for an opening snap followed by a diastolic rumble.'
  },
  {
    id: 'adult-4',
    title: 'Adult Case 4',
    patientName: "Seán O'Connor",
    age: 40,
    sex: 'M',
    vignette: `40-year-old male, lobster fisherman; increasing fatigue and mild exertional breathlessness. Followed since childhood for a murmur. BMI 24, HR 60 regular, BP 125/75. Suprasternal notch and RUSE thrills; pulses somewhat increased. Listen at both upper sternal borders and apex. Recording from LSB, 3rd interspace.`,
    options: ['Bicuspid AV with AS/AR','Mitral valve prolapse','VSD','PDA'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE4.mp3',
    feedbackCorrect: 'Correct: Bicuspid aortic valve with aortic stenosis and aortic regurgitation—crescendo–decrescendo systolic murmur at right upper sternal border radiating to carotids; early diastolic decrescendo at left sternal border for aortic regurgitation. Ejection click suggests bicuspid valve.',
    feedbackWrong: 'Hint: Check right upper sternal border for systolic ejection with carotid radiation; any early diastolic aortic regurgitation component at left sternal border strengthens the diagnosis.'
  },
  {
    id: 'adult-5',
    title: 'Adult Case 5',
    patientName: 'Oluwaseun Adeyemi',
    age: 26,
    sex: 'M',
    vignette: `26-year-old male for police service. Healthy and highly active; no exertional symptoms. BMI 29. Childhood murmur without interventions. No family CV history. BP 122/82; pulses normal; apex not displaced. Focus auscultation at left lower sternal border and apical areas.`,
    options: ['VSD','MR','TR','AS'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE5.mp3',
    feedbackCorrect: 'Correct: Ventricular septal defect—harsh holosystolic murmur at the left lower sternal border, often with a palpable thrill; intensity increases with handgrip (↑ afterload).',
    feedbackWrong: 'Hint: Listen at the left lower sternal border for a harsh holosystolic quality; afterload maneuvers (handgrip) intensify left-to-right shunts.'
  },
  {
    id: 'adult-6',
    title: 'Adult Case 6',
    patientName: 'Elena Petrova',
    age: 30,
    sex: 'F',
    vignette: `30-year-old female referred for a new murmur. Generally well, low activity; occasional brief palpitations with two episodes of mild dizziness. Minimal caffeine, rare alcohol, no meds. BMI 20. Apex not displaced; pulses normal; BP 110/80. Auscultate across the precordium, especially at the apex for midsystolic click and late systolic murmur.`,
    options: ['MVP with MR','AR','MS','AS'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE6.mp3',
    feedbackCorrect: 'Correct: Mitral valve prolapse with mitral regurgitation—midsystolic click followed by a late systolic murmur at the apex; standing/↓ preload moves the click earlier and lengthens the murmur.',
    feedbackWrong: 'Hint: Focus at the apex; maneuvers that reduce preload (standing) bring the click earlier and extend the murmur.'
  },
  {
    id: 'adult-7',
    title: 'Adult Case 7',
    patientName: 'Nikhil Kumar',
    age: 30,
    sex: 'M',
    vignette: `30-year-old male referred for a murmur; recently immigrated. Lifelong good health; moderately active. BMI 24. BP 125/70; pulses easy to feel (possibly increased). Heart action not increased. Consider continuous machinery murmur and wide pulse pressure.`,
    options: ['PDA','ASD','PS','AS'],
    correctIndex: 0,
    audio: '/assets/audio/adultCASE7.mp3',
    feedbackCorrect: 'Correct: PDA—continuous “machinery” murmur (systole + diastole), best below the left clavicle; bounding pulses and wide pulse pressure.',
    feedbackWrong: 'Hint: PDA is distinctive for being continuous through S2; listen in the left infraclavicular area and check pulse pressure.'
  },
  {
    id: 'adult-8',
    title: 'Adult Case 8',
    patientName: 'Isra',
    age: 19,
    sex: 'F',
    vignette: `19-year-old female photographing her red house. She spots a cat, runs after it, and suddenly collapses. No prior medical history; occasional brief palpitations in the past. Family history notable for a cousin with 'heart problems' in youth. On exam: normal pulses, no focal neurology post-recovery. Required listening revealed a harsh crescendo–decrescendo systolic murmur along the left sternal border that increases with Valsalva/standing and decreases with squatting—suggestive of dynamic LVOT obstruction.`,
    options: ['Hypertrophic obstructive cardiomyopathy','Aortic stenosis','Mitral valve prolapse','Pulmonary embolism'],
    correctIndex: 0,
    feedbackCorrect: 'Correct: Exertional syncope in a young person with a dynamic systolic murmur that increases with Valsalva is classic for hypertrophic obstructive cardiomyopathy.',
    feedbackWrong: 'Hint: Dynamic murmurs that increase with Valsalva/standing and decrease with squatting point away from fixed outflow lesions and toward HOCM.',
  },
]

const congenitalCases: Case[] = [
  { id: 'chd-1', title: 'CHD Case 1', patientName: 'Amira Hassan', age: 4, sex: 'F', vignette: '4-year-old girl, no symptoms. Normal growth and development. A quiet child, not as active as some other children. Examination: normal pulses, heart action perhaps a little increased and maximal close to the left sternal edge. You listen at the left upper sternal edge.', options: ['Atrial septal defect','Patent ductus arteriosus','Ventricular septal defect','Tetralogy of Fallot'], correctIndex: 0, audio: '/assets/audio/1-ASD.mp3', feedbackCorrect: 'Correct: Atrial septal defect—fixed split S2 and systolic flow murmur at the left upper sternal edge due to increased pulmonary flow.', feedbackWrong: 'Hint: A fixed (non-varying) split of S2 with a flow murmur at the left upper sternal edge points to atrial septal defect.' },
  { id: 'chd-2', title: 'CHD Case 2', patientName: 'Diego Martínez', age: 9, sex: 'M', vignette: '9-year-old boy, asymptomatic. Routine physical exam. Normal growth and development. Normal pulses and cardiac impulse. You listen at the left upper sternal border.', options: ['Pulmonary stenosis','Atrial septal defect','Ventricular septal defect','Mitral regurgitation'], correctIndex: 0, audio: '/assets/audio/2-Pulmonary-stenosis.mp3', feedbackCorrect: 'Correct: Pulmonary stenosis—systolic ejection at the left upper sternal border with an ejection click; typically intensifies with inspiration.', feedbackWrong: 'Hint: Right-sided ejection murmurs at the left upper sternal border often rise with inspiration; an ejection click supports pulmonary stenosis.' },
  { id: 'chd-3', title: 'CHD Case 3', patientName: 'Minh Nguyen', age: 4, sex: 'M', vignette: '4-year-old boy, asymptomatic. Normal growth and development. On examination, slightly increased heart rate and bounding radial and femoral pulses. Heart action also slightly increased. You listen in the left upper sternal edge.', options: ['Patent ductus arteriosus','Ventricular septal defect','Atrial septal defect','Coarctation of aorta'], correctIndex: 0, audio: '/assets/audio/3-PDA.mp3', feedbackCorrect: 'Correct: Patent ductus arteriosus—continuous "machinery" murmur beneath the left clavicle with bounding pulses and wide pulse pressure.', feedbackWrong: 'Hint: A continuous murmur (systole + diastole) in the left infraclavicular area with bounding pulses suggests patent ductus arteriosus.' },
  { id: 'chd-4', title: 'CHD Case 4', patientName: 'Yusuf Ali', age: 10, sex: 'M', vignette: '10-year-old with 10 days of fever, increased heart rate and bounding pulses. He looks tired and unwell. Normal past history for growth and development, no prior symptoms.', options: ['Aortic stenosis + Aortic regurgitation','Patent ductus arteriosus','Pulmonary stenosis','Mitral regurgitation'], correctIndex: 0, audio: '/assets/audio/4-Aortic-stenosis-and-regurgitation.mp3', feedbackCorrect: 'Correct: Aortic stenosis with regurgitation—right upper sternal border ejection murmur radiating to carotids plus early diastolic decrescendo at left sternal border.', feedbackWrong: 'Hint: Dual lesion clue: systolic ejection at the base with carotid radiation and a separate early diastolic aortic regurgitation murmur.' },
  { id: 'chd-5', title: 'CHD Case 5', patientName: 'Sofia Rossi', age: 20, sex: 'F', vignette: '20-year-old female, no symptoms, good health. Routine physical examination. Normal heart action and pulses. You listen at the left upper sternal edge using the diaphragm of the stethoscope.', options: ['Normal','Atrial septal defect','Ventricular septal defect','Patent ductus arteriosus'], correctIndex: 0, audio: '/assets/audio/5-Normal-sounds.mp3', feedbackCorrect: 'Correct: Normal heart sounds—clear S1/S2 without murmurs. Use as a normal baseline.', feedbackWrong: 'Hint: No murmur or extra sounds; compare this normal timing and intensity to other clips.' },
  { id: 'chd-6', title: 'CHD Case 6', patientName: 'Noah Cohen', age: 10, sex: 'M', vignette: '10-year-old boy. Normal growth and development. No symptoms, routine physical exam for competitive hockey. Normal body habitus. Normal pulses and heart action. You listen in all 4 areas; at the apex here are the sounds (some skin mic crackles present).', options: ['Bicuspid aortic valve','Mitral valve prolapse','Pulmonary stenosis','Tricuspid regurgitation'], correctIndex: 0, audio: '/assets/audio/6-Bicuspid-aortic-valve.mp3', feedbackCorrect: 'Correct: Bicuspid aortic valve—ejection click and systolic ejection at the base (often right upper sternal border); apex may transmit.', feedbackWrong: 'Hint: Seek an early systolic click followed by ejection murmur at the base; recordings may have minor artefact.' },
  { id: 'chd-7', title: 'CHD Case 7', patientName: 'Hiro Tanaka', age: 4, sex: 'M', vignette: '4-year-old boy, completely healthy past history, very active without breathlessness or other cardiac symptoms. Slightly small for age (35th %ile). Heart action a bit increased along the left sternal edge; pulses normal. You listen at the left upper sternal edge.', options: ['Atrial septal defect','Ventricular septal defect','Patent ductus arteriosus','Normal'], correctIndex: 0, audio: '/assets/audio/7-ASD.mp3', feedbackCorrect: 'Correct: Atrial septal defect—fixed split S2 with systolic flow murmur at the left upper sternal edge in an otherwise well child.', feedbackWrong: 'Hint: In children, a fixed split S2 that does not vary with respiration is a classic atrial septal defect sign.' },
  { id: 'chd-8', title: 'CHD Case 8', patientName: 'Arjun Patel', age: 7, sex: 'M', vignette: 'Healthy 7-year-old boy. Normal growth and development, no symptoms. Routine physical exam. Normal heart action and pulses. You listen at the apical area using the stethoscope bell.', options: ['Innocent murmur + S3','Ventricular septal defect','Mitral regurgitation','Aortic regurgitation'], correctIndex: 0, audio: '/assets/audio/8-Innocent-murmur-and-S3.mp3', feedbackCorrect: 'Correct: Innocent vibratory Still\'s murmur at the left lower sternal border with a physiological S3 at the apex.', feedbackWrong: 'Hint: A musical/vibratory left lower sternal border murmur with a physiological S3 in a healthy child is typically benign.' },
  { id: 'chd-9', title: 'CHD Case 9', patientName: 'Mia Novak', age: 7, sex: 'F', vignette: '7-year-old girl, normal growth and development, no symptoms. Normal heart action and pulses. Routine examination. You listen at the left sternal edge, 4th interspace.', options: ['Ventricular septal defect','Atrial septal defect','Patent ductus arteriosus','Mitral regurgitation'], correctIndex: 0, audio: '/assets/audio/9-VSD.mp3', feedbackCorrect: 'Correct: Ventricular septal defect—harsh holosystolic murmur at the left lower sternal edge; often palpable thrill.', feedbackWrong: 'Hint: Holosystolic timing at the left lower sternal border is typical for ventricular septal defect; palpate for a thrill to support the diagnosis.' },
]

function Peds({ onNext, onPrev: _onPrev, setAccuracy, accuracy, stethoscopeOn, onPlay, onStop }: { onNext: () => void, onPrev: () => void, setAccuracy: Dispatch<SetStateAction<number>>, accuracy: number, stethoscopeOn: boolean, onPlay: (src: string)=>void, onStop: () => void }) {
  const deck = congenitalCases
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const current = deck[idx]
  const isLast = idx >= deck.length - 1
  const isFirst = idx <= 0
  const [highlightOn, setHighlightOn] = useState(false)
  const vignetteRef = useRef<HTMLParagraphElement|null>(null)

  // Generate shuffled options for current case
  const shuffledOptions = useMemo(() => {
    return shuffleWithCorrectIndex(current.options, current.correctIndex)
  }, [idx, current.options, current.correctIndex])

  function choose(i: number) {
    if (selected!==null) return
    const correct = i===shuffledOptions.newCorrectIndex
    setSelected(i)
    setIsCorrect(correct)
    setAccuracy(a=> Math.max(0, Math.min(100, a + (correct? +3 : -6))))
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
  function handleMouseUpHighlight() {
    if (!highlightOn) return
    const container = vignetteRef.current
    if (!container) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (!container.contains(range.commonAncestorContainer)) return
    try {
      const span = document.createElement('span')
      span.className = 'neon-highlight'
      // Prefer surroundContents, fallback to extract/insert if it throws
      try {
        range.surroundContents(span)
      } catch {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
    } finally {
      selection.removeAllRanges()
    }
  }
  function clearHighlights() {
    const container = vignetteRef.current
    if (!container) return
    const marks = container.querySelectorAll('.neon-highlight')
    marks.forEach((el) => {
      const parent = el.parentNode
      while (el.firstChild) parent?.insertBefore(el.firstChild, el)
      parent?.removeChild(el)
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="Welcome to the Peds Ward. Smaller patients, equally big learning." />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={current.id} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5 }} className="relative rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="text-sm text-slate-300 mb-1">{current.title}</div>
            <div className="text-xs text-slate-400 mb-3">Patient: {current.patientName} · {current.age}y · {current.sex}</div>
            {/* Vignette with mobile-friendly sentence tap highlighting */}
            <p ref={vignetteRef} onMouseUp={handleMouseUpHighlight} className="mb-4 select-text">
              {useMemo(() => (current.vignette.match(/[^.!?]+[.!?]?/g) || [current.vignette]), [current.vignette]).map((s, i) => (
                <span
                  key={i}
                  onClick={()=>{
                    if (!highlightOn) return
                    // toggle neon-highlight on this sentence span
                    const el = document.querySelector(`[data-sent='peds-${i}']`) as HTMLElement|null
                    (el ?? ({} as any)).classList?.toggle('neon-highlight')
                  }}
                  data-sent={`peds-${i}`}
                  className="cursor-text"
                >
                  {s + ' '}
                </span>
              ))}
            </p>
            {/* Floating vertical highlighter controls */}
            <div className="absolute top-3 right-1 z-10 flex flex-col gap-1.5">
              <button
                onClick={()=> setHighlightOn(v=>!v)}
                className={`px-1.5 py-1.5 rounded-md border ${highlightOn ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'border-white/10 bg-white/0 hover:bg-white/5 text-slate-200'}`}
                title="Toggle highlighter"
              >
                <FiPenTool size={16} />
              </button>
              <button
                onClick={clearHighlights}
                className="px-1.5 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-slate-200"
                title="Clear highlights"
              >
                <LuEraser size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button disabled={!stethoscopeOn || !current.audio} onClick={()=> current.audio && onPlay(current.audio)} className={`px-3 py-1.5 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200':'bg-white/10 text-slate-300 opacity-60'} `}>🔊 Listen</button>
              {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.shuffled.map((d, i) => (
                <motion.button key={d}
                  whileTap={{ scale: 0.97 }}
                  animate={selected===i ? (isCorrect? { scale: 1.03, backgroundColor: 'rgba(16,185,129,0.25)'} : { x: [0,-6,6,-4,4,0], backgroundColor: 'rgba(239,68,68,0.25)'}) : {}}
                  onClick={() => choose(i)}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 flex items-center gap-2">
                  {selected===i && isCorrect===true && <FiCheckCircle className="text-emerald-400"/>}
                  {selected===i && isCorrect===false && <FiXCircle className="text-rose-400"/>}
                  {d}
                </motion.button>
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
          <button onClick={nextCase} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md bg-emerald-500/90 text-slate-900 font-semibold hover:bg-emerald-400 text-sm">{isLast ? 'Finish Ward' : 'Next Patient'}</button>
        </div>
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
              <h4 className="text-emerald-300 font-semibold mb-2">References (Cardiff Harvard)</h4>
              <ol className="list-decimal pl-5 text-sm space-y-2">
                <li>
                  University of Washington. (n.d.) Heart Sounds and Murmurs. Available at: <a className="text-emerald-300 underline" href="https://teachingheartauscultation.com/heart-sounds-mp3-downloads" target="_blank" rel="noreferrer">teachingheartauscultation.com/heart-sounds-mp3-downloads</a> (Accessed: {new Date().toLocaleDateString('en-GB')}).
                </li>
                <li>
                  British Heart Foundation. (n.d.) Heart conditions and tests. Available at: <a className="text-emerald-300 underline" href="https://www.bhf.org.uk/informationsupport/conditions" target="_blank" rel="noreferrer">bhf.org.uk/informationsupport/conditions</a> (Accessed: {new Date().toLocaleDateString('en-GB')}).
                </li>
                <li>
                  National Institute for Health and Care Excellence (NICE). (n.d.) Cardiovascular conditions. Available at: <a className="text-emerald-300 underline" href="https://www.nice.org.uk/guidance/conditions-and-diseases/cardiovascular-conditions" target="_blank" rel="noreferrer">nice.org.uk/guidance/conditions-and-diseases/cardiovascular-conditions</a> (Accessed: {new Date().toLocaleDateString('en-GB')}).
                </li>
                <li>
                  British Society for Echocardiography. (2021) Clinical indications for adult transthoracic echocardiography. Available at: <a className="text-emerald-300 underline" href="https://www.bsecho.org" target="_blank" rel="noreferrer">bsecho.org</a> (Accessed: {new Date().toLocaleDateString('en-GB')}).
                </li>
              </ol>
            </section>
            
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
          </div>
        </div>
      </div>
    </div>
  )
}

function Ward({ onNext, onPrev: _onPrev, setAccuracy, accuracy, stethoscopeOn, onPlay, onStop }: { onNext: () => void, onPrev: () => void, setAccuracy: Dispatch<SetStateAction<number>>, accuracy: number, stethoscopeOn: boolean, onPlay: (src: string)=>void, onStop: () => void }) {
  const deck = adultCases
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const current = deck[idx]
  const [highlightOn, setHighlightOn] = useState(false)
  const vignetteRef = useRef<HTMLParagraphElement|null>(null)

  // Generate shuffled options for current case
  const shuffledOptions = useMemo(() => {
    return shuffleWithCorrectIndex(current.options, current.correctIndex)
  }, [idx, current.options, current.correctIndex])

  function choose(i: number) {
    if (selected!==null) return
    const correct = i===shuffledOptions.newCorrectIndex
    setSelected(i)
    setIsCorrect(correct)
    setAccuracy(a=> Math.max(0, Math.min(100, a + (correct? +3 : -6))))
  }

  function handleMouseUpHighlight() {
    if (!highlightOn) return
    const container = vignetteRef.current
    if (!container) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (!container.contains(range.commonAncestorContainer)) return
    try {
      const span = document.createElement('span')
      span.className = 'neon-highlight'
      try {
        range.surroundContents(span)
      } catch {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
    } finally {
      selection.removeAllRanges()
    }
  }
  function clearHighlights() {
    const container = vignetteRef.current
    if (!container) return
    const marks = container.querySelectorAll('.neon-highlight')
    marks.forEach((el) => {
      const parent = el.parentNode
      while (el.firstChild) parent?.insertBefore(el.firstChild, el)
      parent?.removeChild(el)
    })
  }

  const isLast = idx >= deck.length - 1
  const isFirst = idx <= 0

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
        <Mentor text="We’ll move bed-to-bed. Read the case file, listen, and decide." />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={current.id} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5 }} className="relative rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="text-sm text-slate-300 mb-1">{current.title}</div>
            <div className="text-xs text-slate-400 mb-3">Patient: {current.patientName} · {current.age}y · {current.sex}</div>
            {/* Vignette with mobile-friendly sentence tap highlighting */}
            <p ref={vignetteRef} onMouseUp={handleMouseUpHighlight} className="mb-4 select-text">
              {useMemo(() => (current.vignette.match(/[^.!?]+[.!?]?/g) || [current.vignette]), [current.vignette]).map((s, i) => (
                <span
                  key={i}
                  onClick={()=>{
                    if (!highlightOn) return
                    const el = document.querySelector(`[data-sent='ward-${i}']`) as HTMLElement|null
                    (el ?? ({} as any)).classList?.toggle('neon-highlight')
                  }}
                  data-sent={`ward-${i}`}
                  className="cursor-text"
                >
                  {s + ' '}
                </span>
              ))}
            </p>
            {/* Floating vertical highlighter controls */}
            <div className="absolute top-3 right-1 z-10 flex flex-col gap-1.5">
              <button
                onClick={()=> setHighlightOn(v=>!v)}
                className={`px-1.5 py-1.5 rounded-md border ${highlightOn ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'border-white/10 bg-white/0 hover:bg-white/5 text-slate-200'}`}
                title="Toggle highlighter"
              >
                <FiPenTool size={16} />
              </button>
              <button
                onClick={clearHighlights}
                className="px-1.5 py-1.5 rounded-md border border-white/10 bg-white/0 hover:bg-white/5 text-slate-200"
                title="Clear highlights"
              >
                <LuEraser size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button disabled={!stethoscopeOn || !current.audio} onClick={()=> current.audio && onPlay(current.audio)} className={`px-3 py-1.5 rounded-md ${stethoscopeOn? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200':'bg-white/10 text-slate-300 opacity-60'} `}>🔊 Listen</button>
              {!stethoscopeOn && <span className="text-amber-300 text-xs">Equip stethoscope to enable listening</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.shuffled.map((d, i) => (
                <motion.button key={d}
                  whileTap={{ scale: 0.97 }}
                  animate={selected===i ? (isCorrect? { scale: 1.03, backgroundColor: 'rgba(16,185,129,0.25)'} : { x: [0,-6,6,-4,4,0], backgroundColor: 'rgba(239,68,68,0.25)'}) : {}}
                  onClick={() => choose(i)}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 flex items-center gap-2">
                  {selected===i && isCorrect===true && <FiCheckCircle className="text-emerald-400"/>}
                  {selected===i && isCorrect===false && <FiXCircle className="text-rose-400"/>}
                  {d}
                </motion.button>
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
      </div>
    </div>
  )
}

function Library({ onPrev: _onPrev }: { onPrev: () => void }) {
  const resources = [
    {
      title: "British Society of Echocardiography Guidelines",
      description: "Comprehensive guidelines for cardiac assessment and echocardiography in the UK.",
      url: "https://www.bsecho.org/",
      category: "Clinical Guidelines",
      icon: "📋"
    },
    {
      title: "NICE Clinical Knowledge Summaries - Heart Murmurs",
      description: "Evidence-based guidance on assessment and management of heart murmurs in primary care.",
      url: "https://cks.nice.org.uk/topics/heart-murmurs/",
      category: "Clinical Guidelines",
      icon: "🏥"
    },
    {
      title: "University of Washington Heart Sounds",
      description: "Interactive heart sounds library with high-quality audio recordings and clinical correlations.",
      url: "https://depts.washington.edu/physdx/heart/demo.html",
      category: "Audio Resources",
      icon: "🔊"
    },
    {
      title: "British Heart Foundation - Heart Conditions",
      description: "Patient-friendly explanations of cardiac conditions with medical professional resources.",
      url: "https://www.bhf.org.uk/informationsupport/conditions",
      category: "Educational",
      icon: "❤️"
    },
    {
      title: "CardioNet - ECG Learning",
      description: "Comprehensive ECG interpretation resources with case studies and interactive modules.",
      url: "https://www.ecglibrary.com/",
      category: "ECG Resources",
      icon: "📈"
    },
    {
      title: "Medscape Cardiology",
      description: "Latest cardiology news, clinical updates, and educational content for medical professionals.",
      url: "https://www.medscape.com/cardiology",
      category: "Clinical Updates",
      icon: "📰"
    },
    {
      title: "European Society of Cardiology Guidelines",
      description: "International guidelines for cardiovascular disease prevention and management.",
      url: "https://www.escardio.org/Guidelines",
      category: "Clinical Guidelines",
      icon: "🌍"
    },
    {
      title: "Teaching Heart Auscultation",
      description: "Dedicated platform for learning cardiac auscultation with audio files and clinical cases.",
      url: "https://teachingheartauscultation.com/",
      category: "Audio Resources",
      icon: "🎧"
    },
    {
      title: "BMJ Learning - Cardiology",
      description: "Evidence-based learning modules on cardiovascular medicine and examination techniques.",
      url: "https://learning.bmj.com/",
      category: "Educational",
      icon: "📚"
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
          src="https://upload.wikimedia.org/wikipedia/commons/1/16/William_Osler.jpg"
          alt="Dr. Lubb von Dub"
          className="w-full h-full object-cover"
          onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop' }}
        />
      </div>
      <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-emerald-300 font-semibold mb-1">Dr. Lubb von Dub · Senior Registrar</div>
        <p className="text-slate-200">{text}</p>
      </motion.div>
    </div>
  )
}

function SidebarItem({ label, active, onClick, icon }: { label: string, active?: boolean, onClick?: ()=>void, icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-md text-left ${active ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300' : 'hover:bg-white/5 border border-transparent'}`}>
      <span className="text-emerald-300">{icon}</span>
      <span>{label}</span>
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
