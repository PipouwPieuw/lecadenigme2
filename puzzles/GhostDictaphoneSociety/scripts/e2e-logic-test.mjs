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
const ghostsDoc = JSON.parse(readFileSync(join(root, 'data/ghosts.json'), 'utf8'));
const itemsDoc = JSON.parse(readFileSync(join(root, 'data/items.json'), 'utf8'));
const catalog = {
	ghosts: ghostsDoc.ghosts,
	categories: ghostsDoc.categories,
	items: itemsDoc.items
};

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function sameJson(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

const vowelIds = api.VOWELS.map(function (item) { return item.id; });
const shapeIds = api.SHAPES.map(function (item) { return item.id; });
const durationIds = api.DURATIONS.map(function (item) { return item.id; });

assert(catalog.ghosts.length === 12, 'twelve ghosts');
assert(catalog.items.length === 24, 'twenty-four items');
assert(catalog.categories.length === 6, 'six categories');
catalog.categories.forEach(function (category) {
	var count = catalog.items.filter(function (item) {
		return item.category_id === category.id;
	}).length;
	assert(count === 4, category.id + ' has four items');
});

const first = api.createInstance(1, catalog);
const again = api.createInstance(1, catalog);
const other = api.createInstance(2, catalog);

assert(sameJson(first, again), 'seed 1 is stable');
assert(!sameJson(first.cylinders, other.cylinders), 'seed 2 changes the cylinders');
assert(first.generator_version === 1, 'generator version');
assert(first.seed === 1, 'normalized seed');
assert(first.ghosts[0].id === 'g01', 'ghost button order stays authored');
assert(first.items[0].id === 'it01', 'item button order stays authored');
assert(first.cylinders.length === 8, 'eight cylinders');
assert(/^[a-z]{6}$/.test(first.password_half_rav), 'rav half is six lowercase letters');
assert(/^[a-z]{6}$/.test(first.password_half_tron), 'tron half is six lowercase letters');
assert(first.password_half_rav !== first.password_half_tron, 'halves differ');

const keys = {};
const usedGhosts = {};
const usedCategories = {};
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
	assert(!usedGhosts[cylinder.ghost_id], 'ghost used once');
	usedGhosts[cylinder.ghost_id] = true;
	usedCategories[cylinder.category_id] = true;
	assert(catalog.categories.some(function (category) {
		return category.id === cylinder.category_id;
	}), 'known category');
	assert(api.findCylinder(first.cylinders, cylinder.notes).id === cylinder.id, 'find own sequence');
});

const decoys = catalog.ghosts.filter(function (ghost) {
	return !usedGhosts[ghost.id];
});
assert(decoys.length === 4, 'four unused decoy ghosts');
assert(Object.keys(usedCategories).length === catalog.categories.length, 'every desire appears at least once');

const missed = first.cylinders[0].notes.map(function (note) { return Object.assign({}, note); });
missed[0].vowel = missed[0].vowel === 'a' ? 'u' : 'a';
assert(api.sequenceKey(missed) !== api.sequenceKey(first.cylinders[0].notes), 'altered note changes the sequence');
assert(api.findCylinder(first.cylinders, first.cylinders[0].notes.slice(0, 3)) === null, 'three notes do not match');

assert(api.ravabulleSolved(first.cylinders.map(function (cylinder) { return cylinder.id; })), 'eight ids solve Ravabulle');
const sevenIds = first.cylinders.slice(0, 7).map(function (cylinder) { return cylinder.id; });
assert(!api.ravabulleSolved(sevenIds), 'seven ids do not solve');
assert(!api.ravabulleSolved(sevenIds.concat([sevenIds[0]])), 'a duplicate does not count as an eighth spirit');

function correctSelections(instance) {
	const selections = {};
	instance.cylinders.forEach(function (cylinder) {
		selections[cylinder.id] = {
			ghost_id: cylinder.ghost_id,
			item_ids: api.expectedItemIds(instance.items, cylinder.category_id).slice().reverse()
		};
	});
	return selections;
}

const solved = correctSelections(first);
assert(api.troncadelleSolved(first, solved), 'exact ghost and item set solves, order ignored');

const missing = correctSelections(first);
missing[first.cylinders[0].id].item_ids = missing[first.cylinders[0].id].item_ids.slice(1);
assert(!api.troncadelleSolved(first, missing), 'missing item fails');

const extra = correctSelections(first);
const foreign = first.items.find(function (item) {
	return item.category_id !== first.cylinders[0].category_id;
});
extra[first.cylinders[0].id].item_ids = extra[first.cylinders[0].id].item_ids.concat([foreign.id]);
assert(!api.troncadelleSolved(first, extra), 'extra item fails');

const wrongGhost = correctSelections(first);
wrongGhost[first.cylinders[0].id].ghost_id = decoys[0].id;
assert(!api.troncadelleSolved(first, wrongGhost), 'wrong ghost fails');

const oneShort = correctSelections(first);
delete oneShort[first.cylinders[7].id];
assert(!api.troncadelleSolved(first, oneShort), 'a cylinder without a selection fails');

console.log('ghost dictaphone logic ok');
