/**
 * Ghost Dictaphone — per-role UI.
 * The instance may hold both halves; each page only renders its own board.
 */
(function (global) {
	'use strict';

	var WAX = ['#c45c26', '#d4a017', '#6b8f71', '#8d4e6b', '#4f6f8f', '#a3543c', '#7d6a52', '#3f6f6a'];
	var SHAPE_PATH = {
		flat_low: 'M10 34 H40',
		flat_high: 'M10 8 H40',
		rise: 'M10 34 L40 8',
		fall: 'M10 8 L40 34',
		arch: 'M10 34 Q25 2 40 34',
		valley: 'M10 8 Q25 40 40 8'
	};

	function findById(list, id) {
		var i;
		for (i = 0; i < list.length; i += 1) {
			if (list[i].id === id) return list[i];
		}
		return null;
	}

	function shapeSvg(id) {
		return '<svg viewBox="0 0 48 42" aria-hidden="true" focusable="false">'
			+ '<path d="M5 8 H9 M5 34 H9" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.6" stroke-linecap="round"></path>'
			+ '<path d="' + SHAPE_PATH[id] + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"></path>'
			+ '</svg>';
	}

	function cylinderSvg() {
		return '<svg class="cylinder_svg" viewBox="0 0 72 40" aria-hidden="true" focusable="false">'
			+ '<rect class="wax_body" x="10" y="6" width="48" height="28" rx="2"></rect>'
			+ '<ellipse class="wax_end" cx="12" cy="20" rx="7" ry="14"></ellipse>'
			+ '<ellipse class="wax_shine" cx="58" cy="20" rx="7" ry="14"></ellipse>'
			+ '<rect class="wax_groove" x="24" y="8" width="1.5" height="24"></rect>'
			+ '<rect class="wax_groove" x="32" y="8" width="1.5" height="24"></rect>'
			+ '<rect class="wax_groove" x="40" y="8" width="1.5" height="24"></rect>'
			+ '</svg>';
	}

	function say(text) {
		var live = document.getElementById('status_live');
		if (!live) return;
		live.textContent = '';
		global.setTimeout(function () {
			live.textContent = text;
		}, 30);
	}

	function describeNote(note) {
		var api = global.GhostDictaphoneInstance;
		var shape = findById(api.SHAPES, note.shape);
		var duration = findById(api.DURATIONS, note.duration);
		return note.vowel.toUpperCase() + ', ' + shape.label.toLowerCase() + ', ' + duration.label.toLowerCase();
	}

	function readSeed() {
		var params = new URLSearchParams(global.location.search);
		if (!params.has('seed')) return 1;
		return global.GhostDictaphoneInstance.normalizeSeed(params.get('seed'));
	}

	function showLoadError() {
		var err = document.getElementById('load_error');
		if (!err) return;
		err.hidden = false;
		err.textContent = 'Les archives du dictaphone n’ont pas pu être chargées.';
	}

	function mountRavabulle(instance) {
		var api = global.GhostDictaphoneInstance;
		var draft = { vowel: null, shape: null, duration: null };
		var strip = [];
		var foundIds = [];
		var empty = document.getElementById('crt_empty');
		var video = document.getElementById('gesture_video');
		var glass = document.getElementById('crt_glass');
		var slots = document.getElementById('replay_slots');
		var password = document.getElementById('password_half');
		var passwordText = document.getElementById('password_half_text');
		var commitBtn = document.getElementById('btn_commit_note');
		var playBtn = document.getElementById('btn_play_strip');
		var backBtn = document.getElementById('btn_backspace');
		var clearBtn = document.getElementById('btn_clear');
		var reel = global.GhostDictaphoneReel.createReel({
			video: video,
			glitch: document.getElementById('vhs_glitch'),
			glass: glass
		});

		document.getElementById('seed_value').textContent = String(instance.seed);

		function currentNote() {
			return { vowel: draft.vowel, shape: draft.shape, duration: draft.duration };
		}

		function draftReady() {
			return !!(draft.vowel && draft.shape && draft.duration);
		}

		function syncPressed() {
			['vowel', 'shape', 'duration'].forEach(function (group) {
				var row = document.getElementById(group + '_row');
				Array.prototype.forEach.call(row.querySelectorAll('button'), function (btn) {
					btn.setAttribute('aria-pressed', draft[group] === btn.dataset.value ? 'true' : 'false');
				});
			});
		}

		function syncEncoderButtons() {
			commitBtn.disabled = !draftReady() || strip.length >= 4;
			playBtn.disabled = strip.length === 0;
			backBtn.disabled = strip.length === 0;
			clearBtn.disabled = strip.length === 0;
		}

		function renderStrip() {
			var list = document.getElementById('note_strip');
			list.textContent = '';
			var i;
			for (i = 0; i < 4; i += 1) {
				var note = strip[i];
				var li = document.createElement('li');
				li.className = 'note_slot';
				li.dataset.state = note ? 'filled' : 'empty';
				if (!note) {
					li.setAttribute('aria-label', 'Note ' + (i + 1) + ', vide');
					var index = document.createElement('span');
					index.className = 'slot_index';
					index.setAttribute('aria-hidden', 'true');
					index.textContent = String(i + 1);
					li.appendChild(index);
				} else {
					li.setAttribute('aria-label', 'Note ' + (i + 1) + ', ' + describeNote(note));
					var letter = document.createElement('span');
					letter.className = 'slot_vowel';
					letter.setAttribute('aria-hidden', 'true');
					letter.textContent = note.vowel.toUpperCase();
					var curve = document.createElement('span');
					curve.className = 'slot_shape';
					curve.setAttribute('aria-hidden', 'true');
					curve.innerHTML = shapeSvg(note.shape);
					var mark = document.createElement('span');
					mark.className = 'slot_duration duration_mark duration_mark--' + note.duration;
					mark.setAttribute('aria-hidden', 'true');
					li.appendChild(letter);
					li.appendChild(curve);
					li.appendChild(mark);
				}
				list.appendChild(li);
			}
		}

		function playReel(cylinder) {
			empty.hidden = true;
			var urls = cylinder.gestures.map(function (id) {
				return 'assets/videos/' + id + '.mp4';
			});
			reel.play(urls, {
				onError: function () {
					say('La séquence du cylindre ' + cylinder.label + ' n’a pas pu être lue.');
				}
			});
		}

		function renderSlots() {
			slots.textContent = '';
			instance.cylinders.forEach(function (cylinder) {
				var found = foundIds.indexOf(cylinder.id) !== -1;
				var li = document.createElement('li');
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'replay_slot';
				btn.dataset.state = found ? 'ready' : 'locked';
				btn.disabled = !found;
				if (found) {
					btn.textContent = cylinder.label;
					btn.setAttribute('aria-label', 'Rejouer les gestes du cylindre ' + cylinder.label);
					btn.addEventListener('click', function () {
						playReel(cylinder);
					});
				} else {
					btn.setAttribute('aria-label', 'Cylindre ' + cylinder.label + ', pas encore reçu');
				}
				li.appendChild(btn);
				slots.appendChild(li);
			});
		}

		function choose(group, id) {
			draft[group] = draft[group] === id ? null : id;
			syncPressed();
			syncEncoderButtons();
			if (draftReady()) global.GhostDictaphoneAudio.playNotes([currentNote()]);
		}

		function addChoices(rowId, items, group, fill) {
			var row = document.getElementById(rowId);
			items.forEach(function (item) {
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'choice_btn';
				btn.dataset.value = item.id;
				btn.setAttribute('aria-pressed', 'false');
				btn.setAttribute('aria-label', item.aria);
				fill(btn, item);
				btn.addEventListener('click', function () {
					choose(group, item.id);
				});
				row.appendChild(btn);
			});
		}

		addChoices('vowel_row', api.VOWELS, 'vowel', function (btn, item) {
			btn.textContent = item.label;
		});
		addChoices('shape_row', api.SHAPES, 'shape', function (btn, item) {
			btn.innerHTML = shapeSvg(item.id);
		});
		addChoices('duration_row', api.DURATIONS, 'duration', function (btn, item) {
			var mark = document.createElement('span');
			mark.className = 'duration_mark duration_mark--' + item.id;
			mark.setAttribute('aria-hidden', 'true');
			btn.appendChild(mark);
		});

		commitBtn.addEventListener('click', function () {
			if (!draftReady() || strip.length >= 4) return;
			strip.push(currentNote());
			renderStrip();
			if (strip.length < 4) {
				say('Note ' + strip.length + ' inscrite : ' + describeNote(strip[strip.length - 1]) + '.');
				syncEncoderButtons();
				return;
			}
			var match = api.findCylinder(instance.cylinders, strip);
			if (!match) {
				/* A miss leaves the four notes in place and says nothing about failure. */
				say('Note 4 inscrite : ' + describeNote(strip[3]) + '.');
				syncEncoderButtons();
				return;
			}
			var already = foundIds.indexOf(match.id) !== -1;
			strip = [];
			renderStrip();
			if (!already) foundIds.push(match.id);
			renderSlots();
			playReel(match);
			if (already) {
				say('Cylindre ' + match.label + ', séquence déjà reçue.');
			} else if (api.ravabulleSolved(foundIds)) {
				password.hidden = false;
				passwordText.textContent = instance.password_half_rav;
				say('Cylindre ' + match.label + ' reçu. Moitié du mot de passe : ' + instance.password_half_rav + '.');
			} else {
				say('Cylindre ' + match.label + ' reçu.');
			}
			syncEncoderButtons();
		});

		playBtn.addEventListener('click', function () {
			if (!strip.length) return;
			global.GhostDictaphoneAudio.playNotes(strip.slice());
		});

		backBtn.addEventListener('click', function () {
			if (!strip.length) return;
			strip.pop();
			renderStrip();
			syncEncoderButtons();
			say(strip.length ? 'Dernière note effacée. ' + strip.length + ' notes restantes.' : 'Séquence vide.');
		});

		clearBtn.addEventListener('click', function () {
			if (!strip.length) return;
			strip = [];
			renderStrip();
			syncEncoderButtons();
			say('Séquence effacée.');
		});

		renderStrip();
		renderSlots();
		syncEncoderButtons();
	}

	function mountTroncadelle(instance) {
		var selections = {};
		instance.cylinders.forEach(function (cylinder) {
			selections[cylinder.id] = { gesture_ids: [] };
		});

		var loadedId = null;
		var armedId = null;
		var playing = false;
		var playTimer = null;
		var slotDepth = 0;
		var wasSolved = false;
		var buttons = {};

		var bank = document.getElementById('cylinder_list');
		var slot = document.getElementById('cylinder_slot');
		var slotMount = document.getElementById('slot_mount');
		var slotEmpty = document.getElementById('slot_empty');
		var placeBtn = document.getElementById('btn_place');
		var ejectBtn = document.getElementById('btn_eject');
		var playBtn = document.getElementById('btn_play');
		var stopBtn = document.getElementById('btn_stop');
		var password = document.getElementById('password_half');
		var passwordText = document.getElementById('password_half_text');
		var idle = document.getElementById('screen_idle');
		var mini = document.getElementById('mini_crt');
		var gestureRow = document.getElementById('gesture_buttons');
		var gestureCount = document.getElementById('gesture_count');

		document.getElementById('seed_value').textContent = String(instance.seed);

		function stopPlayback(announce) {
			var wasPlaying = playing;
			playing = false;
			if (playTimer) {
				clearTimeout(playTimer);
				playTimer = null;
			}
			global.GhostDictaphoneAudio.stop();
			syncTransport();
			if (announce && wasPlaying) say('Lecture arrêtée.');
		}

		function syncTransport() {
			playBtn.disabled = !loadedId;
			stopBtn.disabled = !playing;
			playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
		}

		function gestureReadout(ids) {
			var slots = [];
			var i;
			for (i = 0; i < 4; i += 1) {
				slots.push(ids[i] ? String(parseInt(ids[i], 10)) : '_');
			}
			return slots.join(' ');
		}

		function gestureName(ids) {
			var slots = [];
			var i;
			for (i = 0; i < 4; i += 1) {
				slots.push(ids[i] ? String(parseInt(ids[i], 10)) : 'vide');
			}
			return slots.join(', ');
		}

		function gestureCountLabel(count) {
			if (!loadedId) return 'Aucun cylindre chargé';
			if (count === 0) return 'Aucun geste choisi';
			if (count === 1) return '1 geste choisi';
			return count + ' gestes choisis';
		}

		function syncToggles() {
			var ids = loadedId ? selections[loadedId].gesture_ids : [];
			Array.prototype.forEach.call(gestureRow.querySelectorAll('button'), function (btn) {
				btn.disabled = !loadedId;
				btn.setAttribute('aria-pressed', ids.indexOf(btn.dataset.gestureId) !== -1 ? 'true' : 'false');
			});
			gestureCount.textContent = gestureCountLabel(ids.length);
		}

		function syncCylinders() {
			instance.cylinders.forEach(function (cylinder) {
				var btn = buttons[cylinder.id];
				var selection = selections[cylinder.id];
				var mark = btn.querySelector('.cylinder_mark');
				/* The digits are the stored gestures, not a correctness check. */
				mark.textContent = gestureReadout(selection.gesture_ids);
				btn.setAttribute('aria-label', 'Cylindre ' + cylinder.label + ', gestes ' + gestureName(selection.gesture_ids));
				var armed = armedId === cylinder.id && loadedId !== cylinder.id;
				btn.dataset.state = cylinder.id === loadedId ? 'loaded' : (armed ? 'armed' : 'bank');
				btn.setAttribute('aria-pressed', armed ? 'true' : 'false');
				if (cylinder.id === loadedId) slotMount.appendChild(btn);
				else bank.appendChild(btn);
			});
			slotEmpty.hidden = !!loadedId;
			if (slot.dataset.state !== 'hover') {
				slot.dataset.state = loadedId ? 'filled' : 'empty';
			}
			placeBtn.disabled = !armedId || armedId === loadedId;
			ejectBtn.disabled = !loadedId;
			syncTransport();
			syncToggles();
		}

		function loadCylinder(id) {
			if (!buttons[id]) return;
			stopPlayback(false);
			loadedId = id;
			armedId = null;
			slot.dataset.state = 'filled';
			syncCylinders();
		}

		function eject() {
			if (!loadedId) return;
			stopPlayback(false);
			loadedId = null;
			slot.dataset.state = 'empty';
			syncCylinders();
		}

		function refreshSolve() {
			var solved = global.GhostDictaphoneInstance.troncadelleSolved(instance, selections);
			if (solved) {
				password.hidden = false;
				idle.hidden = true;
				passwordText.textContent = instance.password_half_tron;
				mini.dataset.state = 'lit';
				if (!wasSolved) say('Moitié du mot de passe : ' + instance.password_half_tron + '.');
			} else {
				password.hidden = true;
				idle.hidden = false;
				passwordText.textContent = '';
				mini.dataset.state = 'dark';
				if (wasSolved) say('Écran éteint.');
			}
			wasSolved = solved;
		}

		instance.cylinders.forEach(function (cylinder, index) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'cylinder_btn';
			btn.draggable = true;
			btn.dataset.cylinderId = cylinder.id;
			btn.setAttribute('aria-grabbed', 'false');
			btn.setAttribute('aria-pressed', 'false');
			btn.setAttribute('aria-describedby', 'dnd_instructions');
			btn.style.setProperty('--wax', WAX[index]);
			btn.insertAdjacentHTML('beforeend', cylinderSvg());
			var meta = document.createElement('span');
			meta.className = 'cylinder_meta';
			var prefix = document.createElement('span');
			prefix.className = 'visually-hidden';
			prefix.textContent = 'Cylindre ';
			var num = document.createElement('span');
			num.className = 'cylinder_num';
			num.textContent = cylinder.label;
			var mark = document.createElement('span');
			mark.className = 'cylinder_mark';
			mark.textContent = '_ _ _ _';
			meta.appendChild(prefix);
			meta.appendChild(num);
			meta.appendChild(mark);
			btn.appendChild(meta);
			btn.addEventListener('click', function () {
				if (loadedId === cylinder.id) return;
				armedId = armedId === cylinder.id ? null : cylinder.id;
				syncCylinders();
			});
			btn.addEventListener('dragstart', function (event) {
				event.dataTransfer.setData('text/plain', cylinder.id);
				event.dataTransfer.effectAllowed = 'move';
				btn.setAttribute('aria-grabbed', 'true');
			});
			btn.addEventListener('dragend', function () {
				btn.setAttribute('aria-grabbed', 'false');
				slotDepth = 0;
				slot.dataset.state = loadedId ? 'filled' : 'empty';
			});
			buttons[cylinder.id] = btn;
		});

		var gestureIds = [];
		var gestureIndex;
		for (gestureIndex = 1; gestureIndex <= 25; gestureIndex += 1) {
			gestureIds.push((gestureIndex < 10 ? '0' : '') + gestureIndex);
		}
		gestureIds.forEach(function (id, index) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'gesture_btn';
			btn.dataset.gestureId = id;
			btn.textContent = String(index + 1);
			btn.setAttribute('aria-pressed', 'false');
			btn.setAttribute('aria-label', 'Geste ' + (index + 1));
			btn.addEventListener('click', function () {
				if (!loadedId) return;
				var selection = selections[loadedId];
				var at = selection.gesture_ids.indexOf(id);
				if (at !== -1) {
					selection.gesture_ids.splice(at, 1);
				} else if (selection.gesture_ids.length >= 4) {
					say('Quatre gestes déjà choisis. Retirez-en un pour en changer.');
					return;
				} else {
					selection.gesture_ids.push(id);
				}
				syncCylinders();
				refreshSolve();
			});
			gestureRow.appendChild(btn);
		});

		placeBtn.addEventListener('click', function () {
			if (armedId) loadCylinder(armedId);
		});
		ejectBtn.addEventListener('click', eject);

		playBtn.addEventListener('click', function () {
			if (!loadedId) return;
			var cylinder = findById(instance.cylinders, loadedId);
			stopPlayback(false);
			playing = true;
			syncTransport();
			say('Lecture du cylindre ' + cylinder.label + '.');
			global.GhostDictaphoneAudio.playNotes(cylinder.notes).then(function (ms) {
				if (!playing) return;
				playTimer = global.setTimeout(function () {
					playing = false;
					playTimer = null;
					syncTransport();
					say('Lecture terminée.');
				}, ms);
			});
		});

		stopBtn.addEventListener('click', function () {
			stopPlayback(true);
		});

		slot.addEventListener('dragover', function (event) {
			event.preventDefault();
		});
		slot.addEventListener('dragenter', function (event) {
			event.preventDefault();
			slotDepth += 1;
			slot.dataset.state = 'hover';
		});
		slot.addEventListener('dragleave', function () {
			slotDepth -= 1;
			if (slotDepth <= 0) {
				slotDepth = 0;
				slot.dataset.state = loadedId ? 'filled' : 'empty';
			}
		});
		slot.addEventListener('drop', function (event) {
			event.preventDefault();
			slotDepth = 0;
			var id = event.dataTransfer.getData('text/plain');
			if (buttons[id]) loadCylinder(id);
		});

		bank.addEventListener('dragover', function (event) {
			event.preventDefault();
		});
		bank.addEventListener('drop', function (event) {
			event.preventDefault();
			var id = event.dataTransfer.getData('text/plain');
			if (id && id === loadedId) eject();
		});

		syncCylinders();
		refreshSolve();
	}

	function init(options) {
		var role = options && options.role;
		if (role) document.body.dataset.role = role;
		try {
			var instance = global.GhostDictaphoneInstance.createInstance(readSeed());
			if (role === 'ravabulle') mountRavabulle(instance);
			else if (role === 'troncadelle') mountTroncadelle(instance);
		} catch (error) {
			showLoadError();
		}
	}

	global.GhostDictaphoneCore = {
		init: init
	};
})(typeof globalThis !== 'undefined' ? globalThis : this);
