/**
 * Ghost Dictaphone — shared instance.
 * Same seed must be opened on both player pages.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 1;
	var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
	var ONSETS = ['b', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v'];
	var NUCLEI = ['a', 'e', 'i', 'o', 'u'];

	var VOWELS = [
		{ id: 'a', label: 'A', aria: 'Voyelle A' },
		{ id: 'e', label: 'E', aria: 'Voyelle E' },
		{ id: 'i', label: 'I', aria: 'Voyelle I' },
		{ id: 'o', label: 'O', aria: 'Voyelle O' },
		{ id: 'u', label: 'U', aria: 'Voyelle U' }
	];

	var SHAPES = [
		{ id: 'flat_low', label: 'Bas tenu', aria: 'Bas tenu' },
		{ id: 'flat_high', label: 'Haut tenu', aria: 'Haut tenu' },
		{ id: 'rise', label: 'Montant', aria: 'Montant' },
		{ id: 'fall', label: 'Descendant', aria: 'Descendant' },
		{ id: 'arch', label: 'Cloche', aria: 'Cloche, bas puis haut puis bas' },
		{ id: 'valley', label: 'Creux', aria: 'Creux, haut puis bas puis haut' }
	];

	var DURATIONS = [
		{ id: 'short', label: 'Brève', aria: 'Brève, point' },
		{ id: 'long', label: 'Longue', aria: 'Longue, trait' }
	];

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

	function normalizeSeed(seed) {
		var n = Number(seed);
		if (!isFinite(n)) return 1;
		n = Math.floor(Math.abs(n));
		if (n <= 0) return 1;
		return n >>> 0;
	}

	function pick(rng, list) {
		return list[Math.floor(rng() * list.length)];
	}

	function shuffle(rng, list) {
		var arr = list.slice();
		var i;
		for (i = arr.length - 1; i > 0; i -= 1) {
			var j = Math.floor(rng() * (i + 1));
			var tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
		return arr;
	}

	function noteKey(note) {
		return note.vowel + '|' + note.shape + '|' + note.duration;
	}

	function sequenceKey(notes) {
		return notes.map(noteKey).join('/');
	}

	function randomNote(rng) {
		return {
			vowel: pick(rng, VOWELS).id,
			shape: pick(rng, SHAPES).id,
			duration: pick(rng, DURATIONS).id
		};
	}

	function speakableHalf(rng) {
		var word = '';
		var i;
		for (i = 0; i < 3; i += 1) {
			word += pick(rng, ONSETS);
			word += pick(rng, NUCLEI);
		}
		return word;
	}

	function pad(n) {
		return (n < 10 ? '0' : '') + n;
	}

	function createInstance(seed, catalog) {
		if (!catalog || !catalog.ghosts || catalog.ghosts.length < 12) {
			throw new Error('Catalogue de fantômes incomplet');
		}
		if (!catalog.items || catalog.items.length < 24) {
			throw new Error('Catalogue d’offrandes incomplet');
		}
		if (!catalog.categories || catalog.categories.length < 1) {
			throw new Error('Catalogue de désirs incomplet');
		}

		var normalized = normalizeSeed(seed);
		var rng = mulberry32(normalized);
		var used = {};
		var cylinders = [];
		var guard = 0;

		while (cylinders.length < 8 && guard < 5000) {
			guard += 1;
			var notes = [randomNote(rng), randomNote(rng), randomNote(rng), randomNote(rng)];
			var key = sequenceKey(notes);
			if (used[key]) continue;
			used[key] = true;
			cylinders.push({
				id: 'cyl_' + pad(cylinders.length + 1),
				label: ROMAN[cylinders.length],
				notes: notes
			});
		}

		if (cylinders.length < 8) {
			throw new Error('Séquences de cylindres insuffisantes');
		}

		var ghostIds = shuffle(rng, catalog.ghosts.map(function (ghost) {
			return ghost.id;
		})).slice(0, 8);
		var categoryIds = catalog.categories.map(function (category) {
			return category.id;
		});
		var categoryPool = [];
		while (categoryPool.length < cylinders.length) {
			categoryPool = categoryPool.concat(shuffle(rng, categoryIds));
		}
		categoryPool = categoryPool.slice(0, cylinders.length);

		cylinders.forEach(function (cylinder, index) {
			cylinder.ghost_id = ghostIds[index];
			cylinder.category_id = categoryPool[index];
		});

		var passwordHalfRav = speakableHalf(rng);
		var passwordHalfTron = speakableHalf(rng);
		var passwordGuard = 0;
		while (passwordHalfTron === passwordHalfRav && passwordGuard < 6) {
			passwordHalfTron = speakableHalf(rng);
			passwordGuard += 1;
		}

		return {
			generator_version: GENERATOR_VERSION,
			seed: normalized,
			cylinders: cylinders,
			ghosts: catalog.ghosts,
			items: catalog.items,
			categories: catalog.categories,
			password_half_rav: passwordHalfRav,
			password_half_tron: passwordHalfTron
		};
	}

	function findCylinder(cylinders, notes) {
		if (!notes || notes.length !== 4) return null;
		var key = sequenceKey(notes);
		var i;
		for (i = 0; i < cylinders.length; i += 1) {
			if (sequenceKey(cylinders[i].notes) === key) return cylinders[i];
		}
		return null;
	}

	function expectedItemIds(items, categoryId) {
		return items.filter(function (item) {
			return item.category_id === categoryId;
		}).map(function (item) {
			return item.id;
		}).sort();
	}

	function sameIds(left, right) {
		if (left.length !== right.length) return false;
		var i;
		for (i = 0; i < left.length; i += 1) {
			if (left[i] !== right[i]) return false;
		}
		return true;
	}

	function selectionMatches(cylinder, selection, items) {
		if (!selection || selection.ghost_id !== cylinder.ghost_id) return false;
		var expected = expectedItemIds(items, cylinder.category_id);
		var got = (selection.item_ids || []).slice().sort();
		return sameIds(expected, got);
	}

	function troncadelleSolved(instance, selections) {
		var cylinders = instance.cylinders;
		if (!cylinders || cylinders.length !== 8) return false;
		var i;
		for (i = 0; i < cylinders.length; i += 1) {
			var cylinder = cylinders[i];
			if (!selectionMatches(cylinder, selections[cylinder.id], instance.items)) return false;
		}
		return true;
	}

	function ravabulleSolved(foundIds) {
		var seen = {};
		var count = 0;
		(foundIds || []).forEach(function (id) {
			if (!seen[id]) {
				seen[id] = true;
				count += 1;
			}
		});
		return count === 8;
	}

	global.GhostDictaphoneInstance = {
		GENERATOR_VERSION: GENERATOR_VERSION,
		VOWELS: VOWELS,
		SHAPES: SHAPES,
		DURATIONS: DURATIONS,
		createInstance: createInstance,
		normalizeSeed: normalizeSeed,
		noteKey: noteKey,
		sequenceKey: sequenceKey,
		findCylinder: findCylinder,
		expectedItemIds: expectedItemIds,
		selectionMatches: selectionMatches,
		troncadelleSolved: troncadelleSolved,
		ravabulleSolved: ravabulleSolved
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
