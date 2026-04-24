class AudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseCache: AudioBuffer | null = null
  private started = false

  init() {
    if (this.started) return
    this.started = true
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.22
    this.master.connect(this.ctx.destination)
    this.noiseCache = this.genNoise()
    this.startOceanAmbience()
    this.startBeachMusic()
    this.startBirds()
    this.startCrowdMurmur()
  }

  private genNoise(): AudioBuffer {
    const ctx = this.ctx!
    const size = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, size, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
    return buf
  }

  // ── Ocean wave ambience ───────────────────────────────────────────────────
  private startOceanAmbience() {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx, g = this.master

    // Deep wave rumble
    const s1 = ctx.createBufferSource(); s1.buffer = this.noiseCache; s1.loop = true
    const lpf1 = ctx.createBiquadFilter(); lpf1.type = 'lowpass'; lpf1.frequency.value = 380
    const lfo1 = ctx.createOscillator(); const lfoG1 = ctx.createGain()
    lfo1.frequency.value = 0.07; lfoG1.gain.value = 0.09
    lfo1.connect(lfoG1)
    const amp1 = ctx.createGain(); amp1.gain.value = 0.14
    lfoG1.connect(amp1.gain)
    s1.connect(lpf1); lpf1.connect(amp1); amp1.connect(g); lfo1.start(); s1.start()

    // Shore foam — mid frequency, slower wave cycle
    const s2 = ctx.createBufferSource(); s2.buffer = this.noiseCache; s2.loop = true
    const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 750; bpf.Q.value = 0.6
    const lfo2 = ctx.createOscillator(); const lfoG2 = ctx.createGain()
    lfo2.frequency.value = 0.11; lfoG2.gain.value = 0.04
    lfo2.connect(lfoG2)
    const amp2 = ctx.createGain(); amp2.gain.value = 0.05
    lfoG2.connect(amp2.gain)
    s2.connect(bpf); bpf.connect(amp2); amp2.connect(g); lfo2.start(); s2.start()
  }

  // ── Birds — random tropical chirps ───────────────────────────────────────
  private startBirds() {
    const chirp = () => {
      if (!this.ctx || !this.master) return
      const t = this.ctx.currentTime
      const freq = 1600 + Math.random() * 1600
      const dur  = 0.04 + Math.random() * 0.11
      const o = this.ctx.createOscillator()
      const gn = this.ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(freq, t)
      o.frequency.exponentialRampToValueAtTime(freq * (1.2 + Math.random() * 0.4), t + dur * 0.3)
      o.frequency.exponentialRampToValueAtTime(freq * 0.75, t + dur)
      gn.gain.setValueAtTime(0.045, t)
      gn.gain.exponentialRampToValueAtTime(0.001, t + dur)
      o.connect(gn); gn.connect(this.master)
      o.start(t); o.stop(t + dur + 0.01)

      // Sometimes a follow-up chirp
      if (Math.random() > 0.45) setTimeout(() => chirpShort(), (dur + 0.09) * 1000)
      setTimeout(chirp, 2500 + Math.random() * 6500)
    }

    const chirpShort = () => {
      if (!this.ctx || !this.master) return
      const t = this.ctx.currentTime
      const freq = 2000 + Math.random() * 1000
      const o = this.ctx.createOscillator()
      const gn = this.ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      gn.gain.setValueAtTime(0.03, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
      o.connect(gn); gn.connect(this.master)
      o.start(t); o.stop(t + 0.1)
    }

    setTimeout(chirp, 800 + Math.random() * 2000)
  }

  // ── Crowd murmur ─────────────────────────────────────────────────────────
  private startCrowdMurmur() {
    if (!this.ctx || !this.master) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseCache; src.loop = true
    const bpf1 = this.ctx.createBiquadFilter()
    bpf1.type = 'bandpass'; bpf1.frequency.value = 500; bpf1.Q.value = 0.7
    const bpf2 = this.ctx.createBiquadFilter()
    bpf2.type = 'bandpass'; bpf2.frequency.value = 1100; bpf2.Q.value = 1.0
    const amp = this.ctx.createGain(); amp.gain.value = 0.028
    src.connect(bpf1); bpf1.connect(bpf2); bpf2.connect(amp); amp.connect(this.master)
    src.start()
  }

  // ── Tropical beach music — steel pan + tropical groove ───────────────────
  private startBeachMusic() {
    if (!this.ctx || !this.master) return

    const BPM  = 110
    const s16  = 60 / BPM / 4   // 16th note
    const BARS = 32              // 2 bars = 32 steps of 16th notes

    // C major pentatonic frequencies (used for steel pan):
    // C5=523 D5=587 E5=659 G5=784 A5=880 C6=1047 G4=392 A4=440 E4=330
    const C4=262, G4=392, A4=440, C5=523, D5=587, E5=659, G5=784, A5=880, C6=1047

    // Steel pan melody — bright and island-y
    const melody: number[] = [
      G5, 0, E5, 0,  C5, 0, E5, G5,  A5, 0, G5, 0,  E5, 0, C5, 0,
      D5, 0, E5, 0,  G5, A5, 0,  0,  G5, 0, E5, D5,  C5, 0,  0,  0,
    ]

    // Acoustic bass (root on beats 1, 2.5, 3)
    const bassNotes: number[] = [
      C4, 0, 0, 0,  0, 0, G4/2, 0,  A4/2, 0, 0, 0,  0, 0, G4/2, 0,
      C4, 0, 0, C4, 0, 0, 0,    0,  G4/2, 0, 0, 0,  A4/2, 0, 0,  0,
    ]

    // Marimba counter-melody (slightly lower)
    const marimba: number[] = [
      0, C5, 0, 0,  E5, 0, 0, C5,  0, E5, 0, 0,  G5, 0, 0, E5,
      0, 0,  D5,0,  0,  E5,0,  0,  C5,0,  0, E5,  0,  G5,0,  0,
    ]

    // Clave (wood-block) pattern — 3-2 son clave
    const clave: boolean[] = [
      true,false,false,true, false,false,true,false, false,false,true,false, false,true,false,false,
      true,false,false,false,false,true,false,false, false,true,false,false, false,false,false,false,
    ]

    // Shaker — every 8th note
    const shaker: boolean[] = Array.from({length: BARS}, (_, i) => i % 2 === 0)

    let next = this.ctx.currentTime + 0.08
    let step = 0
    const lookahead = 0.18

    const schedule = () => {
      if (!this.ctx || !this.master) return
      while (next < this.ctx.currentTime + lookahead) {
        const i = step % BARS
        if (melody[i])       this.steelPan(next, melody[i], s16 * 2.0)
        if (marimba[i])      this.marimbaNote(next, marimba[i], s16 * 1.5)
        if (bassNotes[i])    this.tropBass(next, bassNotes[i], s16 * 3.8)
        if (clave[i])        this.woodBlock(next)
        if (shaker[i])       this.shaker(next)
        // Chord hit on beat 1 and beat 3 of each bar (every 16 steps = bar)
        const barStep = i % 16
        if (barStep === 0)  this.chord(next, [C4*2, E5, G5], 0.045)
        if (barStep === 8)  this.chord(next, [G4*2, D5, G5], 0.038)
        next += s16; step++
      }
      setTimeout(schedule, 22)
    }
    schedule()
  }

  // Steel pan — bright bell-like, sine + overtone
  private steelPan(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.master) return
    const o1 = this.ctx.createOscillator()
    const o2 = this.ctx.createOscillator()
    const gn = this.ctx.createGain()
    o1.type = 'sine'; o1.frequency.value = freq
    o2.type = 'sine'; o2.frequency.value = freq * 2.76  // characteristic steel pan overtone
    gn.gain.setValueAtTime(0.16, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 0.75))
    o1.connect(gn); o2.connect(gn); gn.connect(this.master)
    o1.start(t); o2.start(t); o1.stop(t + 0.78); o2.stop(t + 0.78)
  }

  // Marimba — softer, sine + 3rd harmonic, faster decay
  private marimbaNote(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const gn = this.ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq
    gn.gain.setValueAtTime(0.1, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 0.45))
    o.connect(gn); gn.connect(this.master)
    o.start(t); o.stop(t + 0.48)
  }

  // Tropical bass — warm sine
  private tropBass(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const lpf = this.ctx.createBiquadFilter()
    const gn = this.ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq
    lpf.type = 'lowpass'; lpf.frequency.value = 320
    gn.gain.setValueAtTime(0.24, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(lpf); lpf.connect(gn); gn.connect(this.master)
    o.start(t); o.stop(t + dur + 0.05)
  }

  // Wood block (clave)
  private woodBlock(t: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const gn = this.ctx.createGain()
    o.type = 'sine'; o.frequency.value = 900
    gn.gain.setValueAtTime(0.06, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    o.connect(gn); gn.connect(this.master)
    o.start(t); o.stop(t + 0.07)
  }

  // Shaker
  private shaker(t: number) {
    if (!this.ctx || !this.master) return
    const n = this.ctx.createBufferSource()
    n.buffer = this.noiseCache
    const hpf = this.ctx.createBiquadFilter()
    hpf.type = 'highpass'; hpf.frequency.value = 7000
    const gn = this.ctx.createGain()
    gn.gain.setValueAtTime(0.035, t)
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.045)
    n.connect(hpf); hpf.connect(gn); gn.connect(this.master)
    n.start(t); n.stop(t + 0.05)
  }

  // Warm chord pad
  private chord(t: number, freqs: number[], vol: number) {
    if (!this.ctx || !this.master) return
    freqs.forEach(freq => {
      const o = this.ctx!.createOscillator()
      const lpf = this.ctx!.createBiquadFilter()
      const gn = this.ctx!.createGain()
      o.type = 'triangle'; o.frequency.value = freq
      lpf.type = 'lowpass'; lpf.frequency.value = 700; lpf.Q.value = 1.2
      gn.gain.setValueAtTime(vol, t)
      gn.gain.setValueAtTime(vol, t + 0.04)
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.65)
      o.connect(lpf); lpf.connect(gn); gn.connect(this.master!)
      o.start(t); o.stop(t + 0.7)
    })
  }

  // ── UI sounds ─────────────────────────────────────────────────────────────
  private tone(freq: number, vol: number, dur: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return
    const o = this.ctx.createOscillator()
    const gn = this.ctx.createGain()
    o.frequency.value = freq; o.type = type
    gn.gain.setValueAtTime(vol, this.ctx.currentTime)
    gn.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur)
    o.connect(gn); gn.connect(this.ctx.destination)
    o.start(); o.stop(this.ctx.currentTime + dur)
  }
  playOpen()      { this.tone(880, 0.07, 0.28); setTimeout(() => this.tone(1108, 0.04, 0.38), 75) }
  playSend()      { this.tone(660, 0.04, 0.10); setTimeout(() => this.tone(880, 0.03, 0.14), 52) }
  playProximity() { this.tone(528, 0.04, 0.42); setTimeout(() => this.tone(660, 0.03, 0.32), 105) }
  playClose()     { this.tone(440, 0.04, 0.16) }
  playRecord()    { this.tone(660, 0.06, 0.11); setTimeout(() => this.tone(880, 0.05, 0.18), 78) }
}

export const audio = new AudioSystem()
