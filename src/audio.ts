class AudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private started = false

  // Separate buffers for each role — sharing causes phase correlation / interference
  private percBuf:  AudioBuffer | null = null   // hi-hat, snare (short hits)
  private waveBufs: AudioBuffer[] = []           // 3 independent ocean layers
  private crowdBuf: AudioBuffer | null = null    // crowd murmur

  init() {
    if (this.started) return
    this.started = true
    this.ctx = new AudioContext()

    // Compressor keeps the mix from clipping and gives a club feel
    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.knee.value      = 8
    comp.ratio.value     = 5
    comp.attack.value    = 0.005
    comp.release.value   = 0.18
    comp.connect(this.ctx.destination)

    this.master = this.ctx.createGain()
    this.master.gain.value = 0.28
    this.master.connect(comp)

    // Generate all buffers upfront (different lengths = uncorrelated loops)
    this.percBuf  = this.genNoise(2.0)
    this.waveBufs = [this.genNoise(6.7), this.genNoise(8.3), this.genNoise(5.9)]
    this.crowdBuf = this.genNoise(7.1)

    this.startOcean()
    this.startCrowd()
    this.startDJ()
    setTimeout(() => this.startBirds(), 800 + Math.random() * 1400)
  }

  // Pink noise — Paul Kellet's algorithm
  private genNoise(sec: number): AudioBuffer {
    const sr  = this.ctx!.sampleRate
    const buf = this.ctx!.createBuffer(1, Math.floor(sr * sec), sr)
    const d   = buf.getChannelData(0)
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
    return buf
  }

  // ── Ocean waves — 3 independent layers, staggered starts ─────────────────
  private startOcean() {
    if (!this.ctx || !this.master) return
    // [lpfFreq, lfoRate, baseGain, lfoDepth]
    const layers: [number, number, number, number][] = [
      [210,  0.052, 0.15, 0.10],  // deep rumble
      [620,  0.088, 0.06, 0.038], // mid wave break
      [1350, 0.140, 0.025, 0.016], // shore hiss
    ]
    layers.forEach(([lpfFreq, lfoRate, base, depth], i) => {
      const src = this.ctx!.createBufferSource()
      src.buffer = this.waveBufs[i]; src.loop = true

      const lpf = this.ctx!.createBiquadFilter()
      lpf.type = 'lowpass'; lpf.frequency.value = lpfFreq; lpf.Q.value = 0.4

      const amp = this.ctx!.createGain(); amp.gain.value = base

      const lfo = this.ctx!.createOscillator()
      const lfoG = this.ctx!.createGain()
      lfo.type = 'sine'; lfo.frequency.value = lfoRate
      lfoG.gain.value = depth
      lfo.connect(lfoG); lfoG.connect(amp.gain)

      src.connect(lpf); lpf.connect(amp); amp.connect(this.master!)
      lfo.start()
      // Stagger starts so layers don't all peak together
      src.start(this.ctx!.currentTime + i * 0.8)
    })
  }

  // ── Crowd murmur — ONE source through parallel formant filters ────────────
  // Series bandpass was the cause of the buzzy interference.
  // Parallel filters on one source = natural multi-band voice murmur.
  private startCrowd() {
    if (!this.ctx || !this.master || !this.crowdBuf) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.crowdBuf; src.loop = true

    // Formant frequencies that approximate speech vowel sounds
    const formants: [number, number, number][] = [
      [280,  2.0, 0.011], // F1 — throat / chest
      [700,  2.4, 0.009], // F2 — mouth cavity
      [1900, 2.8, 0.005], // F3 — sibilance
    ]
    formants.forEach(([f, Q, gain]) => {
      const bpf = this.ctx!.createBiquadFilter()
      bpf.type = 'bandpass'; bpf.frequency.value = f; bpf.Q.value = Q
      const amp = this.ctx!.createGain(); amp.gain.value = gain
      src.connect(bpf); bpf.connect(amp); amp.connect(this.master!)
    })

    // Slow LFO simulates ebb and flow of conversation energy
    const lfo = this.ctx.createOscillator()
    const lfoG = this.ctx.createGain()
    lfo.type = 'sine'; lfo.frequency.value = 0.12
    lfoG.gain.value = 0.004
    // Connect LFO to all three band gains via a shared pre-gain
    const crowdAmp = this.ctx.createGain(); crowdAmp.gain.value = 1.0
    lfo.connect(lfoG); lfoG.connect(crowdAmp.gain)

    lfo.start(); src.start()
  }

  // ── DJ — tropical house beat + steel pan melody ───────────────────────────
  private startDJ() {
    if (!this.ctx || !this.master) return
    const BPM = 116
    const s16 = 60 / BPM / 4   // 16th note duration ~0.129s

    const C4=262, G4=392, A4=440, C5=523, D5=587, E5=659, G5=784, A5=880

    // Steel pan melody (32 steps = 2 bars of 16th notes)
    const melody = [
      G5, 0, E5, 0,  C5, 0, E5, G5,  A5, 0, G5, 0,  E5, 0, C5, 0,
      D5, 0, E5, 0,  G5, A5, 0,  0,  G5, 0, E5, D5,  C5, 0,  0,  0,
    ]
    // Bass line
    const bass = [
      C4, 0,  0,  0,   0,    0, G4/2, 0,  A4/2, 0, 0, 0,  0,    0, G4/2, 0,
      C4, 0,  0, C4,   0,    0,    0, 0,  G4/2, 0, 0, 0, A4/2,  0,    0,  0,
    ]
    // Hi-hat: open (louder) on the "and" of beat 2 and beat 4
    const openHat = new Set([6, 14, 22, 30])

    let next = this.ctx.currentTime + 0.12
    let step = 0

    const schedule = () => {
      if (!this.ctx || !this.master) return
      while (next < this.ctx.currentTime + 0.22) {
        const i = step % 32

        if (melody[i]) this.pan(next, melody[i], s16 * 2.2)
        if (bass[i])   this.bass(next, bass[i],   s16 * 3.8)

        // 4-on-the-floor kick
        if (i % 8 === 0) this.kick(next)
        // Snare / clap on beats 2 & 4
        if (i % 8 === 4) this.snare(next)
        // Hi-hat every 8th note; open hat on selected steps
        if (i % 2 === 0) this.hihat(next, openHat.has(i) ? 0.030 : 0.016)

        // Chord stabs on bar downbeats
        if (i === 0)  this.stab(next, [C5, E5, G5])
        if (i === 16) this.stab(next, [G4 * 2, D5, G5])

        next += s16; step++
      }
      setTimeout(schedule, 20)
    }
    schedule()
  }

  // Kick drum — sine sweep from 170Hz → 38Hz
  private kick(t: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator(), gn = this.ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(170, t)
    o.frequency.exponentialRampToValueAtTime(38, t + 0.14)
    gn.gain.setValueAtTime(0.48, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.40)
    o.connect(gn); gn.connect(this.master!)
    o.start(t); o.stop(t + 0.42)
  }

  // Snare / clap — highpass filtered percBuf
  private snare(t: number) {
    if (!this.ctx || !this.master || !this.percBuf) return
    const n = this.ctx.createBufferSource(); n.buffer = this.percBuf
    const hpf = this.ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 1400
    const gn = this.ctx.createGain()
    gn.gain.setValueAtTime(0.20, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.10)
    n.connect(hpf); hpf.connect(gn); gn.connect(this.master!)
    n.start(t); n.stop(t + 0.12)
  }

  // Hi-hat — very high-pass filtered percBuf
  private hihat(t: number, vol: number) {
    if (!this.ctx || !this.master || !this.percBuf) return
    const n = this.ctx.createBufferSource(); n.buffer = this.percBuf
    const hpf = this.ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 7500
    const gn = this.ctx.createGain()
    gn.gain.setValueAtTime(vol, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.042)
    n.connect(hpf); hpf.connect(gn); gn.connect(this.master!)
    n.start(t); n.stop(t + 0.05)
  }

  // Steel pan — fundamental + 2nd harmonic + characteristic 2.76× partial
  private pan(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.master) return
    const gn = this.ctx.createGain()
    gn.gain.setValueAtTime(0.13, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 0.85))
    gn.connect(this.master!)
    ;[1, 2, 2.76].forEach(ratio => {
      const o = this.ctx!.createOscillator()
      o.type = 'sine'; o.frequency.value = freq * ratio
      o.connect(gn); o.start(t); o.stop(t + 0.9)
    })
  }

  // Bass — sine + 2nd harmonic through LP for warmth
  private bass(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.master) return
    const lpf = this.ctx.createBiquadFilter()
    lpf.type = 'lowpass'; lpf.frequency.value = 260; lpf.Q.value = 0.7
    const gn = this.ctx.createGain()
    gn.gain.setValueAtTime(0.36, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + dur)
    lpf.connect(gn); gn.connect(this.master!)
    ;[1, 2].forEach(r => {
      const o = this.ctx!.createOscillator(); o.type = 'sine'; o.frequency.value = freq * r
      o.connect(lpf); o.start(t); o.stop(t + dur + 0.04)
    })
  }

  // Chord stab — triangle wave, soft attack, fast decay
  private stab(t: number, freqs: number[]) {
    if (!this.ctx || !this.master) return
    freqs.forEach(freq => {
      const o = this.ctx!.createOscillator()
      const lpf = this.ctx!.createBiquadFilter()
      const gn = this.ctx!.createGain()
      o.type = 'triangle'; o.frequency.value = freq
      lpf.type = 'lowpass'; lpf.frequency.value = 820
      gn.gain.setValueAtTime(0.036, t)
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.52)
      o.connect(lpf); lpf.connect(gn); gn.connect(this.master!)
      o.start(t); o.stop(t + 0.56)
    })
  }

  // ── Tropical birds ────────────────────────────────────────────────────────
  private startBirds() {
    const chirp = () => {
      if (!this.ctx || !this.master) return
      const t = this.ctx.currentTime
      const freq = 1600 + Math.random() * 1600
      const dur  = 0.04 + Math.random() * 0.11
      const o = this.ctx.createOscillator(), gn = this.ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(freq, t)
      o.frequency.exponentialRampToValueAtTime(freq * (1.2 + Math.random() * 0.4), t + dur * 0.3)
      o.frequency.exponentialRampToValueAtTime(freq * 0.75, t + dur)
      gn.gain.setValueAtTime(0.028, t)
      gn.gain.exponentialRampToValueAtTime(0.001, t + dur)
      o.connect(gn); gn.connect(this.master!)
      o.start(t); o.stop(t + dur + 0.01)
      if (Math.random() > 0.48) setTimeout(() => {
        if (!this.ctx || !this.master) return
        const t2 = this.ctx.currentTime
        const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain()
        o2.type = 'sine'; o2.frequency.value = 2000 + Math.random() * 900
        g2.gain.setValueAtTime(0.020, t2); g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09)
        o2.connect(g2); g2.connect(this.master!); o2.start(t2); o2.stop(t2 + 0.1)
      }, (dur + 0.1) * 1000)
      setTimeout(chirp, 3000 + Math.random() * 7000)
    }
    chirp()
  }

  // ── UI tones ──────────────────────────────────────────────────────────────
  private tone(freq: number, vol: number, dur: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return
    const o = this.ctx.createOscillator(), gn = this.ctx.createGain()
    o.frequency.value = freq; o.type = type
    gn.gain.setValueAtTime(vol, this.ctx.currentTime)
    gn.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur)
    o.connect(gn); gn.connect(this.ctx.destination)
    o.start(); o.stop(this.ctx.currentTime + dur)
  }
  playOpen()      { this.tone(784, 0.050, 0.22); setTimeout(() => this.tone(988, 0.032, 0.30), 80) }
  playSend()      { this.tone(660, 0.035, 0.10); setTimeout(() => this.tone(880, 0.025, 0.14), 52) }
  playProximity() { this.tone(528, 0.032, 0.38); setTimeout(() => this.tone(660, 0.024, 0.28), 110) }
  playClose()     { this.tone(440, 0.032, 0.16) }
  playRecord()    { this.tone(660, 0.042, 0.10); setTimeout(() => this.tone(880, 0.034, 0.18), 78) }
}

export const audio = new AudioSystem()
