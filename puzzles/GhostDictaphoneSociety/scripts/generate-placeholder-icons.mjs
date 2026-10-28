import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function svg(body) {
	return '<?xml version="1.0" encoding="UTF-8"?>\n'
		+ '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
		+ body
		+ '</svg>\n';
}

function write(rel, body) {
	const path = join(root, rel);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, svg(body));
}

const sheet = '<path fill="#f4f0e8" d="M32 16c-11 0-17 9-17 20v16l4.5-4 4 5 4.2-5 4.3 6 4.3-6 4.2 5 4-5 4.5 4V36c0-11-6-20-17-20z"/>'
	+ '<circle cx="25" cy="34" r="2.3" fill="#221e24"/>'
	+ '<circle cx="39" cy="34" r="2.3" fill="#221e24"/>'
	+ '<path d="M28 41c2 1.8 6 1.8 8 0" fill="none" stroke="#221e24" stroke-width="1.4" stroke-linecap="round"/>';

const ghosts = [
	'<rect x="22" y="3" width="20" height="8" rx="1" fill="#241c18"/><rect x="16" y="10" width="32" height="4" fill="#241c18"/><rect x="28" y="46" width="9" height="7" rx="1" fill="#3d5c8a"/>',
	'<path d="M20 12h8l4-6 4 6h8l-6 5 2 7-8-4-8 4 2-7z" fill="#e07a3d"/><path d="M30 48h4v8h-4z" fill="#c46b3a"/><circle cx="32" cy="46" r="3" fill="#c46b3a"/>',
	'<circle cx="32" cy="8" r="4" fill="#e85d8c"/><rect x="31" y="11" width="2" height="6" fill="#2f7a45"/><path d="M40 50c4 4 8 2 8-2-6 0-8 2-8 2z" fill="#3f8f55"/>',
	'<path d="M18 8h28v3H18z" fill="#222"/><circle cx="20" cy="12" r="4" fill="#222"/><circle cx="44" cy="12" r="4" fill="#222"/><path d="M34 44l4 2v8l-4 3-4-3v-8z" fill="#c9a227"/>',
	'<circle cx="32" cy="9" r="7" fill="#f2d48a" stroke="#8a6a22" stroke-width="1.5"/><path d="M32 9 V5 M32 9 L36 11" fill="none" stroke="#3a2a12" stroke-width="1.4"/>',
	'<path d="M40 4l2 8-6 2 8 10" fill="none" stroke="#b85c7a" stroke-width="2"/><circle cx="30" cy="50" r="3" fill="#d7d2cc" stroke="#888"/>',
	'<path d="M22 8h20v4H22z" fill="#f4f7fb"/><rect x="24" y="4" width="16" height="5" fill="#2a4f86"/><path d="M32 46v8M28 52h8" stroke="#2a4f86" stroke-width="2"/>',
	'<ellipse cx="32" cy="8" rx="12" ry="5" fill="#7a4ea3"/><path d="M42 46l8 10" stroke="#c46b3a" stroke-width="3" stroke-linecap="round"/><path d="M48 44l6 4-8 2z" fill="#e7d8c4"/>',
	'<path d="M18 6h22l6 6v4H18z" fill="#2f6f4f"/><rect x="26" y="46" width="12" height="8" fill="#f4f0e8" stroke="#2a4a38"/>',
	'<path d="M24 6c8-6 18 0 16 6H24z" fill="#a33d55"/><path d="M26 48h14l-2 8H28z" fill="#a33d55"/>',
	'<path d="M18 12h28v6H18z" fill="#c4452d"/><path d="M32 46c4 0 6 4 4 8-4-2-6-2-8 0-2-4 0-8 4-8z" fill="#e0703a"/>',
	'<path d="M32 2l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#f2d48a"/><circle cx="32" cy="50" r="4" fill="none" stroke="#3d4d8a" stroke-width="2"/>'
];

ghosts.forEach(function (extra, index) {
	const id = 'g' + String(index + 1).padStart(2, '0');
	write('assets/images/ghosts/' + id + '.svg', sheet + extra);
});

const disc = '<circle cx="32" cy="32" r="28" fill="#f7f1e6" stroke="#d9cbb6"/>';

const items = {
	it01: '<circle cx="32" cy="34" r="14" fill="#d64545"/><path d="M32 20c2-6 8-6 8-2" fill="none" stroke="#2f7a45" stroke-width="2"/><ellipse cx="36" cy="16" rx="5" ry="3" fill="#3f8f55"/>',
	it02: '<ellipse cx="32" cy="36" rx="16" ry="10" fill="#e0b15a"/><path d="M18 34c6-8 22-8 28 0" fill="none" stroke="#c48a3a" stroke-width="2"/>',
	it03: '<path d="M16 30h32c-2 12-8 18-16 18S18 42 16 30z" fill="#f2f6f8" stroke="#8aa0b0"/><ellipse cx="32" cy="30" rx="16" ry="5" fill="#e07a3d"/>',
	it04: '<path d="M16 40h32l-4 10H20z" fill="#f0d2e4"/><path d="M18 40l14-16 14 16" fill="#fff" stroke="#e7b7cf"/><rect x="31" y="16" width="2" height="8" fill="#e07a3d"/>',
	it05: '<rect x="10" y="30" width="40" height="6" rx="3" fill="#f2d48a"/><circle cx="20" cy="33" r="1.4" fill="#5a4630"/><circle cx="28" cy="33" r="1.4" fill="#5a4630"/><circle cx="36" cy="33" r="1.4" fill="#5a4630"/>',
	it06: '<ellipse cx="32" cy="34" rx="16" ry="12" fill="#c45c26"/><ellipse cx="32" cy="34" rx="6" ry="4" fill="#f2d2b0"/><path d="M32 18v8" stroke="#5a3a28" stroke-width="2"/>',
	it07: '<path d="M32 14c8 8 10 14 10 20a10 10 0 0 1-20 0c0-6 2-12 10-20z" fill="#f2d48a" stroke="#b08a2a"/>',
	it08: '<path d="M40 12c8 10 6 22-2 28-6 4-10 12-8 14 2-6 8-8 10-14 4-8 2-16 0-28z" fill="#8a4b2a"/><rect x="36" y="10" width="10" height="4" rx="1" fill="#222"/>',
	it09: '<rect x="14" y="14" width="22" height="8" rx="1" fill="#8d97a3"/><rect x="30" y="18" width="8" height="28" rx="1" fill="#6d5a48"/>',
	it10: '<path d="M14 40h28l4-6H18z" fill="#c5ccd4"/><path d="M16 40l4 4 4-4 4 4 4-4 4 4 4-4" fill="none" stroke="#66707c" stroke-width="1.5"/><rect x="40" y="28" width="6" height="12" fill="#6d5a48"/>',
	it11: '<circle cx="24" cy="28" r="8" fill="none" stroke="#d4a017" stroke-width="4"/><path d="M30 34l14 14" stroke="#d4a017" stroke-width="4" stroke-linecap="round"/><path d="M40 44h6M40 48h4" stroke="#d4a017" stroke-width="3"/>',
	it12: '<path d="M30 10h4l2 28h-8z" fill="#bfc6ce"/><rect x="28" y="38" width="8" height="12" fill="#8d97a3"/>',
	it13: '<path d="M32 18c8 0 12 10 8 18-6 2-12 2-16 0-4-8 0-18 8-18z" fill="#e85d8c"/><rect x="30" y="36" width="4" height="16" fill="#2f7a45"/>',
	it14: '<circle cx="32" cy="28" r="6" fill="#c44555"/><circle cx="24" cy="32" r="6" fill="#d45d6a"/><circle cx="40" cy="32" r="6" fill="#d45d6a"/><circle cx="28" cy="38" r="6" fill="#e07a88"/><circle cx="36" cy="38" r="6" fill="#e07a88"/><rect x="30" y="42" width="4" height="12" fill="#2f7a45"/>',
	it15: '<circle cx="32" cy="30" r="5" fill="#f2d48a"/><circle cx="32" cy="18" r="5" fill="#fff"/><circle cx="44" cy="26" r="5" fill="#fff"/><circle cx="40" cy="40" r="5" fill="#fff"/><circle cx="24" cy="40" r="5" fill="#fff"/><circle cx="20" cy="26" r="5" fill="#fff"/><rect x="30" y="42" width="4" height="12" fill="#2f7a45"/>',
	it16: '<path d="M18 40c10-18 20-22 28-8-10 2-16 6-28 8z" fill="#3f8f55"/><path d="M22 38c8-6 14-6 18-2" fill="none" stroke="#246338" stroke-width="1.4"/>',
	it17: '<path d="M18 14h22a6 6 0 0 1 6 6v30H24a6 6 0 0 0-6 6z" fill="#3d5c8a"/><path d="M18 14v36a6 6 0 0 1 6-6h22" fill="#2f4a72"/>',
	it18: '<path d="M16 16h32v34H16z" fill="#2f7a45"/><circle cx="32" cy="32" r="8" fill="none" stroke="#f4f0e8" stroke-width="2"/>',
	it19: '<path d="M18 14h28v36H18z" fill="#5c3d86"/><path d="M32 24l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#f2d48a"/>',
	it20: '<path d="M20 12h18l8 8v32H20z" fill="#e7d3b0"/><path d="M38 12v8h8" fill="none" stroke="#b08960"/>',
	it21: '<circle cx="32" cy="34" r="12" fill="none" stroke="#d4a017" stroke-width="4"/><circle cx="32" cy="20" r="4" fill="#49b3c7"/>',
	it22: '<path d="M18 26c8 16 20 16 28 0" fill="none" stroke="#d4a017" stroke-width="3"/><circle cx="32" cy="44" r="5" fill="#49b3c7"/>',
	it23: '<path d="M32 16l8 10 10 2-8 7 2 10-12-6-12 6 2-10-8-7 10-2z" fill="#7ec8c3" stroke="#2f6f6a"/>',
	it24: '<path d="M12 36l6-12 6 8 8-14 8 14 6-8 6 12z" fill="#f2d48a" stroke="#b08a2a"/>'
};

Object.keys(items).forEach(function (id) {
	write('assets/images/items/' + id + '.svg', disc + items[id]);
});

console.log('placeholder icons written');
