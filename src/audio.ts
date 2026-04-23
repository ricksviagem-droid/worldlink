class AudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private started = false

  init() {
    if (this.started) return
    this.started = true
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.28
    this.master.connect(this.ctx.destination)
    this.startOcean()
    this.startAmbientPad()
  }

  private createNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const size = ctx.sampleRate * 3
    const buf = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520
      b3 = 0.86650 * b3 + w * 0.3104856
      b4 = 0.55000 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    }
    return buf
  }

  private startOcean() {
    if (!this.ctx || !this.master) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.createNoiseBuffer()
    src.loop = true

    const lpf = this.ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 380
    lpf.Q.value = 0.8

    // LFO for wave rhythm
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = 0.08
    lfoGain.gain.value = 0.18
    lfo.connect(lfoGain)

    const waveAmp = this.ctx.createGain()
    waveAmp.gain.value = 0.22
    lfoGain.connect(waveAmp.gain)

    src.connect(lpf)
    lpf.connect(waveAmp)
    waveAmp.connect(this.master)
    lfo.start()
    src.start()
  }

  private startAmbientPad() {
    if (!this.ctx || !this.master) return
    // Soft A-major chord pad for beach vibe
    const freqs = [110, 138.59, 164.81, 220]
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      const lpf = this.ctx!.createBiquadFilter()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      lpf.type = 'lowpass'
      lpf.frequency.value = 500
      gain.gain.value = 0.012 - i * 0.002
      osc.connect(lpf)
      lpf.connect(gain)
      gain.connect(this.master!)
      osc.start(this.ctx!.currentTime + i * 0.08)
    })
  }

  private tone(freq: number, vol: number, dur: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.frequency.value = freq
    osc.type = type
    gain.gain.setValueAtTime(vol, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + dur)
  }

  playOpen() {
    this.tone(880, 0.08, 0.3)
    setTimeout(() => this.tone(1108, 0.05, 0.4), 80)
  }

  playSend() {
    this.tone(660, 0.04, 0.12)
    setTimeout(() => this.tone(880, 0.03, 0.15), 60)
  }

  playProximity() {
    this.tone(528, 0.04, 0.5)
    setTimeout(() => this.tone(660, 0.03, 0.4), 120)
  }

  playClose() {
    this.tone(440, 0.04, 0.2)
  }
}

export const audio = new AudioSystem()
