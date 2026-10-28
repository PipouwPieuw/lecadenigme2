/**
 * Twin Apothecary — per-role UI.
 * The instance holds both password halves; each page renders only its own.
 */
(function (global) {
	'use strict';

	var Api = function () {
		return global.TwinApothecaryInstance;
	};

	var STATE_WORD = {
		admission: 'présente',
		faded: 'estompée',
		worse: 'aggravée',
		flare: 'agitée',
		extra: 'trouble passager'
	};

	function el(id) {
		return document.getElementById(id);
	}

	function say(text) {
		var live = el('status_live');
		if (!live) return;
		live.textContent = '';
		global.setTimeout(function () {
			live.textContent = text;
		}, 30);
	}

	function readSeed() {
		var params = new URLSearchParams(global.location.search);
		return Api().normalizeSeed(params.get('seed'));
	}

	function showLoadError(error) {
		var node = el('load_error');
		if (!node) return;
		node.hidden = false;
		node.textContent = error && error.message ? error.message : 'Le registre du jour est illisible.';
	}

	function markSvg(shape) {
		var body = {
			zigzag: '<path d="M4 22 L12 10 L20 22 L28 10 L36 22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>',
			goutte: '<path d="M20 5 C20 5 8 18 8 25 A12 12 0 0 0 32 25 C32 18 20 5 20 5 Z" fill="currentColor"></path>',
			fente: '<path d="M10 8 L30 32 M30 8 L10 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"></path>',
			nuage: '<path d="M13 28 H29 A7 7 0 0 0 29 17 A9 9 0 0 0 15 15 A7 7 0 0 0 11 28 Z" fill="currentColor"></path>'
		};
		return '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + body[shape] + '</svg>';
	}

	function sigilSvg(id) {
		var body = {
			cloche: '<path d="M20 6 V9 M11 30 H29 M14 16 A6 6 0 0 1 26 16 V24 H14 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"></path><circle cx="20" cy="32" r="2.2" fill="currentColor"></circle>',
			soleil: '<circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="2.2"></circle><path d="M20 5 V9 M20 31 V35 M5 20 H9 M31 20 H35 M9 9 L12 12 M28 28 L31 31 M31 9 L28 12 M12 28 L9 31" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>',
			feuille: '<path d="M10 30 C10 14 22 8 32 8 C32 20 24 32 10 30 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"></path><path d="M14 26 C18 20 24 16 30 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>',
			goutte: '<path d="M20 6 C20 6 9 18 9 25 A11 11 0 0 0 31 25 C31 18 20 6 20 6 Z" fill="none" stroke="currentColor" stroke-width="2.2"></path>',
			engrenage: '<path d="M16 6 H24 L25.5 10.5 A9 9 0 0 1 29.5 14.5 L34 16 V24 L29.5 25.5 A9 9 0 0 1 25.5 29.5 L24 34 H16 L14.5 29.5 A9 9 0 0 1 10.5 25.5 L6 24 V16 L10.5 14.5 A9 9 0 0 1 14.5 10.5 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle>',
			clou: '<path d="M20 5 V24 M14 24 H26 M16 29 H24 M18 33 H22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path>',
			nuage: '<path d="M12 28 H28 A8 8 0 0 0 28 16 A10 10 0 0 0 14 14 A8 8 0 0 0 10 28 Z" fill="none" stroke="currentColor" stroke-width="2.2"></path>',
			plume: '<path d="M12 30 C18 18 26 10 32 8 C26 16 20 24 12 30 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"></path><path d="M16 26 L28 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>'
		};
		return '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + body[id] + '</svg>';
	}

	function creatureSvg(speciesId) {
		var body = {
			mousse: '<ellipse class="body_main" cx="100" cy="96" rx="64" ry="40"></ellipse>'
				+ '<rect class="body_accent" x="64" y="46" width="72" height="40" rx="18"></rect>'
				+ '<rect class="body_detail" x="80" y="60" width="40" height="12" rx="6"></rect>'
				+ '<circle class="body_spot" cx="46" cy="84" r="11"></circle>'
				+ '<circle class="body_spot" cx="156" cy="74" r="9"></circle>',
			oiseau: '<ellipse class="body_main" cx="108" cy="92" rx="52" ry="36"></ellipse>'
				+ '<circle class="body_accent" cx="148" cy="78" r="18"></circle>'
				+ '<path class="body_detail" d="M164 78 L186 86 L164 94 Z"></path>'
				+ '<path class="body_spot" d="M70 96 C78 70 96 78 100 98 C88 108 74 110 70 96 Z"></path>'
				+ '<circle class="body_eye" cx="154" cy="74" r="2.5"></circle>',
			gelee: '<ellipse class="body_main" cx="100" cy="96" rx="70" ry="42"></ellipse>'
				+ '<ellipse class="body_accent" cx="100" cy="78" rx="46" ry="22"></ellipse>'
				+ '<circle class="body_eye" cx="82" cy="90" r="5"></circle>'
				+ '<circle class="body_eye" cx="118" cy="90" r="5"></circle>'
				+ '<path class="body_detail" d="M86 112 Q100 122 114 112" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>',
			lanterne: '<rect class="body_accent" x="78" y="18" width="44" height="12" rx="3"></rect>'
				+ '<path class="body_main" d="M70 36 H130 L122 118 H78 Z"></path>'
				+ '<rect class="body_detail" x="88" y="118" width="24" height="10" rx="2"></rect>'
				+ '<circle class="body_spot" cx="100" cy="74" r="14"></circle>'
		};
		return '<svg class="creature_svg" viewBox="0 0 200 150" aria-hidden="true" focusable="false">' + body[speciesId] + '</svg>';
	}

	function copyIds(ids) {
		return (ids || []).slice();
	}

	function slotLabel(index, jar) {
		var place = index === 0 ? 'Premier sigil' : 'Second sigil';
		if (!jar) return place + ', vide';
		return place + ', ' + jar.sigil;
	}

	function reactionSentence(result) {
		var parts = [];
		result.marks.forEach(function (mark) {
			if (mark.state === 'faded') parts.push('La ' + mark.shape_aria + ' s’estompe');
			else if (mark.state === 'worse') parts.push('La ' + mark.shape_aria + ' s’aggrave');
			else if (mark.state === 'flare') parts.push('La ' + mark.shape_aria + ' s’agite');
			else if (mark.state === 'extra') parts.push('Une ' + mark.shape_aria + ' apparaît, trouble passager');
		});
		if (result.stable) parts.push('Le patient est installé');
		else if (!parts.length) parts.push('Aucune marque ne change. Le patient reste en observation');
		else parts.push('Le patient reste en observation');
		return parts.join('. ') + '.';
	}

	function mountShared(instance, role) {
		var letterKey = role === 'ravabulle' ? 'letter_rav' : 'letter_tron';
		var current = 0;
		var records = instance.visits.map(function () {
			return { draft: [], filed: null };
		});
		var tabs = el('visit_tabs');
		var passwordList = el('password_letters');
		var slotList = el(role === 'ravabulle' ? 'tray_slots' : 'pad_slots');
		var tabButtons = [];
		var slotButtons = [];

		function visit() {
			return instance.visits[current];
		}

		function record() {
			return records[current];
		}

		function renderPassword() {
			passwordList.innerHTML = '';
			instance.visits.forEach(function (item, index) {
				var filed = records[index].filed;
				var legal = filed != null && Api().isStable(instance, item, filed);
				var li = document.createElement('li');
				var letter = legal ? item[letterKey] : '';
				li.dataset.state = legal ? 'filled' : 'blank';
				li.textContent = letter;
				li.setAttribute('aria-label', legal
					? 'Visite ' + item.label + ', lettre ' + letter
					: 'Visite ' + item.label + ', pas encore de lettre');
				passwordList.appendChild(li);
			});
		}

		function renderSlots() {
			var draft = record().draft;
			slotButtons.forEach(function (button, index) {
				var jar = draft[index] ? Api().jarById(instance, draft[index]) : null;
				button.dataset.state = jar ? 'filled' : 'empty';
				button.innerHTML = jar
					? sigilSvg(jar.id) + '<span>' + jar.sigil + '</span>'
					: '<span>Vide</span>';
				button.setAttribute('aria-label', slotLabel(index, jar));
			});
		}

		function renderTabs() {
			tabButtons.forEach(function (button, index) {
				var item = instance.visits[index];
				var filed = records[index].filed;
				var legal = filed != null && Api().isStable(instance, item, filed);
				button.setAttribute('aria-pressed', index === current ? 'true' : 'false');
				button.dataset.state = legal ? 'steady' : 'waiting';
			});
		}

		function selectVisit(index, announce) {
			current = index;
			renderTabs();
			renderSlots();
			renderPassword();
			if (announce) {
				var item = visit();
				var species = Api().speciesById(instance, item.species_id);
				say('Visite ' + item.label + ', ' + species.name + '.');
			}
		}

		function toggleJar(jarId) {
			var draft = record().draft;
			var at = draft.indexOf(jarId);
			if (at !== -1) {
				draft.splice(at, 1);
				renderSlots();
				return;
			}
			if (draft.length >= 2) {
				say(role === 'ravabulle'
					? 'Le plateau a déjà deux sigils.'
					: 'L’ordonnance a déjà deux fioles.');
				return;
			}
			draft.push(jarId);
			renderSlots();
		}

		instance.visits.forEach(function (item, index) {
			var species = Api().speciesById(instance, item.species_id);
			var button = document.createElement('button');
			button.type = 'button';
			button.className = 'visit_tab';
			button.setAttribute('aria-pressed', index === current ? 'true' : 'false');
			button.textContent = item.label + ' · ' + species.name;
			tabs.appendChild(button);
			tabButtons.push(button);
		});

		[0, 1].forEach(function (index) {
			var li = document.createElement('li');
			var button = document.createElement('button');
			button.type = 'button';
			li.appendChild(button);
			slotList.appendChild(li);
			slotButtons.push(button);
			button.addEventListener('click', function () {
				var draft = record().draft;
				if (!draft[index]) return;
				draft.splice(index, 1);
				renderSlots();
			});
		});

		function filedLetterSentence(item, filed) {
			if (filed == null || !Api().isStable(instance, item, filed)) return '';
			return ' Lettre ' + item[letterKey] + ' pour la visite ' + item.label + '.';
		}

		return {
			instance: instance,
			letterKey: letterKey,
			visit: visit,
			record: record,
			records: records,
			renderPassword: renderPassword,
			renderSlots: renderSlots,
			renderTabs: renderTabs,
			selectVisit: selectVisit,
			toggleJar: toggleJar,
			copyIds: copyIds,
			filedLetterSentence: filedLetterSentence
		};
	}

	function mountBedside(instance) {
		var shared = mountShared(instance, 'ravabulle');
		var art = el('creature_art');
		var marks = el('mark_list');
		var name = el('patient_name');
		var status = el('visit_status');

		function paintBody() {
			var item = shared.visit();
			var filed = shared.record().filed;
			var result = Api().describeDose(instance, item, filed);
			var species = Api().speciesById(instance, item.species_id);
			name.textContent = species.name;
			art.dataset.species = species.id;
			art.innerHTML = creatureSvg(species.id);
			marks.innerHTML = '';
			result.marks.forEach(function (mark) {
				var li = document.createElement('li');
				var stateWord = STATE_WORD[mark.state];
				li.dataset.state = mark.state;
				li.dataset.shape = mark.shape;
				li.innerHTML = markSvg(mark.shape)
					+ '<span class="mark_label">' + mark.shape_aria.charAt(0).toUpperCase() + mark.shape_aria.slice(1) + '</span>'
					+ '<span class="mark_state">' + stateWord + '</span>';
				marks.appendChild(li);
			});
			if (filed == null) {
				status.textContent = 'Tel qu’à l’arrivée';
				status.dataset.state = 'arrival';
			} else if (result.stable) {
				status.textContent = 'Installé';
				status.dataset.state = 'steady';
			} else {
				status.textContent = 'En observation';
				status.dataset.state = 'observing';
			}
		}

		function syncSigils() {
			var draft = shared.record().draft;
			Array.prototype.forEach.call(el('sigil_buttons').children, function (button) {
				var on = draft.indexOf(button.dataset.jar) !== -1;
				button.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
		}

		function onSelect() {
			paintBody();
			syncSigils();
		}

		instance.jars.forEach(function (jar) {
			var button = document.createElement('button');
			button.type = 'button';
			button.className = 'sigil_button';
			button.dataset.jar = jar.id;
			button.setAttribute('aria-pressed', 'false');
			button.setAttribute('aria-label', 'Sigil ' + jar.sigil);
			button.innerHTML = sigilSvg(jar.id) + '<span>' + jar.sigil + '</span>';
			button.addEventListener('click', function () {
				shared.toggleJar(jar.id);
				syncSigils();
			});
			el('sigil_buttons').appendChild(button);
		});

		el('btn_administer').addEventListener('click', function () {
			var item = shared.visit();
			var before = shared.record().filed;
			var wasLegal = before != null && Api().isStable(instance, item, before);
			shared.record().filed = shared.copyIds(shared.record().draft);
			paintBody();
			shared.renderTabs();
			shared.renderPassword();
			var result = Api().describeDose(instance, item, shared.record().filed);
			var sentence = reactionSentence(result);
			var nowLegal = result.stable;
			if (nowLegal && !wasLegal) sentence += shared.filedLetterSentence(item, shared.record().filed);
			say(sentence);
		});

		el('btn_clear').addEventListener('click', function () {
			shared.record().draft = [];
			shared.record().filed = null;
			paintBody();
			shared.renderSlots();
			shared.renderTabs();
			shared.renderPassword();
			syncSigils();
			say('Le plateau est vidé. Le patient revient à son arrivée.');
		});

		tabRewire(shared, onSelect);
		shared.selectVisit(0, false);
		onSelect();
	}

	function tabRewire(shared, after) {
		var tabs = el('visit_tabs');
		Array.prototype.forEach.call(tabs.children, function (button, index) {
			button.addEventListener('click', function () {
				shared.selectVisit(index, true);
				after();
			});
		});
	}

	function mountLab(instance) {
		var shared = mountShared(instance, 'troncadelle');
		var name = el('patient_name');
		var filedLine = el('filed_line');

		function jarPhrase(ids) {
			if (!ids.length) return 'aucune fiole';
			return ids.map(function (id) {
				return Api().jarById(instance, id).sigil;
			}).join(', ');
		}

		function paintPad() {
			var item = shared.visit();
			var species = Api().speciesById(instance, item.species_id);
			var filed = shared.record().filed;
			name.textContent = species.name;
			if (filed == null) {
				filedLine.textContent = 'Rien d’inscrit';
				filedLine.dataset.state = 'empty';
			} else {
				filedLine.textContent = 'Inscrit : ' + jarPhrase(filed);
				filedLine.dataset.state = Api().isStable(instance, item, filed) ? 'steady' : 'filed';
			}
		}

		function syncJars() {
			var draft = shared.record().draft;
			Array.prototype.forEach.call(el('jar_list').children, function (li) {
				var button = li.querySelector('button');
				var on = draft.indexOf(button.dataset.jar) !== -1;
				button.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
		}

		function onSelect() {
			paintPad();
			syncJars();
		}

		instance.jars.forEach(function (jar) {
			var li = document.createElement('li');
			var button = document.createElement('button');
			button.type = 'button';
			button.className = 'jar_button';
			button.dataset.jar = jar.id;
			button.setAttribute('aria-pressed', 'false');
			button.setAttribute('aria-label', jar.name + ', sigil ' + jar.sigil);
			button.innerHTML = sigilSvg(jar.id)
				+ '<span class="jar_sigil">' + jar.sigil + '</span>'
				+ '<span class="jar_name">' + jar.name + '</span>';
			button.addEventListener('click', function () {
				shared.toggleJar(jar.id);
				syncJars();
			});
			li.appendChild(button);
			el('jar_list').appendChild(li);
		});

		el('btn_file').addEventListener('click', function () {
			var item = shared.visit();
			var before = shared.record().filed;
			var wasLegal = before != null && Api().isStable(instance, item, before);
			shared.record().filed = shared.copyIds(shared.record().draft);
			paintPad();
			shared.renderTabs();
			shared.renderPassword();
			var legal = Api().isStable(instance, item, shared.record().filed);
			var sentence = 'Ordonnance inscrite : ' + jarPhrase(shared.record().filed) + '.';
			if (legal && !wasLegal) sentence += shared.filedLetterSentence(item, shared.record().filed);
			say(sentence);
		});

		el('btn_clear').addEventListener('click', function () {
			shared.record().draft = [];
			shared.record().filed = null;
			paintPad();
			shared.renderSlots();
			shared.renderTabs();
			shared.renderPassword();
			syncJars();
			say('Ordonnance retirée.');
		});

		tabRewire(shared, onSelect);
		shared.selectVisit(0, false);
		onSelect();
	}

	function init(options) {
		var role = options && options.role;
		try {
			if (role) document.body.dataset.role = role;
			var seed = readSeed();
			el('seed_value').textContent = String(seed);
			var instance = Api().createInstance(seed);
			if (role === 'ravabulle') mountBedside(instance);
			else if (role === 'troncadelle') mountLab(instance);
		} catch (error) {
			showLoadError(error);
		}
	}

	global.TwinApothecaryCore = {
		init: init
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
