/**
 * Aliens & Hats — puzzle instance (v2).
 * Same blob for Ravabulle and Troncadelle; page order differs per role.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 2;

	var RAV_SYMBOL_CHARS = '◈◇△▷○●□■◆★☆⌁∇⊛∿';
	var TRON_SYMBOL_CHARS = '⟦⟧⟨⟩╬╳◐◑◒◓⬡⬢⬣⌖⌗※⊹⊰⊱';
	var TAG_ART = ['tag01', 'tag02', 'tag03', 'tag04', 'tag05', 'tag06'];

	var DEFAULT_NAMES = [
		'zorblax', 'quipple', 'mernid', 'flootch', 'grindle',
		'vexnor', 'plimtok', 'snarvee', 'wumble', 'kretch'
	];

	var HAT_IDS = [];
	for (var h = 1; h <= 16; h += 1) {
		HAT_IDS.push('hat' + (h < 10 ? '0' : '') + h);
	}

	var ALIEN_KEYS = [];
	for (var a = 1; a <= 10; a += 1) {
		ALIEN_KEYS.push('alien' + a);
	}

	function mulberry32(seed) {
		var state = seed >>> 0;
		return function () {
			state |= 0;
			state = (state + 0x6d2b79f5) | 0;
			var t = Math.imul(state ^ (state >>> 15), 1 | state);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function shuffle(rng, list) {
		var arr = list.slice();
		for (var i = arr.length - 1; i > 0; i -= 1) {
			var j = Math.floor(rng() * (i + 1));
			var tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
		return arr;
	}

	function sampleUnique(rng, list, count) {
		return shuffle(rng, list).slice(0, count);
	}

	function uniqueStrings(rng, charset, count) {
		var out = [];
		var attempts = 0;
		while (out.length < count && attempts < 600) {
			attempts += 1;
			var len = 3 + Math.floor(rng() * 3);
			var s = '';
			for (var i = 0; i < len; i += 1) {
				s += charset.charAt(Math.floor(rng() * charset.length));
			}
			if (out.indexOf(s) === -1) {
				out.push(s);
			}
		}
		while (out.length < count) {
			out.push('◈' + out.length);
		}
		return out;
	}

	function assignTagArts(rng) {
		var arts = shuffle(rng, TAG_ART).concat([]);
		var result = [];
		for (var i = 0; i < 6; i += 1) {
			result.push(arts[i]);
		}
		for (var j = 6; j < 10; j += 1) {
			result.push(TAG_ART[Math.floor(rng() * TAG_ART.length)]);
		}
		return shuffle(rng, result);
	}

	function randomLetters(rng, count) {
		var letters = [];
		for (var i = 0; i < count; i += 1) {
			letters.push(String.fromCharCode(97 + Math.floor(rng() * 26)));
		}
		return letters;
	}

	function buildPasswordHalf(guests, pageOrder, letterKey) {
		var chars = [];
		for (var i = 0; i < pageOrder.length; i += 1) {
			var g = guests[pageOrder[i]];
			chars.push(g[letterKey]);
		}
		return chars.join('');
	}

	/**
	 * @param {number|string} [seed]
	 * @param {string[]} [nameList]
	 */
	function createInstance(seed, nameList) {
		if (seed === undefined || seed === null || seed === '') {
			seed = Math.floor(Math.random() * 0x7fffffff);
		} else {
			seed = parseInt(String(seed), 10) || 1;
		}

		var names = (nameList && nameList.length >= 10) ? nameList.slice(0, 10) : DEFAULT_NAMES.slice();
		var rng = mulberry32(seed);

		var ravSymbols = uniqueStrings(rng, RAV_SYMBOL_CHARS, 10);
		var tronSymbols = uniqueStrings(rng, TRON_SYMBOL_CHARS, 10);
		var tagArts = assignTagArts(rng);
		var alienKeys = sampleUnique(rng, ALIEN_KEYS, 10);
		var hatIds = sampleUnique(rng, HAT_IDS, 10);
		var lettersRav = randomLetters(rng, 10);
		var lettersTron = randomLetters(rng, 10);

		var guests = [];
		for (var g = 0; g < 10; g += 1) {
			guests.push({
				guest_id: g,
				name: names[g],
				alien: alienKeys[g],
				alien_variant: 1 + Math.floor(rng() * 5),
				hat_id: hatIds[g],
				tag_art: tagArts[g],
				tag_rav: ravSymbols[g],
				tag_tron: tronSymbols[g],
				letter_rav: lettersRav[g],
				letter_tron: lettersTron[g]
			});
		}

		var ravPageOrder = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		var tronPageOrder = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		while (tronPageOrder.join() === ravPageOrder.join()) {
			tronPageOrder = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		}

		return {
			seed: seed,
			generator_version: GENERATOR_VERSION,
			guests: guests,
			rav_page_order: ravPageOrder,
			tron_page_order: tronPageOrder,
			password_half_rav: buildPasswordHalf(guests, ravPageOrder, 'letter_rav'),
			password_half_tron: buildPasswordHalf(guests, tronPageOrder, 'letter_tron')
		};
	}

	global.AliensAndHatsInstance = {
		GENERATOR_VERSION: GENERATOR_VERSION,
		createInstance: createInstance,
		createDevInstance: createInstance
	};
})(typeof window !== 'undefined' ? window : globalThis);
