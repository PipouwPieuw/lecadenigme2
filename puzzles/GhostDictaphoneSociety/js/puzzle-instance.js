/**
 * Ghost Dictaphone — shared instance.
 * Same seed must be opened on both player pages.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 2;
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

	function gesturePool() {
		var pool = [];
		var n;
		for (n = 1; n <= 25; n += 1) pool.push(pad(n));
		return pool;
	}

	function gestureSetKey(ids) {
		return ids.slice().sort().join('/');
	}

	function createInstance(seed) {
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

		var usedSets = {};
		cylinders.forEach(function (cylinder) {
			var setGuard = 0;
			var assigned = null;
			while (!assigned && setGuard < 200) {
				setGuard += 1;
				var picked = shuffle(rng, gesturePool()).slice(0, 4);
				var setKey = gestureSetKey(picked);
				if (usedSets[setKey]) continue;
				usedSets[setKey] = true;
				assigned = picked;
			}
			if (!assigned) throw new Error('Jeux de gestes insuffisants');
			/* Array order is the playback order. Matching ignores it. */
			cylinder.gestures = assigned;
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

	function sameIds(left, right) {
		if (left.length !== right.length) return false;
		var i;
		for (i = 0; i < left.length; i += 1) {
			if (left[i] !== right[i]) return false;
		}
		return true;
	}

	function selectionMatches(cylinder, selection) {
		if (!cylinder || !selection || !cylinder.gestures) return false;
		var got = selection.gesture_ids || [];
		if (got.length !== cylinder.gestures.length) return false;
		return sameIds(gestureSetKey(cylinder.gestures).split('/'), gestureSetKey(got).split('/'));
	}

	function troncadelleSolved(instance, selections) {
		var cylinders = instance.cylinders;
		if (!cylinders || cylinders.length !== 8) return false;
		var i;
		for (i = 0; i < cylinders.length; i += 1) {
			var cylinder = cylinders[i];
			if (!selectionMatches(cylinder, selections[cylinder.id])) return false;
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
		selectionMatches: selectionMatches,
		troncadelleSolved: troncadelleSolved,
		ravabulleSolved: ravabulleSolved
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
