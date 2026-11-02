/**
 * Ghost Dictaphone — chains four gesture clips on the CRT.
 * Playback is slowed so each clip lasts at least two seconds.
 */
(function (global) {
	'use strict';

	var GLITCH_MS = 280;

	function prefersReducedMotion() {
		return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
	}

	function clipRate(duration) {
		if (!isFinite(duration) || duration <= 0) return 0.5;
		return Math.min(0.5, duration / 2);
	}

	function createReel(options) {
		var video = options.video;
		var glitchEl = options.glitch;
		var glass = options.glass;
		var generation = 0;
		var glitchTimer = null;

		function setGlitch(on) {
			if (glitchTimer) {
				clearTimeout(glitchTimer);
				glitchTimer = null;
			}
			if (glitchEl) glitchEl.hidden = !on;
			if (glass) glass.dataset.glitch = on ? 'on' : 'off';
		}

		function detach() {
			video.onloadedmetadata = null;
			video.onplaying = null;
			video.onended = null;
			video.onerror = null;
		}

		function stop() {
			generation += 1;
			setGlitch(false);
			detach();
			video.pause();
		}

		function play(urls, hooks) {
			var mine = generation + 1;
			generation = mine;
			hooks = hooks || {};
			setGlitch(false);
			detach();
			video.hidden = false;
			video.muted = true;

			function alive() {
				return mine === generation;
			}

			function fail() {
				if (!alive()) return;
				setGlitch(false);
				video.pause();
				if (hooks.onError) hooks.onError();
			}

			function finish() {
				if (!alive()) return;
				setGlitch(false);
				if (hooks.onEnd) hooks.onEnd();
			}

			function playAt(index) {
				if (!alive()) return;
				if (!urls || index >= urls.length) {
					finish();
					return;
				}

				function begin() {
					if (!alive()) return;
					detach();
					video.onerror = fail;
					video.onloadedmetadata = function () {
						if (!alive()) return;
						video.playbackRate = clipRate(video.duration);
					};
					video.onplaying = function () {
						if (!alive()) return;
						video.playbackRate = clipRate(video.duration);
					};
					video.onended = function () {
						if (!alive()) return;
						playAt(index + 1);
					};
					video.src = urls[index];
					var pending = video.play();
					if (pending && pending.catch) pending.catch(fail);
				}

				if (index > 0 && !prefersReducedMotion()) {
					setGlitch(true);
					glitchTimer = global.setTimeout(function () {
						glitchTimer = null;
						if (!alive()) return;
						setGlitch(false);
						begin();
					}, GLITCH_MS);
					return;
				}
				begin();
			}

			playAt(0);
		}

		return {
			play: play,
			stop: stop
		};
	}

	global.GhostDictaphoneReel = {
		createReel: createReel
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
