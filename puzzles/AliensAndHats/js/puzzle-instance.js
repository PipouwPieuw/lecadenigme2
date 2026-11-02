/**
 * Aliens & Hats — puzzle instance (v2).
 * Same blob for Ravabulle and Troncadelle; page order differs per role.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 4;

	var RAV_SYMBOL_CHARS = '◈◇△▷○●□■◆★☆⌁∇⊛∿';
	var TRON_SYMBOL_CHARS = '⟦⟧⟨⟩╬╳◐◑◒◓⬡⬢⬣⌖⌗※⊹⊰⊱';
	var NAME_TAG_ART = ['tag01', 'tag02', 'tag03'];
	var SPECIES_TAG_ART = ['tag04', 'tag05', 'tag06'];

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

	function assignTagArts(rng, arts, count) {
		var result = shuffle(rng, arts).slice();
		while (result.length < count) {
			result.push(arts[Math.floor(rng() * arts.length)]);
		}
		return shuffle(rng, result);
	}

	function speciesMeta(catalog) {
		var source = (catalog && catalog.species) || {};
		var byAlien = {};
		for (var i = 0; i < ALIEN_KEYS.length; i += 1) {
			var key = ALIEN_KEYS[i];
			var entry = source[key] || {};
			var raw = Array.isArray(entry.names) ? entry.names : (entry.name ? [entry.name] : []);
			var names = [];
			for (var n = 0; n < raw.length; n += 1) {
				var label = String(raw[n] || '').trim();
				if (label && names.indexOf(label) === -1) {
					names.push(label);
				}
			}
			if (!names.length) {
				names.push('espece' + (i + 1));
			}
			byAlien[key] = {
				names: names,
				description: entry.description || ("Description de l'espèce " + (i + 1) + '.')
			};
		}
		return byAlien;
	}

	function guestNamePool(nameList) {
		var source = (nameList && nameList.length) ? nameList : DEFAULT_NAMES;
		var unique = [];
		for (var i = 0; i < source.length; i += 1) {
			var label = String(source[i] || '').trim();
			if (label && unique.indexOf(label) === -1) {
				unique.push(label);
			}
		}
		return unique.length >= 10 ? unique : DEFAULT_NAMES.slice();
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
	 * @param {{ species?: Object, guests?: string[] }} [catalog]
	 */
	function createInstance(seed, catalog) {
		if (seed === undefined || seed === null || seed === '') {
			seed = Math.floor(Math.random() * 0x7fffffff);
		} else {
			seed = parseInt(String(seed), 10) || 1;
		}

		var species = speciesMeta(catalog);
		var rng = mulberry32(seed);
		var names = sampleUnique(rng, guestNamePool(catalog && catalog.guests), 10);

		var speciesCodes = uniqueStrings(rng, RAV_SYMBOL_CHARS, 10);
		var nameCodes = uniqueStrings(rng, TRON_SYMBOL_CHARS, 10);
		var speciesTagArts = assignTagArts(rng, SPECIES_TAG_ART, 10);
		var nameTagArts = assignTagArts(rng, NAME_TAG_ART, 10);
		var speciesCodeByAlien = {};
		var speciesArtByAlien = {};
		for (var s = 0; s < ALIEN_KEYS.length; s += 1) {
			speciesCodeByAlien[ALIEN_KEYS[s]] = speciesCodes[s];
			speciesArtByAlien[ALIEN_KEYS[s]] = speciesTagArts[s];
		}
		var alienKeys = sampleUnique(rng, ALIEN_KEYS, 10);
		var hatIds = sampleUnique(rng, HAT_IDS, 10);
		var lettersRav = randomLetters(rng, 10);
		var lettersTron = randomLetters(rng, 10);

		var guests = [];
		for (var g = 0; g < 10; g += 1) {
			var alienKey = alienKeys[g];
			var meta = species[alienKey];
			guests.push({
				guest_id: g,
				name: names[g],
				alien: alienKey,
				alien_variant: 1 + Math.floor(rng() * 5),
				hat_id: hatIds[g],
				species_name: meta.names[Math.floor(rng() * meta.names.length)],
				species_description: meta.description,
				species_code: speciesCodeByAlien[alienKey],
				species_tag_art: speciesArtByAlien[alienKey],
				name_code: nameCodes[g],
				name_tag_art: nameTagArts[g],
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
