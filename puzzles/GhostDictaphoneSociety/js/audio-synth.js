/**
 * Ghost Dictaphone — vowel synth.
 * A quiet sine carries the pitch contour. Two band-pass filters on a saw
 * approximate sung vowels so A, E, I, O and U stay distinguishable.
 */
(function (global) {
	'use strict';

	var LOW = 146.83;
	var HIGH = 293.66;
	var FORMANTS = {
		a: [730, 1090],
		e: [530, 1840],
		i: [270, 2290],
		o: [500, 900],
		u: [350, 600]
	};

	var ctx = null;
	var noise = null;
	var active = [];
	var token = 0;

	function audioContext() {
		var AudioCtx = global.AudioContext || global.webkitAudioContext;
		if (!AudioCtx) return null;
		if (!ctx) ctx = new AudioCtx();
		return ctx;
	}

	function noiseBuffer() {
		if (noise) return noise;
		var length = Math.floor(ctx.sampleRate * 0.5);
		noise = ctx.createBuffer(1, length, ctx.sampleRate);
		var data = noise.getChannelData(0);
		var i;
		for (i = 0; i < data.length; i += 1) {
			data[i] = Math.random() * 2 - 1;
		}
		return noise;
	}

	function silence() {
		active.forEach(function (node) {
			try {
				if (typeof node.stop === 'function') node.stop();
			} catch (err) {
				/* Oscillator already stopped. */
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

	function scheduleNote(note, when) {
		var dur = note.duration === 'long' ? 2 : 1;
		var formant = FORMANTS[note.vowel] || FORMANTS.a;
		var osc = ctx.createOscillator();
		var body = ctx.createOscillator();
		var breath = ctx.createBufferSource();
		var f1 = ctx.createBiquadFilter();
		var f2 = ctx.createBiquadFilter();
		var breathFilter = ctx.createBiquadFilter();
		var g1 = ctx.createGain();
		var g2 = ctx.createGain();
		var gBody = ctx.createGain();
		var gBreath = ctx.createGain();
		var master = ctx.createGain();

		osc.type = 'sawtooth';
		body.type = 'sine';
		f1.type = 'bandpass';
		f1.frequency.value = formant[0];
		f1.Q.value = 6;
		f2.type = 'bandpass';
		f2.frequency.value = formant[1];
		f2.Q.value = 8;
		breathFilter.type = 'highpass';
		breathFilter.frequency.value = 700;
		g1.gain.value = 0.62;
		g2.gain.value = 0.34;
		gBody.gain.value = 0.22;
		gBreath.gain.value = 0.045;

		osc.connect(f1);
		f1.connect(g1);
		g1.connect(master);
		osc.connect(f2);
		f2.connect(g2);
		g2.connect(master);
		body.connect(gBody);
		gBody.connect(master);
		breath.buffer = noiseBuffer();
		breath.loop = true;
		breath.connect(breathFilter);
		breathFilter.connect(gBreath);
		gBreath.connect(master);
		master.connect(ctx.destination);

		var steps = Math.round(dur * 24);
		var s;
		for (s = 0; s <= steps; s += 1) {
			var tNorm = s / steps;
			var freq = glide(note.shape, tNorm) + Math.sin(tNorm * Math.PI * 6) * 3;
			var at = when + dur * tNorm;
			osc.frequency.setValueAtTime(freq, at);
			body.frequency.setValueAtTime(freq, at);
		}

		var release = 0.16;
		var holdAt = when + Math.max(0.08, dur - release);
		master.gain.setValueAtTime(0.0001, when);
		master.gain.exponentialRampToValueAtTime(0.4, when + 0.03);
		master.gain.setValueAtTime(0.4, holdAt);
		master.gain.exponentialRampToValueAtTime(0.0001, when + dur);

		osc.start(when);
		body.start(when);
		breath.start(when);
		osc.stop(when + dur + 0.02);
		body.stop(when + dur + 0.02);
		breath.stop(when + dur + 0.02);
		active.push(osc, body, breath);
		return dur;
	}

	function playNotes(notes) {
		var context = audioContext();
		if (!context || !notes || !notes.length) return Promise.resolve(0);
		var mine = ++token;
		var ready = context.state === 'suspended' ? context.resume() : Promise.resolve();
		return ready.then(function () {
			if (mine !== token) return 0;
			silence();
			var gap = 0.14;
			var cursor = context.currentTime + 0.05;
			notes.forEach(function (note) {
				var dur = scheduleNote(note, cursor);
				cursor += dur + gap;
			});
			return Math.ceil((cursor - gap - context.currentTime) * 1000) + 40;
		}).catch(function () {
			return 0;
		});
	}

	global.GhostDictaphoneAudio = {
		playNotes: playNotes,
		stop: stop
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
