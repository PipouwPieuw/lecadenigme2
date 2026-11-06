/**
 * Aliens & Hats — puzzle instance (v2).
 * Same blob for Ravabulle and Troncadelle; both books use the same page order.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 8;

	var RAV_SYMBOL_CHARS = '◈◇△▷○●□■◆★☆⌁∇⊛∿';
	var TRON_SYMBOL_CHARS = '⟦⟧⟨⟩╬╳◐◑◒◓⬡⬢⬣⌖⌗※⊹⊰⊱';
	var NAME_TAG_ART = ['tag01', 'tag02', 'tag03'];
	var SPECIES_TAG_ART = ['tag04', 'tag05', 'tag06'];

	var DEFAULT_NAMES = [
		'zorblax', 'quipple', 'mernid', 'flootch', 'grindle',
		'vexnor', 'plimtok', 'snarvee', 'wumble', 'kretch'
	];

	var HAT_IDS = [];
	for (var h = 1; h <= 30; h += 1) {
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

	function hatPools(catalog) {
		var raw = (catalog && catalog.hat_groups) || [];
		var claimed = {};
		var groups = [];
		for (var i = 0; i < raw.length; i += 1) {
			if (!Array.isArray(raw[i])) {
				continue;
			}
			var members = [];
			for (var j = 0; j < raw[i].length; j += 1) {
				var id = String(raw[i][j] || '').trim();
				if (HAT_IDS.indexOf(id) === -1 || claimed[id]) {
					continue;
				}
				claimed[id] = true;
				members.push(id);
			}
			if (members.length > 1) {
				groups.push(members);
			} else if (members.length === 1) {
				delete claimed[members[0]];
			}
		}
		var lones = [];
		for (var h = 0; h < HAT_IDS.length; h += 1) {
			if (!claimed[HAT_IDS[h]]) {
				lones.push(HAT_IDS[h]);
			}
		}
		return { groups: groups, lones: lones };
	}

	function pickHats(rng, catalog, count) {
		var pools = hatPools(catalog);
		var groups = [];
		for (var g = 0; g < pools.groups.length; g += 1) {
			groups.push({ members: pools.groups[g], picked: [], open: true });
		}
		var lones = pools.lones.slice();
		var chosen = [];

		function units() {
			var list = [];
			for (var i = 0; i < lones.length; i += 1) {
				list.push({ type: 'lone', index: i });
			}
			for (var n = 0; n < groups.length; n += 1) {
				if (groups[n].open && groups[n].picked.length < groups[n].members.length) {
					list.push({ type: 'group', index: n });
				}
			}
			return list;
		}

		while (chosen.length < count) {
			var available = units();
			if (!available.length) {
				for (var r = 0; r < groups.length; r += 1) {
					if (groups[r].picked.length < groups[r].members.length) {
						groups[r].open = true;
					}
				}
				available = units();
				if (!available.length) {
					break;
				}
			}
			var unit = available[Math.floor(rng() * available.length)];
			if (unit.type === 'lone') {
				chosen.push(lones.splice(unit.index, 1)[0]);
				continue;
			}
			var group = groups[unit.index];
			var remaining = [];
			for (var m = 0; m < group.members.length; m += 1) {
				if (group.picked.indexOf(group.members[m]) === -1) {
					remaining.push(group.members[m]);
				}
			}
			var hat = remaining[Math.floor(rng() * remaining.length)];
			group.picked.push(hat);
			group.open = false;
			chosen.push(hat);
		}
		return chosen;
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
				description: entry.description || ("Description de l'espèce " + (i + 1) + '.'),
				sex: entry.sex === 'female' || entry.sex === 'male' ? entry.sex : ''
			};
		}
		return byAlien;
	}

	function uniqueLabels(list) {
		var unique = [];
		var source = list || [];
		for (var i = 0; i < source.length; i += 1) {
			var label = String(source[i] || '').trim();
			if (label && unique.indexOf(label) === -1) {
				unique.push(label);
			}
		}
		return unique;
	}

	function guestNamePools(guests) {
		if (Array.isArray(guests)) {
			var flat = uniqueLabels(guests);
			return { female: flat.slice(), male: flat.slice() };
		}
		var source = guests || {};
		var female = uniqueLabels(source.female);
		var male = uniqueLabels(source.male);
		if (!female.length && !male.length) {
			return { female: DEFAULT_NAMES.slice(), male: DEFAULT_NAMES.slice() };
		}
		return { female: female, male: male };
	}

	function pickFrom(rng, pool, used) {
		var available = [];
		for (var i = 0; i < pool.length; i += 1) {
			if (used.indexOf(pool[i]) === -1) {
				available.push(pool[i]);
			}
		}
		if (!available.length) {
			return null;
		}
		var name = available[Math.floor(rng() * available.length)];
		used.push(name);
		return name;
	}

	function pickGuestName(rng, sex, pools, used) {
		var combined = pools.female.concat(pools.male);
		if (sex === 'female' || sex === 'male') {
			var primary = sex === 'female' ? pools.female : pools.male;
			var fallback = sex === 'female' ? pools.male : pools.female;
			return pickFrom(rng, primary, used)
				|| pickFrom(rng, fallback, used)
				|| ('invite' + (used.length + 1));
		}
		return pickFrom(rng, combined, used) || ('invite' + (used.length + 1));
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
	 * @param {{ species?: Object, guests?: { female?: string[], male?: string[] } | string[] }} [catalog]
	 */
	function createInstance(seed, catalog) {
		if (seed === undefined || seed === null || seed === '') {
			seed = Math.floor(Math.random() * 0x7fffffff);
		} else {
			seed = parseInt(String(seed), 10) || 1;
		}

		var species = speciesMeta(catalog);
		var pools = guestNamePools(catalog && catalog.guests);
		var usedNames = [];
		var rng = mulberry32(seed);

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
		var hatIds = pickHats(rng, catalog, 10);
		var lettersRav = randomLetters(rng, 10);
		var lettersTron = randomLetters(rng, 10);

		var guests = [];
		for (var g = 0; g < 10; g += 1) {
			var alienKey = alienKeys[g];
			var meta = species[alienKey];
			guests.push({
				guest_id: g,
				name: pickGuestName(rng, meta.sex, pools, usedNames),
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

		var pageOrder = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

		return {
			seed: seed,
			generator_version: GENERATOR_VERSION,
			guests: guests,
			rav_page_order: pageOrder,
			tron_page_order: pageOrder.slice(),
			password_half_rav: buildPasswordHalf(guests, pageOrder, 'letter_rav'),
			password_half_tron: buildPasswordHalf(guests, pageOrder, 'letter_tron')
		};
	}

	global.AliensAndHatsInstance = {
		GENERATOR_VERSION: GENERATOR_VERSION,
		HAT_IDS: HAT_IDS,
		createInstance: createInstance,
		createDevInstance: createInstance
	};
})(typeof window !== 'undefined' ? window : globalThis);
