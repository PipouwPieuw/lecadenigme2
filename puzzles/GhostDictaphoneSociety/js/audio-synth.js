/**
 * Ghost Dictaphone — recorded vowels.
 * Each take is a steady note. Playback rate draws the contour, and the clip
 * loops inside the audio engine so a long note has no gap between repeats.
 * Bases are the recorded fundamentals, so every vowel's low note matches.
 * Fixed filters keep the vowel color in place. O and U stay close to the
 * recordings: a dark lowpass made their high notes muffled, so each only dips
 * the brightness of I.
 */
(function (global) {
	'use strict';

	/* C3 to G3, a fifth. An octave above the takes made the high O and U sound strained. */
	var LOW = 130.81;
	var HIGH = 196;
	var SHORT = 1;
	var LONG = 2;
	var GAP = 0.14;
	var LEVEL = 0.62;
	/* Frequencies stay put while the pitch moves, so each vowel keeps its color. */
	var BODY = { a: 0.9, e: 0.8, i: 0.55, o: 1, u: 1 };
	var COLOR = {
		a: [
			{ type: 'peaking', f: 780, q: 1.3, g: 6 },
			{ type: 'peaking', f: 1200, q: 1.5, g: 5 },
			{ type: 'lowpass', f: 3800, q: 0.7 }
		],
		e: [
			{ type: 'peaking', f: 480, q: 1.1, g: 3 },
			{ type: 'peaking', f: 1950, q: 2.2, g: 8 },
			{ type: 'highshelf', f: 2600, q: 0.7, g: 3 }
		],
		i: [
			{ type: 'peaking', f: 680, q: 1.3, g: -6 },
			{ type: 'peaking', f: 2500, q: 2.6, g: 10 },
			{ type: 'highshelf', f: 3200, q: 0.7, g: 5 }
		],
		o: [
			{ type: 'peaking', f: 560, q: 1, g: 2 },
			{ type: 'peaking', f: 2500, q: 1.6, g: -4 }
		],
		u: [
			{ type: 'peaking', f: 450, q: 1, g: 2 },
			{ type: 'peaking', f: 2500, q: 1.6, g: -4 }
		]
	};
	var BASE_HZ = {
		a: 130,
		e: 145,
		i: 144,
		o: 133,
		u: 158
	};

	var ctx = null;
	var buffers = null;
	var decoding = null;
	var active = [];
	var token = 0;

	function audioContext() {
		var AudioCtx = global.AudioContext || global.webkitAudioContext;
		if (!AudioCtx) return null;
		if (!ctx) ctx = new AudioCtx();
		return ctx;
	}

	function bytesFromBase64(value) {
		var binary = global.atob(value);
		var bytes = new Uint8Array(binary.length);
		var i;
		for (i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
		return bytes.buffer;
	}

	function ensureBuffers() {
		var context = audioContext();
		if (!context || !global.GhostDictaphoneClips) return Promise.reject(new Error('clips'));
		if (buffers) return Promise.resolve(buffers);
		if (decoding) return decoding;
		decoding = Promise.all(Object.keys(BASE_HZ).map(function (id) {
			var copy = bytesFromBase64(global.GhostDictaphoneClips[id]).slice(0);
			return context.decodeAudioData(copy).then(function (buffer) {
				return { id: id, buffer: buffer };
			});
		})).then(function (list) {
			buffers = {};
			list.forEach(function (item) {
				buffers[item.id] = item.buffer;
			});
			return buffers;
		});
		return decoding;
	}

	function noteDuration(note) {
		return note.duration === 'long' ? LONG : SHORT;
	}

	function glide(shape, t) {
		var span = HIGH - LOW;
		if (shape === 'flat_low') return LOW;
		if (shape === 'flat_high') return HIGH;
		if (shape === 'rise') return LOW + span * t;
		if (shape === 'fall') return HIGH - span * t;
		if (shape === 'arch') {
			return t < 0.5 ? LOW + span * (t * 2) : HIGH - span * ((t - 0.5) * 2);
		}
		return t < 0.5 ? HIGH - span * (t * 2) : LOW + span * ((t - 0.5) * 2);
	}

	function silence() {
		active.forEach(function (node) {
			try {
				node.stop();
			} catch (err) {
				/* Source already stopped. */
			}
			try {
				node.disconnect();
			} catch (err2) {
				/* Node already disconnected. */
			}
		});
		active = [];
	}

	function stop() {
		token += 1;
		silence();
	}

	function scheduleNote(note, when) {
		var dur = noteDuration(note);
		var buffer = buffers[note.vowel];
		var base = BASE_HZ[note.vowel];
		if (!buffer || !base) return dur;
		var src = ctx.createBufferSource();
		var gain = ctx.createGain();
		var steps = Math.max(1, Math.round(dur * 30));
		var release = 0.14;
		var attack = 0.02;
		var color = COLOR[note.vowel] || COLOR.a;
		var nodes = [src, gain];
		var previous = src;
		var s;
		src.buffer = buffer;
		src.loop = true;
		color.forEach(function (spec) {
			var filter = ctx.createBiquadFilter();
			filter.type = spec.type;
			filter.frequency.value = spec.f;
			filter.Q.value = spec.q;
			if (spec.g !== undefined) filter.gain.value = spec.g;
			previous.connect(filter);
			previous = filter;
			nodes.push(filter);
		});
		previous.connect(gain);
		gain.connect(ctx.destination);
		for (s = 0; s <= steps; s += 1) {
			var tNorm = s / steps;
			var rate = glide(note.shape, tNorm) / base;
			var at = when + dur * tNorm;
			if (s === 0) src.playbackRate.setValueAtTime(rate, at);
			else src.playbackRate.linearRampToValueAtTime(rate, at);
		}
		var level = LEVEL * (BODY[note.vowel] || 1);
		gain.gain.setValueAtTime(0.0001, when);
		gain.gain.exponentialRampToValueAtTime(level, when + attack);
		gain.gain.setValueAtTime(level, Math.max(when + attack, when + dur - release));
		gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
		src.start(when);
		src.stop(when + dur + 0.03);
		nodes.forEach(function (node) {
			active.push(node);
		});
		return dur;
	}

	function playNotes(notes) {
		if (!notes || !notes.length) return Promise.resolve(0);
		var context = audioContext();
		if (!context) return Promise.resolve(0);
		var mine = ++token;
		silence();
		if (context.state === 'suspended') context.resume();
		return ensureBuffers().then(function () {
			if (mine !== token) return 0;
			var cursor = context.currentTime + 0.05;
			notes.forEach(function (note) {
				var dur = scheduleNote(note, cursor);
				cursor += dur + GAP;
			});
			return Math.ceil((cursor - GAP - context.currentTime) * 1000) + 40;
		}).catch(function () {
			return 0;
		});
	}

	global.GhostDictaphoneAudio = {
		playNotes: playNotes,
		stop: stop
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
