const translation = window.i18nextify.init({
  autorun: false
})

// 钢琴 piano.

$(function () {
  translation.start()
  console.log(
    "%cWelcome to MPP's developer console~! owo",
    'color:blue; font-size:20px;'
  )
  console.log(
    '%cCheck out the source code: https://github.com/mppnet/frontend/tree/main/client\nGuide for coders and bot developers: https://docs.google.com/document/d/1OrxwdLD1l1TE8iau6ToETVmnLuLXyGBhA0VfAY1Lf14/edit?usp=sharing',
    'color:gray; font-size:12px;'
  )

  let pageJustLoaded = true

  var test_mode =
    window.location.hash &&
    window.location.hash.match(/^(?:#.+)*#test(?:#.+)*$/i)

  var gSeeOwnCursor =
    window.location.hash &&
    window.location.hash.match(/^(?:#.+)*#seeowncursor(?:#.+)*$/i)

  var gMidiVolumeTest =
    window.location.hash &&
    window.location.hash.match(/^(?:#.+)*#midivolumetest(?:#.+)*$/i)

  var gMidiOutTest

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
      var len = this.length >>> 0
      var from = Number(arguments[1]) || 0
      from = from < 0 ? Math.ceil(from) : Math.floor(from)
      if (from < 0) from += len
      for (; from < len; from++) {
        if (from in this && this[from] === elt) return from
      }
      return -1
    }
  }

  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (cb) {
      setTimeout(cb, 1000 / 30)
    }

  var DEFAULT_VELOCITY = 0.5

  var TIMING_TARGET = 1000

  // Utility

  ////////////////////////////////////////////////////////////////

  var Rect = function (x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x2 = x + w
    this.y2 = y + h
  }
  Rect.prototype.contains = function (x, y) {
    return x >= this.x && x <= this.x2 && y >= this.y && y <= this.y2
  }

  const BASIC_PIANO_SCALES = {
    // ty https://www.pianoscales.org/
    // major keys
    'Notes in C Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
    'Notes in D Major': ['D', 'E', 'G♭', 'G', 'A', 'B', 'D♭', 'D'],
    'Notes in E Major': ['E', 'G♭', 'A♭', 'A', 'B', 'D♭', 'E♭', 'E'],
    'Notes in F Major': ['F', 'G', 'A', 'B♭', 'C', 'D', 'E', 'F'],
    'Notes in G Major': ['G', 'A', 'B', 'C', 'D', 'E', 'G♭', 'G'],
    'Notes in A Major': ['A', 'B', 'D♭', 'D', 'E', 'G♭', 'A♭', 'A'],
    'Notes in B Major': ['B', 'D♭', 'E♭', 'E', 'G♭', 'A♭', 'B♭', 'B'],
    'Notes in C# / Db Major': ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C', 'D♭'],
    'Notes in D# / Eb Major': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D', 'E♭'],
    'Notes in F# / Gb Major': ['G♭', 'A♭', 'B♭', 'B', 'D♭', 'E♭', 'F', 'G♭'],
    'Notes in G# / Ab Major': ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G', 'A♭'],
    'Notes in A# / Bb Major': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A', 'B♭'],
    // natural minor keys
    'Notes in A Minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'],
    'Notes in A# / Bb Minor': ['B♭', 'C', 'D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭'],
    'Notes in B Minor': ['B', 'D♭', 'D', 'E', 'G♭', 'G', 'A', 'B'],
    'Notes in C Minor': ['C', 'D', 'E♭', 'F', 'G', 'A♭', 'B♭', 'C'],
    'Notes in C# / Db Minor': ['D♭', 'E♭', 'E', 'G♭', 'A♭', 'A', 'B', 'D♭'],
    'Notes in D Minor': ['D', 'E', 'F', 'G', 'A', 'B♭', 'C', 'D'],
    'Notes in D# / Eb Minor': ['E♭', 'F', 'G♭', 'A♭', 'B♭', 'B', 'D♭', 'E♭'],
    'Notes in E Minor': ['E', 'G♭', 'G', 'A', 'B', 'C', 'D', 'E'],
    'Notes in F Minor': ['F', 'G', 'A♭', 'B♭', 'C', 'D♭', 'E♭', 'F'],
    'Notes in F# / Gb Minor': ['G♭', 'A♭', 'A', 'B', 'D♭', 'D', 'E', 'G♭'],
    'Notes in G Minor': ['G', 'A', 'B♭', 'C', 'D', 'E♭', 'F', 'G'],
    'Notes in G# / Ab Minor': ['A♭', 'B♭', 'B', 'D♭', 'E♭', 'E', 'G♭', 'A♭']
  }

  // AudioEngine classes

  ////////////////////////////////////////////////////////////////

  var AudioEngine = function () { }

  AudioEngine.prototype.init = function (cb) {
    this.volume = 0.6
    this.sounds = {}
    this.paused = true
    return this
  }

  AudioEngine.prototype.load = function (id, url, cb) { }

  AudioEngine.prototype.play = function () { }

  AudioEngine.prototype.stop = function () { }

  AudioEngine.prototype.setVolume = function (vol) {
    this.volume = vol
  }

  AudioEngine.prototype.resume = function () {
    this.paused = false
  }

  AudioEngineWeb = function () {
    this.threshold = 0
    this.worker = new Worker('/workerTimer.js')
    var self = this
    this.worker.onmessage = function (event) {
      if (event.data.args)
        if (event.data.args.action == 0) {
          self.actualPlay(
            event.data.args.id,
            event.data.args.vol,
            event.data.args.time,
            event.data.args.part_id
          )
        } else {
          self.actualStop(
            event.data.args.id,
            event.data.args.time,
            event.data.args.part_id
          )
        }
    }
  }

  AudioEngineWeb.prototype = new AudioEngine()

  AudioEngineWeb.prototype.init = function (cb) {
    AudioEngine.prototype.init.call(this)

    this.context = new AudioContext({ latencyHint: 'interactive' })

    this.masterGain = this.context.createGain()
    this.masterGain.connect(this.context.destination)
    this.masterGain.gain.value = this.volume

    this.limiterNode = this.context.createDynamicsCompressor()
    this.limiterNode.threshold.value = -10
    this.limiterNode.knee.value = 0
    this.limiterNode.ratio.value = 20
    this.limiterNode.attack.value = 0
    this.limiterNode.release.value = 0.1
    this.limiterNode.connect(this.masterGain)

    // for synth mix
    this.pianoGain = this.context.createGain()
    this.pianoGain.gain.value = 0.5
    this.pianoGain.connect(this.limiterNode)
    this.synthGain = this.context.createGain()
    this.synthGain.gain.value = 0.5
    this.synthGain.connect(this.limiterNode)

    this.playings = {}

    if (cb) setTimeout(cb, 0)
    return this
  }

  AudioEngineWeb.prototype.load = function (id, url, cb) {
    var audio = this
    var req = new XMLHttpRequest()
    req.open('GET', url)
    req.responseType = 'arraybuffer'
    req.addEventListener('readystatechange', function (evt) {
      if (req.readyState !== 4) return
      try {
        audio.context.decodeAudioData(req.response, function (buffer) {
          audio.sounds[id] = buffer
          if (cb) cb()
        })
      } catch (e) {
        /*throw new Error(e.message
          + " / id: " + id
          + " / url: " + url
          + " / status: " + req.status
          + " / ArrayBuffer: " + (req.response instanceof ArrayBuffer)
          + " / byteLength: " + (req.response && req.response.byteLength ? req.response.byteLength : "undefined"));*/
        new Notification({
          id: 'audio-download-error',
          title: 'Problem',
          text:
            'For some reason, an audio download failed with a status of ' +
            req.status +
            '. ',
          target: '#piano',
          duration: 10000
        })
      }
    })
    req.send()
  }

  AudioEngineWeb.prototype.actualPlay = function (id, vol, time, part_id) {
    //the old play(), but with time insted of delay_ms.
    if (this.paused) return
    if (!this.sounds.hasOwnProperty(id)) return
    var source = this.context.createBufferSource()
    source.buffer = this.sounds[id]
    var gain = this.context.createGain()
    gain.gain.value = vol
    source.connect(gain)
    gain.connect(this.pianoGain)
    source.start(time)
    // Patch from ste-art remedies stuttering under heavy load
    if (this.playings[id]) {
      var playing = this.playings[id]
      playing.gain.gain.setValueAtTime(playing.gain.gain.value, time)
      playing.gain.gain.linearRampToValueAtTime(0.0, time + 0.2)
      playing.source.stop(time + 0.21)
      if (enableSynth && playing.voice) {
        playing.voice.stop(time)
      }
    }
    this.playings[id] = { source: source, gain: gain, part_id: part_id }

    if (enableSynth) {
      this.playings[id].voice = new synthVoice(id, time)
    }
  }

  AudioEngineWeb.prototype.play = function (id, vol, delay_ms, part_id) {
    if (!this.sounds.hasOwnProperty(id)) return
    var time = this.context.currentTime + delay_ms / 1000 //calculate time on note receive.
    var delay = delay_ms - this.threshold
    if (delay <= 0) this.actualPlay(id, vol, time, part_id)
    else {
      this.worker.postMessage({
        delay: delay,
        args: {
          action: 0 /*play*/,
          id: id,
          vol: vol,
          time: time,
          part_id: part_id
        }
      }) // but start scheduling right before play.
    }
  }

  AudioEngineWeb.prototype.actualStop = function (id, time, part_id) {
    if (
      this.playings.hasOwnProperty(id) &&
      this.playings[id] &&
      this.playings[id].part_id === part_id
    ) {
      var gain = this.playings[id].gain.gain
      gain.setValueAtTime(gain.value, time)
      gain.linearRampToValueAtTime(gain.value * 0.1, time + 0.16)
      gain.linearRampToValueAtTime(0.0, time + 0.4)
      this.playings[id].source.stop(time + 0.41)

      if (this.playings[id].voice) {
        this.playings[id].voice.stop(time)
      }

      this.playings[id] = null
    }
  }

  AudioEngineWeb.prototype.stop = function (id, delay_ms, part_id) {
    var time = this.context.currentTime + delay_ms / 1000
    var delay = delay_ms - this.threshold
    if (delay <= 0) this.actualStop(id, time, part_id)
    else {
      this.worker.postMessage({
        delay: delay,
        args: {
          action: 1 /*stop*/,
          id: id,
          time: time,
          part_id: part_id
        }
      })
    }
  }

  AudioEngineWeb.prototype.setVolume = function (vol) {
    AudioEngine.prototype.setVolume.call(this, vol)
    this.masterGain.gain.value = this.volume
  }

  AudioEngineWeb.prototype.resume = function () {
    this.paused = false
    this.context.resume()
  }

  // Renderer classes

  ////////////////////////////////////////////////////////////////

  var Renderer = function () { }

  Renderer.prototype.init = function (piano) {
    this.piano = piano
    this.resize()
    return this
  }

  Renderer.prototype.resize = function (width, height) {
    if (typeof width == 'undefined') width = $(this.piano.rootElement).width()
    if (typeof height == 'undefined') height = Math.floor(width * 0.2)
    $(this.piano.rootElement).css({
      height: height + 'px',
      marginTop: Math.floor($(window).height() / 2 - height / 2) + 'px'
    })
    this.width = width * window.devicePixelRatio
    this.height = height * window.devicePixelRatio
  }

  Renderer.prototype.visualize = function (key, color) { }

  var CanvasRenderer = function () {
    Renderer.call(this)
  }

  CanvasRenderer.prototype = new Renderer()

  CanvasRenderer.prototype.init = function (piano) {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    piano.rootElement.appendChild(this.canvas)

    Renderer.prototype.init.call(this, piano) // calls resize()

    // create render loop
    var self = this
    var render = function () {
      self.redraw()
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    // add event listeners
    var mouse_down = false
    var last_key = null
    $(piano.rootElement).mousedown(function (event) {
      mouse_down = true
      //event.stopPropagation();
      if (!gNoPreventDefault) event.preventDefault()

      var pos = CanvasRenderer.translateMouseEvent(event)
      var hit = self.getHit(pos.x, pos.y)
      if (hit) {
        press(hit.key.note, hit.v)
        last_key = hit.key
      }
    })
    piano.rootElement.addEventListener(
      'touchstart',
      function (event) {
        mouse_down = true
        //event.stopPropagation();
        if (!gNoPreventDefault) event.preventDefault()
        for (var i in event.changedTouches) {
          var pos = CanvasRenderer.translateMouseEvent(event.changedTouches[i])
          var hit = self.getHit(pos.x, pos.y)
          if (hit) {
            press(hit.key.note, hit.v)
            last_key = hit.key
          }
        }
      },
      false
    )
    $(window).mouseup(function (event) {
      if (last_key) {
        release(last_key.note)
      }
      mouse_down = false
      last_key = null
    })
    /*$(piano.rootElement).mousemove(function(event) {
      if(!mouse_down) return;
      var pos = CanvasRenderer.translateMouseEvent(event);
      var hit = self.getHit(pos.x, pos.y);
      if(hit && hit.key != last_key) {
        press(hit.key.note, hit.v);
        last_key = hit.key;
      }
    });*/

    return this
  }
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.arcTo(x + width, y, x + width, y + radius, radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    ctx.lineTo(x + radius, y + height)
    ctx.arcTo(x, y + height, x, y + height - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
  }

  let cornerRadius = 4

  CanvasRenderer.prototype.resize = function (width, height) {
    Renderer.prototype.resize.call(this, width, height)
    // Dynamically count white keys
    const whiteKeyCount = Object.values(this.piano.keys).filter(k => !k.sharp).length
    // Use dynamic key count instead of hardcoded 52
    if (this.width < whiteKeyCount * 2) this.width = whiteKeyCount * 2
    if (this.height < this.width * 0.2)
      this.height = Math.floor(this.width * 0.2)
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = this.width / window.devicePixelRatio + 'px'
    this.canvas.style.height = this.height / window.devicePixelRatio + 'px'

    // calculate key sizes
    this.whiteKeyWidth = Math.floor(this.width / whiteKeyCount)
    this.whiteKeyHeight = Math.floor(this.height * 0.9)
    this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.75)
    this.blackKeyHeight = Math.floor(this.height * 0.5)

    this.blackKeyOffset = Math.floor(
      this.whiteKeyWidth - this.blackKeyWidth / 2
    )
    this.keyMovement = Math.floor(this.whiteKeyHeight * 0.015)

    this.whiteBlipWidth = Math.floor(this.whiteKeyWidth * 0.7)
    this.whiteBlipHeight = Math.floor(this.whiteBlipWidth * 0.8)
    this.whiteBlipX = Math.floor((this.whiteKeyWidth - this.whiteBlipWidth) / 2)
    this.whiteBlipY = Math.floor(
      this.whiteKeyHeight - this.whiteBlipHeight * 1.2
    )
    this.blackBlipWidth = Math.floor(this.blackKeyWidth * 0.7)
    this.blackBlipHeight = Math.floor(this.blackBlipWidth * 0.8)
    this.blackBlipY = Math.floor(
      this.blackKeyHeight - this.blackBlipHeight * 1.2
    )
    this.blackBlipX = Math.floor((this.blackKeyWidth - this.blackBlipWidth) / 2)

    // prerender white key
    this.whiteKeyRender = document.createElement('canvas')
    this.whiteKeyRender.width = this.whiteKeyWidth
    this.whiteKeyRender.height = this.height + 10
    var ctx = this.whiteKeyRender.getContext('2d')
    if (ctx.createLinearGradient) {
      var gradient = ctx.createLinearGradient(0, 0, 0, this.whiteKeyHeight)
      gradient.addColorStop(0, '#eee')
      gradient.addColorStop(0.75, '#fff')
      gradient.addColorStop(1, '#dad4d4')
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = '#fff'
    }
    ctx.strokeStyle = '#000'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = 10

    roundRect(
      ctx,
      ctx.lineWidth / 2,
      ctx.lineWidth / 2,
      this.whiteKeyWidth - ctx.lineWidth,
      this.whiteKeyHeight - ctx.lineWidth,
      cornerRadius
    )
    ctx.stroke()

    ctx.lineWidth = 4

    roundRect(
      ctx,
      ctx.lineWidth / 2,
      ctx.lineWidth / 2,
      this.whiteKeyWidth - ctx.lineWidth,
      this.whiteKeyHeight - ctx.lineWidth,
      cornerRadius
    )
    ctx.fill()

    // prerender black key
    this.blackKeyRender = document.createElement('canvas')
    this.blackKeyRender.width = this.blackKeyWidth + 10
    this.blackKeyRender.height = this.blackKeyHeight + 10
    var ctx = this.blackKeyRender.getContext('2d')
    if (ctx.createLinearGradient) {
      var gradient = ctx.createLinearGradient(0, 0, 0, this.blackKeyHeight)
      gradient.addColorStop(0, '#000')
      gradient.addColorStop(1, '#444')
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = '#000'
    }
    ctx.strokeStyle = '#222'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = 8

    roundRect(
      ctx,
      ctx.lineWidth / 2,
      ctx.lineWidth / 2,
      this.blackKeyWidth - ctx.lineWidth,
      this.blackKeyHeight - ctx.lineWidth,
      cornerRadius
    )
    ctx.stroke()

    ctx.lineWidth = 4

    roundRect(
      ctx,
      ctx.lineWidth / 2,
      ctx.lineWidth / 2,
      this.blackKeyWidth - ctx.lineWidth,
      this.blackKeyHeight - ctx.lineWidth,
      cornerRadius
    )
    ctx.fill()

    // prerender shadows
    this.shadowRender = []
    var y = -this.canvas.height * 2
    for (var j = 0; j < 2; j++) {
      var canvas = document.createElement('canvas')
      this.shadowRender[j] = canvas
      canvas.width = this.canvas.width
      canvas.height = this.canvas.height
      var ctx = canvas.getContext('2d')
      var sharp = j ? true : false
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = 1
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = this.keyMovement * 3
      ctx.shadowOffsetY = -y + this.keyMovement
      if (sharp) {
        ctx.shadowOffsetX = this.keyMovement
      } else {
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = -y + this.keyMovement
      }
      for (var i in this.piano.keys) {
        if (!this.piano.keys.hasOwnProperty(i)) continue
        var key = this.piano.keys[i]
        if (key.sharp != sharp) continue

        if (key.sharp) {
          ctx.fillRect(
            this.blackKeyOffset +
            this.whiteKeyWidth * key.spatial +
            ctx.lineWidth / 2,
            y + ctx.lineWidth / 2,
            this.blackKeyWidth - ctx.lineWidth,
            this.blackKeyHeight - ctx.lineWidth
          )
        } else {
          ctx.fillRect(
            this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
            y + ctx.lineWidth / 2,
            this.whiteKeyWidth - ctx.lineWidth,
            this.whiteKeyHeight - ctx.lineWidth
          )
        }
      }
    }

    // update key rects
    for (var i in this.piano.keys) {
      if (!this.piano.keys.hasOwnProperty(i)) continue
      var key = this.piano.keys[i]
      if (key.sharp) {
        key.rect = new Rect(
          this.blackKeyOffset + this.whiteKeyWidth * key.spatial,
          0,
          this.blackKeyWidth,
          this.blackKeyHeight
        )
      } else {
        key.rect = new Rect(
          this.whiteKeyWidth * key.spatial,
          0,
          this.whiteKeyWidth,
          this.whiteKeyHeight
        )
      }
    }
  }

  CanvasRenderer.prototype.visualize = function (key, color) {
    key.timePlayed = Date.now()
    key.blips.push({ time: key.timePlayed, color: color })
  }

  CanvasRenderer.prototype.redraw = function () {
    var now = Date.now()
    var timeLoadedEnd = now - 1000
    var timePlayedEnd = now - 100
    var timeBlipEnd = now - 1000

    this.ctx.save()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // draw all keys
    for (var j = 0; j < 2; j++) {
      this.ctx.globalAlpha = 1.0
      this.ctx.drawImage(this.shadowRender[j], 0, 0)
      var sharp = j ? true : false
      for (var i in this.piano.keys) {
        if (!this.piano.keys.hasOwnProperty(i)) continue
        var key = this.piano.keys[i]
        if (key.sharp != sharp) continue

        if (!key.loaded) {
          this.ctx.globalAlpha = 0.2
        } else if (key.timeLoaded > timeLoadedEnd) {
          this.ctx.globalAlpha = ((now - key.timeLoaded) / 1000) * 0.8 + 0.2
        } else {
          this.ctx.globalAlpha = 1.0
        }
        var y = 0
        if (key.timePlayed > timePlayedEnd) {
          y = Math.floor(
            this.keyMovement - ((now - key.timePlayed) / 100) * this.keyMovement
          )
        }
        var x = Math.floor(
          key.sharp
            ? this.blackKeyOffset + this.whiteKeyWidth * key.spatial
            : this.whiteKeyWidth * key.spatial
        )
        var image = key.sharp ? this.blackKeyRender : this.whiteKeyRender
        this.ctx.drawImage(image, x, y)

        var keyName = key.baseNote[0].toUpperCase()
        if (sharp) keyName += '#'
        keyName += key.octave + 1

        if (gShowPianoNotes) {
          this.ctx.font = `${(key.sharp ? this.blackKeyWidth : this.whiteKeyWidth) / 2
            }px Arial`
          this.ctx.fillStyle = key.sharp ? 'white' : 'black'
          this.ctx.textAlign = 'center'

          // do two passes to render both sharps and flat names.
          if (keyName.includes('#')) {
            this.ctx.fillText(
              keyName,
              x + (key.sharp ? this.blackKeyWidth : this.whiteKeyWidth) / 2,
              y +
              (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight) -
              30 -
              this.ctx.lineWidth
            )
          }

          keyName = keyName.replace('C#', 'D♭')
          keyName = keyName.replace('D#', 'E♭')
          keyName = keyName.replace('F#', 'G♭')
          keyName = keyName.replace('G#', 'A♭')
          keyName = keyName.replace('A#', 'B♭')

          this.ctx.fillText(
            keyName,
            x + (key.sharp ? this.blackKeyWidth : this.whiteKeyWidth) / 2,
            y +
            (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight) -
            10 -
            this.ctx.lineWidth
          )
        }

        const highlightScale = BASIC_PIANO_SCALES[gHighlightScaleNotes]
        if (highlightScale && key.loaded) {
          keyName = keyName.replace('C#', 'D♭')
          keyName = keyName.replace('D#', 'E♭')
          keyName = keyName.replace('F#', 'G♭')
          keyName = keyName.replace('G#', 'A♭')
          keyName = keyName.replace('A#', 'B♭')
          const keynameNoOctave = keyName.slice(0, -1)
          if (highlightScale.includes(keynameNoOctave)) {
            const prev = this.ctx.globalAlpha
            this.ctx.globalAlpha = 0.3
            this.ctx.fillStyle = '#0f0'
            if (key.sharp) {
              this.ctx.fillRect(x, y, this.blackKeyWidth, this.blackKeyHeight)
            } else {
              this.ctx.fillRect(x, y, this.whiteKeyWidth, this.whiteKeyHeight)
            }
            this.ctx.globalAlpha = prev
          }
        }

        // render blips
        if (key.blips.length) {
          var alpha = this.ctx.globalAlpha
          var w, h
          if (key.sharp) {
            x += this.blackBlipX
            y = this.blackBlipY
            w = this.blackBlipWidth
            h = this.blackBlipHeight
          } else {
            x += this.whiteBlipX
            y = this.whiteBlipY
            w = this.whiteBlipWidth
            h = this.whiteBlipHeight
          }
          for (var b = 0; b < key.blips.length; b++) {
            var blip = key.blips[b]
            if (blip.time > timeBlipEnd) {
              this.ctx.fillStyle = blip.color
              this.ctx.globalAlpha = alpha - ((now - blip.time) / 1000) * alpha
              this.ctx.fillRect(x, y, w, h)
            } else {
              key.blips.splice(b, 1)
              --b
            }
            y -= Math.floor(h * 1.1)
          }
        }
      }
    }
    this.ctx.restore()
  }

  CanvasRenderer.prototype.renderNoteLyrics = function () {
    // render lyric
    for (var part_id in this.noteLyrics) {
      if (!this.noteLyrics.hasOwnProperty(part_id)) continue
      var lyric = this.noteLyrics[part_id]
      var lyric_x = x
      var lyric_y = this.whiteKeyHeight + 1
      this.ctx.fillStyle = key.lyric.color
      var alpha = this.ctx.globalAlpha
      this.ctx.globalAlpha = alpha - ((now - key.lyric.time) / 1000) * alpha
      this.ctx.fillRect(x, y, 10, 10)
    }
  }

  CanvasRenderer.prototype.getHit = function (x, y) {
    for (var j = 0; j < 2; j++) {
      var sharp = j ? false : true // black keys first
      for (var i in this.piano.keys) {
        if (!this.piano.keys.hasOwnProperty(i)) continue
        var key = this.piano.keys[i]
        if (key.sharp != sharp) continue
        if (key.rect.contains(x, y)) {
          var v = y / (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight)
          v += 0.25
          v *= DEFAULT_VELOCITY
          if (v > 1.0) v = 1.0
          return { key: key, v: v }
        }
      }
    }
    return null
  }

  CanvasRenderer.isSupported = function () {
    var canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  }

  CanvasRenderer.translateMouseEvent = function (evt) {
    var element = evt.target
    var offx = 0
    var offy = 0
    do {
      if (!element) break // wtf, wtf?
      offx += element.offsetLeft
      offy += element.offsetTop
    } while ((element = element.offsetParent))
    return {
      x: (evt.pageX - offx) * window.devicePixelRatio,
      y: (evt.pageY - offy) * window.devicePixelRatio
    }
  }

  // Soundpack Stuff by electrashave ♥

  ////////////////////////////////////////////////////////////////

  if (window.location.hostname === 'localhost') {
    var soundDomain = `http://${location.host}`
  } else {
    var soundDomain = 'https://multiplayerpiano.net'
  }

  function SoundSelector(piano) {
    this.initialized = false
    this.keys = piano.keys
    this.loading = {}
    this.notification
    this.packs = []
    this.piano = piano
    this.soundSelection = localStorage.soundSelection
      ? localStorage.soundSelection
      : 'mppclassic'
    this.addPack({
      name: 'MPP Classic',
      keys: Object.keys(this.piano.keys),
      ext: '.mp3',
      url: '/sounds/mppclassic/'
    })
  }

  SoundSelector.prototype.addPack = function (pack, load) {
    var self = this
    self.loading[pack.url || pack] = true
    function add(obj) {
      var added = false
      for (var i = 0; self.packs.length > i; i++) {
        if (obj.name == self.packs[i].name) {
          added = true
          break
        }
      }

      if (added) return console.warn('Sounds already added!!') //no adding soundpacks twice D:<

      if (obj.url.substr(obj.url.length - 1) != '/') obj.url = obj.url + '/'
      var html = document.createElement('li')
      html.classList = 'pack'
      html.innerText = obj.name + ' (' + obj.keys.length + ' keys)'
      html.onclick = function () {
        self.loadPack(obj.name)
        self.notification.close()
      }
      obj.html = html
      self.packs.push(obj)
      self.packs.sort(function (a, b) {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
      if (load) self.loadPack(obj.name)
      delete self.loading[obj.url]
    }

    if (typeof pack == 'string') {
      let useDomain = true
      if (pack.match(/^(http|https):\/\//i)) useDomain = false
      $.getJSON((useDomain ? soundDomain : '') + pack + '/info.json').done(
        function (json) {
          json.url = pack
          add(json)
        }
      )
    } else add(pack) //validate packs??
  }

  SoundSelector.prototype.addPacks = function (packs) {
    for (var i = 0; packs.length > i; i++) this.addPack(packs[i])
  }

  SoundSelector.prototype.init = function () {
    var self = this
    if (self.initialized)
      return console.warn('Sound selector already initialized!')

    if (!!Object.keys(self.loading).length)
      return setTimeout(function () {
        self.init()
      }, 250)

    $('#sound-btn').on('click', function () {
      if (document.getElementById('Notification-Sound-Selector') != null)
        return self.notification.close()
      var html = document.createElement('ul')
      //$(html).append("<p>Current Sound: " + self.soundSelection + "</p>");

      for (var i = 0; self.packs.length > i; i++) {
        var pack = self.packs[i]
        if (pack.name == self.soundSelection)
          pack.html.classList = 'pack enabled'
        else pack.html.classList = 'pack'
        pack.html.setAttribute('translated', '')
        html.appendChild(pack.html)
      }

      self.notification = new Notification({
        title: 'Sound Selector',
        html: html,
        id: 'Sound-Selector',
        duration: -1,
        target: '#sound-btn'
      })
    })
    self.initialized = true
    self.loadPack(self.soundSelection, true)
  }

  SoundSelector.prototype.loadPack = function (pack, f) {
    for (var i = 0; this.packs.length > i; i++) {
      var p = this.packs[i]
      if (p.name == pack) {
        pack = p
        break
      }
    }
    if (typeof pack == 'string') {
      console.warn('Sound pack does not exist! Loading default pack...')
      return this.loadPack('MPP Classic')
    }

    if (pack.name == this.soundSelection && !f) return
    if (pack.keys.length != Object.keys(this.piano.keys).length) {
      this.piano.keys = {}
      for (var i = 0; pack.keys.length > i; i++)
        this.piano.keys[pack.keys[i]] = this.keys[pack.keys[i]]
      this.piano.renderer.resize()
    }

    var self = this
    for (var i in this.piano.keys) {
      if (!this.piano.keys.hasOwnProperty(i)) continue
        ; (function () {
          var key = self.piano.keys[i]
          key.loaded = false
          let useDomain = true
          if (pack.url.match(/^(http|https):\/\//i)) useDomain = false
          self.piano.audio.load(
            key.note,
            (useDomain ? soundDomain : '') + pack.url + key.note + pack.ext,
            function () {
              key.loaded = true
              key.timeLoaded = Date.now()
            }
          )
        })()
    }
    if (localStorage) localStorage.soundSelection = pack.name
    this.soundSelection = pack.name
  }

  SoundSelector.prototype.removePack = function (name) {
    var found = false
    for (var i = 0; this.packs.length > i; i++) {
      var pack = this.packs[i]
      if (pack.name == name) {
        this.packs.splice(i, 1)
        if (pack.name == this.soundSelection) this.loadPack(this.packs[0].name) //add mpp default if none?
        break
      }
    }
    if (!found) console.warn('Sound pack not found!')
  }

  // Pianoctor

  ////////////////////////////////////////////////////////////////

  var PianoKey = function (note, octave) {
    this.note = note + octave
    this.baseNote = note
    this.octave = octave
    this.sharp = note.indexOf('s') != -1
    this.loaded = false
    this.timeLoaded = 0
    this.domElement = null
    this.timePlayed = 0
    this.blips = []
  }

  var Piano = function (rootElement) {
    var piano = this
    piano.rootElement = rootElement
    piano.keys = {}

    var white_spatial = 0
    var black_spatial = 0
    var black_it = 0
    var black_lut = [2, 1, 2, 1, 1]
    var addKey = function (note, octave) {
      var key = new PianoKey(note, octave)
      piano.keys[key.note] = key
      if (key.sharp) {
        key.spatial = black_spatial
        black_spatial += black_lut[black_it % 5]
        ++black_it
      } else {
        key.spatial = white_spatial
        ++white_spatial
      }
    }
    if (test_mode) {
      addKey('c', 2)
    } else {
      addKey('a', -1)
      addKey('as', -1)
      addKey('b', -1)
      var notes = 'c cs d ds e f fs g gs a as b'.split(' ')
      for (var oct = 0; oct < 7; oct++) {
        for (var i in notes) {
          addKey(notes[i], oct)
        }
      }
      addKey('c', 7)
    }

    this.renderer = new CanvasRenderer().init(this)

    window.addEventListener('resize', function () {
      piano.renderer.resize()
    })

    window.AudioContext =
      window.AudioContext || window.webkitAudioContext || undefined
    var audio_engine = AudioEngineWeb
    this.audio = new audio_engine().init()
  }

  Piano.prototype.play = function (note, vol, participant, delay_ms, lyric) {
    if (!this.keys.hasOwnProperty(note) || !participant) return
    var key = this.keys[note]
    if (key.loaded) this.audio.play(key.note, vol, delay_ms, participant.id)
    if (gMidiOutTest)
      gMidiOutTest(key.note, vol * 100, delay_ms, participant.id)
    var self = this
    setTimeout(function () {
      self.renderer.visualize(key, participant.color)
      if (lyric) {
      }
      var jq_namediv = $(participant.nameDiv)
      jq_namediv.addClass('play')
      setTimeout(function () {
        jq_namediv.removeClass('play')
      }, 30)
    }, delay_ms || 0)
  }

  Piano.prototype.stop = function (note, participant, delay_ms) {
    if (!this.keys.hasOwnProperty(note)) return
    var key = this.keys[note]
    if (key.loaded) this.audio.stop(key.note, delay_ms, participant.id)
    if (gMidiOutTest) gMidiOutTest(key.note, 0, delay_ms, participant.id)
  }

  var gPiano = new Piano(document.getElementById('piano'))

  var gSoundSelector = new SoundSelector(gPiano)
  gSoundSelector.addPacks(['/sounds/Emotional/', '/sounds/Emotional_2.0/'])
  //gSoundSelector.addPacks(["/sounds/Emotional_2.0/", "/sounds/Harp/", "/sounds/Music_Box/", "/sounds/Vintage_Upright/", "/sounds/Steinway_Grand/", "/sounds/Emotional/", "/sounds/Untitled/"]);
  gSoundSelector.init()

  var gAutoSustain = false
  var gSustain = false

  var gHeldNotes = {}
  var gSustainedNotes = {}

  function press(id, vol) {
    if (!gClient.preventsPlaying() && gNoteQuota.spend(1)) {
      gHeldNotes[id] = true
      gSustainedNotes[id] = true
      gPiano.play(
        id,
        vol !== undefined ? vol : DEFAULT_VELOCITY,
        gClient.getOwnParticipant(),
        0
      )
      gClient.startNote(id, vol)
    }
  }

  function release(id) {
    if (gHeldNotes[id]) {
      gHeldNotes[id] = false
      if ((gAutoSustain || gSustain) && !enableSynth) {
        gSustainedNotes[id] = true
      } else {
        if (gNoteQuota.spend(1)) {
          gPiano.stop(id, gClient.getOwnParticipant(), 0)
          gClient.stopNote(id)
          gSustainedNotes[id] = false
        }
      }
    }
  }

  function pressSustain() {
    gSustain = true
  }

  function releaseSustain() {
    gSustain = false
    if (!gAutoSustain) {
      for (var id in gSustainedNotes) {
        if (
          gSustainedNotes.hasOwnProperty(id) &&
          gSustainedNotes[id] &&
          !gHeldNotes[id]
        ) {
          gSustainedNotes[id] = false
          if (gNoteQuota.spend(1)) {
            gPiano.stop(id, gClient.getOwnParticipant(), 0)
            gClient.stopNote(id)
          }
        }
      }
    }
  }

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  function getRoomNameFromURL() {
    var channel_id = decodeURIComponent(window.location.pathname)
    if (channel_id.substr(0, 1) == '/') channel_id = channel_id.substr(1)
    if (!channel_id) {
      channel_id = getParameterByName('c')
    }
    if (!channel_id) channel_id = 'lobby'
    return channel_id
  }

  // internet science

  ////////////////////////////////////////////////////////////////

  var channel_id = getRoomNameFromURL()

  var loginInfo
  if (getParameterByName('callback') === 'discord') {
    var code = getParameterByName('code')
    if (code) {
      loginInfo = {
        type: 'discord',
        code
      }
    }
    history.pushState({ name: 'lobby' }, 'Piano > lobby', '/')
    channel_id = 'lobby'
  }

  var wssport = 8443
  var isSecure = location.protocol == 'https:'
  if (window.location.hostname === 'localhost') {
    var gClient = new Client(`${isSecure ? 'wss' : 'ws'}://${location.host}`)
  } else {
    var gClient = new Client('wss://mpp.smp-meow.net/')
  }
  if (loginInfo) {
    gClient.setLoginInfo(loginInfo)
  }
  gClient.setChannel(channel_id)

  gClient.on('disconnect', function (evt) {
    //console.log(evt);
  })

  var tabIsActive = true
  var youreMentioned = false
  var youreReplied = false

  window.addEventListener('focus', function (event) {
    tabIsActive = true
    youreMentioned = false
    youreReplied = false
    var count = Object.keys(MPP.client.ppl).length
    if (count > 0) {
      document.title = 'Pianowo (' + count + ')'
    } else {
      document.title = 'Multiplayer Piano! >w<'
    }
  })

  window.addEventListener('blur', function (event) {
    tabIsActive = false
  })

    // Setting status
    ; (function () {
      gClient.on('status', function (status) {
        $('#status').text(status)
      })
      gClient.on('count', function (count) {
        if (count > 0) {
          $('#status').html(
            '<span class="number" translated>' +
            count +
            '</span> ' +
            window.i18nextify.i18next.t('people are playing', { count })
          )
          if (!tabIsActive) {
            if (youreMentioned || youreReplied) {
              return
            }
          }
          document.title = 'Pianowo (' + count + ')'
        } else {
          document.title = 'Multiplayer Piano! >w<'
        }
      })
    })()

    // Show moderator buttons and screen
    ; (function () {
      let receivedHi = false
      gClient.on('hi', function (msg) {
        if (receivedHi) return
        receivedHi = true

        const motdList = [
          '이 사이트는 소리가 많이 나요! 소리를 조절하고 이용해 주세요! >w<',
          '볼륨을 낮춰주세요~ 깜짝 놀랄 수 있어요! ♪',
          '주의! 사운드 폭격 incoming~ 🎵 볼륨 체크 필수!',
          '소리 조심! 갑자기 클 수 있어요 >_<',
          '이 사이트는 MIDI In/Out을 지원하여 다양한 사운드를 제공합니다! 🎹',
          '이 사이트는 Soft Midi Player가 편집했어요! 원본은 https://multiplayerpiano.net 이에요!',
          '채팅은 512자 제한이 있어요. 더 긴 메시지는 나누어 보내주세요!',
          '채팅을 보고 싶지 않다면 클라이언트 설정에서 끌 수 있어요. 원치 않으면 끄세요!',
          'lobby나 test/로 시작하는 방에는 왕관이 없어요! 참고해주세요~ 👑',
          '이 사이트는 소리설정을 지원해요! 원하는 사운드를 선택해보세요! 🎶',
          '으아 심심하다..',
          '혹시 외로우시나요?? 이 사이트에서는 다른 사람들과 함께 채팅하고 연주할 수 있어요! 🎹',
          '혹시 이 사이트가 마음에 드시나요? 그렇다면 친구들에게도 알려주세요! 함께 놀아요! 🎉',
          '혹시 친근한 사이트 분위기를 원하시나요? 그렇다면 이 사이트는 당신을 위한 곳이에요! 😊',
          '혹시 친구를 사귀고 싶으신가요? 이 사이트에서는 다른 사람들과 함께 채팅하고 연주하며 같이 친구가 될 수 있어요! 🎶',
          '멀티피아노라는 취지는 전쟁터같은 사회에서 마음의 안락을 위해 서로 음악으로 다듬어주는거예요..'
        ]

        if (!msg.motd) {
          msg.motd = motdList[Math.floor(Math.random() * motdList.length)]
        }

        document.getElementById('motd-text').innerHTML = msg.motd
        openModal('#motd')
        $(document).off('keydown', modalHandleEsc)

        var user_interact = function (evt) {
          if (
            (evt.path || (evt.composedPath && evt.composedPath())).includes(
              document.getElementById('motd')
            ) ||
            evt.target === document.getElementById('motd')
          ) {
            closeModal()
          }
          document.removeEventListener('click', user_interact)
          gPiano.audio.resume()
        }
        document.addEventListener('click', user_interact)

        if (gClient.permissions.clearChat) {
          $('#clearchat-btn').show()
        }
        if (gClient.permissions.vanish) {
          $('#vanish-btn').show()
        } else {
          $('#vanish-btn').hide()
        }
      })
    })()

  var participantTouchhandler //declare this outside of the smaller functions so it can be used below and setup later

  // Handle changes to participants
  function hexToRgba(hex, alpha = 0.9) {
    hex = hex.replace(/^#/, '')
    let r = parseInt(hex.substring(0, 2), 16)
    let g = parseInt(hex.substring(2, 4), 16)
    let b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  ; (function () {
    function setupParticipantDivs(part) {
      if (shouldHideUser(part)) return
      var hadNameDiv = Boolean(part.nameDiv)

      var nameDiv
      if (hadNameDiv) {
        nameDiv = part.nameDiv
        $(nameDiv).empty()
      } else {
        nameDiv = document.createElement('div')
        nameDiv.addEventListener('mousedown', e =>
          participantTouchhandler(e, nameDiv)
        )
        nameDiv.addEventListener('touchstart', e =>
          participantTouchhandler(e, nameDiv)
        )
        nameDiv.style.display = 'none'
        $(nameDiv).fadeTo(2000, 0.9)
        nameDiv.id = 'namediv-' + part._id
        nameDiv.className = 'name'
        nameDiv.participantId = part.id
        $('#names')[0].appendChild(nameDiv)
        part.nameDiv = nameDiv
      }

      nameDiv.style.backgroundColor = hexToRgba(part.color) || '#777'
      var tagText = typeof part.tag === 'object' ? part.tag.text : part.tag
      if (tagText === 'BOT') nameDiv.title = 'This is an authorized bot.'
      if (tagText === 'MOD')
        nameDiv.title = 'This user is an official moderator of the site.'
      if (tagText === 'ADMIN')
        nameDiv.title = 'This user is an official administrator of the site.'
      if (tagText === 'OWNER')
        nameDiv.title = 'This user is the owner of the site.'
      if (tagText === 'MEDIA')
        nameDiv.title =
          'This is a well known person on Twitch, Youtube, or another platform.'

      updateLabels(part)

      const existingAfkDiv = document.getElementById('afktag-' + part._id)
      if (existingAfkDiv) existingAfkDiv.remove()

      var hasOtherDiv = false
      if (part.vanished) {
        hasOtherDiv = true
        var vanishDiv = document.createElement('div')
        vanishDiv.className = 'nametag'
        vanishDiv.textContent = 'VANISH'
        vanishDiv.style.backgroundColor = '#00ffcc'
        vanishDiv.id = 'namevanish-' + part._id
        part.nameDiv.appendChild(vanishDiv)
      }
      if (part.tag) {
        hasOtherDiv = true
        var tagDiv = document.createElement('div')
        tagDiv.className = 'nametag'
        tagDiv.textContent = tagText || ''
        tagDiv.style.backgroundColor = tagColor(part.tag)
        tagDiv.id = 'nametag-' + part._id
        part.nameDiv.appendChild(tagDiv)
      }
      if (part.afk) {
        var afkDiv = document.createElement('div')
        afkDiv.className = 'nametag'
        afkDiv.textContent = 'AFK'
        afkDiv.style.backgroundColor = '#00000040'
        afkDiv.style['margin-left'] = '5px'
        afkDiv.style['margin-right'] = '0px'
        afkDiv.style.float = 'right'
        afkDiv.id = 'afktag-' + part._id
        part.nameDiv.appendChild(afkDiv)
      }

      var textDiv = document.createElement('div')
      textDiv.className = 'nametext'
      textDiv.textContent = part.name || ''
      textDiv.id = 'nametext-' + part._id
      if (hasOtherDiv) textDiv.style.float = 'left'
      part.nameDiv.appendChild(textDiv)
      part.nameDiv.setAttribute('translated', '')

      const specialIcons = {
        '2c3dcc66b5669ae2222f422a': {
          src: 'bow.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(2)'
        },
        'c999cae925319d41f8265d04': {
          src: 'bow.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(2)'
        },
        '974de1896994239c21245813': {
          src: 'bow.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(2)'
        },
        'd14d8d62104422f12e5e79ff': {
          src: 'bow.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(2)'
        },
        'ca004a44cdd373fb63bed8c1': {
          src: 'bow.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(2)'
        },
        'cf66dea672311a11e5cf7bc4': {
          src: 'PG.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(1.2)'
        },
        '109df8ff7ff921507ea73b65': {
          src: 'coffee.svg',
          top: '-6px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(1)'
        },
        '3ca19d53d4b258dfcf1fa698': {
          src: '2.svg',
          top: '-4px',
          right: '0px',
          width: '16px',
          height: '16px',
          transform: 'rotate(35deg) scale(1.7)'
        }
      }

      if (specialIcons[part.id]) {
        const iconConfig = specialIcons[part.id]
        const icon = document.createElement('img')
        icon.src = iconConfig.src
        icon.className = 'special-icon'
        part.nameDiv.style.position = 'relative'
        icon.style.position = 'absolute'
        icon.style.top = iconConfig.top
        icon.style.right = iconConfig.right
        icon.style.width = iconConfig.width
        icon.style.height = iconConfig.height
        icon.style.transform = iconConfig.transform
        icon.style.transformOrigin = 'center center'
        part.nameDiv.appendChild(icon)
      }

      var arr = $('#names .name')
      arr.sort(function (a, b) {
        if (a.id > b.id) return 1
        else if (a.id < b.id) return -1
        else return 0
      })
      $('#names').html(arr)
    }

    gClient.on('participant added', function (part) {
      if (shouldHideUser(part)) return

      part.displayX = 150
      part.displayY = 50
      var tagText = typeof part.tag === 'object' ? part.tag.text : part.tag

      // add nameDiv
      setupParticipantDivs(part)

      // add cursorDiv
      if (
        (gClient.participantId !== part.id || gSeeOwnCursor) &&
        !gCursorHides.includes(part.id) &&
        !gHideAllCursors
      ) {
        var div = document.createElement('div')
        div.className = 'cursor ' + part.id
        div.style.display = 'none'
        part.cursorDiv = $('#cursors')[0].appendChild(div)
        $(part.cursorDiv).fadeTo(2000, 0.9)

        var div = document.createElement('div')
        div.className = 'name'
        div.style.backgroundColor = hexToRgba(part.color)

        if (part.tag) {
          var tagDiv = document.createElement('span')
          tagDiv.className = 'curtag'
          tagDiv.textContent = tagText || ''
          tagDiv.style.backgroundColor = hexToRgba(tagColor(part.tag))
          tagDiv.id = 'nametag-' + part._id
          div.appendChild(tagDiv)
        }

        var namep = document.createElement('span')
        namep.className = 'nametext'
        namep.textContent = part.name || ''
        // namep.style.backgroundColor = part.color || "#777"
        div.setAttribute('translated', '')
        div.appendChild(namep)
        part.cursorDiv.appendChild(div)

        const specialIcons = {
          '2c3dcc66b5669ae2222f422a': {
            src: 'bow.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(2)'
          },
          'c999cae925319d41f8265d04': {
            src: 'bow.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(2)'
          },
          '974de1896994239c21245813': {
            src: 'bow.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(2)'
          },
          'd14d8d62104422f12e5e79ff': {
            src: 'bow.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(2)'
          },
          'ca004a44cdd373fb63bed8c1': {
            src: 'bow.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(2)'
          },
          'cf66dea672311a11e5cf7bc4': {
            src: 'PG.svg',
            top: '-6px',
            right: '-3px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(1.2)'
          },
          '109df8ff7ff921507ea73b65': {
            src: 'coffee.svg',
            top: '-8px',
            right: '-4px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(1)'
          },
          '3ca19d53d4b258dfcf1fa698': {
            src: '2.svg',
            top: '-4px',
            right: '0px',
            width: '16px',
            height: '16px',
            transform: 'rotate(35deg) scale(1.7)'
          }
        }
        if (specialIcons[part.id]) {
          const iconConfig = specialIcons[part.id]
          const icon = document.createElement('img')
          icon.src = iconConfig.src
          icon.className = 'special-icon'
          div.style.position = 'relative'
          icon.style.position = 'absolute'
          icon.style.top = iconConfig.top
          icon.style.right = iconConfig.right
          icon.style.width = iconConfig.width
          icon.style.height = iconConfig.height
          icon.style.transform = iconConfig.transform
          icon.style.transformOrigin = 'center center'
          div.appendChild(icon)
        }
      } else {
        part.cursorDiv = undefined
      }
    })
    gClient.on('participant removed', function (part) {
      if (shouldHideUser(part)) return
      // remove nameDiv
      var nd = $(part.nameDiv)
      var cd = $(part.cursorDiv)
      cd.fadeOut(2000)
      nd.fadeOut(2000, function () {
        nd.remove()
        cd.remove()
        part.nameDiv = undefined
        part.cursorDiv = undefined
      })
    })
    gClient.on('participant update', function (part) {
      if (shouldHideUser(part)) return
      var name = part.name || ''
      var color = part.color || '#777'
      setupParticipantDivs(part)
      $(part.cursorDiv).find('.name .nametext').text(name)
      $(part.cursorDiv).find('.name').css('background-color', color)
    })
    gClient.on('ch', function (msg) {
      for (var id in gClient.ppl) {
        if (gClient.ppl.hasOwnProperty(id)) {
          var part = gClient.ppl[id]
          updateLabels(part)
        }
      }
    })
    gClient.on('participant added', function (part) {
      if (shouldHideUser(part)) return
      updateLabels(part)
    })
    function updateLabels(part) {
      if (part.id === gClient.participantId) {
        $(part.nameDiv).addClass('me')
      } else {
        $(part.nameDiv).removeClass('me')
      }
      if (
        gClient.channel.crown &&
        gClient.channel.crown.participantId === part.id
      ) {
        $(part.nameDiv).addClass('owner')
        $(part.cursorDiv).addClass('owner')
      } else {
        $(part.nameDiv).removeClass('owner')
        $(part.cursorDiv).removeClass('owner')
      }
      if (gPianoMutes.indexOf(part._id) !== -1) {
        $(part.nameDiv).addClass('muted-notes')
      } else {
        $(part.nameDiv).removeClass('muted-notes')
      }
      if (gChatMutes.indexOf(part._id) !== -1) {
        $(part.nameDiv).addClass('muted-chat')
      } else {
        $(part.nameDiv).removeClass('muted-chat')
      }
    }

    function tagColor(tag) {
      if (typeof tag === 'object') return tag.color
      if (tag === 'BOT') return '#55f'
      if (tag === 'OWNER') return '#a00'
      if (tag === 'ADMIN') return '#f55'
      if (tag === 'MOD') return '#0a0'
      if (tag === 'MEDIA') return '#f5f'
      return '#777'
    }
    function updateCursor(msg) {
      const part = gClient.ppl[msg.id]
      if (shouldHideUser(part)) return
      if (part && part.cursorDiv) {
        if (gSmoothCursor) {
          part.cursorDiv.style.transform =
            'translate3d(' + msg.x + 'vw, ' + msg.y + 'vh, 0)'
        } else {
          part.cursorDiv.style.left = msg.x + '%'
          part.cursorDiv.style.top = msg.y + '%'
        }
      }
    }
    gClient.on('m', updateCursor)
    gClient.on('participant added', updateCursor)
    gClient.on('afk', msg => {
      const part = gClient.ppl[msg.id]
      if (!part) return
      part.afk = msg.state
      setupParticipantDivs(part)
    })
  })()

    // Handle changes to crown
    ; (function () {
      var jqcrown = $('<div id="crown"></div>').appendTo(document.body).hide()
      var jqcountdown = $('<span></span>').appendTo(jqcrown)
      var countdown_interval
      jqcrown.click(function () {
        gClient.sendArray([{ m: 'chown', id: gClient.participantId }])
      })
      gClient.on('ch', function (msg) {
        if (msg.ch.crown) {
          var crown = msg.ch.crown
          if (!crown.participantId || !gClient.ppl[crown.participantId]) {
            var land_time = crown.time + 2000 - gClient.serverTimeOffset
            var avail_time = crown.time + 15000 - gClient.serverTimeOffset
            jqcountdown.text('')
            jqcrown.show()
            if (land_time - Date.now() <= 0) {
              jqcrown.css({
                left: crown.endPos.x + '%',
                top: crown.endPos.y + '%'
              })
            } else {
              jqcrown.css({
                left: crown.startPos.x + '%',
                top: crown.startPos.y + '%'
              })
              jqcrown.addClass('spin')
              jqcrown.animate(
                {
                  left: crown.endPos.x + '%',
                  top: crown.endPos.y + '%'
                },
                2000,
                'linear',
                function () {
                  jqcrown.removeClass('spin')
                }
              )
            }
            clearInterval(countdown_interval)
            countdown_interval = setInterval(function () {
              var time = Date.now()
              if (time >= land_time) {
                var ms = avail_time - time
                if (ms > 0) {
                  jqcountdown.text(Math.ceil(ms / 1000) + 's')
                } else {
                  jqcountdown.text('')
                  clearInterval(countdown_interval)
                }
              }
            }, 1000)
          } else {
            jqcrown.hide()
          }
        } else {
          jqcrown.hide()
        }
      })
      gClient.on('disconnect', function () {
        jqcrown.fadeOut(2000)
      })
    })()

  // Playing notes
  gClient.on('n', function (msg) {
    var t = msg.t - gClient.serverTimeOffset + TIMING_TARGET - Date.now()
    var participant = gClient.findParticipantById(msg.p)
    if (gPianoMutes.indexOf(participant._id) !== -1) return

    if (gClient.findParticipantById(msg.p).tag) {
      if (
        gHideBotUsers == true &&
        gClient.findParticipantById(msg.p).tag.text == 'BOT'
      )
        return
    }
    for (var i = 0; i < msg.n.length; i++) {
      var note = msg.n[i]
      var ms = t + (note.d || 0)
      if (ms < 0) {
        ms = 0
      } else if (ms > 10000) continue
      if (note.s) {
        gPiano.stop(note.n, participant, ms)
      } else {
        var vel =
          typeof note.v !== 'undefined' ? parseFloat(note.v) : DEFAULT_VELOCITY
        if (!vel) vel = 0
        else if (vel < 0) vel = 0
        else if (vel > 1) vel = 1
        gPiano.play(note.n, vel, participant, ms)
        if (enableSynth) {
          gPiano.stop(note.n, participant, ms + 1000)
        }
      }
    }
  })

  // Send cursor updates
  var mx = 0,
    last_mx = -10,
    my = 0,
    last_my = -10
  setInterval(function () {
    if (Math.abs(mx - last_mx) > 0.1 || Math.abs(my - last_my) > 0.1) {
      last_mx = mx
      last_my = my
      gClient.sendArray([{ m: 'm', x: mx, y: my }])
      if (gSeeOwnCursor) {
        gClient.emit('m', {
          m: 'm',
          id: gClient.participantId,
          x: mx,
          y: my
        })
      }
      var part = gClient.getOwnParticipant()
      if (part) {
        part.x = mx
        part.y = my
      }
    }
  }, 50)
  $(document).mousemove(function (event) {
    mx = ((event.pageX / $(window).width()) * 100).toFixed(2)
    my = ((event.pageY / $(window).height()) * 100).toFixed(2)
  })

    // Room settings button
    ; (function () {
      gClient.on('ch', function (msg) {
        if (gClient.isOwner() || gClient.permissions.chsetAnywhere) {
          $('#room-settings-btn').show()
        } else {
          $('#room-settings-btn').hide()
        }
        if (
          !gClient.channel.settings.lobby &&
          (gClient.permissions.chownAnywhere ||
            gClient.channel.settings.owner_id === gClient.user._id)
        ) {
          $('#getcrown-btn').show()
        } else {
          $('#getcrown-btn').hide()
        }
      })
      $('#room-settings-btn').click(function (evt) {
        if (
          gClient.channel &&
          (gClient.isOwner() || gClient.permissions.chsetAnywhere)
        ) {
          var settings = gClient.channel.settings
          openModal('#room-settings')
          setTimeout(function () {
            $('#room-settings .checkbox[name=visible]').prop(
              'checked',
              settings.visible
            )
            $('#room-settings .checkbox[name=chat]').prop(
              'checked',
              settings.chat
            )
            $('#room-settings .checkbox[name=crownsolo]').prop(
              'checked',
              settings.crownsolo
            )
            $('#room-settings .checkbox[name=nocussing]').prop(
              'checked',
              settings['no cussing']
            )
            $('#room-settings .checkbox[name=noindex]').prop(
              'checked',
              settings.noindex
            )
            $('#room-settings .checkbox[name=allowBots]').prop(
              'checked',
              settings.allowBots
            )
            $('#room-settings input[name=color]').val(settings.color)
            $('#room-settings input[name=color2]').val(settings.color2)
            $('#room-settings input[name=limit]').val(settings.limit)
          }, 100)
        }
      })
      $('#room-settings .submit').click(function () {
        var settings = {
          visible: $('#room-settings .checkbox[name=visible]').is(':checked'),
          chat: $('#room-settings .checkbox[name=chat]').is(':checked'),
          crownsolo: $('#room-settings .checkbox[name=crownsolo]').is(':checked'),
          'no cussing': $('#room-settings .checkbox[name=nocussing]').is(
            ':checked'
          ),
          noindex: $('#room-settings .checkbox[name=noindex]').is(':checked'),
          allowBots: $('#room-settings .checkbox[name=allowBots]').is(':checked'),
          color: $('#room-settings input[name=color]').val(),
          color2: $('#room-settings input[name=color2]').val(),
          limit: $('#room-settings input[name=limit]').val()
        }
        gClient.setChannelSettings(settings)
        closeModal()
      })
      let DCNotification = null
      $('#room-settings .drop-crown').click(function () {
        if (DCNotification) {
          DCNotification.close()
          DCNotification = null
          return
        }

        const n = new Notification({
          title: 'Drop crown!',
          html: `
            <div style="padding: 10px;">
                <p style="text-align: center;">Are you sure you want to drop crown..? o.o;;</p>
                <div style="text-align: center; margin-top: 15px;">
                    <button id="confirm-yes" class="dialog-btn dialog-btn-yes" style="margin-right: 10px;">Yes</button>
                    <button id="confirm-no" class="dialog-btn dialog-btn-no">No</button>
                </div>
            </div>
        `,
          duration: -1,
          target: '.drop-crown',
          zIndex: '12000',
          onopen: function (n) {
            n.domElement.find('#confirm-yes').on('click', function () {
              gClient.sendArray([{ m: 'chown' }])
              n.close()
              closeModal()
                       })
            n.domElement.find('#confirm-no').on('click', function () {
              n.close()
            })
          }
        })

        DCNotification = n

        n.on('close', function () {
          DCNotification = null
        })
      })
    })()

  let clearChatNotification = null

  $('#clearchat-btn').click(function (evt) {
    if (clearChatNotification) {
      clearChatNotification.close()
      clearChatNotification = null
      return
    }

    const n = new Notification({
      title: 'Clear Chat',
      html: `
            <div style="padding: 10px;">
                <p style="text-align: center;">Are you sure you want to clear chat?</p>
                <div style="text-align: center; margin-top: 15px;">
                    <button id="confirm-yes" class="dialog-btn dialog-btn-yes" style="margin-right: 10px;">Yes</button>
                    <button id="confirm-no" class="dialog-btn dialog-btn-no">No</button>
                </div>
            </div>
        `,
      duration: -1,
      target: '#clearchat-btn',
      onopen: function (n) {
        n.domElement.find('#confirm-yes').on('click', function () {
          gClient.sendArray([{ m: 'clearchat' }])
          n.close()
        })
        n.domElement.find('#confirm-no').on('click', function () {
          n.close()
        })
      }
    })

    clearChatNotification = n

    n.on('close', function () {
      clearChatNotification = null
    })
  })

  var button = document.getElementById('volume-container-btn')
  var notification
  const buttons = document.getElementById('buttons')

  document.getElementById('toggle-btn').addEventListener('click', function () {
    const isShowing = buttons.classList.contains('show-buttons')
    const toggleBtn = document.getElementById('toggle-btn')

    if (isShowing) {
      buttons.classList.remove('show-buttons')
      buttons.classList.add('hide-buttons')
      toggleBtn.classList.remove('toggled') // 버튼 상태 반영
    } else {
      setTimeout(() => {
        buttons.classList.remove('hide-buttons')
        buttons.classList.add('show-buttons')
        toggleBtn.classList.add('toggled') // 버튼 상태 반영
      }, 10)
    }
  })

  button.addEventListener('click', function () {
    if (notification) {
      notification.close()
    } else {
      showVolume()
    }
  })

  function showVolume() {
    var html = document.createElement('div')
    html.innerHTML = `
    <div id="volume">
        <input id="volume-slider" type="range" min="0" max="100" />
        <label id="volume-label">Volume: 50%</label>
    </div>
  `

    notification = new Notification({
      title: 'Volume',
      html: html,
      duration: -1,
      target: '#volume-container-btn'
    })

    // MutationObserver 사용
    const observer = new MutationObserver(() => {
      const volume_slider = document.getElementById('volume-slider')
      const volume_label = document.getElementById('volume-label')
      if (!volume_slider || !volume_label || !gPiano.audio) return

      volume_slider.value = gPiano.audio.volume * 100
      volume_label.textContent =
        'Volume: ' + Math.floor(gPiano.audio.volume * 100) + '%'

      function onSliderChange() {
        var v = volume_slider.value / 100
        gPiano.audio.setVolume(v)
        if (window.localStorage) localStorage.volume = v
        volume_label.textContent = 'Volume: ' + Math.floor(v * 100) + '%'
      }

      volume_slider.addEventListener('input', onSliderChange)

      notification.on('close', function () {
        volume_slider.removeEventListener('input', onSliderChange)
        notification = null
        observer.disconnect()
      })

      observer.disconnect() // 이벤트 연결 후 observer 종료
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  // Get crown button
  $('#getcrown-btn').click(function (evt) {
    gClient.sendArray([{ m: 'chown', id: MPP.client.getOwnParticipant().id }])
  })

  // Vanish or unvanish button
  $('#vanish-btn').click(function (evt) {
    gClient.sendArray([
      { m: 'v', vanish: !gClient.getOwnParticipant().vanished }
    ])
  })
  gClient.on('participant update', part => {
    if (part._id === gClient.getOwnParticipant()._id) {
      if (part.vanished) {
        $('#vanish-btn').text('Unvanish')
      } else {
        $('#vanish-btn').text('Vanish')
      }
    }
  })
  gClient.on('participant added', part => {
    if (part._id === gClient.getOwnParticipant()._id) {
      if (part.vanished) {
        $('#vanish-btn').text('Unvanish')
      } else {
        $('#vanish-btn').text('Vanish')
      }
    }
  })

  // Handle notifications
  gClient.on('notification', function (msg) {
    new Notification(msg)
  })

  // Don't foget spin
  gClient.on('ch', function (msg) {
    var chidlo = msg.ch._id.toLowerCase()
    if (chidlo === 'spin' || chidlo.substr(-5) === '/spin') {
      $('#piano').addClass('spin')
    } else {
      $('#piano').removeClass('spin')
    }
    if (chidlo === '/test') { new Notification({ title: 'Notice', text: 'Test', duration: 10000, target: '#piano' }) }
  })

  /*function eb() {
    if(gClient.channel && gClient.channel._id.toLowerCase() === "test/fishing") {
      ebsprite.start(gClient);
    } else {
      ebsprite.stop();
    }
  }
  if(ebsprite) {
    gClient.on("ch", eb);
    eb();
  }*/

  // Crownsolo notice
  gClient.on('ch', function (msg) {
    let notice = ''
    let has_notice = false
    if (msg.ch.settings.crownsolo) {
      has_notice = true
      notice += '<p>This room is set to "Only the owner can play!"</p>'
    }
    if (msg.ch.settings['no cussing']) {
      has_notice = true
      notice += '<p>This room is set to "No Cussing!"</p>'
    }
    let notice_div = $('#room-notice')
    if (has_notice) {
      notice_div.html(notice)
      if (notice_div.is(':hidden')) notice_div.fadeIn(1000)
    } else {
      if (notice_div.is(':visible')) notice_div.fadeOut(1000)
    }
  })
  gClient.on('disconnect', function () {
    $('#room-notice').fadeOut(1000)
  })

  var gPianoMutes = (localStorage.pianoMutes ? localStorage.pianoMutes : '')
    .split(',')
    .filter(v => v)
  var gChatMutes = (localStorage.chatMutes ? localStorage.chatMutes : '')
    .split(',')
    .filter(v => v)
  var gShowIdsInChat = localStorage.showIdsInChat == 'true'
  var gShowTimestampsInChat = localStorage.showTimestampsInChat == 'true'
  var gChatSoundInChat = localStorage.chatSoundInChat == 'true'
  var gSpoilerMediaInChat = localStorage.spoilerMediaInChat == 'true'
  var gNoChatColors = localStorage.noChatColors == 'true'
  var gNoBackgroundColor = localStorage.noBackgroundColor == 'true'
  var gOutputOwnNotes = localStorage.outputOwnNotes
    ? localStorage.outputOwnNotes == 'true'
    : true
  var gVirtualPianoLayout = localStorage.virtualPianoLayout == 'true'
  var gSmoothCursor = localStorage.smoothCursor == 'true'
  var gShowChatTooltips = localStorage.showChatTooltips == 'true'
  var gShowPianoNotes = localStorage.showPianoNotes == 'true'
  var gHighlightScaleNotes = localStorage.highlightScaleNotes
  var gCursorHides = (localStorage.cursorHides ? localStorage.cursorHides : '')
    .split(',')
    .filter(v => v)
  var gHideAllCursors = localStorage.hideAllCursors == 'true'
  var gHidePiano = localStorage.hidePiano == 'true'
  var gHideChat = localStorage.hideChat == 'true'
  var gOffAniChat = localStorage.OffAniChat == 'true'
  var gNoPreventDefault = localStorage.noPreventDefault == 'true'
  var gHideBotUsers = localStorage.hideBotUsers == 'true'
  var gPianoKeys = localStorage.pianoKeys == 'false'
  var gSnowflakes =
    new Date().getMonth() === 11 && localStorage.snowflakes !== 'false'

  //   var gWarnOnLinks = localStorage.warnOnLinks ? loalStorage.warnOnLinks == "true" : true;
  var gDisableMIDIDrumChannel = localStorage.disableMIDIDrumChannel
    ? localStorage.disableMIDIDrumChannel == 'true'
    : true

  function shouldShowSnowflakes() {
    const snowflakes = document.querySelector('.snowflakes')
    if (gSnowflakes) {
      snowflakes.style.visibility = 'visible'
    } else {
      snowflakes.style.visibility = 'hidden'
    }
  }

  shouldShowSnowflakes()
  // This code is not written specficially for readibility, it is a heavily used function and performance matters.
  // If someone finds this code and knows a more performant way to do this (with proof of it being more performant)
  // it may be replaced with the more performant code.
  // Returns true if we should hide the user, and returns false when we should not.
  function shouldHideUser(user) {
    if (gHideBotUsers) {
      if (user) {
        if (user.tag && user.tag.text === 'BOT') {
          return true
        } else {
          return false
        }
      }
    } else {
      return false
    }
  }

  // Hide piano attribute
  if (gHidePiano) {
    $('#piano').hide()
  } else {
    $('#piano').show()
  }

  // Hide chat attribute
  if (gHideChat) {
    $('#chat').hide()
  } else {
    $('#chat').show()
  }

  if (gOffAniChat) {
    document.body.classList.add('no-ani-chat')
  } else {
    document.body.classList.remove('no-ani-chat')
    $('#chat li').each(function () {
      this.style.transition = ''
      this.style.transform = ''
    })
  }

  // smooth cursor attribute

  if (gSmoothCursor) {
    $('#cursors').attr('smooth-cursors', '')
  } else {
    $('#cursors').removeAttr('smooth-cursors')
  }

  // Background color
  ; (function () {
    var old_color1 = new Color('#000000')
    var old_color2 = new Color('#000000')
    function setColor(hex, hex2) {
      var color1 = new Color(hex)
      var color2 = new Color(hex2 || hex)
      if (!hex2) color2.add(-0x40, -0x40, -0x40)

      var duration = 500
      var step = 0
      var steps = 30
      var step_ms = duration / steps
      var difference = new Color(color1.r, color1.g, color1.b)
      difference.r -= old_color1.r
      difference.g -= old_color1.g
      difference.b -= old_color1.b
      var inc1 = new Color(
        difference.r / steps,
        difference.g / steps,
        difference.b / steps
      )
      difference = new Color(color2.r, color2.g, color2.b)
      difference.r -= old_color2.r
      difference.g -= old_color2.g
      difference.b -= old_color2.b
      var inc2 = new Color(
        difference.r / steps,
        difference.g / steps,
        difference.b / steps
      )
      var iv
      iv = setInterval(function () {
        old_color1.add(inc1.r, inc1.g, inc1.b)
        old_color2.add(inc2.r, inc2.g, inc2.b)
        document.body.style.background =
          'radial-gradient(ellipse at center, ' +
          old_color1.toHexa() +
          ' 0%,' +
          old_color2.toHexa() +
          ' 100%)'
        if (++step >= steps) {
          clearInterval(iv)
          old_color1 = color1
          old_color2 = color2
          document.body.style.background =
            'radial-gradient(ellipse at center, ' +
            color1.toHexa() +
            ' 0%,' +
            color2.toHexa() +
            ' 100%)'
        }
      }, step_ms)
    }

    function setColorToDefault() {
      setColor('#220022', '#000022')
    }

    window.setBackgroundColor = setColor
    window.setBackgroundColorToDefault = setColorToDefault

    setColorToDefault()

    gClient.on('ch', function (ch) {
      if (gNoBackgroundColor) {
        setColorToDefault()
        return
      }
      if (ch.ch.settings) {
        if (ch.ch.settings.color) {
          setColor(ch.ch.settings.color, ch.ch.settings.color2)
        } else {
          setColorToDefault()
        }
      }
    })
  })()

  var Note = function (note, octave) {
    this.note = note
    this.octave = octave || 0
  }

  var n = function (a, b) {
    return { note: new Note(a, b), held: false }
  }

  var layouts = {
    MPP: {
      65: n('gs'),
      90: n('a'),
      83: n('as'),
      88: n('b'),
      67: n('c', 1),
      70: n('cs', 1),
      86: n('d', 1),
      71: n('ds', 1),
      66: n('e', 1),
      78: n('f', 1),
      74: n('fs', 1),
      77: n('g', 1),
      75: n('gs', 1),
      188: n('a', 1),
      76: n('as', 1),
      190: n('b', 1),
      191: n('c', 2),
      222: n('cs', 2),

      49: n('gs', 1),
      81: n('a', 1),
      50: n('as', 1),
      87: n('b', 1),
      69: n('c', 2),
      52: n('cs', 2),
      82: n('d', 2),
      53: n('ds', 2),
      84: n('e', 2),
      89: n('f', 2),
      55: n('fs', 2),
      85: n('g', 2),
      56: n('gs', 2),
      73: n('a', 2),
      57: n('as', 2),
      79: n('b', 2),
      80: n('c', 3),
      189: n('cs', 3),
      173: n('cs', 3), // firefox why
      219: n('d', 3),
      187: n('ds', 3),
      61: n('ds', 3), // firefox why
      221: n('e', 3)
    },
    VP: {
      112: n('c', -1),
      113: n('d', -1),
      114: n('e', -1),
      115: n('f', -1),
      116: n('g', -1),
      117: n('a', -1),
      118: n('b', -1),

      49: n('c'),
      50: n('d'),
      51: n('e'),
      52: n('f'),
      53: n('g'),
      54: n('a'),
      55: n('b'),
      56: n('c', 1),
      57: n('d', 1),
      48: n('e', 1),
      81: n('f', 1),
      87: n('g', 1),
      69: n('a', 1),
      82: n('b', 1),
      84: n('c', 2),
      89: n('d', 2),
      85: n('e', 2),
      73: n('f', 2),
      79: n('g', 2),
      80: n('a', 2),
      65: n('b', 2),
      83: n('c', 3),
      68: n('d', 3),
      70: n('e', 3),
      71: n('f', 3),
      72: n('g', 3),
      74: n('a', 3),
      75: n('b', 3),
      76: n('c', 4),
      90: n('d', 4),
      88: n('e', 4),
      67: n('f', 4),
      86: n('g', 4),
      66: n('a', 4),
      78: n('b', 4),
      77: n('c', 5)
    }
  }

  var key_binding = gVirtualPianoLayout ? layouts.VP : layouts.MPP

  var capsLockKey = false

  var transpose = 0

  function handleKeyDown(evt) {
    if (evt.target.type) return
    //console.log(evt);
    var code = parseInt(evt.keyCode)
    if (key_binding[code] !== undefined) {
      var binding = key_binding[code]
      if (!binding.held) {
        binding.held = true

        var note = binding.note
        var octave = 1 + note.octave
        if (!gVirtualPianoLayout) {
          if (evt.shiftKey) ++octave
          else if (capsLockKey || evt.ctrlKey) --octave
          else if (evt.altKey) octave += 2
        }
        note = note.note + octave
        var index = Object.keys(gPiano.keys).indexOf(note)
        if (gVirtualPianoLayout && evt.shiftKey) {
          note = Object.keys(gPiano.keys)[index + transpose + 1]
        } else note = Object.keys(gPiano.keys)[index + transpose]
        if (note === undefined) return
        var vol = velocityFromMouseY()
        press(note, vol)
      }

      if (++gKeyboardSeq == 3) {
        gKnowsYouCanUseKeyboard = true
        if (window.gKnowsYouCanUseKeyboardTimeout)
          clearTimeout(gKnowsYouCanUseKeyboardTimeout)
        if (localStorage) localStorage.knowsYouCanUseKeyboard = true
        if (window.gKnowsYouCanUseKeyboardNotification)
          gKnowsYouCanUseKeyboardNotification.close()
      }

      if (!gNoPreventDefault) evt.preventDefault()
      evt.stopPropagation()
      return false
    } else if (code == 20) {
      // Caps Lock
      capsLockKey = true
      if (!gNoPreventDefault) evt.preventDefault()
    } else if (code === 0x20) {
      // Space Bar
      pressSustain()
      if (!gNoPreventDefault) evt.preventDefault()
    } else if (code === 38 && transpose <= 100) {
      transpose += 12
      sendTransposeNotif()
    } else if (code === 40 && transpose >= -100) {
      transpose -= 12
      sendTransposeNotif()
    } else if (code === 39 && transpose < 100) {
      transpose++
      sendTransposeNotif()
    } else if (code === 37 && transpose > -100) {
      transpose--
      sendTransposeNotif()
    } else if (code == 9) {
      // Tab (don't tab away from the piano)
      if (!gNoPreventDefault) evt.preventDefault()
    } else if (code == 8) {
      // Backspace (don't navigate Back)
      gAutoSustain = !gAutoSustain
      if (!gNoPreventDefault) evt.preventDefault()
    }
  }

  function sendTransposeNotif() {
    //이것도 타겟 변경 필요
    const targetElement = $('#midi-btn')
    let notificationTarget = '#midi-btn'
    if (
      targetElement.hasClass('ugly-button') &&
      targetElement.css('pointer-events') === 'none'
    ) {
      notificationTarget = '#toggle-btn'
    }
    new Notification({
      title: 'Transposing',
      html: 'Transpose level: ' + transpose,
      target: notificationTarget,
      duration: 1500
    })
  }

  function handleKeyUp(evt) {
    if (evt.target.type) return
    var code = parseInt(evt.keyCode)
    if (key_binding[code] !== undefined) {
      var binding = key_binding[code]
      if (binding.held) {
        binding.held = false

        var note = binding.note
        var octave = 1 + note.octave
        if (!gVirtualPianoLayout) {
          if (evt.shiftKey) ++octave
          else if (capsLockKey || evt.ctrlKey) --octave
          else if (evt.altKey) octave += 2
        }
        note = note.note + octave
        var index = Object.keys(gPiano.keys).indexOf(note)
        if (gVirtualPianoLayout && evt.shiftKey) {
          note = Object.keys(gPiano.keys)[index + transpose + 1]
        } else note = Object.keys(gPiano.keys)[index + transpose]
        if (note === undefined) return
        release(note)
      }

      if (!gNoPreventDefault) evt.preventDefault()
      evt.stopPropagation()
      return false
    } else if (code == 20) {
      // Caps Lock
      capsLockKey = false
      if (!gNoPreventDefault) evt.preventDefault()
    } else if (code === 0x20) {
      // Space Bar
      releaseSustain()
      if (!gNoPreventDefault) evt.preventDefault()
    }
  }

  function handleKeyPress(evt) {
    if (evt.target.type) return
    if (!gNoPreventDefault) evt.preventDefault()
    evt.stopPropagation()
    if (evt.keyCode == 27 || evt.keyCode == 13) {
      //$("#chat input").focus();
    }
    return false
  }

  var recapListener = function (evt) {
    captureKeyboard()
  }

  var capturingKeyboard = false

  function captureKeyboard() {
    if (!capturingKeyboard) {
      capturingKeyboard = true
      $('#piano').off('mousedown', recapListener)
      $('#piano').off('touchstart', recapListener)
      $(document).on('keydown', handleKeyDown)
      $(document).on('keyup', handleKeyUp)
      $(window).on('keypress', handleKeyPress)
    }
  }

  function releaseKeyboard() {
    if (capturingKeyboard) {
      capturingKeyboard = false
      $(document).off('keydown', handleKeyDown)
      $(document).off('keyup', handleKeyUp)
      $(window).off('keypress', handleKeyPress)
      $('#piano').on('mousedown', recapListener)
      $('#piano').on('touchstart', recapListener)
    }
  }

  captureKeyboard()

  var velocityFromMouseY = function () {
    return 0.1 + (my / 100) * 0.6
  }

  // NoteQuota
  var gNoteQuota = (function () {
    var last_rat = 0
    var nqjq = $('#quota .value')
    setInterval(function () {
      gNoteQuota.tick()
    }, 2000)
    return new NoteQuota(function (points) {
      // update UI
      var rat = (points / this.max) * 100
      if (rat <= last_rat)
        nqjq.stop(true, true).css('width', rat.toFixed(0) + '%')
      else
        nqjq
          .stop(true, true)
          .animate({ width: rat.toFixed(0) + '%' }, 2000, 'linear')
      last_rat = rat
    })
  })()
  gClient.on('nq', function (nq_params) {
    gNoteQuota.setParams(nq_params)
  })
  gClient.on('disconnect', function () {
    gNoteQuota.setParams(NoteQuota.PARAMS_OFFLINE)
  })

  //DMs
  var gDmParticipant
  var gIsDming = false
  var gKnowsHowToDm = localStorage.knowsHowToDm === 'true'
  gClient.on('participant removed', part => {
    if (gIsDming && part._id === gDmParticipant._id) {
      chat.endDM()
      chat.endDM()
    }
  })

  //Replies

  var gReplyParticipant
  var gIsReplying = false
  var gMessageId
  gClient.on(`participant removed`, part => {
    if (gIsReplying && part._id === gReplyParticipant._id) {
      MPP.chat.cancelReply()
    }
  })

    // click participant names
    ; (function () {
      participantTouchhandler = function (e, ele) {
        var target = ele
        var target_jq = $(target)
        if (!target_jq) return
        if (target_jq.hasClass('name')) {
          target_jq.addClass('play')
          var id = target.participantId
          if (id == gClient.participantId) {
            openModal('#rename', 'input[name=name]')

            setTimeout(function () {
              $('#rename input[name=name]').val(
                gClient.ppl[gClient.participantId].name
              )
              $('#rename input[name=color]').val(
                gClient.ppl[gClient.participantId].color
              )
            }, 100)
          } else if (id) {
            var part = gClient.ppl[id] || null
            if (part) {
              participantMenu(part)
              e.stopPropagation()
            }
          }
        }
      }
      var releasehandler = function (e) {
        $('#names .name').removeClass('play')
      }
      document.body.addEventListener('mouseup', releasehandler)
      document.body.addEventListener('touchend', releasehandler)

      var removeParticipantMenus = function () {
        $('.participant-menu').fadeOut(200, function () {
          $(this).remove()
        })
        $('.participantSpotlight').fadeOut(200)
        document.removeEventListener('mousedown', removeParticipantMenus)
        document.removeEventListener('touchstart', removeParticipantMenus)
      }

      var participantMenu = function (part) {
        if (!part) return
        removeParticipantMenus()
        document.addEventListener('mousedown', removeParticipantMenus)
        document.addEventListener('touchstart', removeParticipantMenus)

        $('#' + part.id)
          .find('.enemySpotlight')
          .fadeIn(200)

        var menu = $('<div class="participant-menu"></div>').hide()
        $('body').append(menu)

        var jq_nd = $(part.nameDiv)
        var pos = jq_nd.position()
        var baseColor = part.color || '#000'
        function hexToRgba(hex, alpha = 0.6) {
          var c
          if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('')
            if (c.length == 3) {
              c = [c[0], c[0], c[1], c[1], c[2], c[2]]
            }
            c = '0x' + c.join('')
            return (
              'rgba(' +
              [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') +
              ',' +
              alpha +
              ')'
            )
          }
          throw new Error('Bad Hex')
        }

        menu.css({
          top: pos.top + jq_nd.height() + 85,
          left: pos.left + 35,
          background: hexToRgba(baseColor, 0.5),
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        })

        menu.fadeIn(200)

        menu.on('mousedown touchstart', function (evt) {
          evt.stopPropagation()
          var target = $(evt.target)
          if (target.hasClass('menu-item')) {
            target.addClass('clicked')
            menu.fadeOut(200, function () {
              removeParticipantMenus()
            })
          }
        })
        // this spaces stuff out but also can be used for informational
        $('<div class="info"></div>')
          .appendTo(menu)
          .text(part._id)
          .on('mousedown touchstart', evt => {
            navigator.clipboard.writeText(part._id)
            evt.target.innerText = 'Copied!'
            setTimeout(() => {
              evt.target.innerText = part._id
            }, 2500)
          })
        // add menu items
        if (gPianoMutes.indexOf(part._id) == -1) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Mute Notes'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              gPianoMutes.push(part._id)
              if (localStorage) localStorage.pianoMutes = gPianoMutes.join(',')
              $(part.nameDiv).addClass('muted-notes')
            })
        } else {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Unmute Notes'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var i
              while ((i = gPianoMutes.indexOf(part._id)) != -1)
                gPianoMutes.splice(i, 1)
              if (localStorage) localStorage.pianoMutes = gPianoMutes.join(',')
              $(part.nameDiv).removeClass('muted-notes')
            })
        }
        if (gChatMutes.indexOf(part._id) == -1) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Mute Chat'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              gChatMutes.push(part._id)
              if (localStorage) localStorage.chatMutes = gChatMutes.join(',')
              $(part.nameDiv).addClass('muted-chat')
            })
        } else {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Unmute Chat'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var i
              while ((i = gChatMutes.indexOf(part._id)) != -1)
                gChatMutes.splice(i, 1)
              if (localStorage) localStorage.chatMutes = gChatMutes.join(',')
              $(part.nameDiv).removeClass('muted-chat')
            })
        }
        if (
          !(gPianoMutes.indexOf(part._id) >= 0) ||
          !(gChatMutes.indexOf(part._id) >= 0)
        ) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Mute Completely'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              gPianoMutes.push(part._id)
              if (localStorage) localStorage.pianoMutes = gPianoMutes.join(',')
              gChatMutes.push(part._id)
              if (localStorage) localStorage.chatMutes = gChatMutes.join(',')
              $(part.nameDiv).addClass('muted-notes')
              $(part.nameDiv).addClass('muted-chat')
            })
        }
        if (
          gPianoMutes.indexOf(part._id) >= 0 ||
          gChatMutes.indexOf(part._id) >= 0
        ) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Unmute Completely'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var i
              while ((i = gPianoMutes.indexOf(part._id)) != -1)
                gPianoMutes.splice(i, 1)
              while ((i = gChatMutes.indexOf(part._id)) != -1)
                gChatMutes.splice(i, 1)
              if (localStorage) localStorage.pianoMutes = gPianoMutes.join(',')
              if (localStorage) localStorage.chatMutes = gChatMutes.join(',')
              $(part.nameDiv).removeClass('muted-notes')
              $(part.nameDiv).removeClass('muted-chat')
            })
        }
        if (gIsDming && gDmParticipant._id === part._id) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'End Direct Message'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              chat.endDM()
            })
        } else {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Direct Message'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              if (!gKnowsHowToDm) {
                localStorage.knowsHowToDm = true
                gKnowsHowToDm = true
                new Notification({
                  target: '#piano',
                  duration: 20000,
                  title: window.i18nextify.i18next.t('How to DM'),
                  text: window.i18nextify.i18next.t(
                    'After you click the button to direct message someone, future chat messages will be sent to them instead of to everyone. To go back to talking in public chat, send a blank chat message, or click the button again.'
                  )
                })
              }
              chat.startDM(part)
            })
        }
        if (gCursorHides.indexOf(part._id) == -1) {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Hide Cursor'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              gCursorHides.push(part._id)
              if (localStorage) localStorage.cursorHides = gCursorHides.join(',')
              $(part.cursorDiv).hide()
            })
        } else {
          $(
            `<div class="menu-item">${window.i18nextify.i18next.t(
              'Show Cursor'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var i
              while ((i = gCursorHides.indexOf(part._id)) != -1)
                gCursorHides.splice(i, 1)
              if (localStorage) localStorage.cursorHides = gCursorHides.join(',')
              $(part.cursorDiv).show()
            })
        }

        $(
          `<div class="menu-item">${window.i18nextify.i18next.t('Mention')}</div>`
        )
          .appendTo(menu)
          .on('mousedown touchstart', function (evt) {
            $('#chat-input')[0].value += '@' + part.id + ' '
            setTimeout(() => {
              $('#chat-input').focus()
            }, 1)
          })

        let giveOwnerNotification = null

        if (gClient.isOwner() || gClient.permissions.chownAnywhere) {
          if (!gClient.channel.settings.lobby) {
            $(
              `<div class="menu-item give-crown">${window.i18nextify.i18next.t(
                'Give Crown'
              )}</div>`
            )
              .appendTo(menu)
              .on('mousedown touchstart', function (evt) {
                const n = new Notification({
                  title: 'Room Ownership Transferred',
                  html: `
            <div style="padding: 10px;">
                <p style="text-align: center;">Are you sure that you will give ownership..?</p>
                <div style="text-align: center; margin-top: 15px;">
                    <button id="confirm-yes" class="dialog-btn dialog-btn-yes" style="margin-right: 10px;">Yes</button>
                    <button id="confirm-no" class="dialog-btn dialog-btn-no">No</button>
                </div>
            </div>
        `,
                  duration: -1,
                  target: `#namediv-${part.id}`,
                  onopen: function (n) {
                    n.domElement.find('#confirm-yes').on('click', function () {
                      gClient.sendArray([{ m: 'chown', id: part.id }])
                      n.close()
                    })
                    n.domElement.find('#confirm-no').on('click', function () {
                      n.close()
                    })
                  }
                })

                giveOwnerNotification = n

                n.on('close', function () {
                  giveOwnerNotification = null
                })
              })
          }
          $(
            `<div class="menu-item kickban">${window.i18nextify.i18next.t(
              'Kickban'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var minutes = prompt('How many minutes? (0-300)', '30')
              if (minutes === null) return
              minutes = parseFloat(minutes) || 0
              var ms = minutes * 60 * 1000
              gClient.sendArray([{ m: 'kickban', _id: part._id, ms: ms }])
            })
        }
        if (gClient.permissions.siteBan) {
          $(
            `<div class="menu-item site-ban">${window.i18nextify.i18next.t(
              'Site Ban'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              openModal('#siteban')
              setTimeout(function () {
                $('#siteban input[name=id]').val(part._id)
                $('#siteban input[name=reasonText]').val(
                  'Discrimination against others'
                )
                $('#siteban input[name=reasonText]').attr('disabled', true)
                $('#siteban select[name=reasonSelect]').val(
                  'Discrimination against others'
                )
                $('#siteban input[name=durationNumber]').val(5)
                $('#siteban input[name=durationNumber]').attr('disabled', false)
                $('#siteban select[name=durationUnit]').val('hours')
                $('#siteban textarea[name=note]').val('')
                $('#siteban p[name=errorText]').text('')
                if (gClient.permissions.siteBanAnyReason) {
                  $(
                    '#siteban select[name=reasonSelect] option[value=custom]'
                  ).attr('disabled', false)
                } else {
                  $(
                    '#siteban select[name=reasonSelect] option[value=custom]'
                  ).attr('disabled', true)
                }
              }, 100)
            })
        }
        if (gClient.permissions.usersetOthers) {
          $(
            `<div class="menu-item set-color">${window.i18nextify.i18next.t(
              'Set Color'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var color = prompt('What color?', part.color)
              if (color === null) return
              gClient.sendArray([{ m: 'setcolor', _id: part._id, color: color }])
            })
        }
        if (gClient.permissions.usersetOthers) {
          $(
            `<div class="menu-item set-name">${window.i18nextify.i18next.t(
              'Set Name'
            )}</div>`
          )
            .appendTo(menu)
            .on('mousedown touchstart', function (evt) {
              var name = prompt('What name?', part.name)
              if (name === null) return
              gClient.sendArray([{ m: 'setname', _id: part._id, name: name }])
            })
        }
        menu.fadeIn(100)
      }
    })()

  // Notification class
  ////////////////////////////////////////////////

  var Notification = function (par) {
    if (this instanceof Notification === false) throw 'yeet'
    EventEmitter.call(this)

    var par = par || {}

    this.id = 'Notification-' + (par.id || Math.random())
    this.title = par.title || ''
    this.text = par.text || ''
    this.html = par.html || ''
    this.target = $(par.target || '#piano')
    this.duration = par.duration || 30000
    this['class'] = par['class'] || 'classic'
    this.onopen = par.onopen
    this.zIndex = par.zIndex || null

    // 보간을 위한 변수들
    this.currentX = 0
    this.currentY = 0
    this.targetX = 0
    this.targetY = 0
    this.isAnimating = false

    var self = this
    var eles = $('#' + this.id)
    if (eles.length > 0) {
      eles.remove()
    }
    this.domElement = $(`
    <div class="notification">
        <div class="notification-body">
            <div class="title"></div>
            <div class="text"></div>
        </div>
        <div class="x" translated>
            <img src="svgs/close_red.svg" alt="Close" />
        </div>
    </div>
  `)
    this.domElement[0].id = this.id
    this.domElement.addClass(this['class'])
    this.domElement.find('.title').text(this.title)

    if (this.text.length > 0) {
      this.domElement.find('.text').text(this.text)
    } else if (this.html instanceof HTMLElement) {
      this.domElement.find('.text')[0].appendChild(this.html)
    } else if (this.html.length > 0) {
      const textEl = this.domElement.find('.text')[0]
      textEl.innerHTML = this.html

      textEl.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script')
        if (oldScript.src) newScript.src = oldScript.src
        else newScript.textContent = oldScript.textContent
        oldScript.replaceWith(newScript)
      })

      textEl.querySelectorAll('style').forEach(oldStyle => {
        const newStyle = document.createElement('style')
        newStyle.textContent = oldStyle.textContent
        oldStyle.replaceWith(newStyle)
      })
    }
    if (this.zIndex !== null) {
      this.domElement.css('z-index', this.zIndex)
    }

    document.body.appendChild(this.domElement.get(0))

    // 초기 위치 계산
    this.calculateTargetPosition()
    this.currentX = this.targetX
    this.currentY = this.targetY
    this.updatePosition()

    // 부드러운 애니메이션 시작
    this.startAnimation()

    this.observer = new MutationObserver(() => {
      this.calculateTargetPosition()
    })

    this.observer.observe(this.target[0], {
      attributes: true,
      childList: true,
      subtree: true
    })

    this.onresize = function () {
      self.calculateTargetPosition()
    }

    window.addEventListener('resize', this.onresize)

    this.domElement.find('.x').click(function () {
      self.close()
    })

    setTimeout(() => {
      this.domElement.addClass('show')
      if (typeof this.onopen === 'function') {
        this.onopen(this)
      }
    }, 0)

    if (this.duration > 0) {
      setTimeout(function () {
        self.close()
      }, this.duration)
    }

    return this
  }

  mixin(Notification.prototype, EventEmitter.prototype)
  Notification.prototype.constructor = Notification

  Notification.prototype.calculateTargetPosition = function () {
    if (
      !this.target ||
      this.target.length === 0 ||
      !document.body.contains(this.target[0])
    ) {
      this.close()
      return
    }

    var pos = this.target.offset()
    if (!pos) return

    var width = this.domElement.width()
    var height = this.domElement.height()

    var notificationBody = this.domElement.find('.notification-body')
    notificationBody.removeClass('arrow-bottom arrow-right arrow-top')

    if (
      this.target.attr('id') &&
      (this.target.attr('id').startsWith('namediv') ||
        this.target.attr('id').startsWith('nametag'))
    ) {
      this.targetX = pos.left + this.target.width() / 2 - width / 2
      this.targetY = pos.top + this.target.height() + 10
      notificationBody.addClass('arrow-top')
    } else if (
      this.target.hasClass('ugly-button') ||
      this.target.attr('id') === 'toggle-btn'
    ) {
      this.targetX = pos.left - width - 10
      this.targetY = pos.top + this.target.height() / 2 - height / 2
      notificationBody.addClass('arrow-right')
    } else {
      this.targetX = pos.left - width / 2 + this.target.width() / 4
      this.targetY = pos.top - height - 23
      notificationBody.addClass('arrow-bottom')
    }
  }

  Notification.prototype.updatePosition = function () {
    this.domElement.css({
      left: this.currentX + 'px',
      top: this.currentY + 'px'
    })
  }

  Notification.prototype.startAnimation = function () {
    if (this.isAnimating) return
    this.isAnimating = true

    var self = this
    var smoothness = 0.15 //1에 가까울수록 빠름

    function animate() {
      if (!self.isAnimating) return

      //선형 보간
      var dx = self.targetX - self.currentX
      var dy = self.targetY - self.currentY

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        self.currentX = self.targetX
        self.currentY = self.targetY
      } else {
        self.currentX += dx * smoothness
        self.currentY += dy * smoothness
      }

      self.updatePosition()
      requestAnimationFrame(animate)
    }

    animate()
  }

  Notification.prototype.close = function () {
    var self = this
    this.isAnimating = false
    window.removeEventListener('resize', this.onresize)
    this.domElement.removeClass('show').addClass('hide')

    setTimeout(function () {
      if (self.observer) {
        self.observer.disconnect()
      }
      self.domElement.remove()
      self.emit('close')
    }, 300)
  }

  ////////////////////////////////////////////////////////////////

  var gKeyboardSeq = 0
  var gKnowsYouCanUseKeyboard = false
  if (localStorage && localStorage.knowsYouCanUseKeyboard)
    gKnowsYouCanUseKeyboard = true
  if (!gKnowsYouCanUseKeyboard) {
    window.gKnowsYouCanUseKeyboardTimeout = setTimeout(function () {
      window.gKnowsYouCanUseKeyboardNotification = new Notification({
        title: window.i18nextify.i18next.t('Did you know!?!'),
        text: window.i18nextify.i18next.t(
          'You can play the piano with your keyboard, too.  Try it!'
        ),
        target: '#piano',
        duration: 10000
      })
    }, 30000)
  }

  if (window.localStorage) {
    window.gHasBeenHereBefore = localStorage.gHasBeenHereBefore || false
    if (!gHasBeenHereBefore) {
      /*new Notification({
        title: "Important Info",
        html: "If you were not on multiplayerpiano.net or mppclone.com previously, you are now! This is due to an issue with the owner of multiplayerpiano.com, who has added a bunch of things in the website's code that has affected the site negatively. Since they are using our servers, it's best that you use this website. If you have any issues, please join our <a href=\"https://discord.com/invite/338D2xMufC\">Discord</a> and let us know!",
        duration: -1
      });*/
    }
    localStorage.gHasBeenHereBefore = true
  }

  // New room, change room

  ////////////////////////////////////////////////////////////////

  $('#room > .info').text('--')
  gClient.on('ch', function (msg) {
    var channel = msg.ch
    var info = $('#room > .info')
    info.text(channel._id)
    if (channel.settings.lobby) info.addClass('lobby')
    else info.removeClass('lobby')
    if (!channel.settings.chat) info.addClass('no-chat')
    else info.removeClass('no-chat')
    if (channel.settings.crownsolo) info.addClass('crownsolo')
    else info.removeClass('crownsolo')
    if (channel.settings['no cussing']) info.addClass('no-cussing')
    else info.removeClass('no-cussing')
    if (!channel.settings.visible) info.addClass('not-visible')
    else info.removeClass('not-visible')
  })

  /////////////////////////////////////////////

  $('#channels-btn').on('click', function (evt) {
    evt.stopPropagation()
    gClient.sendArray([{ m: '+ls' }])
    openModal('#channels')
  })

  gClient.on('ls', function (ls) {
    const $list = $('#channel-btn-list')
    const existingIds = {}

    $list.find('button[data-room-id]').each(function () {
      existingIds[$(this).data('room-id')] = $(this)
    })

    Object.values(ls.u).forEach(room => {
      if (room.count === 0) {
        if (existingIds[room._id]) {
          existingIds[room._id].remove()
          delete existingIds[room._id]
        }
        return
      }

      const btnText = `${room._id} (${room.count}/${room.settings.limit || 20})`

      if (existingIds[room._id]) {
        existingIds[room._id]
          .text(btnText)
          .removeClass('lobby not-visible banned crownsolo no-chat')
          .toggleClass('lobby', !!room.settings.lobby)
          .toggleClass('not-visible', !room.settings.visible)
          .toggleClass('banned', !!room.banned)
          .toggleClass('crownsolo', !!room.settings.crownsolo)
          .toggleClass('no-chat', !room.settings.chat)
        delete existingIds[room._id]
      } else {
        const $btn = $('<button>')
          .attr('data-room-id', room._id)
          .text(btnText)
          .css({
            margin: '6px',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '16px'
          })
          .on('click', function () {
            closeModal()
            changeRoom(room._id, 'right')
          })
          .toggleClass('lobby', !!room.settings.lobby)
          .toggleClass('not-visible', !room.settings.visible)
          .toggleClass('banned', !!room.banned)
          .toggleClass('crownsolo', !!room.settings.crownsolo)
          .toggleClass('no-chat', !room.settings.chat)

        $list.append($btn)
      }
    })
  })

  $('#channels .close-btn').on('click', function () {
    closeModal()
  })

  $('#channels .new-room-btn').on('click', function (evt) {
    evt.stopPropagation()
    openModal('#new-room', 'input[name=name]')
  })

  /////////////////////////////////////////////

  $('#play-alone-btn').on('click', function (evt) {
    evt.stopPropagation()
    var room_name = 'Room' + Math.floor(Math.random() * 1000000000000)
    changeRoom(room_name, 'right', { visible: false })
    setTimeout(function () {
      new Notification({
        id: 'share',
        title: window.i18nextify.i18next.t('Playing alone'),
        html:
          window.i18nextify.i18next.t(
            'You are playing alone in a room by yourself, but you can always invite friends by sending them the link.'
          ) +
          '<br><a href="' +
          location.href +
          '">' +
          location.href +
          '</a>',
        duration: 25000
      })
    }, 1000)
  })

  //Account button
  $('#account-btn').on('click', function (evt) {
    evt.stopPropagation()
    openModal('#account')
    if (gClient.accountInfo) {
      $('#account #account-info').show()
      if (gClient.accountInfo.type === 'discord') {
        $('#account #avatar-image').prop('src', gClient.accountInfo.avatar)
        $('#account #logged-in-user-text').text(
          gClient.accountInfo.username + '#' + gClient.accountInfo.discriminator
        )
      }
    } else {
      $('#account #account-info').hide()
    }
  })

  var gModal

  function modalHandleEsc(evt) {
    if (evt.keyCode == 27) {
      closeModal()
      if (!gNoPreventDefault) evt.preventDefault()
      evt.stopPropagation()
    }
  }

  const modalStack = []
  let modalLock = false
  let zIndexCounter = 1000

  function updateModalStyles() {
    modalStack.forEach(($dialog, index) => {
      if (index !== modalStack.length - 1) {
        $dialog.removeClass('background-blur')
        const computedStyle = window.getComputedStyle($dialog[0])
        $dialog[0].offsetHeight
        requestAnimationFrame(() => {
          $dialog[0].style.filter = 'blur(0px)'
          $dialog[0].offsetHeight
          requestAnimationFrame(() => {
            $dialog[0].style.transition = 'filter 0.4s ease'
            $dialog[0].style.filter = 'blur(4px)'
            $dialog.css('pointer-events', 'none')
          })
        })
      } else {
        $dialog[0].style.filter = 'blur(0px)'
        if (!$dialog.data('closing')) {
          $dialog.css('pointer-events', 'auto')
        }
      }
    })
  }

  function openModal(selector, focus) {
    if (modalLock) return
    modalLock = true

    const $dialog = $(selector)

    $dialog.off('transitionend')
    clearTimeout($dialog.data('closeTimeout'))
    $dialog.removeData('closing')
    $dialog.removeData('closeStart')
    $dialog.removeData('closeTimeout')

    $dialog.removeClass('closing background-blur')
    $dialog[0].style.filter = ''
    $dialog[0].style.transition = ''
    $dialog.css('pointer-events', '')

    const existingIndex = modalStack.findIndex(d => d.is(selector))
    if (existingIndex !== -1) {
      modalStack.splice(existingIndex, 1)
    }

    $('#modal').addClass('show')
    $dialog.show()
    zIndexCounter++
    $dialog.css('z-index', zIndexCounter)

    modalStack.push($dialog)

    requestAnimationFrame(() => {
      $dialog.addClass('active')
      if (focus) $dialog.find(focus).focus()

      updateModalStyles()
    })

    setTimeout(() => {
      modalLock = false
    }, 400)
  }

  function closeModal(selector) {
    if (modalStack.length === 0) return

    const $dialog = selector
      ? modalStack.find(d => d.is(selector))
      : modalStack[modalStack.length - 1]
    if (!$dialog) return

    if ($dialog.data('closing')) return

    $dialog.data('closing', true)
    $dialog.data('closeStart', performance.now())

    $dialog.css('pointer-events', 'none')

    const index = modalStack.indexOf($dialog)
    if (index !== -1) modalStack.splice(index, 1)

    $dialog.removeClass('active background-blur').addClass('closing')
    $dialog[0].style.filter = ''
    $dialog[0].style.transition = ''

    if (modalStack.length === 0) $('#modal').removeClass('show')

    updateModalStyles()

    $dialog.off('transitionend')

    function finishClosing() {
      if ($dialog.data('closing')) {
        $dialog.removeClass('closing').hide()
        $dialog.removeData('closing')
        $dialog.removeData('closeStart')
        $dialog.removeData('closeTimeout')
        $dialog.css('pointer-events', '')
        captureKeyboard()
      }
    }

    $dialog.one('transitionend', e => {
      if (e.target !== $dialog[0]) return
      clearTimeout($dialog.data('closeTimeout'))
      finishClosing()
    })
    const fallback = setTimeout(() => {
      finishClosing()
    }, 450)

    $dialog.data('closeTimeout', fallback)
  }

  var modal_bg = $('#modal .bg')[0]
  $(modal_bg).on('click', function (evt) {
    if (evt.target != modal_bg) return
    closeModal()
  })
    ; (function () {
      function submit() {
        var name = $('#new-room .text[name=name]').val()
        var settings = {
          visible: $('#new-room .checkbox[name=visible]').is(':checked'),
          chat: true
        }

        closeModal()
        setTimeout(() => {
          closeModal('#channels')
        }, 200)

        setTimeout(() => {
          changeRoom(name, 'right', settings)

          new Notification({
            id: 'share',
            title: window.i18nextify.i18next.t('Created a Room'),
            html:
              window.i18nextify.i18next.t(
                'You can invite friends to your room by sending them the link.'
              ) +
              '<br><a href="' +
              location.href +
              '">' +
              location.href +
              '</a>',
            duration: 25000
          })
          $('#new-room .text[name=name]').val('')
        }, 500)
      }

      $('#new-room .submit').click(function (evt) {
        submit()
      })

      $('#new-room .text[name=name]').keypress(function (evt) {
        if (evt.keyCode == 13) {
          submit()
        } else if (evt.keyCode == 27) {
          closeModal('#new-room')
          closeModal('#channels')
        } else {
          return
        }

        if (!gNoPreventDefault) evt.preventDefault()
        evt.stopPropagation()
        return false
      })
    })()

  function changeRoom(name, direction, settings, push) {
    pageJustLoaded = true
    setTimeout(() => {
      pageJustLoaded = false
    }, 2000)
    if (!settings) settings = {}
    if (!direction) direction = 'right'
    if (typeof push == 'undefined') push = true
    var opposite = direction == 'left' ? 'right' : 'left'

    if (name == '') name = 'lobby'
    if (gClient.channel && gClient.channel._id === name) return
    if (push) {
      var url = '/?c=' + encodeURIComponent(name).replace("'", '%27')
      if (window.history && history.pushState) {
        history.pushState(
          { depth: (gHistoryDepth += 1), name: name },
          'Piano > ' + name,
          url
        )
      } else {
        window.location = url
        return
      }
    }

    gClient.setChannel(name, settings)

    var t = 0,
      d = 100
    $('#piano')
      .addClass('ease-out')
      .addClass('slide-' + opposite)
    setTimeout(function () {
      $('#piano')
        .removeClass('ease-out')
        .removeClass('slide-' + opposite)
        .addClass('slide-' + direction)
    }, (t += d))
    setTimeout(function () {
      $('#piano')
        .addClass('ease-in')
        .removeClass('slide-' + direction)
    }, (t += d))
    setTimeout(function () {
      $('#piano').removeClass('ease-in')
    }, (t += d))
  }

  var gHistoryDepth = 0
  $(window).on('popstate', function (evt) {
    var depth = evt.state ? evt.state.depth : 0
    //if (depth == gHistoryDepth) return; // <-- forgot why I did that though...
    //yeah brandon idk why you did that either, but it's stopping the back button from changing rooms after 1 click so I commented it out

    var direction = depth <= gHistoryDepth ? 'left' : 'right'
    gHistoryDepth = depth

    var name = getRoomNameFromURL()
    changeRoom(name, direction, null, false)
  })

    // Rename

    ////////////////////////////////////////////////////////////////
    ; (function () {
      function submit() {
        var set = {
          name: $('#rename input[name=name]').val(),
          color: $('#rename input[name=color]').val()
        }
        //$("#rename .text[name=name]").val("");
        closeModal()
        gClient.sendArray([{ m: 'userset', set: set }])
      }
      $('#rename .submit').click(function (evt) {
        submit()
      })
      $('#rename .text[name=name]').keypress(function (evt) {
        if (evt.keyCode == 13) {
          submit()
        } else if (evt.keyCode == 27) {
          closeModal()
        } else {
          return
        }
        if (!gNoPreventDefault) evt.preventDefault()
        evt.stopPropagation()
        return false
      })
    })()

    //site-wide bans
    ; (function () {
      function submit() {
        var msg = { m: 'siteban' }

        msg.id = $('#siteban .text[name=id]').val()

        var durationUnit = $('#siteban select[name=durationUnit]').val()
        if (durationUnit === 'permanent') {
          if (!gClient.permissions.siteBanAnyDuration) {
            $('#siteban p[name=errorText]').text(
              "You don't have permission to ban longer than 1 month. Contact a higher staff to ban the user for longer."
            )
            return
          }
          msg.permanent = true
        } else {
          var factor = 0
          switch (durationUnit) {
            case 'seconds':
              factor = 1000
              break
            case 'minutes':
              factor = 1000 * 60
              break
            case 'hours':
              factor = 1000 * 60 * 60
              break
            case 'days':
              factor = 1000 * 60 * 60 * 24
              break
            case 'weeks':
              factor = 1000 * 60 * 60 * 24 * 7
              break
            case 'months':
              factor = 1000 * 60 * 60 * 24 * 30
              break
            case 'years':
              factor = 1000 * 60 * 60 * 24 * 365
              break
          }
          var duration =
            factor * parseFloat($('#siteban input[name=durationNumber]').val())
          if (duration < 0) {
            $('#siteban p[name=errorText]').text('Invalid duration.')
            return
          }
          if (
            duration > 1000 * 60 * 60 * 24 * 30 &&
            !gClient.permissions.siteBanAnyDuration
          ) {
            $('#siteban p[name=errorText]').text(
              "You don't have permission to ban longer than 1 month. Contact a higher staff to ban the user for longer."
            )
            return
          }
          msg.duration = duration
        }

        var reason
        if ($('#siteban select[name=reasonSelect]').val() === 'custom') {
          reason = $('#siteban .text[name=reasonText]').val()
          if (reason.length === 0) {
            $('#siteban p[name=errorText]').text('Please provide a reason.')
            return
          }
        } else {
          reason = $('#siteban select[name=reasonSelect]').val()
        }
        msg.reason = reason

        var note = $('#siteban textarea[name=note]').val()
        if (note) {
          msg.note = note
        }

        closeModal()
        gClient.sendArray([msg])
      }
      $('#siteban .submit').click(function (evt) {
        submit()
      })
      $('#siteban select[name=reasonSelect]').change(function (evt) {
        if (this.value === 'custom') {
          $('#siteban .text[name=reasonText]').attr('disabled', false)
          $('#siteban .text[name=reasonText]').val('')
        } else {
          $('#siteban .text[name=reasonText]').attr('disabled', true)
          $('#siteban .text[name=reasonText]').val(this.value)
        }
      })
      $('#siteban select[name=durationUnit]').change(function (evt) {
        if (this.value === 'permanent') {
          $('#siteban .text[name=durationNumber]').attr('disabled', true)
        } else {
          $('#siteban .text[name=durationNumber]').attr('disabled', false)
        }
      })
      $('#siteban .text[name=id]').keypress(textKeypressEvent)
      $('#siteban .text[name=reasonText]').keypress(textKeypressEvent)
      $('#siteban .text[name=note]').keypress(textKeypressEvent)
      function textKeypressEvent(evt) {
        if (evt.keyCode == 13) {
          submit()
        } else if (evt.keyCode == 27) {
          closeModal()
        } else {
          return
        }
        if (!gNoPreventDefault) evt.preventDefault()
        evt.stopPropagation()
        return false
      }
    })()

    //Accounts
    ; (function () {
      function logout() {
        delete localStorage.token
        delete gClient.accountInfo
        gClient.stop()
        gClient.start()
        closeModal()
      }
      $('#account .logout-btn').click(function (evt) {
        logout()
      })
      $('#account .login-discord').click(function (evt) {
        location.replace(
          `https://discord.com/oauth2/authorize?client_id=1336291245533691945&response_type=code&redirect_uri=https%3A%2F%2Fmpp.smp-meow.net%2F%3Fcallback%3Ddiscord&scope=identify+email`
        )
      })
    })()

  // chatctor

  ////////////////////////////////////////////////////////////////

  let isPageReload = false
  $(window).on('beforeunload', function () {
    isPageReload = true
  })
  setTimeout(() => {
    pageJustLoaded = false
  }, 2000)
  var chat = (function () {
    let isEditing = false
    let editingMessageId = null
    let editModeNotification
    let messageCache = []
    let typingTimeout
    const playedMentionSounds = new Set()
    const $chatUl = $('#chat ul')
    const $chatInput = $('#chat-input')

    function applySpoilerToMedia(mediaElement) {
      if (
        gSpoilerMediaInChat &&
        mediaElement &&
        !mediaElement.closest('.spoiler-container').length
      ) {
        const spoilerContainer = $('<div class="spoiler-container"></div>')
        const spoilerOverlay = $('<div class="spoiler-overlay"></div>')

        $(mediaElement).wrap(spoilerContainer)
        $(mediaElement).closest('.spoiler-container').append(spoilerOverlay)
      }
    }

    function showImageModal(imageUrl) {
      $('.image-modal-overlay').remove()

      const modalHtml = `
            <div class="image-modal-overlay">
                <div class="image-modal-content">
                    <span class="image-modal-close">&times;</span>
                    <img src="${imageUrl}" class="image-modal-img">
                </div>
            </div>
        `
      const $modal = $(modalHtml)

      $modal
        .find('.image-modal-close, .image-modal-overlay')
        .on('click', function (e) {
          if (
            $(e.target).hasClass('image-modal-overlay') ||
            $(e.target).hasClass('image-modal-close')
          ) {
            $modal.remove()
          }
        })

      $(document).on('keydown.imageModal', function (e) {
        if (e.key === 'Escape') {
          $modal.remove()
          $(document).off('keydown.imageModal')
        }
      })

      $('body').append($modal)
    }

    function escapeHtml(str) {
      if (!str) return ''
      return str.replace(/[&<>"'\/]/g, function (s) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '/': '&#x2F;'
        }[s]
      })
    }

    function createMessageElement(msg) {
      const isOwnMessage =
        (msg.m === 'dm' && msg.sender?._id === gClient.user._id) ||
        (msg.m !== 'dm' && msg.p?._id === gClient.user._id)

      const li =
        $(`<li id="msg-${msg.id}" style="opacity: 0; transition: opacity 0.3s ease-in-out;">
    <span class="info-btn" style="cursor:pointer;">Info</span>
  </li>`)

      if (gShowTimestampsInChat) {
        const timeColor = '#aaa'
        li.append(
          `<span class="timestamp" style="color: ${timeColor};">${new Date(
            msg.t
          ).toLocaleTimeString()}</span>`
        )
      }

      if (gShowIdsInChat) {
        const idColor = '#aaa'
        const idText =
          msg.m === 'dm'
            ? msg.sender?._id.substring(0, 6)
            : msg.p?._id.substring(0, 6)
        li.append(
          `<span class="id" style="color: ${idColor};">${idText}</span>`
        )
      }

      if (msg.m === 'dm') {
        li.addClass('dm')
        if (msg.sender?._id === gClient.user._id)
          li.append('<span class="sentDm">To</span>')
        else if (msg.recipient?._id === gClient.user._id)
          li.append('<span class="receivedDm">From</span>')
        else li.append('<span class="otherDm">DM</span>')
        li.append(
          `<span class="name" style="color: ${msg.sender?.color || 'white'};">${msg.sender?.name || 'Anonymous'
          }:</span>`
        )
        if (
          msg.recipient?._id &&
          msg.sender?._id !== gClient.user._id &&
          msg.recipient?._id !== gClient.user._id
        ) {
          li.append(`<span class="dmArrow">-></span>`)
          li.append(
            `<span class="name2" style="color: ${msg.recipient?.color || 'white'
            };">${msg.recipient?.name}:</span>`
          )
        }
      } else {
        li.append(
          `<span class="name" style="color: ${msg.p?.color || 'white'};">${msg.p?.name || 'Anonymous'
          }:</span>`
        )
      }

      if (msg.m === 'dm' && msg.recipient?._id === gClient.user._id) {
        if (!playedMentionSounds.has(msg.id)) {
          playedMentionSounds.add(msg.id)
          if (gChatSoundInChat) {
            if (!pageJustLoaded) {
              try {
                const notificationSound = new Audio(
                  './subsound/Notification.mp3'
                )
                notificationSound.volume = 1
                notificationSound.play().catch(err => {
                  console.log('알림음 재생 실패:', err)
                })
              } catch (err) {
                console.log('알림음 로드 실패:', err)
              }
            }
          }
        }
      }

      if (msg.r) {
        const repliedMsg = messageCache.find(e => e.id === msg.r)
        if (repliedMsg) {
          const repliedName =
            repliedMsg.m === 'dm' ? repliedMsg.sender.name : repliedMsg.p.name
          const repliedColor =
            repliedMsg.m === 'dm'
              ? repliedMsg.sender?.color
              : repliedMsg.p?.color || 'white'
          const repliedText = repliedMsg.a

          let indentString = 'ㅤㅤㅤ'
          const timestampElem = li.find('.timestamp')
          const idElem = li.find('.id')
          if (timestampElem.length || idElem.length) {
            $('#chat').append(li)
            const timestampWidth = timestampElem.outerWidth() || 0
            const idWidth = idElem.outerWidth() || 0
            const indentSpaces = Math.ceil((timestampWidth + idWidth) / 8)
            indentString = 'ㅤ'.repeat(indentSpaces)
            li.detach()
          }

          const replyPreview = $(`<div class="replyPreview" 
            data-replied-id="${repliedMsg.id}" 
            data-sender-id="${repliedMsg.m === 'dm' ? repliedMsg.sender._id : repliedMsg.p._id
            }"
            style="font-size:12px; color:${repliedColor}; cursor:pointer;">
            ${indentString}┌ ${repliedName} : ${repliedText}${repliedMsg.edited ? '<span class="edited">(edited)</span>' : ''
            }</div>`)
          li.prepend(replyPreview)

          replyPreview.on('click', () => {
            const targetMsg = document.getElementById(`msg-${repliedMsg.id}`)
            if (targetMsg) {
              targetMsg.scrollIntoView({ behavior: 'smooth', block: 'center' })
              $(targetMsg).css({
                border: `1px solid ${repliedColor}`,
                'background-color': `${repliedColor}20`
             
              })
              setTimeout(
                () =>
                  $(targetMsg).css({
                    border: '1px solid transparent',
                    'background-color': 'unset'
                  }),
                5000
              )
            }
          })
        }
      }

      const urls = []
      const mediaExtensions = /\.(png|jpg|jpeg|gif|svg|mp3|mp4|webm)$/i
      let messageWithPossibleUrl = msg.a
      const parts = messageWithPossibleUrl.split(/(`[^`]+`)|(```[\s\S]*?```)/)
      let parsedText = ''
      parts.forEach(part => {
        if (!part) return
        if (part.startsWith('`') || part.startsWith('```')) {
          parsedText += part
        } else {
          const urlPattern = /(?:> )?(https?:\/\/[^\s"'<>]+)/gi
          let cleanedPart = part.replace(urlPattern, match => {
            const url = match.replace(/^> /, '').replace(/[:\s]+$/, '')
            if (url.match(mediaExtensions)) {
              urls.push(url)
              return ''
            } else {
              return url
            }
          })
          parsedText += cleanedPart
        }
      })
      let finalMessage = parseMarkdown(parseContent(parsedText), parseUrl)
      finalMessage = finalMessage.replace(
        /@([\da-f]{24})(\s*\{heart\})?/g,
        (match, id, heart) => {
          const user = gClient.ppl[id]
          if (user) {
            const nick = parseContent(user.name)
            const hasHeart = heart !== undefined

            if (user.id === gClient.getOwnParticipant().id) {
              if (!playedMentionSounds.has(msg.id)) {
                playedMentionSounds.add(msg.id)
                if (gChatSoundInChat) {
                  if (!pageJustLoaded) {
                    try {
                      const notificationSound = new Audio(
                        './subsound/Notification.mp3'
                      )
                      notificationSound.volume = 1
                      notificationSound.play().catch(err => {
                        console.log('알림음 재생 실패:', err)
                      })
                    } catch (err) {
                      console.log('알림음 로드 실패:', err)
                    }
                  }
                }
              }
            }

            if (hasHeart) {
              return `<span style="color: ${user.color} !important; font-weight: bold; background-color: ${user.color}30; padding: 2px 4px; border-radius: 3px; position: relative; display: inline-block;">@${nick}<img src="./love.svg" style="position: absolute; top: -7px; right: -6px; width: 18px; height: 18px; transform: rotate(25deg);"></span>`
            } else {
              return `<span style="color: ${user.color} !important; font-weight: bold; background-color: ${user.color}30; padding: 2px 4px; border-radius: 3px;">@${nick}</span>`
            }
          } else return match
        }
      )

      finalMessage = finalMessage.replace(
        /@([\w\s•!?.]+?)(\s*\{heart\})?(?=\s|$|<)/g,
        (match, username, heart) => {
          const participant = Object.values(gClient.ppl).find(
            p => p.name === username.trim()
          )
          if (participant) {
            const hasHeart = heart !== undefined

            // 자신이 멘션되었을 때만 소리 재생
            if (participant.id === gClient.getOwnParticipant().id) {
              if (!playedMentionSounds.has(msg.id)) {
                playedMentionSounds.add(msg.id)
                if (gChatSoundInChat) {
                  if (!pageJustLoaded) {
                    try {
                      const notificationSound = new Audio(
                        './subsound/Notification.mp3'
                      )
                      notificationSound.volume = 1
                      notificationSound.play().catch(err => {
                        console.log('알림음 재생 실패:', err)
                      })
                    } catch (err) {
                      console.log('알림음 로드 실패:', err)
                    }
                  }
                }
              }
            }

            if (hasHeart) {
              return `<span style="color: ${participant.color
                } !important; font-weight: bold; background-color: ${participant.color
                }20; padding: 2px 4px; border-radius: 3px; position: relative; display: inline-block;">@${username.trim()}<img src="./love.svg" style="position: absolute; top: -7px; right: -6px; width: 18px; height: 18px; transform: rotate(25deg);"></span>`
            } else {
              return `<span style="color: ${participant.color
                } !important; font-weight: bold; background-color: ${participant.color
                }20; padding: 2px 4px; border-radius: 3px;">@${username.trim()}</span>`
            }
          }
          return match
        }
      )

      const messageDiv = $(`
  <div class="messageDiv">${finalMessage}${msg.edited ? '<span class="edited">(edited)</span>' : ''
        }</div>
`)

      messageDiv.css({
        display: 'inline-block',
        padding: '3px 4px',
        'border-radius': '4px',
        color: (msg.m === 'dm' ? msg.sender?.color : msg.p?.color) || 'white',
        'word-break': 'break-word'
      })

      if (msg.cset && msg.cset.bgcolor) {
        messageDiv.css('background-color', msg.cset.bgcolor)
      }

      messageDiv.css('position', 'relative')

      const deco = msg.cset?.deco
      if (deco && deco.img) {
        const decoImg = $(`
          <img src="${deco.img}" style="
          position:absolute;
          top:${deco.top || '0'};
          right:${deco.right || '0'};
          width:${deco.width || '30px'};
          height:${deco.height || '30px'};
          pointer-events:none;
          transform:${deco.transform || 'none'};
          transform-origin:${deco.transformOrigin || 'center'};
          ">
          `) //left는 넣으면 메시지 길이에 따라 걍 고정됨.. right만 쓰자.
        messageDiv.append(decoImg)
      }

      li.append(messageDiv)

      if (urls.length > 0) {
        const mediaContainer = $(
          '<div class="media-container" style="margin-top: 5px;"></div>'
        )
        urls.forEach(url => {
          if (/\.(png|jpg|jpeg|gif|svg)$/i.test(url)) {
            const img = $(
              `<img src="${url}" style="max-width:200px;max-height:200px; display:block; cursor:pointer;">`
            )
            img.on('error', function () {
              $(this).replaceWith(
                $('<a>').attr('href', url).attr('target', '_blank').text(url)
              )
            })
            img.on('click', function () {
              showImageModal(url)
            })
            mediaContainer.append(img)
            applySpoilerToMedia(img)
          } else if (/\.(mp4|webm)$/i.test(url)) {
            const video = $(
              `<video controls style="max-width:200px;max-height:200px; display:block;"><source src="${url}"></video>`
            )
            video.on('error', function () {
              $(this).replaceWith(
                $('<a>').attr('href', url).attr('target', '_blank').text(url)
              )
            })
            mediaContainer.append(video)
            applySpoilerToMedia(video)
          } else if (/\.(mp3)$/i.test(url)) {
            const audioPlayerHtml = `
          <div class="custom-audio-player">
            <div class="player-controls">
              <button class="play-pause-btn">▶</button>
              <div class="progress-bar-container">
                <div class="progress-bar"></div>
              </div>
              <span class="current-time">00:00</span>
              <span>/</span>
              <span class="total-time">00:00</span>
            </div>
            <div class="audio-filename"></div>
          </div>
        `
            const audioPlayer = $(audioPlayerHtml)
            const audio = new Audio(url)
            const playPauseBtn = audioPlayer.find('.play-pause-btn')
            const progressBar = audioPlayer.find('.progress-bar')
            const progressBarContainer = audioPlayer.find(
              '.progress-bar-container'
            )
            const currentTimeSpan = audioPlayer.find('.current-time')
            const totalTimeSpan = audioPlayer.find('.total-time')
            const filenameSpan = audioPlayer.find('.audio-filename')
            const filename = url.split('/').pop()
            filenameSpan.text(filename)
            playPauseBtn.on('click', () => {
              if (audio.paused) {
                audio.play()
                playPauseBtn.text('❚❚')
              } else {
                audio.pause()
                playPauseBtn.text('▶')
              }
            })
            audio.addEventListener('loadedmetadata', () => {
              const totalMinutes = Math.floor(audio.duration / 60)
              const totalSeconds = Math.floor(audio.duration % 60)
              totalTimeSpan.text(
                `${String(totalMinutes).padStart(2, '0')}:${String(
                  totalSeconds
                ).padStart(2, '0')}`
              )
            })
            audio.addEventListener('timeupdate', () => {
              const currentMinutes = Math.floor(audio.currentTime / 60)
              const currentSeconds = Math.floor(audio.currentTime % 60)
              const progressPercent = (audio.currentTime / audio.duration) * 100
              currentTimeSpan.text(
                `${String(currentMinutes).padStart(2, '0')}:${String(
                  currentSeconds
                ).padStart(2, '0')}`
              )
              progressBar.css('width', `${progressPercent}%`)
            })
            progressBarContainer.on('click', e => {
              const containerWidth = progressBarContainer.width()
              const clickX = e.offsetX
              const newTime = (clickX / containerWidth) * audio.duration
              audio.currentTime = newTime
            })
            audio.addEventListener('ended', () => {
              playPauseBtn.text('▶')
              audio.currentTime = 0
            })
            audio.addEventListener('error', function () {
              audioPlayer.replaceWith(
                $('<a>').attr('href', url).attr('target', '_blank').text(url)
              )
            })
            mediaContainer.append(audioPlayer)
            applySpoilerToMedia(audioPlayer)
          }
        })
        li.append(mediaContainer)
      }

      li.find('.name').css(
        'color',
        (msg.m === 'dm' ? msg.sender?.color : msg.p?.color) || 'white'
      )

      if (gShowChatTooltips)
        li.attr(
          'title',
          msg.m === 'dm'
            ? isOwnMessage
              ? msg.recipient?._id
              : msg.sender?._id
            : msg.p?._id
        )

      li.find('.info-btn').on('click', function () {
        $('.msg-action-popup').remove()
        const popupHtml = `
      <div class="msg-action-popup">
        <button class="reply-btn">Reply</button>
        ${isOwnMessage
            ? `<button class="edit-btn">Edit Message</button><button class="delete-btn">Delete Message</button>`
            : ''
          }
      </div>
    `
        const popup = $(popupHtml)
        const btnOffset = $(this).offset()
        popup.css({
          left: btnOffset.left,
          top: btnOffset.top + $(this).height() + 8
        })
        popup.find('.reply-btn').on('click', function () {
          if (msg.m !== 'dm') MPP.chat.startReply(msg.p, msg.id, msg.a)
          else {
            const replyingTo =
              msg.sender?._id === gClient.user._id ? msg.recipient : msg.sender
            MPP.chat.startDmReply(replyingTo, msg.id)
          }
          $('.msg-action-popup').remove()
        })

        if (isOwnMessage) {
          popup.find('.edit-btn').on('click', function () {
            const latestMsg = messageCache.find(m => m.id === msg.id)
            if (!latestMsg) return
            const urlPattern = /^(https?:\/\/[^\s]+)\s*(.*)$/
            const matches = latestMsg.a.match(urlPattern)
            let existingUrl = ''
            let existingMessage = latestMsg.a
            const closeButtonHtml = `<button id="close-edit-mode" style="border: none; background: none; color: white; margin-right: 10px; cursor: pointer;">❌</button>`
            const notificationHtml = `<div>Exit edit mode : ${closeButtonHtml}</div>`
            editModeNotification = new Notification({
              id: 'edit-mode',
              title: 'Editing mode',
              html: notificationHtml,
              target: '#send',
              duration: -100
            })
            $('#close-edit-mode').on('click', function () {
              isEditing = false
              editingMessageId = null
              editModeNotification.close()
              $('#chat-input').val('')
              $('#uploaded-url-container').empty()
              $('#chat-input').focus()
            })
            if (matches) {
              existingUrl = matches[1]
              existingMessage = matches[2]
            }
            if (existingUrl) {
              const fileName = existingUrl.split('/').pop()
              const urlBlockHtml = `<span class="uploaded-url" data-full-url="${existingUrl}">${fileName}</span>`
              $('#uploaded-url-container').html(urlBlockHtml)
            }
            $('#chat-input').val(existingMessage)
            $('#chat-input').focus()
            isEditing = true
            editingMessageId = latestMsg.id
            $('.msg-action-popup').remove()
          })
          popup.find('.delete-btn').on('click', function () {
            gClient.sendArray([{ m: 'deletemsg', id: msg.id }])
            $('.msg-action-popup').remove()
          })
        }
        $('body').append(popup)
      })

      $(document)
        .off('mousedown.msgpopup')
        .on('mousedown.msgpopup', function (evt) {
          if (!$(evt.target).closest('.msg-action-popup, .info-btn').length) {
            $('.msg-action-popup').remove()
          }
        })

      return li
    }

    function updateMessage(msg) {
      const li = $(`#msg-${msg.id}`)
      if (!li.length) return

      const messageColor =
        (msg.m === 'dm' ? msg.sender?.color : msg.p?.color) || 'white'
      const finalMessage = parseMarkdown(parseContent(msg.a), parseUrl)

      // messageDiv 처리
      let messageSpan = li.find('.messageDiv')
      if (!messageSpan.length) {
        messageSpan = $(
          '<div class="messageDiv" style="position: relative;"></div>'
        )
        li.append(messageSpan)
      }
      messageSpan.css('color', messageColor).html(finalMessage)

      if (msg.edited) {
        messageSpan.find('.edited').remove()
        messageSpan.append('<span class="edited">(edited)</span>')
      }

      const d = msg.cset?.deco

      // deco 이미지 처리
      if (d?.img) {
        let decoImg = messageSpan.find('.messageDeco')
        if (!decoImg.length) {
          decoImg = $(
            '<img class="messageDeco" style="position:absolute; pointer-events:none;">'
          )
          messageSpan.append(decoImg)
        }
        decoImg.attr('src', d.img).css({
          top: d.top || '0',
          right: d.right || '0',
          width: d.width || '30px',
          height: d.height || '30px',
          transform: d.transform || '',
          position: 'absolute',
          pointerEvents: 'none'
        })
      } else {
        messageSpan.find('.messageDeco').remove()
      }

      const urls = []
      const mediaExtensions = /\.(png|jpg|jpeg|gif|svg|mp4|webm)$/i
      msg.a.replace(/https?:\/\/[^\s]+/g, url => {
        if (url.match(mediaExtensions)) urls.push(url)
      })

      li.find('.media-container').remove()
      if (urls.length > 0) {
        const mediaContainer = $(
          '<div class="media-container" style="margin-top: 5px;"></div>'
        )
        urls.forEach(url => {
          if (/\.(png|jpg|jpeg|gif|svg)$/i.test(url)) {
            const img = $(
              `<img src="${url}" style="max-width:200px;max-height:200px; display:block; cursor:pointer;">`
            )
            img.on('error', function () {
              $(this).replaceWith(
                $('<a>').attr('href', url).attr('target', '_blank').text(url)
              )
            })
            img.on('click', function () {
              showImageModal(url)
            })
            mediaContainer.append(img)
            applySpoilerToMedia(img)
          } else if (/\.(mp4|webm)$/i.test(url)) {
            const video = $(
              `<video controls style="max-width:200px;max-height:200px; display:block;"><source src="${url}"></video>`
            )
            video.on('error', function () {
              $(this).replaceWith(
                $('<a>').attr('href', url).attr('target', '_blank').text(url)
              )
            })
            mediaContainer.append(video)
            applySpoilerToMedia(video)
          }
        })
        li.append(mediaContainer)
      }

      li.find('.name').css('color', messageColor)

      // 답글 처리
      const repliedMessages = $(`.replyPreview[data-replied-id="${msg.id}"]`)
      repliedMessages.each(function () {
        const $this = $(this)
        const repliedName = escapeHtml(
          msg.m === 'dm' ? msg.sender.name : msg.p.name
        )
        const repliedColor =
          msg.m === 'dm' ? msg.sender?.color : msg.p?.color || 'white'
        const repliedText = escapeHtml(msg.a)
        const prefix = $this.text().split('┌')[0]
        $this.css('color', repliedColor)
        $this.text(`${prefix}┌ ${repliedName} : ${repliedText}`)
      })

      publicMethods.scrollToBottom()
    }

    const publicMethods = {
      init: function () {
        document.getElementById('send').addEventListener('click', () => {
          const message = $chatInput.val().trim()
          if (message) {
            this.send(message)
            $chatInput.val('')
          }
        })
        $chatInput.on('focus', () => {
          releaseKeyboard()
          $('#chat').addClass('chatting')
          this.scrollToBottom()
        })
        $(document).mousedown(evt => {
          if (!$('#chat').has(evt.target).length) {
            this.blur()
          }
        })
        document.addEventListener('touchstart', event => {
          for (const touch of event.changedTouches) {
            if (!$('#chat').has(touch.target).length) {
              this.blur()
            }
          }
        })
        $(document).on('keydown', evt => {
          if ($('#chat').hasClass('chatting')) {
            if (evt.key === 'Escape') {
              this.blur()
              if (!gNoPreventDefault) evt.preventDefault()
              evt.stopPropagation()
            } else if (evt.key === 'Enter') {
              $chatInput.focus()
            }
          } else if (!gModal && (evt.key === 'Escape' || evt.key === 'Enter')) {
            $chatInput.focus()
          }
        })

        $chatInput.on('input', () => {
          const message = $chatInput.val().trim()
          if (!message || isEditing) return
          gClient.sendArray([{ m: 'typing', typing: true }])

          clearTimeout(typingTimeout)
          typingTimeout = setTimeout(() => {
            gClient.sendArray([{ m: 'typing', typing: false }])
          }, 2800)
        })

        $chatInput.on('keydown', evt => {
          if (evt.key === 'Enter') {
            const message = $(evt.target).val()
            if (isEditing) {
              this.send(message)
              editModeNotification.close()
            } else {
              if (message.length === 0) {
                if (gIsDming) this.endDM()
                if (gIsReplying) this.cancelReply()
                if ($('#uploaded-url-container .uploaded-url').length > 0) {
                  this.send('')
                }
              } else {
                this.send(message)
              }
            }
            $chatInput.val('')
            $('#uploaded-url-container').empty()
            setTimeout(() => this.blur(), 100)
            if (!gNoPreventDefault) evt.preventDefault()
            evt.stopPropagation()
          } else if (evt.key === 'Escape') {
            this.blur()
            if (isEditing) {
              editModeNotification.close()
              isEditing = false
              editingMessageId = null
              $('#uploaded-url-container').empty()
              $chatInput.val('')
            }
            if (!gNoPreventDefault) evt.preventDefault()
            evt.stopPropagation()
          } else if (evt.key === 'Tab') {
            if (!gNoPreventDefault) evt.preventDefault()
            evt.stopPropagation()
          }
        })

        $('#uploaded-url-container').on('click', '.uploaded-url', function () {
          $(this).remove()
          $('#chat-input').focus()
        })

        $('#chat-plus').on('click', () => {
          $('.msg-action-popup').remove()
          const popupHtml = $(`
                    <div class="msg-action-popup">
                        <button class="select-file-btn">Upload</button>
                    </div>
                `)
          $('body').append(popupHtml)
          const btnOffset = $('#chat-plus').offset()
          const popupHeight = popupHtml.outerHeight()
          popupHtml.css({
            left: btnOffset.left,
            top: btnOffset.top - popupHeight - 8
          })
          popupHtml.find('.select-file-btn').on('click', () => {
            const fileInput = $(
              '<input type="file" accept="image/*,video/*" style="display:none">'
            )
            $('body').append(fileInput)
            fileInput.on('change', e => {
              const file = e.target.files[0]
              if (!file) {
                fileInput.remove()
                popupHtml.remove()
                return
              }
              const progressContainer = $(`
                            <div class="upload-progress-container">
                                <div class="upload-progress-bar"></div>
                                <span class="upload-progress-text">0%</span>
                            </div>
                        `)
              $('#chat').append(progressContainer)
              const formData = new FormData()
              formData.append('file', file)
              const xhr = new XMLHttpRequest()
              xhr.open('POST', '/upload')
              xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                  const percent = (event.loaded / event.total) * 100
                  progressContainer
                    .find('.upload-progress-bar')
                    .css('width', percent + '%')
                  progressContainer
                    .find('.upload-progress-text')
                    .text(Math.round(percent) + '%')
                }
              }
              xhr.onload = () => {
                progressContainer.remove()
                if (xhr.status === 200) {
                  try {
                    const data = JSON.parse(xhr.responseText)
                    if (data.url) {
                      const fileName = data.url.split('/').pop()
                      const urlBlockHtml = `<span class="uploaded-url" data-full-url="${data.url}">${fileName}</span>`
                      $('#uploaded-url-container').html(urlBlockHtml)
                      $('#chat-input').focus()
                    }
                  } catch (err) {
                    console.error('Upload response parsing failed:', err)
                    alert('Failed to process upload response!')
                  }
                } else {
                  console.error('Upload failed:', xhr.status, xhr.statusText)
                  alert('Failed to upload! (Server responded with an error)')
                }
              }
              xhr.onerror = () => {
                progressContainer.remove()
                console.error('Upload failed due to network error')
                alert('Failed to upload! (Network error)')
              }
              xhr.send(formData)
              fileInput.remove()
              popupHtml.remove()
            })
            fileInput.click()
          })
          $(document).on('mousedown.uploadPopup', evt => {
            if (
              !$(evt.target).closest('.msg-action-popup, #chat-plus').length
            ) {
              popupHtml.remove()
              $(document).off('mousedown.uploadPopup')
            }
          })
        })
        $(document).on('click', '.spoiler-overlay', function () {
          $(this).toggleClass('revealed')
        })
      },

      startDM: function (part) {
        gIsDming = true
        gDmParticipant = part
        $chatInput[0].placeholder = 'Direct messaging ' + part.name + '.'
      },
      endDM: function () {
        gIsDming = false
        $chatInput[0].placeholder = window.i18nextify.i18next.t(
          'You can chat with this thing~!'
        )
      },
      startReply: function (part, id, msgText) {
        if (gIsDming) this.endDM()
        $(`#msg-${gMessageId}`).css({
          'background-color': 'unset',
          border: '1px solid transparent'
        })
        gIsReplying = true
        gReplyParticipant = part
        gMessageId = id
        $chatInput[0].placeholder = `Replying to ${part.name}`
        $(`#msg-${gMessageId}`).css({
          border: `1px solid ${part.color}80`,
          'background-color': `${part.color}20`
        })
      },
      startDmReply: function (part, id) {
        $(`#msg-${gMessageId}`).css({
          'background-color': 'unset',
          border: '1px solid transparent'
        })
        gIsReplying = true
        gIsDming = true
        gMessageId = id
        gReplyParticipant = part
        gDmParticipant = part
        $chatInput[0].placeholder = `Replying to ${part.name} in a DM.`
        $(`#msg-${gMessageId}`).css({
          border: `1px solid ${part.color}80`,
          'background-color': `${part.color}20`
        })
      },
      cancelReply: function () {
        if (gIsDming) gIsDming = false
        gIsReplying = false
        $(`#msg-${gMessageId}`).css({
          'background-color': 'unset',
          border: '1px solid transparent'
        })
        $chatInput[0].placeholder = window.i18nextify.i18next.t(
          'You can chat with this thing~!'
        )
      },
      show: function () {
        $('#chat').fadeIn()
      },
      hide: function () {
        $('#chat').fadeOut()
      },
      clear: function () {
        $chatUl.empty()
        messageCache.length = 0
        $('#typing-indicator').css('opacity', '0').css('visibility', 'hidden')
        if (typingTimeout) {
          clearTimeout(typingTimeout)
          typingTimeout = null
        }
      },
      scrollToBottom: function () {
        const ele = $chatUl.get(0)
        if (ele) ele.scrollTop = ele.scrollHeight - ele.clientHeight
      },
      blur: function () {
        if ($('#chat').hasClass('chatting')) {
          $chatInput[0].blur()
          $('#chat').removeClass('chatting')
          this.scrollToBottom()
          captureKeyboard()
        }
        clearTimeout(typingTimeout)
        gClient.sendArray([{ m: 'typing', typing: false }])
      },
      send: function (message) {
        const urlBlock = $('#uploaded-url-container .uploaded-url')
        const fullUrl = urlBlock.data('full-url')
        let urlText = ''
        clearTimeout(typingTimeout)
        gClient.sendArray([{ m: 'typing', typing: false }])
        if (fullUrl) {
          const parts = fullUrl.split('/')
          const filename = parts.pop()
          const encodedFilename = encodeURIComponent(filename)
          urlText = parts.join('/') + '/' + encodedFilename
        }
        let fullMessage = message
        if (isEditing) {
          const originalMessage = messageCache.find(
            m => m.id === editingMessageId
          )
          if (!originalMessage) {
            isEditing = false
            editingMessageId = null
            return
          }
          let originalFullMessage = originalMessage.a
          let newFullMessage = (urlText ? urlText + ' ' : '') + message
          if (originalFullMessage.trim() === newFullMessage.trim()) {
            isEditing = false
            editingMessageId = null
            return
          }
          if (!urlText) {
            const urlPattern = /^(https?:\/\/[^\s]+)\s*(.*)$/
            fullMessage = message.replace(urlPattern, '$2').trim()
          } else {
            fullMessage = newFullMessage
          }
          gClient.sendArray([
            { m: 'editmsg', id: editingMessageId, to: fullMessage }
          ])
          isEditing = false
          editingMessageId = null
        } else {
          fullMessage = urlText ? urlText + ' ' + message : message
          if (gIsReplying) {
            if (gIsDming) {
              gClient.sendArray([
                {
                  m: 'dm',
                  reply_to: gMessageId,
                  _id: gReplyParticipant._id,
                  message: fullMessage
                }
              ])
              setTimeout(() => MPP.chat.cancelReply(), 100)
            } else {
              gClient.sendArray([
                {
                  m: 'a',
                  reply_to: gMessageId,
                  _id: gReplyParticipant._id,
                  message: fullMessage
                }
              ])
              setTimeout(() => MPP.chat.cancelReply(), 100)
            }
          } else {
            if (gIsDming) {
              gClient.sendArray([
                { m: 'dm', _id: gDmParticipant._id, message: fullMessage }
              ])
            } else {
              gClient.sendArray([{ m: 'a', message: fullMessage }])
            }
          }
        }
      },
      receive: function (msg) {
        if (msg.m === 'editmsg') {
          const index = messageCache.findIndex(m => m.id === msg.msg?.id)
          if (index !== -1) messageCache[index] = msg.msg
          if (msg.msg) updateMessage(msg.msg)
          return
        }

        if (msg.m === 'deletemsg') {
          $(`#msg-${msg.id}`).remove()
          messageCache = messageCache.filter(m => m.id !== msg.id)
          return
        }

        const senderId = msg.m === 'dm' ? msg.sender?._id : msg.p?._id
        if (!senderId) return
        if (gChatMutes.includes(senderId)) return

        const li = createMessageElement(msg)
        $('#chat ul').append(li)
        messageCache.push(msg)

        //li.get(0).offsetHeight; // force reflow
        li.find('img, video').each((_, media) => {
          const $media = $(media)
          $media.on('load loadedmetadata', () => chat.scrollToBottom())
        })

        function updateOpacity() {
          const eles = $('#chat ul li').get()
          for (let i = 1; i <= 50 && i <= eles.length; i++) {
            eles[eles.length - i].style.opacity = (1.0 - i * 0.03).toFixed(2)
          }
        }

        if (!isPageReload) {
          li.css('opacity', 0)
          setTimeout(() => {
            li.css('opacity', 1)
            updateOpacity()
          }, 43)
        } else {
          updateOpacity()
        }

        const eles = $('#chat ul li').get()
        if (eles.length > 50) $(eles[0]).css('display', 'none')
        if (eles.length > 256) {
          messageCache.shift()
          $(eles[0]).remove()
        }
        const chatEle = $('#chat ul').get(0)
        if (
          !$('#chat').hasClass('chatting') ||
          chatEle.scrollTop > chatEle.scrollHeight - chatEle.offsetHeight - 50
        ) {
          chat.scrollToBottom()
        }
      }
    }

    gClient.on('ch', msg => {
      $('#typing-indicator').css('opacity', '0')
      setTimeout(() => {
        $('#typing-indicator').css('visibility', 'hidden')
      }, 300)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        typingTimeout = null
      }

      msg.ch.settings.chat ? publicMethods.show() : publicMethods.hide()
    })
    gClient.on('c', msg => {
      publicMethods.clear()
      if (msg.c) {
        msg.c.forEach(m => publicMethods.receive(m))
      }
      $(
        '#chat ul li .media-container img, #chat ul li .media-container video, #chat ul li .media-container .custom-audio-player'
      ).each(function () {
        applySpoilerToMedia($(this))
      })
    })
    gClient.on('typing', msg => {
      if (!msg.users || msg.users.length === 0) {
        $('#typing-indicator').css('opacity', '0')
        setTimeout(() => {
          $('#typing-indicator').css('visibility', 'hidden')
        }, 300)
        return
      }

      function truncateName(name, maxLength = 15) {
        if (name.length > maxLength) {
          return name.substring(0, maxLength) + '...'
        }
        return name
      }

      const myId = gClient.user?._id || gClient.getOwnParticipant()?._id
      const otherUsers = msg.users.filter(u => u._id !== myId)

      if (otherUsers.length === 0) {
        $('#typing-indicator').css('opacity', '0')
        setTimeout(() => {
          $('#typing-indicator').css('visibility', 'hidden')
        }, 300)
        return
      }

      let html = ''
      if (otherUsers.length === 1) {
        const u = otherUsers[0]
        html = `<span style="color: ${u.color || '#fff'}">${truncateName(
          u.name
        )}</span> is typing...`
      } else if (otherUsers.length === 2) {
        const u1 = otherUsers[0]
        const u2 = otherUsers[1]
        html = `<span style="color: ${u1.color || '#fff'}">${truncateName(
          u1.name
        )}</span> and <span style="color: ${u2.color || '#fff'}">${truncateName(
          u2.name
        )}</span> are typing...`
      } else {
        const u1 = otherUsers[0]
        const u2 = otherUsers[1]
        html = `<span style="color: ${u1.color || '#fff'}">${truncateName(
          u1.name
        )}</span>, <span style="color: ${u2.color || '#fff'}">${truncateName(
          u2.name
        )}</span> and ${otherUsers.length - 2} others are typing...`
      }

      $('#typing-indicator')
        .html(html)
        .css('visibility', 'visible')
        .css('opacity', '0')
      setTimeout(() => {
        $('#typing-indicator').css('opacity', '1')
      }, 10)
    })
    gClient.on('a', msg => publicMethods.receive(msg))
    gClient.on('dm', msg => publicMethods.receive(msg))
    gClient.on('editmsg', msg => publicMethods.receive(msg))
    gClient.on('updateReplyPreview', data => {
      updateMessage(data.msg)
    })
    gClient.on('deletemsg', msg => publicMethods.receive(msg))
    publicMethods.init()
    console.log('inited')
    return publicMethods
  })()

  let messageParticleLayer = null
  function ensureParticleLayer() {
    if (!messageParticleLayer) {
      messageParticleLayer = document.createElement('div')
      messageParticleLayer.id = 'message-particle-layer'
      Object.assign(messageParticleLayer.style, {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 9999
      })
      document.body.appendChild(messageParticleLayer)
    }
    return messageParticleLayer
  }

  function animateDeleteMessage(msg, showDeleted = false) {
    if (gOffAniChat) {
      $(`#msg-${msg.id}`).remove()
      return
    }

    const messageEl = $(`#msg-${msg.id}`)
    if (!messageEl.length) return

    let messageText = messageEl.text()
    if (!messageText) {
      messageEl.remove()
      return
    }

    if (messageText.length > 200) {
      messageText = messageText.slice(0, 200)
    }

    const color = msg.p?.color || '#fff'
    const rect = messageEl[0].getBoundingClientRect()
    const style = window.getComputedStyle(messageEl[0])

    const baseX = rect.left
    const baseY = rect.top

    if (showDeleted) {
      messageEl.html('<span style="color: red;">[Deleted]</span>')
    } else {
      messageEl.css('visibility', 'hidden')
    }

    const layer = ensureParticleLayer()

    // physics settings ///////

    let activeChars = []
    const parts = 3
    const len = messageText.length
    const size = Math.ceil(len / parts)

    for (let i = 0; i < parts; i++) {
      const groupText = messageText.slice(i * size, (i + 1) * size)
      if (!groupText) continue

      const groupEl = document.createElement('span')
      groupEl.textContent = groupText
      groupEl.className = 'animated-char-group'
      Object.assign(groupEl.style, {
        position: 'absolute',
        left: `${baseX}px`,
        top: `${baseY}px`,
        color: color,
        display: 'inline-block',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        pointerEvents: 'none',
        whiteSpace: 'pre'
      })

      layer.appendChild(groupEl)

      activeChars.push({
        el: groupEl,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 8 - 5,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 30
      })
    }

    const gravity = 0.25
    const damping = 0.7
    const floor = window.innerHeight + 1000
    const FPS = 60
    const FRAME_DURATION = 1000 / FPS

    const intervalId = setInterval(() => {
      let stillMoving = false

      activeChars.forEach(c => {
        c.vy += gravity
        c.x += c.vx
        c.y += c.vy
        c.rotation += c.vRot

        if (c.y < floor || Math.abs(c.vy) > 0.1 || Math.abs(c.vRot) > 0.1) {
          stillMoving = true
        }

        c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.rotation}deg)`
        c.el.style.opacity = Math.max(0, 1 - c.y / (floor + 200))

        if (c.y >= floor) {
          c.y = floor
          c.vy *= -damping
          c.vx *= 0.98
        }
      })

      if (!stillMoving) clearInterval(intervalId)
    }, FRAME_DURATION)

    setTimeout(() => {
      messageEl.remove()
      activeChars.forEach(c => c.el.remove())
      clearInterval(intervalId)
      activeChars = []
    }, 3500)
  }

  // delete chat message animation

  gClient.on('deletemsg', msg => {
    //console.log('deletemsg 감지됨', msg)

    msg.chat.forEach(chatMsg => {
      animateDeleteMessage(chatMsg, true) // [Deleted] 표시
    })
  })

  gClient.on('clearchat', msg => {
    //console.log('clearchat 감지됨', msg)

    const $chatList = $('#chat ul')
    const latest = msg.chat ? msg.chat.slice(-7) : []

    const idsToRemove = []

    $chatList.find('li').each(function (i, el) {
      const id = $(el).attr('id')?.replace('msg-', '')
      if (!latest.some(c => String(c.id) === String(id))) {
        idsToRemove.push(id)
        $(el).remove()
      }
    })

    latest.forEach(chatMsg => {
      animateDeleteMessage(chatMsg, false) // [Deleted] 표시 안함
    })

    setTimeout(() => {
      idsToRemove.forEach(id => {
        $(`#msg-${id}`).remove()
      })
    }, 2000)
  })

  // MIDI

  ////////////////////////////////////////////////////////////////

  var MIDI_TRANSPOSE = -12
  var MIDI_KEY_NAMES = ['a-1', 'as-1', 'b-1']
  var bare_notes = 'c cs d ds e f fs g gs a as b'.split(' ')
  for (var oct = 0; oct < 7; oct++) {
    for (var i in bare_notes) {
      MIDI_KEY_NAMES.push(bare_notes[i] + oct)
    }
  }
  MIDI_KEY_NAMES.push('c7')

  var devices_json = '[]'
  function sendDevices() {
    gClient.sendArray([{ m: 'devices', list: JSON.parse(devices_json) }])
  }
  gClient.on('connect', sendDevices)

  var pitchBends = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0
  }

    ; (function () {
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(
          function (midi) {
            //console.log(midi);
            function midimessagehandler(evt) {
              if (!evt.target.enabled) return
              //console.log(evt);
              var channel = evt.data[0] & 0xf
              var cmd = evt.data[0] >> 4
              var note_number = evt.data[1]
              var vel = evt.data[2]
              if (gDisableMIDIDrumChannel && channel == 9) {
                return
              }
              //console.log(channel, cmd, note_number, vel);
              if (cmd == 8 || (cmd == 9 && vel == 0)) {
                // NOTE_OFF
                release(
                  MIDI_KEY_NAMES[
                  note_number -
                  9 +
                  MIDI_TRANSPOSE +
                  transpose +
                  pitchBends[channel]
                  ]
                )
              } else if (cmd == 9) {
                // NOTE_ON
                if (evt.target.volume !== undefined) vel *= evt.target.volume
                press(
                  MIDI_KEY_NAMES[
                  note_number -
                  9 +
                  MIDI_TRANSPOSE +
                  transpose +
                  pitchBends[channel]
                  ],
                  vel / 127
                )
              } else if (cmd == 11) {
                // CONTROL_CHANGE
                if (!gAutoSustain) {
                  if (note_number == 64) {
                    if (vel > 20) {
                      pressSustain()
                    } else {
                      releaseSustain()
                    }
                  }
                }
              } else if (cmd == 14) {
                var pitchMod = evt.data[1] + (evt.data[2] << 7) - 0x2000
                pitchMod = Math.round(pitchMod / 1000)
                pitchBends[channel] = pitchMod
              }
            }

            function deviceInfo(dev) {
              return {
                type: dev.type,
                //id: dev.id,
                manufacturer: dev.manufacturer,
                name: dev.name,
                version: dev.version,
                //connection: dev.connection,
                //state: dev.state,
                enabled: dev.enabled,
                volume: dev.volume
              }
            }

            function updateDevices() {
              var list = []
              if (midi.inputs.size > 0) {
                var inputs = midi.inputs.values()
                for (
                  var input_it = inputs.next();
                  input_it && !input_it.done;
                  input_it = inputs.next()
                ) {
                  var input = input_it.value
                  list.push(deviceInfo(input))
                }
              }
              if (midi.outputs.size > 0) {
                var outputs = midi.outputs.values()
                for (
                  var output_it = outputs.next();
                  output_it && !output_it.done;
                  output_it = outputs.next()
                ) {
                  var output = output_it.value
                  list.push(deviceInfo(output))
                }
              }
              var new_json = JSON.stringify(list)
              if (new_json !== devices_json) {
                devices_json = new_json
                sendDevices()
              }
            }

            function plug() {
              if (midi.inputs.size > 0) {
                var inputs = midi.inputs.values()
                for (
                  var input_it = inputs.next();
                  input_it && !input_it.done;
                  input_it = inputs.next()
                ) {
                  var input = input_it.value
                  //input.removeEventListener("midimessage", midimessagehandler);
                  //input.addEventListener("midimessage", midimessagehandler);
                  input.onmidimessage = midimessagehandler
                  if (input.enabled !== false) {
                    input.enabled = true
                  }
                  if (typeof input.volume === 'undefined') {
                    input.volume = 1.0
                  }
                  //console.log("input", input);
                }
              }
              if (midi.outputs.size > 0) {
                var outputs = midi.outputs.values()
                for (
                  var output_it = outputs.next();
                  output_it && !output_it.done;
                  output_it = outputs.next()
                ) {
                  var output = output_it.value
                  //output.enabled = false; // edit: don't touch
                  if (typeof output.volume === 'undefined') {
                    output.volume = 1.0
                  }
                  //console.log("output", output);
                }
                gMidiOutTest = function (
                  note_name,
                  vel,
                  delay_ms,
                  participantId
                ) {
                  if (!gOutputOwnNotes && participantId === gClient.participantId)
                    return
                  var note_number = MIDI_KEY_NAMES.indexOf(note_name)
                  if (note_number == -1) return
                  note_number = note_number + 9 - MIDI_TRANSPOSE
                  var outputs = midi.outputs.values()
                  for (
                    var output_it = outputs.next();
                    output_it && !output_it.done;
                    output_it = outputs.next()
                  ) {
                    var output = output_it.value
                    if (output.enabled) {
                      var v = vel
                      if (output.volume !== undefined) v *= output.volume
                      output.send(
                        [0x90, note_number, v],
                        window.performance.now() + delay_ms
                      )
                    }
                  }
                }
              }
              showConnections(false)
              updateDevices()
            }

            midi.addEventListener('statechange', function (evt) {
              if (evt instanceof MIDIConnectionEvent) {
                plug()
              }
            })

            plug()

            var connectionsNotification

            function showConnections(sticky) {
              //if(document.getElementById("Notification-MIDI-Connections"))
              //sticky = 1; // todo: instead,
              var inputs_ul = document.createElement('ul')
              if (midi.inputs.size > 0) {
                var inputs = midi.inputs.values()
                for (
                  var input_it = inputs.next();
                  input_it && !input_it.done;
                  input_it = inputs.next()
                ) {
                  var input = input_it.value
                  var li = document.createElement('li')
                  li.connectionId = input.id
                  li.classList.add('connection')
                  if (input.enabled) li.classList.add('enabled')
                  li.textContent = input.name
                  li.addEventListener('click', function (evt) {
                    var inputs = midi.inputs.values()
                    for (
                      var input_it = inputs.next();
                      input_it && !input_it.done;
                      input_it = inputs.next()
                    ) {
                      var input = input_it.value
                      if (input.id === evt.target.connectionId) {
                        input.enabled = !input.enabled
                        evt.target.classList.toggle('enabled')
                        //console.log("click", input);
                        updateDevices()
                        return
                      }
                    }
                  })
                  if (gMidiVolumeTest) {
                    var knob = document.createElement('canvas')
                    mixin(knob, {
                      width: 16 * window.devicePixelRatio,
                      height: 16 * window.devicePixelRatio,
                      className: 'knob'
                    })
                    li.appendChild(knob)
                    knob = new Knob(knob, 0, 2, 0.01, input.volume, 'volume')
                    knob.canvas.style.width = '16px'
                    knob.canvas.style.height = '16px'
                    knob.canvas.style.float = 'right'
                    knob.on('change', function (k) {
                      input.volume = k.value
                    })
                    knob.emit('change', knob)
                  }
                  inputs_ul.appendChild(li)
                }
              } else {
                inputs_ul.textContent = '(none)'
              }
              var outputs_ul = document.createElement('ul')
              if (midi.outputs.size > 0) {
                var outputs = midi.outputs.values()
                for (
                  var output_it = outputs.next();
                  output_it && !output_it.done;
                  output_it = outputs.next()
                ) {
                  var output = output_it.value
                  var li = document.createElement('li')
                  li.connectionId = output.id
                  li.classList.add('connection')
                  if (output.enabled) li.classList.add('enabled')
                  li.textContent = output.name
                  li.addEventListener('click', function (evt) {
                    var outputs = midi.outputs.values()
                    for (
                      var output_it = outputs.next();
                      output_it && !output_it.done;
                      output_it = outputs.next()
                    ) {
                      var output = output_it.value
                      if (output.id === evt.target.connectionId) {
                        output.enabled = !output.enabled
                        evt.target.classList.toggle('enabled')
                        //console.log("click", output);
                        updateDevices()
                        return
                      }
                    }
                  })
                  if (gMidiVolumeTest) {
                    var knob = document.createElement('canvas')
                    mixin(knob, {
                      width: 16 * window.devicePixelRatio,
                      height: 16 * window.devicePixelRatio,
                      className: 'knob'
                    })
                    li.appendChild(knob)
                    knob = new Knob(knob, 0, 2, 0.01, output.volume, 'volume')
                    knob.canvas.style.width = '16px'
                    knob.canvas.style.height = '16px'
                    knob.canvas.style.float = 'right'
                    knob.on('change', function (k) {
                      output.volume = k.value
                    })
                    knob.emit('change', knob)
                  }
                  outputs_ul.appendChild(li)
                }
              } else {
                outputs_ul.textContent = '(none)'
              }

              outputs_ul.setAttribute('translated', '')
              inputs_ul.setAttribute('translated', '')

              var div = document.createElement('div')
              var h1 = document.createElement('h1')
              h1.textContent = 'Inputs'
              div.appendChild(h1)
              div.appendChild(inputs_ul)
              h1 = document.createElement('h1')
              h1.textContent = 'Outputs'
              div.appendChild(h1)
              div.appendChild(outputs_ul)

              //만약 버튼이 비활성화 상태라면, 알림 대상은 toggle-btn으로 설정
              const targetElement = $('#midi-btn')
              let notificationTarget = '#midi-btn'
              if (
                targetElement.hasClass('ugly-button') &&
                targetElement.css('pointer-events') === 'none'
              ) {
                notificationTarget = '#toggle-btn'
              }
              connectionsNotification = new Notification({
                id: 'MIDI-Connections',
                title: 'MIDI Connections',
                duration: sticky ? '-1' : '4500',
                html: div,
                target: notificationTarget
              })
            }

            document
              .getElementById('midi-btn')
              .addEventListener('click', function (evt) {
                if (!document.getElementById('Notification-MIDI-Connections'))
                  showConnections(true)
                else {
                  connectionsNotification.close()
                }
              })
          },
          function (err) {
            //console.log(err);
          }
        )
      }
    })()

  // bug supply

  ////////////////////////////////////////////////////////////////

  window.onerror = function (message, url, line) {
    /*var url = url || "(no url)";
    var line = line || "(no line)";
    // errors in socket.io
    if(url.indexOf("socket.io.js") !== -1) {
      if(message.indexOf("INVALID_STATE_ERR") !== -1) return;
      if(message.indexOf("InvalidStateError") !== -1) return;
      if(message.indexOf("DOM Exception 11") !== -1) return;
      if(message.indexOf("Property 'open' of object #<c> is not a function") !== -1) return;
      if(message.indexOf("Cannot call method 'close' of undefined") !== -1) return;
      if(message.indexOf("Cannot call method 'close' of null") !== -1) return;
      if(message.indexOf("Cannot call method 'onClose' of null") !== -1) return;
      if(message.indexOf("Cannot call method 'payload' of null") !== -1) return;
      if(message.indexOf("Unable to get value of the property 'close'") !== -1) return;
      if(message.indexOf("NS_ERROR_NOT_CONNECTED") !== -1) return;
      if(message.indexOf("Unable to get property 'close' of undefined or null reference") !== -1) return;
      if(message.indexOf("Unable to get value of the property 'close': object is null or undefined") !== -1) return;
      if(message.indexOf("this.transport is null") !== -1) return;
    }
    // errors in soundmanager2
    if(url.indexOf("soundmanager2.js") !== -1) {
      // operation disabled in safe mode?
      if(message.indexOf("Could not complete the operation due to error c00d36ef") !== -1) return;
      if(message.indexOf("_s.o._setVolume is not a function") !== -1) return;
    }
    // errors in midibridge
    if(url.indexOf("midibridge") !== -1) {
      if(message.indexOf("Error calling method on NPObject") !== -1) return;
    }
    // too many failing extensions injected in my html
    if(url.indexOf(".js") !== url.length - 3) return;
    // extensions inject cross-domain embeds too
    if(url.toLowerCase().indexOf("multiplayerpiano.com") == -1) return;
  
    // errors in my code
    if(url.indexOf("script.js") !== -1) {
      if(message.indexOf("Object [object Object] has no method 'on'") !== -1) return;
      if(message.indexOf("Object [object Object] has no method 'off'") !== -1) return;
      if(message.indexOf("Property '$' of object [object Object] is not a function") !== -1) return;
    }
  
    var enc = "/bugreport/"
      + (message ? encodeURIComponent(message) : "") + "/"
      + (url ? encodeURIComponent(url) : "") + "/"
      + (line ? encodeURIComponent(line) : "");
    var img = new Image();
    img.src = enc;*/
  }

  // API
  window.MPP = {
    get press() {
      return press
    },
    set press(func) {
      press = func
    },

    get release() {
      return release
    },
    set release(func) {
      release = func
    },

    get pressSustain() {
      return pressSustain
    },
    set pressSustain(func) {
      pressSustain = func
    },

    get releaseSustain() {
      return releaseSustain
    },
    set releaseSustain(func) {
      releaseSustain = func
    },

    piano: gPiano,
    client: gClient,
    chat: chat,
    noteQuota: gNoteQuota,
    soundSelector: gSoundSelector,
    Notification: Notification
  }

  // synth
  var enableSynth = false
  var audio = gPiano.audio
  var context = gPiano.audio.context
  var synth_gain = context.createGain()
  synth_gain.gain.value = 0.05
  synth_gain.connect(audio.synthGain)

  var osc_types = ['sine', 'square', 'sawtooth', 'triangle']
  var osc_type_index = 1

  var osc1_type = 'square'
  var osc1_attack = 0
  var osc1_decay = 0.2
  var osc1_sustain = 0.5
  var osc1_release = 2.0

  function synthVoice(note_name, time) {
    var note_number = MIDI_KEY_NAMES.indexOf(note_name)
    note_number = note_number + 9 - MIDI_TRANSPOSE
    var freq = Math.pow(2, (note_number - 69) / 12) * 440.0
    this.osc = context.createOscillator()
    this.osc.type = osc1_type
    this.osc.frequency.value = freq
    this.gain = context.createGain()
    this.gain.gain.value = 0
    this.osc.connect(this.gain)
    this.gain.connect(synth_gain)
    this.osc.start(time)
    this.gain.gain.setValueAtTime(0, time)
    this.gain.gain.linearRampToValueAtTime(1, time + osc1_attack)
    this.gain.gain.linearRampToValueAtTime(
      osc1_sustain,
      time + osc1_attack + osc1_decay
    )
  }

  synthVoice.prototype.stop = function (time) {
    //this.gain.gain.setValueAtTime(osc1_sustain, time);
    this.gain.gain.linearRampToValueAtTime(0, time + osc1_release)
    this.osc.stop(time + osc1_release)
  }
    ; (function () {
      var button = document.getElementById('synth-btn')
      var notification

      button.addEventListener('click', function () {
        if (notification) {
          notification.close()
        } else {
          showSynth()
        }
      })

      function showSynth() {
        var html = document.createElement('div')

          // on/off button
          ; (function () {
            var button = document.createElement('input')
            mixin(button, {
              type: 'button',
              value: window.i18nextify.i18next.t('ON/OFF'),
              className: enableSynth ? 'switched-on' : 'switched-off'
            })
            button.addEventListener('click', function (evt) {
              enableSynth = !enableSynth
              button.className = enableSynth ? 'switched-on' : 'switched-off'
              if (!enableSynth) {
                // stop all
                for (var i in audio.playings) {
                  if (!audio.playings.hasOwnProperty(i)) continue
                  var playing = audio.playings[i]
                  if (playing && playing.voice) {
                    playing.voice.osc.stop()
                    playing.voice = undefined
                  }
                }
              }
            })
            html.appendChild(button)
          })()

        // mix
        var knob = document.createElement('canvas')
        mixin(knob, {
          width: 32 * window.devicePixelRatio,
          height: 32 * window.devicePixelRatio,
          className: 'knob'
        })
        html.appendChild(knob)
        knob = new Knob(knob, 0, 100, 0.1, 50, 'mix', '%')
        knob.canvas.style.width = '32px'
        knob.canvas.style.height = '32px'
        knob.on('change', function (k) {
          var mix = k.value / 100
          audio.pianoGain.gain.value = 1 - mix
          audio.synthGain.gain.value = mix
        })
        knob.emit('change', knob)

          // osc1 type
          ; (function () {
            osc1_type = osc_types[osc_type_index]
            var button = document.createElement('input')
            mixin(button, {
              type: 'button',
              value: window.i18nextify.i18next.t(osc_types[osc_type_index])
            })
            button.addEventListener('click', function (evt) {
              if (++osc_type_index >= osc_types.length) osc_type_index = 0
              osc1_type = osc_types[osc_type_index]
              button.value = window.i18nextify.i18next.t(osc1_type)
            })
            html.appendChild(button)
          })()

        // osc1 attack
        var knob = document.createElement('canvas')
        mixin(knob, {
          width: 32 * window.devicePixelRatio,
          height: 32 * window.devicePixelRatio,
          className: 'knob'
        })
        html.appendChild(knob)
        knob = new Knob(knob, 0, 1, 0.001, osc1_attack, 'osc1 attack', 's')
        knob.canvas.style.width = '32px'
        knob.canvas.style.height = '32px'
        knob.on('change', function (k) {
          osc1_attack = k.value
        })
        knob.emit('change', knob)

        // osc1 decay
        var knob = document.createElement('canvas')
        mixin(knob, {
          width: 32 * window.devicePixelRatio,
          height: 32 * window.devicePixelRatio,
          className: 'knob'
        })
        html.appendChild(knob)
        knob = new Knob(knob, 0, 2, 0.001, osc1_decay, 'osc1 decay', 's')
        knob.canvas.style.width = '32px'
        knob.canvas.style.height = '32px'
        knob.on('change', function (k) {
          osc1_decay = k.value
        })
        knob.emit('change', knob)

        var knob = document.createElement('canvas')
        mixin(knob, {
          width: 32 * window.devicePixelRatio,
          height: 32 * window.devicePixelRatio,
          className: 'knob'
        })
        html.appendChild(knob)
        knob = new Knob(knob, 0, 1, 0.001, osc1_sustain, 'osc1 sustain', 'x')
        knob.canvas.style.width = '32px'
        knob.canvas.style.height = '32px'
        knob.on('change', function (k) {
          osc1_sustain = k.value
        })
        knob.emit('change', knob)

        // osc1 release
        var knob = document.createElement('canvas')
        mixin(knob, {
          width: 32 * window.devicePixelRatio,
          height: 32 * window.devicePixelRatio,
          className: 'knob'
        })
        html.appendChild(knob)
        knob = new Knob(knob, 0, 2, 0.001, osc1_release, 'osc1 release', 's')
        knob.canvas.style.width = '32px'
        knob.canvas.style.height = '32px'
        knob.on('change', function (k) {
          osc1_release = k.value
        })
        knob.emit('change', knob)

        //useless blank space
        //var div = document.createElement("div");
        //div.innerHTML = "<br><br><br><br><center>this space intentionally left blank</center><br><br><br><br>";
        //html.appendChild(div);

        // notification
        notification = new Notification({
          title: 'Synthesize',
          html: html,
          duration: -1,
          target: '#synth-btn'
        })
        notification.on('close', function () {
          var tip = document.getElementById('tooltip')
          if (tip) tip.parentNode.removeChild(tip)
          notification = null
        })
      }
    })()
    ; (function () {
      var button = document.getElementById('client-settings-btn')
      var content = document.getElementById('client-settings-content')
      var tablinks = document.getElementsByClassName('client-settings-tablink')
      var okButton = document.getElementById('client-settings-ok-btn')

      button.addEventListener('click', evt => {
        evt.stopPropagation()
        openModal('#client-settings')
      })

      okButton.addEventListener('click', evt => {
        evt.stopPropagation()
        closeModal()
      })

      function createSetting(id, labelText, isChecked, addBr, html, onclickFunc) {
        const setting = document.createElement('input')
        setting.type = 'checkbox'
        setting.id = id
        setting.checked = isChecked
        setting.onclick = onclickFunc

        const label = document.createElement('label')

        label.innerText = window.i18nextify.i18next.t(labelText + ':') + ' '

        label.appendChild(setting)
        html.appendChild(label)
        if (addBr) html.appendChild(document.createElement('br'))
      }

      window.changeClientSettingsTab = (evt, tabName) => {
        content.innerHTML = ''

        for (let index = 0; index < tablinks.length; index++) {
          tablinks[index].className = tablinks[index].className.replace(
            ' active',
            ''
          )
        }

        evt.currentTarget.className += ' active'

        switch (tabName.toLowerCase()) {
          case 'chat':
            var html = document.createElement('div')

            createSetting(
              'show-timestamps-in-chat',
              'Show timestamps in chat',
              gShowTimestampsInChat,
              true,
              html,
              () => {
                gShowTimestampsInChat = !gShowTimestampsInChat
                localStorage.showTimestampsInChat = gShowTimestampsInChat
              }
            )

            createSetting(
              'chat-sound',
              'Chat Sound in chat',
              gChatSoundInChat,
              true,
              html,
              () => {
                gChatSoundInChat = !gChatSoundInChat
                localStorage.chatSoundInChat = gChatSoundInChat
              }
            )

            createSetting(
              'spoiler-media-in-chat',
              'Spoiler Media in chat',
              gSpoilerMediaInChat,
              true,
              html,
              () => {
                gSpoilerMediaInChat = !gSpoilerMediaInChat
                localStorage.spoilerMediaInChat = gSpoilerMediaInChat

                const allMediaElements = $(
                  '#chat ul li .media-container img, #chat ul li .media-container video, #chat ul li .media-container .custom-audio-player'
                )

                if (gSpoilerMediaInChat) {
                  allMediaElements.each(function () {
                    const mediaElement = $(this)
                    if (!mediaElement.closest('.spoiler-container').length) {
                      const spoilerContainer = $(
                        '<div class="spoiler-container"></div>'
                      )
                      const spoilerOverlay = $(
                        '<div class="spoiler-overlay"></div>'
                      )
                      mediaElement.wrap(spoilerContainer)
                      mediaElement
                        .closest('.spoiler-container')
                        .append(spoilerOverlay)
                    }
                  })
                } else {
                  allMediaElements.each(function () {
                    const mediaElement = $(this)
                    const spoilerContainer =
                      mediaElement.closest('.spoiler-container')
                    if (spoilerContainer.length) {
                      spoilerContainer.find('.spoiler-overlay').remove()
                      spoilerContainer.contents().unwrap()
                    }
                  })
                }
              }
            )

            createSetting(
              'show-user-ids-in-chat',
              'Show user IDs in chat',
              gShowIdsInChat,
              true,
              html,
              () => {
                gShowIdsInChat = !gShowIdsInChat
                localStorage.showIdsInChat = gShowIdsInChat
              }
            )

            createSetting(
              'show-id-tooltips',
              'Show ID tooltips',
              gShowChatTooltips,
              true,
              html,
              () => {
                gShowChatTooltips = !gShowChatTooltips
                localStorage.showChatTooltips = gShowChatTooltips
              }
            )

            createSetting(
              'no-chat-colors',
              'No chat colors',
              gNoChatColors,
              true,
              html,
              () => {
                gNoChatColors = !gNoChatColors
                localStorage.noChatColors = gNoChatColors
              }
            )

            createSetting(
              'off-chat-animation',
              'Off chat animation',
              gOffAniChat,
              true,
              html,
              () => {
                gOffAniChat = !gOffAniChat
                localStorage.OffAniChat = gOffAniChat
                if (gOffAniChat) {
                  document.body.classList.add('no-ani-chat')
                } else {
                  document.body.classList.remove('no-ani-chat')
                  $('#chat li').each(function () {
                    this.style.transition = ''
                    this.style.transform = ''
                  })
                }
              }
            )

            createSetting(
              'hide-chat',
              'Hide chat',
              gHideChat,
              false,
              html,
              () => {
                gHideChat = !gHideChat
                localStorage.hideChat = gHideChat

                if (gHideChat) {
                  $('#chat').hide()
                } else {
                  $('#chat').show()
                }
              }
            )

            content.appendChild(html)
            break

          case 'midi':
            var html = document.createElement('div')

            createSetting(
              'output-own-notes-to-midi',
              'Output own notes to MIDI',
              gOutputOwnNotes,
              true,
              html,
              () => {
                gOutputOwnNotes = !gOutputOwnNotes
                localStorage.outputOwnNotes = gOutputOwnNotes
              }
            )

            createSetting(
              'disable-midi-drum-channel',
              'Disable MIDI Drum Channel (channel 10)',
              gDisableMIDIDrumChannel,
              true,
              html,
              () => {
                gDisableMIDIDrumChannel = !gDisableMIDIDrumChannel
                localStorage.disableMIDIDrumChannel = gDisableMIDIDrumChannel
              }
            )

            content.appendChild(html)
            break

          case 'piano':
            var html = document.createElement('div')

            createSetting(
              'virtual-piano-layout',
              'Virtual Piano layout',
              gVirtualPianoLayout,
              true,
              html,
              () => {
                gVirtualPianoLayout = !gVirtualPianoLayout
                localStorage.virtualPianoLayout = gVirtualPianoLayout
                key_binding = gVirtualPianoLayout ? layouts.VP : layouts.MPP
              }
            )

            createSetting(
              'show-piano-notes',
              'Show piano notes',
              gShowPianoNotes,
              true,
              html,
              () => {
                gShowPianoNotes = !gShowPianoNotes
                localStorage.showPianoNotes = gShowPianoNotes
              }
            )

            createSetting(
              'hide-piano',
              'Hide piano',
              gHidePiano,
              true,
              html,
              () => {
                gHidePiano = !gHidePiano
                localStorage.hidePiano = gHidePiano

                if (gHidePiano) {
                  $('#piano').hide()
                } else {
                  $('#piano').show()
                }
              }
            )

            createSetting(
              'hide-piano',
              'Hide piano',
              gPianoKeys === 88,
              true,
              html,
              () => {
                gPianoKeys = gPianoKeys === 88 ? 128 : 88
                localStorage.pianoKeys = gPianoKeys
                if (gPiano && gPiano.rerender) gPiano.rerender()
              }
            )

            var setting = document.createElement('select')
            setting.classList = 'setting'
            setting.style = 'width: calc(58.7% - 2px);'

            setting.onchange = () => {
              localStorage.highlightScaleNotes = setting.value
              gHighlightScaleNotes = setting.value
            }

            const keys = Object.keys(BASIC_PIANO_SCALES) // lol
            const option = document.createElement('option')
            option.value = key
            option.innerText = 'None'
            option.selected = !gHighlightScaleNotes
            setting.appendChild(option)

            for (const key of keys) {
              const option = document.createElement('option')
              option.value = key
              option.innerText = key
              option.selected = key === gHighlightScaleNotes
              setting.appendChild(option)
            }

            if (gHighlightScaleNotes) {
              setting.value = gHighlightScaleNotes
            }

            var label = document.createElement('label')

            label.setAttribute('for', setting.id)
            label.innerText = 'Highlighted notes: '

            html.appendChild(label)
            html.appendChild(setting)

            content.appendChild(html)
            break

          case 'misc':
            var html = document.createElement('div')

            createSetting(
              'dont-use-prevent-default',
              "Don't use prevent default",
              gNoPreventDefault,
              true,
              html,
              () => {
                gNoPreventDefault = !gNoPreventDefault
                localStorage.noPreventDefault = noPreventDefault
              }
            )

            createSetting(
              'force-dark-background',
              'Force dark background',
              gNoBackgroundColor,
              true,
              html,
              () => {
                gNoBackgroundColor = !gNoBackgroundColor
                localStorage.noBackgroundColor = gNoBackgroundColor

                if (gClient.channel.settings.color && !gNoBackgroundColor) {
                  setBackgroundColor(
                    gClient.channel.settings.color,
                    gClient.channel.settings.color2
                  )
                } else {
                  setBackgroundColorToDefault()
                }
              }
            )

            createSetting(
              'enable-smooth-cursors',
              'Enable smooth cursors',
              gSmoothCursor,
              true,
              html,
              () => {
                gSmoothCursor = !gSmoothCursor
                localStorage.smoothCursor = gSmoothCursor
                if (gSmoothCursor) {
                  $('#cursors').attr('smooth-cursors', '')
                  Object.values(gClient.ppl).forEach(function (participant) {
                    if (participant.cursorDiv) {
                      participant.cursorDiv.style.left = ''
                      participant.cursorDiv.style.top = ''
                      participant.cursorDiv.style.transform =
                        'translate3d(' +
                        participant.x +
                        'vw, ' +
                        participant.y +
                        'vh, 0)'
                    }
                  })
                } else {
                  $('#cursors').removeAttr('smooth-cursors')
                  Object.values(gClient.ppl).forEach(function (participant) {
                    if (participant.cursorDiv) {
                      participant.cursorDiv.style.left = participant.x + '%'
                      participant.cursorDiv.style.top = participant.y + '%'
                      participant.cursorDiv.style.transform = ''
                    }
                  })
                }
              }
            )

            createSetting(
              'hide-all-cursors',
              'Hide all cursors',
              gHideAllCursors,
              true,
              html,
              () => {
                gHideAllCursors = !gHideAllCursors
                localStorage.hideAllCursors = gHideAllCursors
                if (gHideAllCursors) {
                  $('#cursors').hide()
                } else {
                  $('#cursors').show()
                }
              }
            )

            createSetting(
              'hide-bot-users',
              'Hide all bots',
              gHideBotUsers,
              true,
              html,
              () => {
                gHideBotUsers = !gHideBotUsers
                localStorage.hideBotUsers = gHideBotUsers

                Object.values(gClient.ppl).forEach(function (participant) {
                  if (
                    participant.tag &&
                    participant.tag.text === 'BOT' &&
                    participant.cursorDiv
                  ) {
                    if (gHideBotUsers) {
                      $('#names #namediv-' + participant.id).fadeOut(400)
                      participant.cursorDiv.style.display = 'none'
                    } else {
                      $('#names #namediv-' + participant.id).fadeIn(400)
                      participant.cursorDiv.style.display = ''
                    }
                  }
                })
              }
            )

            if (new Date().getMonth() === 11) {
              createSetting(
                'snowflakes',
                'Enable snowflakes',
                gSnowflakes,
                true,
                html,
                () => {
                  gSnowflakes = !gSnowflakes
                  localStorage.snowflakes = gSnowflakes
                  shouldShowSnowflakes()
                }
              )
            }

            content.appendChild(html)
            break
        }
      }

      changeClientSettingsTab(
        {
          currentTarget: document.getElementsByClassName(
            'client-settings-tablink'
          )[0]
        },
        'Chat'
      )
    })()

  //confetti, to be removed after the 10th anniversary
  //source: https://www.cssscript.com/confetti-falling-animation/

  var maxParticleCount = 500 //set max confetti count
  var particleSpeed = 2 //set the particle animation speed
  var startConfetti //call to start confetti animation
  var stopConfetti //call to stop adding confetti
  var toggleConfetti //call to start or stop the confetti animation depending on whether it's already running
  var removeConfetti //call to stop the confetti animation and remove all confetti immediately
    ; (function () {
      startConfetti = startConfettiInner
      stopConfetti = stopConfettiInner
      toggleConfetti = toggleConfettiInner
      removeConfetti = removeConfettiInner
      var colors = [
        'DodgerBlue',
        'OliveDrab',
        'Gold',
        'Pink',
        'SlateBlue',
        'LightBlue',
        'Violet',
        'PaleGreen',
        'SteelBlue',
        'SandyBrown',
        'Chocolate',
        'Crimson'
      ]
      var streamingConfetti = false
      var animationTimer = null
      var particles = []
      var waveAngle = 0

      function resetParticle(particle, width, height) {
        particle.color = colors[(Math.random() * colors.length) | 0]
        particle.x = Math.random() * width
        particle.y = Math.random() * height - height
        particle.diameter = Math.random() * 10 + 5
        particle.tilt = Math.random() * 10 - 10
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05
        particle.tiltAngle = 0
        return particle
      }

      function startConfettiInner() {
        var width = window.innerWidth
        var height = window.innerHeight
        window.requestAnimFrame = (function () {
          return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
              return window.setTimeout(callback, 16.6666667)
            }
          )
        })()
        var canvas = document.getElementById('confetti-canvas')
        if (canvas === null) {
          canvas = document.createElement('canvas')
          canvas.setAttribute('id', 'confetti-canvas')
          canvas.setAttribute(
            'style',
            'display:block;z-index:999999;pointer-events:none;position:absolute;top:0;left:0'
          )
          document.body.appendChild(canvas)
          canvas.width = width
          canvas.height = height
          window.addEventListener(
            'resize',
            function () {
              canvas.width = window.innerWidth
              canvas.height = window.innerHeight
            },
            true
          )
        }
        var context = canvas.getContext('2d')
        while (particles.length < maxParticleCount)
          particles.push(resetParticle({}, width, height))
        streamingConfetti = true
        if (animationTimer === null) {
          ; (function runAnimation() {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight)
            if (particles.length === 0) animationTimer = null
            else {
              updateParticles()
              drawParticles(context)
              animationTimer = requestAnimFrame(runAnimation)
            }
          })()
        }
      }

      function stopConfettiInner() {
        streamingConfetti = false
      }

      function removeConfettiInner() {
        stopConfetti()
        particles = []
      }

      function toggleConfettiInner() {
        if (streamingConfetti) stopConfettiInner()
        else startConfettiInner()
      }

      function drawParticles(context) {
        var particle
        var x
        for (var i = 0; i < particles.length; i++) {
          particle = particles[i]
          context.beginPath()
          context.lineWidth = particle.diameter
          context.strokeStyle = particle.color
          context.shadowColor = 'rgba(0, 0, 0, .3)'
          context.shadowBlur = 4
          context.shadowOffsetY = 2
          context.shadowOffsetX = 0
          x = particle.x + particle.tilt
          context.moveTo(x + particle.diameter / 2, particle.y)
          context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2)
          context.stroke()
        }
      }

      function updateParticles() {
        var width = window.innerWidth
        var height = window.innerHeight
        var particle
        waveAngle += 0.01
        for (var i = 0; i < particles.length; i++) {
          particle = particles[i]
          if (!streamingConfetti && particle.y < -15) particle.y = height + 100
          else {
            particle.tiltAngle += particle.tiltAngleIncrement
            particle.x += Math.sin(waveAngle)
            particle.y +=
              (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5
            particle.tilt = Math.sin(particle.tiltAngle) * 15
          }
          if (
            particle.x > width + 20 ||
            particle.x < -20 ||
            particle.y > height
          ) {
            if (streamingConfetti && particles.length <= maxParticleCount)
              resetParticle(particle, width, height)
            else {
              particles.splice(i, 1)
              i--
            }
          }
        }
      }
    })()

  if (window !== top) {
    alert(
      "Hey, it looks like you're visiting our site through another website. Consider playing Multiplayer Piano directly at https://multiplayerpiano.net"
    )
  }

  ; (async () => {
    // prettier-ignore
    const translationIdsWithNames = [{ "code": "bg", "name": "Bulgarian", "native": "Български" }, { "code": "cs", "name": "Czech", "native": "Česky" }, { "code": "de", "name": "German", "native": "Deutsch" }, { "code": "en", "name": "English", "native": "English" }, { "code": "es", "name": "Spanish", "native": "Español" }, { "code": "fr", "name": "French", "native": "Français" }, { "code": "hu", "name": "Hungarian", "native": "Magyar" }, { "code": "is", "name": "Icelandic", "native": "Íslenska" }, { "code": "ja", "name": "Japanese", "native": "日本語" }, { "code": "ko", "name": "Korean", "native": "한국어" }, { "code": "lv", "name": "Latvian", "native": "Latviešu" }, { "code": "nb", "name": "Norwegian Bokmål", "native": "Norsk bokmål" }, { "code": "nl", "name": "Dutch", "native": "Nederlands" }, { "code": "pl", "name": "Polish", "native": "Polski" }, { "code": "pt", "name": "Portuguese", "native": "Português" }, { "code": "ru", "name": "Russian", "native": "Русский" }, { "code": "sk", "name": "Slovak", "native": "Slovenčina" }, { "code": "sv", "name": "Swedish", "native": "Svenska" }, { "code": "tr", "name": "Turkish", "native": "Türkçe" }, { "code": "zh", "name": "Chinese", "native": "中文" }]

    const languages = document.getElementById('languages')

    translationIdsWithNames.forEach(z => {
      const option = document.createElement('option')
      option.value = z.code
      option.innerText = z.native
      if (z.code == i18nextify.i18next.language.split('-')[0]) {
        option.selected = true
      }
      option.setAttribute('translated', '')
      languages.appendChild(option)
    })

    document.getElementById('language-button').addEventListener('click', () => {
      openModal('#language')
    })

    document
      .querySelector('#language > button')
      .addEventListener('click', async e => {
        await i18nextify.i18next.changeLanguage(
          document.querySelector('#languages').selectedOptions[0].value
        )
        i18nextify.forceRerender()
        closeModal()
      })
  })()
    ; (async () => {
      const fontList = [
        'DejaVu Sans',
        'Arial',
        'Verdana',
        'Tahoma',
        'Georgia',
        'Times New Roman',
        'Courier New',
        'a새콤달콤'
      ]

      const fontSelect = document.getElementById('fonts').querySelector('select')

      fontList.forEach(font => {
        const option = document.createElement('option')
        option.value = font
        option.innerText = font
        fontSelect.appendChild(option)
      })

      document.getElementById('font-button').addEventListener('click', () => {
        openModal('#fonts')
      })

      document.querySelector('#fonts > button').addEventListener('click', () => {
        const selectedFont = fontSelect.selectedOptions[0].value
        document.documentElement.style.setProperty('--main-font', selectedFont) // CSS 변수 업데이트
        closeModal()
      })
    })()

  gClient.start()
})

// misc

////////////////////////////////////////////////////////////////

// non-ad-free experience
/*(function() {
  function adsOn() {
    if(window.localStorage) {
      var div = document.querySelector("#inclinations");
      div.innerHTML = "Ads:<br>ON / <a id=\"adsoff\" href=\"#\">OFF</a>";
      div.querySelector("#adsoff").addEventListener("click", adsOff);
      localStorage.ads = true;
    }
    // adsterra
    var script = document.createElement("script");
    script.src = "//pl132070.puhtml.com/68/7a/97/687a978dd26d579c788cb41e352f5a41.js";
    document.head.appendChild(script);
  }

  function adsOff() {
    if(window.localStorage) localStorage.ads = false;
    document.location.reload(true);
  }

  function noAds() {
    var div = document.querySelector("#inclinations");
    div.innerHTML = "Ads:<br><a id=\"adson\" href=\"#\">ON</a> / OFF";
    div.querySelector("#adson").addEventListener("click", adsOn);
  }

  if(window.localStorage) {
    if(localStorage.ads === undefined || localStorage.ads === "true")
      adsOn();
    else
      noAds();
  } else {
    adsOn();
  }
})();*/
