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
    this.master.gain.value = 0.2
    this.master.connect(this.ctx.destination)
    this.noiseCache = this.genNoise()
    this.startOcean()
    this.startBeat()
  }

  private genNoise(): AudioBuffer {
    const ctx = this.ctx!
    const size = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, size, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
    return buf
  }

  private startOcean() {
    if (!this.ctx||!this.master) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseCache; src.loop = true
    const lpf = this.ctx.createBiquadFilter()
    lpf.type='lowpass'; lpf.frequency.value=300
    const lfo = this.ctx.createOscillator()
    const lfoG = this.ctx.createGain()
    lfo.frequency.value=0.06; lfoG.gain.value=0.12
    lfo.connect(lfoG)
    const amp = this.ctx.createGain(); amp.gain.value=0.14
    lfoG.connect(amp.gain)
    src.connect(lpf); lpf.connect(amp); amp.connect(this.master)
    lfo.start(); src.start()
  }

  // ── House / Dance beat 126 BPM ──────────────────────────────────────────
  private startBeat() {
    const BPM = 126
    const s16 = 60 / BPM / 4        // 16th note duration
    const STEPS = 32                  // 2 measures of 16 steps

    // Kick: 4-on-floor (steps 0,8,16,24)
    const kickPat  = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0,
                      1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
    // Snare: 2+4
    const snarePat = [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0,
                      0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,1]
    // Hi-hat: 16ths, accented on 8ths
    const hatVol   = [.10,.05,.10,.05, .12,.05,.10,.05,
                      .10,.05,.10,.05, .12,.05,.10,.08,
                      .10,.05,.10,.05, .12,.05,.10,.05,
                      .10,.05,.10,.05, .12,.05,.10,.05]
    // Open hat on off-beats
    const openPat  = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0,
                      0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]
    // Bass: A minor (A2=110, E2=82.4, C2=65.4, D2=73.4)
    const bassFreq = [110,0,0,0, 0,0,82.4,0, 0,0,110,0, 0,0,0,0,
                       73.4,0,0,0, 0,0,82.4,0, 0,0,110,0, 0,65.4,0,0]
    // Synth lead melody: A major (A4=440, C#5=554, E5=659, B4=494, F#5=740)
    const leadFreq = [659,0,0,659, 0,554,0,0, 494,0,659,0, 0,0,0,0,
                      440,0,0,440, 0,494,0,554, 659,0,0,440, 0,0,0,0]

    let next = this.ctx!.currentTime + 0.3
    let step = 0
    const lookahead = 0.15

    const schedule = () => {
      if (!this.ctx||!this.master) return
      while (next < this.ctx.currentTime + lookahead) {
        const i = step % STEPS
        if (kickPat[i])       this.kick(next)
        if (snarePat[i])      this.snare(next)
        if (hatVol[i])        this.hihat(next, hatVol[i], !!openPat[i])
        if (bassFreq[i])      this.bass(next, bassFreq[i], s16*3.5)
        if (leadFreq[i])      this.lead(next, leadFreq[i], s16*1.8)
        // Chord hit on beat 1 of measure
        if (i===0||i===16)    this.chord(next, [220,277,330], 0.05)
        if (i===8||i===24)    this.chord(next, [196,247,311], 0.04)
        next += s16; step++
      }
      setTimeout(schedule, 20)
    }
    schedule()
  }

  private kick(t: number) {
    const ctx=this.ctx!, g=this.master!
    const o=ctx.createOscillator(), gn=ctx.createGain()
    o.frequency.setValueAtTime(220,t)
    o.frequency.exponentialRampToValueAtTime(40,t+0.45)
    gn.gain.setValueAtTime(0.6,t)
    gn.gain.exponentialRampToValueAtTime(0.001,t+0.5)
    o.connect(gn); gn.connect(g); o.start(t); o.stop(t+0.5)
  }

  private snare(t: number) {
    const ctx=this.ctx!, g=this.master!
    const n=ctx.createBufferSource(); n.buffer=this.noiseCache
    const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3000
    const gn=ctx.createGain()
    gn.gain.setValueAtTime(0.28,t); gn.gain.exponentialRampToValueAtTime(0.001,t+0.16)
    n.connect(f); f.connect(gn); gn.connect(g); n.start(t); n.stop(t+0.16)
    const o=ctx.createOscillator(), g2=ctx.createGain()
    o.frequency.value=200; g2.gain.setValueAtTime(0.18,t); g2.gain.exponentialRampToValueAtTime(0.001,t+0.07)
    o.connect(g2); g2.connect(g); o.start(t); o.stop(t+0.07)
  }

  private hihat(t: number, vol: number, open: boolean) {
    const ctx=this.ctx!, g=this.master!
    const n=ctx.createBufferSource(); n.buffer=this.noiseCache
    const hpf=ctx.createBiquadFilter(); hpf.type='highpass'; hpf.frequency.value=10000
    const gn=ctx.createGain(); const dur=open?0.1:0.03
    gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(0.001,t+dur)
    n.connect(hpf); hpf.connect(gn); gn.connect(g); n.start(t); n.stop(t+dur)
  }

  private bass(t: number, freq: number, dur: number) {
    const ctx=this.ctx!, g=this.master!
    const o=ctx.createOscillator(), lpf=ctx.createBiquadFilter(), gn=ctx.createGain()
    o.type='sawtooth'; o.frequency.value=freq
    lpf.type='lowpass'; lpf.frequency.value=200
    gn.gain.setValueAtTime(0.3,t); gn.gain.exponentialRampToValueAtTime(0.001,t+dur)
    o.connect(lpf); lpf.connect(gn); gn.connect(g); o.start(t); o.stop(t+dur)
  }

  private lead(t: number, freq: number, dur: number) {
    const ctx=this.ctx!, g=this.master!
    const o=ctx.createOscillator(), lpf=ctx.createBiquadFilter(), gn=ctx.createGain()
    o.type='square'; o.frequency.value=freq
    lpf.type='lowpass'; lpf.frequency.value=1200; lpf.Q.value=3
    gn.gain.setValueAtTime(0.06,t); gn.gain.exponentialRampToValueAtTime(0.001,t+dur)
    o.connect(lpf); lpf.connect(gn); gn.connect(g); o.start(t); o.stop(t+dur)
  }

  private chord(t: number, freqs: number[], vol: number) {
    freqs.forEach(freq => {
      const ctx=this.ctx!, g=this.master!
      const o=ctx.createOscillator(), lpf=ctx.createBiquadFilter(), gn=ctx.createGain()
      o.type='triangle'; o.frequency.value=freq
      lpf.type='lowpass'; lpf.frequency.value=800
      gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(0.001,t+0.35)
      o.connect(lpf); lpf.connect(gn); gn.connect(g); o.start(t); o.stop(t+0.35)
    })
  }

  // ── UI sounds ─────────────────────────────────────────────────────────────
  private tone(freq: number, vol: number, dur: number, type: OscillatorType='sine') {
    if(!this.ctx) return
    const o=this.ctx.createOscillator(), gn=this.ctx.createGain()
    o.frequency.value=freq; o.type=type
    gn.gain.setValueAtTime(vol,this.ctx.currentTime)
    gn.gain.exponentialRampToValueAtTime(0.0001,this.ctx.currentTime+dur)
    o.connect(gn); gn.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+dur)
  }
  playOpen()      { this.tone(880,0.07,0.3); setTimeout(()=>this.tone(1108,0.04,0.4),80) }
  playSend()      { this.tone(660,0.04,0.1); setTimeout(()=>this.tone(880,0.03,0.15),55) }
  playProximity() { this.tone(528,0.04,0.45); setTimeout(()=>this.tone(660,0.03,0.35),110) }
  playClose()     { this.tone(440,0.04,0.18) }
  playRecord()    { this.tone(660,0.06,0.12); setTimeout(()=>this.tone(880,0.05,0.2),80) }
}

export const audio = new AudioSystem()
