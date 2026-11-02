import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({});
vm.runInContext(
	readFileSync(join(root, 'js/puzzle-instance.js'), 'utf8'),
	context,
	{ filename: 'puzzle-instance.js' }
);

const api = context.GhostDictaphoneInstance;

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function sameJson(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function setKey(ids) {
	return ids.slice().sort().join('/');
}

const vowelIds = api.VOWELS.map(function (item) { return item.id; });
const shapeIds = api.SHAPES.map(function (item) { return item.id; });
const durationIds = api.DURATIONS.map(function (item) { return item.id; });

const first = api.createInstance(1);
const again = api.createInstance(1);
const other = api.createInstance(2);

assert(sameJson(first, again), 'seed 1 is stable');
assert(!sameJson(first.cylinders, other.cylinders), 'seed 2 changes the cylinders');
assert(first.generator_version === 2, 'generator version');
assert(first.seed === 1, 'normalized seed');
assert(first.cylinders.length === 8, 'eight cylinders');
assert(/^[a-z]{6}$/.test(first.password_half_rav), 'rav half is six lowercase letters');
assert(/^[a-z]{6}$/.test(first.password_half_tron), 'tron half is six lowercase letters');
assert(first.password_half_rav !== first.password_half_tron, 'halves differ');

const keys = {};
const usedSets = {};
first.cylinders.forEach(function (cylinder) {
	assert(cylinder.notes.length === 4, cylinder.id + ' has four notes');
	cylinder.notes.forEach(function (note) {
		assert(vowelIds.indexOf(note.vowel) !== -1, 'vowel');
		assert(shapeIds.indexOf(note.shape) !== -1, 'shape');
		assert(durationIds.indexOf(note.duration) !== -1, 'duration');
	});
	const key = api.sequenceKey(cylinder.notes);
	assert(!keys[key], 'sequence unique');
	keys[key] = true;
	assert(cylinder.gestures.length === 4, cylinder.id + ' has four gestures');
	const seenGesture = {};
	cylinder.gestures.forEach(function (id) {
		assert(/^(0[1-9]|1[0-9]|2[0-5])$/.test(id), 'gesture id');
		assert(!seenGesture[id], 'no repeat inside a cylinder');
		seenGesture[id] = true;
	});
	const gestures = setKey(cylinder.gestures);
	assert(!usedSets[gestures], 'gesture set unique');
	usedSets[gestures] = true;
	assert(api.findCylinder(first.cylinders, cylinder.notes).id === cylinder.id, 'find own sequence');
});

const missed = first.cylinders[0].notes.map(function (note) { return Object.assign({}, note); });
missed[0].vowel = missed[0].vowel === 'a' ? 'u' : 'a';
assert(api.sequenceKey(missed) !== api.sequenceKey(first.cylinders[0].notes), 'altered note changes the sequence');
assert(api.findCylinder(first.cylinders, first.cylinders[0].notes.slice(0, 3)) === null, 'three notes do not match');

assert(api.ravabulleSolved(first.cylinders.map(function (cylinder) { return cylinder.id; })), 'eight ids solve Ravabulle');
const sevenIds = first.cylinders.slice(0, 7).map(function (cylinder) { return cylinder.id; });
assert(!api.ravabulleSolved(sevenIds), 'seven ids do not solve');
assert(!api.ravabulleSolved(sevenIds.concat([sevenIds[0]])), 'a duplicate does not count as an eighth cylinder');

function correctSelections(instance) {
	const selections = {};
	instance.cylinders.forEach(function (cylinder) {
		selections[cylinder.id] = {
			gesture_ids: cylinder.gestures.slice().reverse()
		};
	});
	return selections;
}

const solved = correctSelections(first);
assert(api.troncadelleSolved(first, solved), 'the same four gestures solve in any order');
assert(api.selectionMatches(first.cylinders[0], solved[first.cylinders[0].id]), 'reversed order still matches');

const missing = correctSelections(first);
missing[first.cylinders[0].id].gesture_ids = missing[first.cylinders[0].id].gesture_ids.slice(1);
assert(!api.troncadelleSolved(first, missing), 'a missing gesture fails');

const extra = correctSelections(first);
const foreign = first.cylinders[1].gestures.find(function (id) {
	return first.cylinders[0].gestures.indexOf(id) === -1;
});
assert(foreign, 'another cylinder supplies a gesture outside the first set');
extra[first.cylinders[0].id].gesture_ids = extra[first.cylinders[0].id].gesture_ids.slice(1).concat([foreign]);
assert(!api.troncadelleSolved(first, extra), 'a swapped gesture fails');

const oneShort = correctSelections(first);
delete oneShort[first.cylinders[7].id];
assert(!api.troncadelleSolved(first, oneShort), 'a cylinder without a selection fails');

console.log('ghost dictaphone logic ok');
