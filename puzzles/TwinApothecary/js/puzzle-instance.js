/**
 * Twin Apothecary — shared instance.
 * Same seed must be opened on both player pages.
 * Jar effects stay in this generator; pages must not print them.
 */
(function (global) {
	'use strict';

	var GENERATOR_VERSION = 1;
	var ROMAN = ['I', 'II', 'III', 'IV', 'V'];
	var ROLES = ['single', 'trap', 'trap', 'empty', 'trap'];
	var ONSETS = ['b', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v'];
	var NUCLEI = ['a', 'e', 'i', 'o', 'u'];

	var QUALITIES = [
		{ id: 'etincelle', shape: 'zigzag', shape_label: 'zigzag', shape_aria: 'marque en zigzag' },
		{ id: 'flaque', shape: 'goutte', shape_label: 'goutte', shape_aria: 'marque en goutte' },
		{ id: 'grincement', shape: 'fente', shape_label: 'fente', shape_aria: 'marque en fente' },
		{ id: 'bouffee', shape: 'nuage', shape_label: 'nuage', shape_aria: 'marque en nuage' }
	];

	var JARS = [
		{ id: 'cloche', sigil: 'cloche', name: 'Campanule', soothes: 'etincelle', spoils: 'flaque' },
		{ id: 'soleil', sigil: 'soleil', name: 'Hélianthe', soothes: 'etincelle', spoils: 'bouffee' },
		{ id: 'feuille', sigil: 'feuille', name: 'Foliaire', soothes: 'flaque', spoils: 'grincement' },
		{ id: 'goutte', sigil: 'goutte', name: 'Rosée', soothes: 'flaque', spoils: 'etincelle' },
		{ id: 'engrenage', sigil: 'engrenage', name: 'Rouage', soothes: 'grincement', spoils: 'bouffee' },
		{ id: 'clou', sigil: 'clou', name: 'Ferrule', soothes: 'grincement', spoils: 'flaque' },
		{ id: 'nuage', sigil: 'nuage', name: 'Brumaire', soothes: 'bouffee', spoils: 'etincelle' },
		{ id: 'plume', sigil: 'plume', name: 'Plumule', soothes: 'bouffee', spoils: 'grincement' }
	];

	var SPECIES = [
		{ id: 'mousse', name: 'Chevalier-mousse', natural: 'flaque' },
		{ id: 'oiseau', name: 'Oiseau-horloger', natural: 'grincement' },
		{ id: 'gelee', name: 'Bête-gelée', natural: 'etincelle' },
		{ id: 'lanterne', name: 'Lanterne-brume', natural: 'bouffee' }
	];

	var TRAP_PAIRS = [
		['etincelle', 'flaque'],
		['etincelle', 'bouffee'],
		['flaque', 'grincement'],
		['grincement', 'bouffee']
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

	function findById(list, id) {
		var i;
		for (i = 0; i < list.length; i += 1) {
			if (list[i].id === id) return list[i];
		}
		return null;
	}

	function pairKey(pair) {
		return pair[0] < pair[1] ? pair[0] + '|' + pair[1] : pair[1] + '|' + pair[0];
	}

	function pairsAvoiding(natural) {
		return TRAP_PAIRS.filter(function (pair) {
			return pair[0] !== natural && pair[1] !== natural;
		});
	}

	function speakableHalf(rng) {
		var word = '';
		var i;
		for (i = 0; i < 5; i += 1) {
			word += (i % 2 === 0) ? pick(rng, ONSETS) : pick(rng, NUCLEI);
		}
		return word;
	}

	function createInstance(seed) {
		var normalized = normalizeSeed(seed);
		var rng = mulberry32(normalized);
		var speciesIds = shuffle(rng, SPECIES.map(function (species) {
			return species.id;
		}));
		var duplicate = pick(rng, speciesIds);
		var lineup = speciesIds.slice();
		var insertAt = Math.floor(rng() * (lineup.length + 1));
		lineup.splice(insertAt, 0, duplicate);

		var visits = lineup.map(function (speciesId, index) {
			return {
				id: 'visit_' + (index + 1),
				label: ROMAN[index],
				role: ROLES[index],
				species_id: speciesId,
				natural: findById(SPECIES, speciesId).natural,
				complaints: null
			};
		});

		var usedPairs = {};
		visits.forEach(function (visit) {
			if (visit.role !== 'trap') return;
			var available = pairsAvoiding(visit.natural);
			if (!available.length) {
				throw new Error('Aucune paire légale pour ' + visit.label);
			}
			var unused = available.filter(function (pair) {
				return !usedPairs[pairKey(pair)];
			});
			var pool = unused.length ? unused : available;
			var pair = pick(rng, pool).slice();
			usedPairs[pairKey(pair)] = true;
			visit.complaints = pair;
		});

		visits.forEach(function (visit) {
			var options;
			if (visit.role === 'empty') {
				visit.complaints = [];
				return;
			}
			if (visit.role !== 'single') return;
			options = QUALITIES.map(function (quality) {
				return quality.id;
			}).filter(function (qualityId) {
				return qualityId !== visit.natural;
			});
			visit.complaints = [pick(rng, options)];
		});

		var passwordHalfRav = speakableHalf(rng);
		var passwordHalfTron = speakableHalf(rng);
		var guard = 0;
		while (passwordHalfTron === passwordHalfRav && guard < 6) {
			passwordHalfTron = speakableHalf(rng);
			guard += 1;
		}

		visits.forEach(function (visit, index) {
			visit.letter_rav = passwordHalfRav.charAt(index);
			visit.letter_tron = passwordHalfTron.charAt(index);
		});

		return {
			generator_version: GENERATOR_VERSION,
			seed: normalized,
			visits: visits,
			qualities: QUALITIES,
			jars: JARS,
			species: SPECIES,
			password_half_rav: passwordHalfRav,
			password_half_tron: passwordHalfTron
		};
	}

	function qualityById(instance, id) {
		return findById(instance.qualities, id);
	}

	function jarById(instance, id) {
		return findById(instance.jars, id);
	}

	function speciesById(instance, id) {
		return findById(instance.species, id);
	}

	function hasDuplicate(ids) {
		var seen = {};
		var i;
		for (i = 0; i < ids.length; i += 1) {
			if (seen[ids[i]]) return true;
			seen[ids[i]] = true;
		}
		return false;
	}

	function isStable(instance, visit, jarIds) {
		var ids = jarIds || [];
		var complaints = visit.complaints;
		var soothed = {};
		var i;
		var jar;
		if (!complaints.length) return ids.length === 0;
		if (ids.length !== complaints.length) return false;
		if (hasDuplicate(ids)) return false;
		for (i = 0; i < ids.length; i += 1) {
			jar = jarById(instance, ids[i]);
			if (!jar) return false;
			if (jar.soothes === visit.natural) return false;
			if (complaints.indexOf(jar.soothes) === -1) return false;
			if (complaints.indexOf(jar.spoils) !== -1) return false;
			if (soothed[jar.soothes]) return false;
			soothed[jar.soothes] = true;
		}
		for (i = 0; i < complaints.length; i += 1) {
			if (!soothed[complaints[i]]) return false;
		}
		return true;
	}

	function admissionMarks(instance, visit) {
		var present = visit.complaints.concat([visit.natural]);
		return QUALITIES.filter(function (quality) {
			return present.indexOf(quality.id) !== -1;
		}).map(function (quality) {
			return {
				quality_id: quality.id,
				shape: quality.shape,
				shape_aria: quality.shape_aria,
				role: quality.id === visit.natural ? 'natural' : 'complaint',
				state: 'admission'
			};
		});
	}

	function describeDose(instance, visit, jarIds) {
		var marks;
		var jars;
		var spoilt = {};
		var soothed = {};
		var extraSeen = {};
		if (jarIds == null) {
			return {
				marks: admissionMarks(instance, visit),
				stable: false
			};
		}
		jars = [];
		jarIds.forEach(function (id) {
			var jar = jarById(instance, id);
			if (jar) jars.push(jar);
		});
		jars.forEach(function (jar) {
			spoilt[jar.spoils] = true;
			soothed[jar.soothes] = true;
		});
		marks = admissionMarks(instance, visit).map(function (mark) {
			var next = {
				quality_id: mark.quality_id,
				shape: mark.shape,
				shape_aria: mark.shape_aria,
				role: mark.role,
				state: 'admission'
			};
			if (mark.role === 'natural') {
				if (soothed[mark.quality_id]) next.state = 'flare';
				return next;
			}
			if (spoilt[mark.quality_id]) next.state = 'worse';
			else if (soothed[mark.quality_id]) next.state = 'faded';
			return next;
		});
		jars.forEach(function (jar) {
			var treatsComplaint = visit.complaints.indexOf(jar.soothes) !== -1;
			var treatsNatural = jar.soothes === visit.natural;
			var quality;
			if (treatsComplaint || treatsNatural) return;
			if (visit.complaints.indexOf(jar.spoils) !== -1) return;
			if (jar.spoils === visit.natural) return;
			if (extraSeen[jar.spoils]) return;
			extraSeen[jar.spoils] = true;
			quality = qualityById(instance, jar.spoils);
			marks.push({
				quality_id: quality.id,
				shape: quality.shape,
				shape_aria: quality.shape_aria,
				role: 'extra',
				state: 'extra'
			});
		});
		return {
			marks: marks,
			stable: isStable(instance, visit, jarIds)
		};
	}

	global.TwinApothecaryInstance = {
		GENERATOR_VERSION: GENERATOR_VERSION,
		createInstance: createInstance,
		normalizeSeed: normalizeSeed,
		qualityById: qualityById,
		jarById: jarById,
		speciesById: speciesById,
		isStable: isStable,
		describeDose: describeDose
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
