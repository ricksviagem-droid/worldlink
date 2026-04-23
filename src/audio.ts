class AudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private beatTimer: ReturnType<typeof setTimeout> | null = null
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
    this.startOcean()
    this.startAmbientPad()
    this.startDJBeat()
  }

  private genNoise(): AudioBuffer {
    const ctx = this.ctx!
    const size = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, size, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759
      b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856
      b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980
      d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6 = w*0.115926
    }
    return buf
  }

  private startOcean() {
    if (!this.ctx || !this.master) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseCache
    src.loop = true
    const lpf = this.ctx.createBiquadFilter()
    lpf.type = 'lowpass'; lpf.frequency.value = 320; lpf.Q.value = 0.9
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = 0.07; lfoGain.gain.value = 0.14
    lfo.connect(lfoGain)
    const amp = this.ctx.createGain()
    amp.gain.value = 0.18
    lfoGain.connect(amp.gain)
    src.connect(lpf); lpf.connect(amp); amp.connect(this.master)
    lfo.start(); src.start()
  }

  private startAmbientPad() {
    if (!this.ctx || !this.master) return
    // Warm lofi chord: A2 C#3 E3 A3
    const freqs = [110, 138.59, 164.81, 220]
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      const lpf = this.ctx!.createBiquadFilter()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      lpf.type = 'lowpass'; lpf.frequency.value = 600
      gain.gain.value = 0.018 - i * 0.003
      osc.connect(lpf); lpf.connect(gain); gain.connect(this.master!)
      osc.start(this.ctx!.currentTime + i * 0.1)
    })
  }

  // ── DJ Beat ──────────────────────────────────────────────────────────────
  private startDJBeat() {
    const BPM = 98
    const beat = 60 / BPM
    const eighth = beat / 2
    const lookahead = 0.12
    let next = this.ctx!.currentTime + 1.0
    let step = 0

    // A minor pentatonic bass line (2 measures cycling)
    const bassLine = [110, 0, 130.81, 0, 146.83, 0, 110, 0,
                      196.00, 0, 164.81, 0, 130.81, 0, 110, 0]

    const schedule = () => {
      if (!this.ctx || !this.master) return
      while (next < this.ctx.currentTime + lookahead) {
        const s = step % 16
        const s8 = step % 8

        if (s === 0 || s === 8) this.kick(next, 0.55)
        if (s === 4 || s === 12) this.kick(next, 0.3)   // ghost kick
        if (s8 === 4) this.snare(next, 0.3)
        this.hihat(next, s % 2 === 0 ? 0.07 : 0.04, s8 === 7)

        const bassFreq = bassLine[s]
        if (bassFreq) this.bass(next, bassFreq, eighth * 0.85)

        // Chord stab every measure
        if (s === 0) this.chordStab(next, [220, 261.63, 329.63], 0.06)
        if (s === 8) this.chordStab(next, [196, 246.94, 311.13], 0.05)

        next += eighth
        step++
      }
      this.beatTimer = setTimeout(schedule, 20)
    }
    schedule()
  }

  private kick(time: number, vol = 0.5) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(200, time)
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.35)
    gain.gain.setValueAtTime(vol, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5)
    osc.connect(gain); gain.connect(this.master!)
    osc.start(time); osc.stop(time + 0.5)
  }

  private snare(time: number, vol = 0.25) {
    const ctx = this.ctx!
    // Noise body
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseCache
    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'; bpf.frequency.value = 2800; bpf.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vol, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18)
    noise.connect(bpf); bpf.connect(gain); gain.connect(this.master!)
    noise.start(time); noise.stop(time + 0.18)
    // Tone crack
    const osc = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc.frequency.value = 190
    g2.gain.setValueAtTime(vol * 0.6, time)
    g2.gain.exponentialRampToValueAtTime(0.001, time + 0.08)
    osc.connect(g2); g2.connect(this.master!)
    osc.start(time); osc.stop(time + 0.08)
  }

  private hihat(time: number, vol = 0.06, open = false) {
    const ctx = this.ctx!
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseCache
    const hpf = ctx.createBiquadFilter()
    hpf.type = 'highpass'; hpf.frequency.value = 9000
    const gain = ctx.createGain()
    const dur = open ? 0.12 : 0.035
    gain.gain.setValueAtTime(vol, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)
    noise.connect(hpf); hpf.connect(gain); gain.connect(this.master!)
    noise.start(time); noise.stop(time + dur)
  }

  private bass(time: number, freq: number, dur: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const lpf = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.value = freq
    lpf.type = 'lowpass'; lpf.frequency.value = 260
    gain.gain.setValueAtTime(0.28, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)
    osc.connect(lpf); lpf.connect(gain); gain.connect(this.master!)
    osc.start(time); osc.stop(time + dur)
  }

  private chordStab(time: number, freqs: number[], vol: number) {
    freqs.forEach(freq => {
      const ctx = this.ctx!
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const lpf = ctx.createBiquadFilter()
      osc.type = 'triangle'; osc.frequency.value = freq
      lpf.type = 'lowpass'; lpf.frequency.value = 900
      gain.gain.setValueAtTime(vol, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4)
      osc.connect(lpf); lpf.connect(gain); gain.connect(this.master!)
      osc.start(time); osc.stop(time + 0.4)
    })
  }

  // ── UI Sounds ─────────────────────────────────────────────────────────────
  private tone(freq: number, vol: number, dur: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.frequency.value = freq; osc.type = type
    gain.gain.setValueAtTime(vol, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur)
    osc.connect(gain); gain.connect(this.ctx.destination)
    osc.start(); osc.stop(this.ctx.currentTime + dur)
  }

  playOpen()     { this.tone(880, 0.07, 0.3); setTimeout(() => this.tone(1108, 0.04, 0.4), 80) }
  playSend()     { this.tone(660, 0.04, 0.1); setTimeout(() => this.tone(880, 0.03, 0.15), 55) }
  playProximity(){ this.tone(528, 0.04, 0.45); setTimeout(() => this.tone(660, 0.03, 0.35), 110) }
  playClose()    { this.tone(440, 0.04, 0.18) }
  playRecord()   { this.tone(660, 0.06, 0.12); setTimeout(() => this.tone(880, 0.05, 0.2), 80) }
}

export const audio = new AudioSystem()
