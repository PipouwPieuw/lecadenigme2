/**
 * Aliens & Hats — shared UI (v2).
 */
(function (global) {
	'use strict';

	// Temporary: tags show the Latin species and guest names.
	// Set to false when hand-drawn symbol codes replace them.
	var SHOW_PLAIN_LABELS = true;

	var POOL_PIECE_MAX_HEIGHT_PX = 200;
	var POOL_MIN_COLUMNS = 3;
	var POOL_EDGE_PAD = 4;
	var SOLVE_SOUND_DELAY_MS = 1000;
	var SOLVE_FOLLOW_DELAY_MS = 1500;
	// Matches the dossier entrance delays in aliens-and-hats.css.
	var DOSSIER_SWAP_DELAYS_MS = [0, 200, 400];
	var PAGE_SOUND_IDS = ['page1', 'page2', 'page3', 'page4', 'page5'];
	var poolLayoutPass = 0;
	var lastPageSound = -1;

	var state = {
		role: null,
		instance: null,
		layout: null,
		bookOpen: false,
		coverSide: 'front',
		currentSpread: 0,
		puzzleSolved: false,
		dossierRevealed: false,
		dossierAnimating: false,
		pageRevealed: {}
	};

	function assetPath(folder, file) {
		return 'assets/' + folder + '/' + file + '.png';
	}

	function playSound(id) {
		var audio = new Audio('assets/sounds/' + id + '.mp3');
		var pending = audio.play();
		if (pending && typeof pending.catch === 'function') {
			pending.catch(function () {});
		}
	}

	function playPageTurn() {
		var index = Math.floor(Math.random() * PAGE_SOUND_IDS.length);
		if (PAGE_SOUND_IDS.length > 1 && index === lastPageSound) {
			index = (index + 1) % PAGE_SOUND_IDS.length;
		}
		lastPageSound = index;
		playSound(PAGE_SOUND_IDS[index]);
	}

	function setBookLocked(locked) {
		state.dossierAnimating = locked;
		document.body.classList.toggle('ah_book_locked', locked);
		var stage = el('book_stage');
		if (stage) {
			if (locked) {
				stage.setAttribute('aria-busy', 'true');
			} else {
				stage.removeAttribute('aria-busy');
			}
		}
		updateSpreadNav();
	}

	function mulberry32(seed) {
		var a = seed >>> 0;
		return function () {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			var t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function pageOrder() {
		return state.role === 'ravabulle'
			? state.instance.rav_page_order
			: state.instance.tron_page_order;
	}

	function guestAtPage(pageIndex) {
		return state.instance.guests[pageOrder()[pageIndex]];
	}

	function letterAtPage(pageIndex) {
		var g = guestAtPage(pageIndex);
		return state.role === 'ravabulle' ? g.letter_rav : g.letter_tron;
	}

	function passwordHalf() {
		return state.role === 'ravabulle'
			? state.instance.password_half_rav
			: state.instance.password_half_tron;
	}

	function layoutGet(section, key, fallbackKey) {
		if (!state.layout || !state.layout[section]) {
			return null;
		}
		var block = state.layout[section];
		return block[key] || block[fallbackKey || 'default'] || null;
	}

	function applyPctStyles(el, spec) {
		if (!spec) {
			return;
		}
		if (spec.widthPct) {
			el.style.width = spec.widthPct + '%';
		}
		if (spec.marginBottomPct) {
			el.style.marginBottom = spec.marginBottomPct + '%';
		}
	}

	function sizePxFromLayout(value) {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		var n = parseInt(value, 10);
		if (!n) {
			return null;
		}
		return n;
	}

	function sizePctFromLayout(value) {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		var n = parseInt(value, 10);
		if (!n) {
			return null;
		}
		return n;
	}

	function layoutSpeciesBookEntry(section, speciesKey) {
		var root = state.layout && state.layout[section];
		var block = root && root.book;
		return (block && (block[speciesKey] || block.default)) || {};
	}

	function alienBookSizeEntry(alienKey) {
		var frame = layoutGet('rav_alien_on_page', alienKey, 'default') || {};
		var book = layoutSpeciesBookEntry('alien_species_size', alienKey);
		return Object.assign({}, frame, book);
	}

	function applySizeEntryToElement(el, entry, img) {
		var widthPx = sizePxFromLayout(entry.widthPx);
		var heightPx = sizePxFromLayout(entry.heightPx);
		var widthPct = sizePctFromLayout(entry.widthPct);
		var heightPct = sizePctFromLayout(entry.heightPct);
		var hasWidth = widthPct !== null || widthPx !== null;
		var hasHeight = heightPct !== null || heightPx !== null;

		if (widthPct !== null) {
			el.style.width = widthPct + '%';
			el.style.maxWidth = 'none';
		} else if (widthPx !== null) {
			el.style.width = widthPx + 'px';
			el.style.maxWidth = widthPx + 'px';
		} else {
			el.style.width = '';
			el.style.maxWidth = '';
		}

		if (heightPct !== null) {
			el.style.height = heightPct + '%';
			el.style.maxHeight = 'none';
		} else if (heightPx !== null) {
			el.style.height = heightPx + 'px';
			el.style.maxHeight = heightPx + 'px';
		} else {
			el.style.height = '';
			el.style.maxHeight = '';
		}

		if (!img) {
			return;
		}
		if (hasWidth) {
			img.style.width = '100%';
		} else {
			img.style.width = '100%';
		}
		if (hasHeight) {
			img.style.height = '100%';
		} else {
			img.style.height = 'auto';
		}
		img.style.maxWidth = 'none';
		img.style.maxHeight = 'none';
	}

	function layoutAssetSize(section, context, assetKey) {
		var root = state.layout && state.layout[section];
		var block = root && root[context];
		var entry = (block && (block[assetKey] || block.default)) || {};
		var widthPx = sizePxFromLayout(entry.widthPx);
		var heightPx = sizePxFromLayout(entry.heightPx);
		if (context === 'pool' && heightPx === null && widthPx === null) {
			heightPx = POOL_PIECE_MAX_HEIGHT_PX;
		}
		return { widthPx: widthPx, heightPx: heightPx };
	}

	function applyImgDisplaySize(img, section, context, assetKey) {
		var size = layoutAssetSize(section, context, assetKey);
		if (size.widthPx === null) {
			img.style.width = 'auto';
			img.style.maxWidth = 'none';
		} else {
			img.style.width = size.widthPx + 'px';
			img.style.maxWidth = size.widthPx + 'px';
		}
		if (size.heightPx === null) {
			img.style.height = 'auto';
			img.style.maxHeight = 'none';
		} else {
			img.style.height = size.heightPx + 'px';
			img.style.maxHeight = size.heightPx + 'px';
		}
	}

	function applyAlienDisplaySize(img, context, alienKey) {
		applyImgDisplaySize(img, 'alien_species_size', context, alienKey);
	}

	function applyHatPoolSize(img, hatId) {
		applyImgDisplaySize(img, 'hat_size', 'pool', hatId);
	}

	function ravHatAlienBlock(alienKey) {
		var root = state.layout && state.layout.rav_hat_on_alien;
		if (!root) {
			return {};
		}
		return root[alienKey] || root.default || {};
	}

	function ravHatLayerSpec(alienKey) {
		var block = ravHatAlienBlock(alienKey);
		var root = state.layout && state.layout.rav_hat_on_alien;
		var rootDef = root && root.default;
		return {
			widthPct: block.widthPct || (rootDef && rootDef.widthPct),
			marginBottomPct: block.marginBottomPct !== undefined
				? block.marginBottomPct
				: (rootDef && rootDef.marginBottomPct)
		};
	}

	function ravHatPlacedSizeEntry(alienKey, hatId) {
		var block = ravHatAlienBlock(alienKey);
		if (hatId && /^hat\d{2}$/.test(hatId) && block[hatId] && typeof block[hatId] === 'object') {
			return block[hatId];
		}
		if (block.default && typeof block.default === 'object') {
			return block.default;
		}
		return {};
	}

	function ravHatHeadOffsetPct(alienKey, hatId) {
		var block = ravHatAlienBlock(alienKey);
		if (hatId && /^hat\d{2}$/.test(hatId) && block[hatId]
			&& block[hatId].marginBottomPct !== undefined) {
			return block[hatId].marginBottomPct;
		}
		if (hatId && block.default && block.default.marginBottomPct !== undefined) {
			return block.default.marginBottomPct;
		}
		return ravHatLayerSpec(alienKey).marginBottomPct;
	}

	function ravHatLayerWidthPct(alienKey, hatId) {
		var block = ravHatAlienBlock(alienKey);
		if (hatId && /^hat\d{2}$/.test(hatId) && block[hatId]
			&& sizePctFromLayout(block[hatId].widthPct) !== null) {
			return sizePctFromLayout(block[hatId].widthPct);
		}
		if (hatId && block.default && sizePctFromLayout(block.default.widthPct) !== null) {
			return sizePctFromLayout(block.default.widthPct);
		}
		return ravHatLayerSpec(alienKey).widthPct;
	}

	function syncTronPortraitLayout(alienSlot) {
		if (!alienSlot || !alienSlot.classList.contains('placement_slot--alien')) {
			return;
		}
		var body = alienSlot.closest('.portrait_body');
		if (!body) {
			return;
		}
		var hatLayer = body.querySelector('.portrait_hat');
		var hatWrap = hatLayer && hatLayer.querySelector('.hat_fixed_bw');
		if (!hatLayer || !hatWrap) {
			return;
		}
		var pageIndex = parseInt(alienSlot.dataset.pageIndex, 10);
		var guest = guestAtPage(pageIndex);
		var hatImg = hatWrap.querySelector('img');
		var alienPiece = alienSlot.querySelector('.grab_piece--alien');
		if (!alienPiece) {
			applyHatLayerLayout(hatLayer, 'tron_hat_on_page', guest.hat_id);
			applySizeEntryToElement(hatWrap, { widthPct: 100, heightPct: 0 }, hatImg);
			return;
		}
		var alienKey = alienPiece.dataset.alien;
		var hatId = guest.hat_id;
		var offsetPct = ravHatHeadOffsetPct(alienKey, hatId);
		if (offsetPct !== undefined) {
			hatLayer.style.setProperty('--ah-hat-offset-y', offsetPct + '%');
		}
		var layerWidthPct = ravHatLayerWidthPct(alienKey, hatId);
		if (layerWidthPct) {
			hatLayer.style.width = layerWidthPct + '%';
		}
		applySizeEntryToElement(hatWrap, { widthPct: 100, heightPct: 0 }, hatImg);
	}

	function syncPortraitSlotLayout(slot) {
		if (!slot) {
			return;
		}
		if (slot.classList.contains('placement_slot--hat')) {
			syncRavHatHeadOffset(slot);
			return;
		}
		if (slot.classList.contains('placement_slot--alien')) {
			syncTronPortraitLayout(slot);
		}
	}

	function syncRavHatHeadOffset(hatSlot) {
		if (!hatSlot || !hatSlot.classList.contains('placement_slot--hat')) {
			return;
		}
		var hatLayer = hatSlot.closest('.portrait_hat');
		if (!hatLayer) {
			return;
		}
		var pageIndex = parseInt(hatSlot.dataset.pageIndex, 10);
		var guest = guestAtPage(pageIndex);
		var piece = hatSlot.querySelector('.grab_piece--hat');
		var hatId = piece ? piece.dataset.hatId : null;
		var offsetPct = ravHatHeadOffsetPct(guest.alien, hatId);
		if (offsetPct !== undefined) {
			hatLayer.style.setProperty('--ah-hat-offset-y', offsetPct + '%');
		}
		var layerWidthPct = ravHatLayerWidthPct(guest.alien, hatId);
		if (layerWidthPct) {
			hatLayer.style.width = layerWidthPct + '%';
		}
	}

	function applyRavPlacedHatSize(piece, alienKey, hatId) {
		var entry = ravHatPlacedSizeEntry(alienKey, hatId);
		var img = piece.querySelector('img');
		applySizeEntryToElement(piece, {
			widthPct: 100,
			heightPct: entry.heightPct
		}, img);
	}

	function applyPoolPieceSize(piece) {
		piece.dataset.sizeContext = 'pool';
		piece.style.transform = '';
		piece.style.width = 'auto';
		piece.style.height = 'auto';
		piece.style.maxWidth = 'none';
		piece.style.maxHeight = 'none';
		var img = piece.querySelector('img');
		if (!img) {
			return;
		}
		if (piece.classList.contains('grab_piece--alien')) {
			applyAlienDisplaySize(img, 'pool', piece.dataset.alien);
			return;
		}
		if (piece.classList.contains('grab_piece--hat')) {
			applyHatPoolSize(img, piece.dataset.hatId);
		}
	}

	function applyBookGrabPieceSize(piece, slot) {
		var img = piece.querySelector('img');
		if (!img) {
			return;
		}
		if (piece.classList.contains('grab_piece--alien')) {
			applySizeEntryToElement(piece, alienBookSizeEntry(piece.dataset.alien), img);
			return;
		}
		if (piece.classList.contains('grab_piece--hat') && slot) {
			var pageIndex = parseInt(slot.dataset.pageIndex, 10);
			var guest = guestAtPage(pageIndex);
			applyRavPlacedHatSize(piece, guest.alien, piece.dataset.hatId);
		}
	}

	function configuredPoolImgSize(piece) {
		if (piece.classList.contains('grab_piece--alien')) {
			return layoutAssetSize('alien_species_size', 'pool', piece.dataset.alien);
		}
		if (piece.classList.contains('grab_piece--hat')) {
			return layoutAssetSize('hat_size', 'pool', piece.dataset.hatId);
		}
		return { widthPx: null, heightPx: POOL_PIECE_MAX_HEIGHT_PX };
	}

	function poolLayoutDimensions(cfg, img) {
		var targetW = cfg.widthPx;
		var targetH = cfg.heightPx;
		if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
			if (targetW && targetH) {
				return { width: targetW, height: targetH };
			}
			if (targetW) {
				return {
					width: targetW,
					height: Math.round(targetW * img.naturalHeight / img.naturalWidth)
				};
			}
			if (targetH) {
				return {
					width: Math.round(targetH * img.naturalWidth / img.naturalHeight),
					height: targetH
				};
			}
			return {
				width: Math.round(POOL_PIECE_MAX_HEIGHT_PX * img.naturalWidth / img.naturalHeight),
				height: POOL_PIECE_MAX_HEIGHT_PX
			};
		}
		if (targetW && targetH) {
			return { width: targetW, height: targetH };
		}
		if (targetW) {
			return { width: targetW, height: POOL_PIECE_MAX_HEIGHT_PX };
		}
		if (targetH) {
			return { width: POOL_PIECE_MAX_HEIGHT_PX, height: targetH };
		}
		return { width: POOL_PIECE_MAX_HEIGHT_PX, height: POOL_PIECE_MAX_HEIGHT_PX };
	}

	function pieceLayoutSize(piece) {
		var w = piece.offsetWidth;
		var h = piece.offsetHeight;
		if (w >= 2 && h >= 2) {
			return { width: w, height: h };
		}
		var img = piece.querySelector('img');
		var dims = poolLayoutDimensions(configuredPoolImgSize(piece), img);
		return {
			width: Math.max(1, Math.ceil(dims.width)),
			height: Math.max(1, Math.ceil(dims.height))
		};
	}

	function readSeed() {
		var m = window.location.search.match(/[?&]seed=(\d+)/);
		return m ? m[1] : undefined;
	}

	function el(id) {
		return document.getElementById(id);
	}

	function tagArtImg(art) {
		var img = document.createElement('img');
		img.src = assetPath('misc', art);
		img.alt = '';
		img.setAttribute('aria-hidden', 'true');
		return img;
	}

	function buildCodedTag(className, art, symbols, accessibleLabel) {
		var wrap = document.createElement('div');
		wrap.className = className;
		wrap.appendChild(tagArtImg(art));
		var hidden = document.createElement('span');
		hidden.className = 'visually-hidden';
		hidden.textContent = accessibleLabel;
		wrap.appendChild(hidden);
		var span = document.createElement('span');
		span.className = 'tag_symbols' + (SHOW_PLAIN_LABELS ? ' tag_symbols--plain' : '');
		span.textContent = symbols;
		wrap.appendChild(span);
		return wrap;
	}

	function buildInputTag(className, art, inputLabel, pageIndex, field) {
		var wrap = document.createElement('div');
		wrap.className = className;
		wrap.appendChild(tagArtImg(art));
		var input = document.createElement('input');
		input.type = 'text';
		input.className = 'tag_input';
		input.setAttribute('aria-label', inputLabel);
		input.setAttribute('autocomplete', 'off');
		input.setAttribute('autocapitalize', 'off');
		input.spellcheck = false;
		input.dataset.pageIndex = String(pageIndex);
		input.dataset.field = field;
		input.addEventListener('input', tryValidate);
		wrap.appendChild(input);
		return wrap;
	}

	function applyHatLayerLayout(hatLayer, section, key) {
		var spec;
		if (section === 'rav_hat_on_alien') {
			spec = ravHatLayerSpec(key);
		} else {
			spec = layoutGet(section, key, 'default') || {};
		}
		if (spec.widthPct) {
			hatLayer.style.width = spec.widthPct + '%';
		}
		if (spec.marginBottomPct !== undefined) {
			hatLayer.style.setProperty('--ah-hat-offset-y', spec.marginBottomPct + '%');
		}
	}

	function buildPortraitStack(pageIndex) {
		var guest = guestAtPage(pageIndex);
		var stack = document.createElement('div');
		stack.className = 'portrait_stack';

		var body = document.createElement('div');
		body.className = 'portrait_body';

		var hatLayer = document.createElement('div');
		hatLayer.className = 'portrait_hat';

		if (state.role === 'ravabulle') {
			var alienWrap = document.createElement('div');
			alienWrap.className = 'alien_figure alien_fixed_bw';
			var alienImg = document.createElement('img');
			alienImg.src = assetPath('aliens', guest.alien + '-' + guest.alien_variant);
			alienImg.alt = 'Invité';
			alienImg.className = 'alien_img alien_img--grayscale';
			applySizeEntryToElement(alienWrap, alienBookSizeEntry(guest.alien), alienImg);
			alienWrap.appendChild(alienImg);
			body.appendChild(alienWrap);

			var hatSlot = document.createElement('div');
			hatSlot.className = 'placement_slot placement_slot--hat';
			hatSlot.dataset.pageIndex = String(pageIndex);
			hatLayer.appendChild(hatSlot);
			applyHatLayerLayout(hatLayer, 'rav_hat_on_alien', guest.alien);
		} else {
			var alienSlot = document.createElement('div');
			alienSlot.className = 'placement_slot placement_slot--alien';
			alienSlot.dataset.pageIndex = String(pageIndex);
			body.appendChild(alienSlot);

			var hatWrap = document.createElement('div');
			hatWrap.className = 'hat_fixed_bw';
			var hatImg = document.createElement('img');
			hatImg.src = assetPath('hats', guest.hat_id);
			hatImg.alt = '';
			hatImg.className = 'hat_img hat_img--grayscale';
			hatWrap.appendChild(hatImg);
			hatLayer.appendChild(hatWrap);
			applyHatLayerLayout(hatLayer, 'tron_hat_on_page', guest.hat_id);
		}

		body.appendChild(hatLayer);
		stack.appendChild(body);
		return stack;
	}

	function buildPortraitPage(pageIndex) {
		var page = document.createElement('div');
		page.className = 'book_page book_page--portrait';
		page.dataset.pageIndex = String(pageIndex);

		var scene = document.createElement('div');
		scene.className = 'page_scene';
		scene.appendChild(buildPortraitStack(pageIndex));
		page.appendChild(scene);
		return page;
	}

	function buildDossierPage(pageIndex) {
		var guest = guestAtPage(pageIndex);
		var page = document.createElement('div');
		page.className = 'book_page book_page--dossier';

		var scene = document.createElement('div');
		scene.className = 'page_scene page_scene--dossier';
		scene.hidden = true;

		if (state.role === 'ravabulle') {
			scene.appendChild(buildCodedTag(
				'dossier_tag dossier_tag--species',
				guest.species_tag_art,
				SHOW_PLAIN_LABELS ? guest.species_name : guest.species_code,
				SHOW_PLAIN_LABELS ? 'Espèce' : "Code d'espèce"
			));
		} else {
			scene.appendChild(buildInputTag(
				'dossier_tag dossier_tag--species',
				guest.species_tag_art,
				"Nom de l'espèce",
				pageIndex,
				'species'
			));
		}

		var description = document.createElement('p');
		description.className = 'species_description';
		description.textContent = guest.species_description;
		scene.appendChild(description);

		if (state.role === 'ravabulle') {
			scene.appendChild(buildInputTag(
				'dossier_tag dossier_tag--name',
				guest.name_tag_art,
				"Nom de l'invité",
				pageIndex,
				'name'
			));
		} else {
			scene.appendChild(buildCodedTag(
				'dossier_tag dossier_tag--name',
				guest.name_tag_art,
				SHOW_PLAIN_LABELS ? guest.name : guest.name_code,
				SHOW_PLAIN_LABELS ? 'Nom' : 'Code du nom'
			));
		}

		page.appendChild(scene);
		return page;
	}

	function renderBook() {
		var container = el('book_spreads');
		container.innerHTML = '';
		for (var s = 0; s < 10; s += 1) {
			var spread = document.createElement('div');
			spread.className = 'book_spread';
			spread.dataset.spread = String(s);
			if (s !== state.currentSpread) {
				spread.hidden = true;
			}
			var frame = document.createElement('div');
			frame.className = 'book_spread_frame';
			frame.setAttribute('aria-hidden', 'true');
			spread.appendChild(frame);
			spread.appendChild(buildPortraitPage(s));
			spread.appendChild(buildDossierPage(s));

			var letter = document.createElement('div');
			letter.className = 'page_letter spread_letter';
			letter.hidden = true;
			letter.textContent = letterAtPage(s);
			letter.setAttribute('aria-hidden', 'true');
			spread.appendChild(letter);

			container.appendChild(spread);
		}
		updateSpreadNav();
		refreshPageViews();
	}

	function buildHatPiece(hatId) {
		var piece = document.createElement('div');
		piece.className = 'grab_piece grab_piece--pool grab_piece--hat';
		piece.dataset.hatId = hatId;
		piece.tabIndex = 0;
		piece.setAttribute('role', 'button');
		piece.setAttribute('aria-label', 'Chapeau ' + hatId);
		var img = document.createElement('img');
		img.src = assetPath('hats', hatId);
		img.alt = '';
		piece.appendChild(img);
		applyPoolPieceSize(piece);
		return piece;
	}

	function buildAlienPiece(alienKey, variant) {
		var piece = document.createElement('div');
		piece.className = 'grab_piece grab_piece--pool grab_piece--alien';
		piece.dataset.alien = alienKey;
		piece.dataset.alienVariant = String(variant);
		piece.tabIndex = 0;
		piece.setAttribute('role', 'button');
		piece.setAttribute('aria-label', alienKey + ' variante ' + variant);
		var img = document.createElement('img');
		img.src = assetPath('aliens', alienKey + '-' + variant);
		img.alt = '';
		piece.appendChild(img);
		applyPoolPieceSize(piece);
		return piece;
	}

	function shuffleList(list, rng) {
		var arr = list.slice();
		for (var i = arr.length - 1; i > 0; i -= 1) {
			var j = Math.floor(rng() * (i + 1));
			var tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
		return arr;
	}

	function clampPoolPosition(left, top, pieceW, pieceH) {
		var pool = el('grab_pool');
		var maxLeft = Math.max(0, pool.clientWidth - pieceW - POOL_EDGE_PAD);
		var maxTop = Math.max(0, pool.clientHeight - pieceH - POOL_EDGE_PAD);
		return {
			left: Math.min(Math.max(0, left), maxLeft),
			top: Math.min(Math.max(POOL_EDGE_PAD, top), maxTop)
		};
	}

	function poolColumnCount(pieceCount, poolH) {
		var cols = POOL_MIN_COLUMNS;
		var estHeight = POOL_PIECE_MAX_HEIGHT_PX;
		while (cols < pieceCount) {
			var rows = Math.ceil(pieceCount / cols);
			if (rows <= 1) {
				break;
			}
			var step = (poolH - POOL_EDGE_PAD * 2 - estHeight) / (rows - 1);
			if (step >= -estHeight * 0.35) {
				break;
			}
			cols += 1;
		}
		return Math.min(Math.max(POOL_MIN_COLUMNS, cols), pieceCount);
	}

	function whenGrabPoolImagesReady(pieces, done) {
		var imgs = [];
		pieces.forEach(function (piece) {
			var img = piece.querySelector('img');
			if (img) {
				imgs.push(img);
			}
		});
		var pending = imgs.filter(function (img) {
			return !(img.complete && img.naturalWidth > 0);
		});
		function finish() {
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(done);
			});
		}
		if (!pending.length) {
			finish();
			return;
		}
		Promise.all(pending.map(function (img) {
			return img.decode().catch(function () {
				return new Promise(function (resolve) {
					img.addEventListener('load', resolve, { once: true });
					img.addEventListener('error', resolve, { once: true });
				});
			});
		})).then(finish);
	}

	function placePieceInPool(piece, left, top) {
		var pool = el('grab_pool');
		piece.classList.remove('grab_piece--placed');
		piece.classList.add('grab_piece--pool');
		piece.style.position = 'absolute';
		pool.appendChild(piece);
		applyPoolPieceSize(piece);
		var size = pieceLayoutSize(piece);
		var pos = clampPoolPosition(left, top, size.width, size.height);
		piece.style.left = pos.left + 'px';
		piece.style.top = pos.top + 'px';
	}

	function layoutPoolInColumns(pieces) {
		var pool = el('grab_pool');
		var poolW = pool.clientWidth;
		var poolH = pool.clientHeight;
		if (poolW < 1 || poolH < 1) {
			poolLayoutPass += 1;
			if (poolLayoutPass > 40) {
				return;
			}
			window.requestAnimationFrame(function () {
				layoutPoolInColumns(pieces);
			});
			return;
		}
		poolLayoutPass = 0;

		var columnCount = poolColumnCount(pieces.length, poolH);
		var columns = [];
		var colIndex;
		for (colIndex = 0; colIndex < columnCount; colIndex += 1) {
			columns.push([]);
		}
		pieces.forEach(function (piece, index) {
			columns[index % columnCount].push(piece);
		});

		var colWidth = poolW / columnCount;
		columns.forEach(function (colPieces, columnIndex) {
			var count = colPieces.length;
			if (!count) {
				return;
			}
			var colLeft = columnIndex * colWidth;
			colPieces.forEach(function (piece, rowIndex) {
				var size = pieceLayoutSize(piece);
				var left = colLeft + (colWidth - size.width) / 2;
				var maxTop = Math.max(0, poolH - size.height - POOL_EDGE_PAD);
				var top = count === 1 ? maxTop / 2 : (rowIndex / (count - 1)) * maxTop;
				var pos = clampPoolPosition(left, top, size.width, size.height);
				piece.style.left = pos.left + 'px';
				piece.style.top = pos.top + 'px';
			});
		});
	}

	function renderPool() {
		var pool = el('grab_pool');
		pool.innerHTML = '';
		poolLayoutPass = 0;
		var pieces = [];
		if (state.role === 'ravabulle') {
			for (var h = 1; h <= 16; h += 1) {
				var hatId = 'hat' + (h < 10 ? '0' : '') + h;
				pieces.push(buildHatPiece(hatId));
			}
		} else {
			for (var a = 1; a <= 10; a += 1) {
				var key = 'alien' + a;
				for (var v = 1; v <= 5; v += 1) {
					pieces.push(buildAlienPiece(key, v));
				}
			}
		}
		var rng = mulberry32(state.instance.seed + (state.role === 'ravabulle' ? 4101 : 4202));
		pieces = shuffleList(pieces, rng);
		pieces.forEach(function (piece) {
			piece.classList.add('grab_piece--pool');
			piece.style.position = 'absolute';
			pool.appendChild(piece);
			applyPoolPieceSize(piece);
		});
		whenGrabPoolImagesReady(pieces, function () {
			layoutPoolInColumns(pieces);
		});
	}

	function captureRest(piece) {
		var slot = piece.closest('.placement_slot');
		if (slot) {
			return { type: 'slot', slot: slot };
		}
		return {
			type: 'pool',
			left: piece.style.left,
			top: piece.style.top
		};
	}

	function placeInPoolAt(piece, clientX, clientY, offsetX, offsetY) {
		var pool = el('grab_pool');
		var rect = pool.getBoundingClientRect();
		var left = clientX - rect.left - offsetX;
		var top = clientY - rect.top - offsetY;
		placePieceInPool(piece, left, top);
	}

	function placeInBookSlot(piece, slot) {
		slot.appendChild(piece);
		piece.classList.add('grab_piece--placed');
		piece.classList.remove('grab_piece--pool');
		piece.dataset.sizeContext = 'book';
		piece.style.position = 'relative';
		piece.style.left = 'auto';
		piece.style.top = 'auto';
		piece.style.width = 'auto';
		piece.style.height = 'auto';
		piece.style.marginBottom = '';
		piece.style.transform = '';
		syncPortraitSlotLayout(slot);
		applyBookGrabPieceSize(piece, slot);
	}

	function restoreRest(piece, rest) {
		if (!rest) {
			return;
		}
		if (rest.type === 'slot') {
			placeInBookSlot(piece, rest.slot);
			return;
		}
		placePieceInPool(
			piece,
			parseFloat(rest.left) || 0,
			parseFloat(rest.top) || 0
		);
	}

	function snapToSlot(piece, slot, originSlot, poolRest) {
		var occupant = slot.querySelector('.grab_piece');
		var fromSlot = piece.closest('.placement_slot') || originSlot || null;
		piece.remove();
		if (fromSlot) {
			syncPortraitSlotLayout(fromSlot);
		}
		if (occupant && occupant !== piece) {
			if (fromSlot) {
				placeInBookSlot(occupant, fromSlot);
			} else {
				placePieceInPool(
					occupant,
					poolRest ? (parseFloat(poolRest.left) || 0) : 0,
					poolRest ? (parseFloat(poolRest.top) || 0) : 0
				);
			}
		}
		placeInBookSlot(piece, slot);
		tryValidate();
	}

	var drag = null;

	function findDropTarget(x, y, dragPiece) {
		var elements = document.elementsFromPoint(x, y);
		for (var i = 0; i < elements.length; i += 1) {
			if (elements[i] === dragPiece) {
				continue;
			}
			var page = elements[i].closest && elements[i].closest('.book_page--portrait');
			if (page && page.closest('.book_spread:not([hidden])')) {
				return { page: page, pool: false };
			}
			if (elements[i].id === 'grab_pool' || elements[i].closest('#grab_pool')) {
				return { page: null, pool: true };
			}
		}
		return { page: null, pool: false };
	}

	function onPointerDown(e) {
		var piece = e.target.closest('.grab_piece');
		if (!piece || e.button !== 0) {
			return;
		}
		e.preventDefault();
		var rect = piece.getBoundingClientRect();
		drag = {
			piece: piece,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			rest: captureRest(piece),
			hoverPage: null,
			overPool: false,
			pointerId: e.pointerId
		};
		piece.classList.add('grab_piece--dragging');
		document.body.classList.add('is_dragging_grab');
		piece.style.position = 'fixed';
		piece.style.left = rect.left + 'px';
		piece.style.top = rect.top + 'px';
		piece.style.width = rect.width + 'px';
		piece.style.height = rect.height + 'px';
		piece.style.zIndex = '2000';
		piece.style.pointerEvents = 'none';
		document.body.appendChild(piece);
		piece.setPointerCapture(e.pointerId);
		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
		document.addEventListener('pointercancel', onPointerUp);
	}

	function onPointerMove(e) {
		if (!drag || e.pointerId !== drag.pointerId) {
			return;
		}
		var piece = drag.piece;
		piece.style.left = e.clientX - drag.offsetX + 'px';
		piece.style.top = e.clientY - drag.offsetY + 'px';
		document.querySelectorAll('.book_page--drop-hover').forEach(function (p) {
			p.classList.remove('book_page--drop-hover');
		});
		el('object_box').classList.remove('object_box--hover');
		drag.hoverPage = null;
		drag.overPool = false;

		var hit = findDropTarget(e.clientX, e.clientY, piece);
		if (hit.page) {
			drag.hoverPage = hit.page;
			hit.page.classList.add('book_page--drop-hover');
		} else if (hit.pool) {
			drag.overPool = true;
			el('object_box').classList.add('object_box--hover');
		}
	}

	function onPointerUp(e) {
		if (!drag || e.pointerId !== drag.pointerId) {
			return;
		}
		document.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('pointerup', onPointerUp);
		document.removeEventListener('pointercancel', onPointerUp);
		document.body.classList.remove('is_dragging_grab');
		document.querySelectorAll('.book_page--drop-hover').forEach(function (p) {
			p.classList.remove('book_page--drop-hover');
		});
		el('object_box').classList.remove('object_box--hover');

		var piece = drag.piece;
		piece.classList.remove('grab_piece--dragging');
		piece.style.pointerEvents = '';
		piece.style.zIndex = '';
		piece.style.transform = '';
		try {
			piece.releasePointerCapture(e.pointerId);
		} catch (err) {
			/* ignore */
		}

		if (drag.hoverPage) {
			var slot = drag.hoverPage.querySelector('.placement_slot');
			if (slot) {
				var originSlot = drag.rest.type === 'slot' ? drag.rest.slot : null;
				var poolRest = drag.rest.type === 'pool' ? drag.rest : null;
				snapToSlot(piece, slot, originSlot, poolRest);
			} else {
				restoreRest(piece, drag.rest);
			}
		} else if (drag.overPool) {
			if (drag.rest.type === 'slot') {
				syncPortraitSlotLayout(drag.rest.slot);
			}
			placeInPoolAt(piece, e.clientX, e.clientY, drag.offsetX, drag.offsetY);
			tryValidate();
		} else {
			restoreRest(piece, drag.rest);
		}
		playSound('swap');
		drag = null;
	}

	function slotFilledCorrectly(pageIndex) {
		var guest = guestAtPage(pageIndex);
		var page = document.querySelector('.book_page--portrait[data-page-index="' + pageIndex + '"]');
		if (!page) {
			return false;
		}
		var piece = page.querySelector('.placement_slot .grab_piece');
		if (!piece) {
			return false;
		}
		if (state.role === 'ravabulle') {
			return piece.dataset.hatId === guest.hat_id;
		}
		return piece.dataset.alien === guest.alien
			&& parseInt(piece.dataset.alienVariant, 10) === guest.alien_variant;
	}

	function normalizeAnswer(value) {
		return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
	}

	function typedAnswer(pageIndex) {
		var field = state.role === 'ravabulle' ? 'name' : 'species';
		var input = document.querySelector(
			'.tag_input[data-page-index="' + pageIndex + '"][data-field="' + field + '"]'
		);
		return input ? input.value : '';
	}

	function textFilledCorrectly(pageIndex) {
		var guest = guestAtPage(pageIndex);
		var expected = state.role === 'ravabulle' ? guest.name : guest.species_name;
		var value = normalizeAnswer(typedAnswer(pageIndex));
		if (!value) {
			return false;
		}
		return value === normalizeAnswer(expected);
	}

	function allPlacementsFilled() {
		for (var i = 0; i < 10; i += 1) {
			var page = document.querySelector('.book_page--portrait[data-page-index="' + i + '"]');
			if (!page || !page.querySelector('.placement_slot .grab_piece')) {
				return false;
			}
		}
		return true;
	}

	function allPlacementsCorrect() {
		for (var i = 0; i < 10; i += 1) {
			if (!slotFilledCorrectly(i)) {
				return false;
			}
		}
		return true;
	}

	function allTextsFilled() {
		for (var i = 0; i < 10; i += 1) {
			if (!normalizeAnswer(typedAnswer(i))) {
				return false;
			}
		}
		return true;
	}

	function allTextsCorrect() {
		for (var i = 0; i < 10; i += 1) {
			if (!textFilledCorrectly(i)) {
				return false;
			}
		}
		return true;
	}

	function finishDossierEntrance() {
		if (!state.dossierAnimating) {
			return;
		}
		document.querySelectorAll('.dossier_scene--enter').forEach(function (scene) {
			scene.classList.remove('dossier_scene--enter');
		});
		setBookLocked(false);
	}

	function showDossierPages() {
		state.dossierRevealed = true;
		updateInstructions();
		var current = document.querySelector('.book_spread:not([hidden]) .page_scene--dossier');
		var animate = current && !motionReduced();
		document.querySelectorAll('.page_scene--dossier').forEach(function (scene) {
			scene.hidden = false;
		});
		if (!animate) {
			finishDossierEntrance();
			return;
		}
		DOSSIER_SWAP_DELAYS_MS.forEach(function (delay) {
			window.setTimeout(function () {
				playSound('swap');
			}, delay);
		});
		void current.offsetWidth;
		current.classList.add('dossier_scene--enter');
		var nameTag = current.querySelector('.dossier_tag--name');
		var finished = false;
		function done() {
			if (finished) {
				return;
			}
			finished = true;
			finishDossierEntrance();
		}
		if (nameTag) {
			nameTag.addEventListener('animationend', done, { once: true });
		}
		window.setTimeout(done, 1400);
	}

	function revealDossiers() {
		if (state.dossierRevealed || state.dossierAnimating) {
			return;
		}
		setBookLocked(true);
		window.setTimeout(function () {
			playSound('valid');
		}, SOLVE_SOUND_DELAY_MS);
		window.setTimeout(showDossierPages, SOLVE_SOUND_DELAY_MS + SOLVE_FOLLOW_DELAY_MS);
	}

	function tryValidate() {
		if (!state.bookOpen || state.puzzleSolved || state.dossierAnimating) {
			return;
		}
		if (!allPlacementsFilled()) {
			return;
		}
		if (!state.dossierRevealed) {
			if (allPlacementsCorrect()) {
				revealDossiers();
			}
			return;
		}
		if (!allTextsFilled()) {
			return;
		}
		if (!allPlacementsCorrect() || !allTextsCorrect()) {
			return;
		}
		onPuzzleSolved();
	}

	function revealSpreadInstant(spreadIndex) {
		var spread = document.querySelector('.book_spread[data-spread="' + spreadIndex + '"]');
		if (!spread) {
			return;
		}
		spread.querySelectorAll('.page_scene').forEach(function (scene) {
			scene.hidden = true;
		});
		spread.querySelector('.spread_letter').hidden = false;
	}

	function motionReduced() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function onPuzzleSolved() {
		if (state.puzzleSolved || state.dossierAnimating) {
			return;
		}
		state.puzzleSolved = true;
		setBookLocked(true);
		window.setTimeout(function () {
			playSound('valid');
		}, SOLVE_SOUND_DELAY_MS);
		window.setTimeout(presentPassword, SOLVE_SOUND_DELAY_MS + SOLVE_FOLLOW_DELAY_MS);
	}

	function presentPassword() {
		for (var i = 0; i < 10; i += 1) {
			state.pageRevealed[i] = true;
		}
		for (var p = 0; p < 10; p += 1) {
			if (p !== state.currentSpread) {
				revealSpreadInstant(p);
			}
		}
		animateRevealOnCurrentSpread();
		el('password_half_text').textContent = passwordHalf();
		el('password_reveal').hidden = false;
		setBookLocked(false);
	}

	function refreshPageViews() {
		for (var i = 0; i < 10; i += 1) {
			var spread = document.querySelector('.book_spread[data-spread="' + i + '"]');
			if (!spread) {
				continue;
			}
			var letter = spread.querySelector('.spread_letter');
			var scenes = spread.querySelectorAll('.page_scene');
			if (state.pageRevealed[i]) {
				scenes.forEach(function (scene) {
					scene.hidden = true;
				});
				letter.hidden = false;
			} else {
				scenes.forEach(function (scene) {
					var dossier = scene.classList.contains('page_scene--dossier');
					scene.hidden = dossier && !state.dossierRevealed;
				});
				letter.hidden = true;
			}
		}
	}

	function animateRevealOnCurrentSpread() {
		var spread = document.querySelector('.book_spread[data-spread="' + state.currentSpread + '"]');
		if (!spread) {
			return;
		}
		var scenes = spread.querySelectorAll('.page_scene:not([hidden])');
		if (!scenes.length || motionReduced()) {
			revealSpreadInstant(state.currentSpread);
			return;
		}
		var pending = scenes.length;
		scenes.forEach(function (scene) {
			scene.classList.add('page_scene--fade-out');
			scene.addEventListener('animationend', function () {
				pending -= 1;
				scene.hidden = true;
				if (pending === 0) {
					var letter = spread.querySelector('.spread_letter');
					letter.hidden = false;
					letter.classList.add('page_letter--fade-in');
				}
			}, { once: true });
		});
	}

	function showCurrentSpread() {
		document.querySelectorAll('.book_spread').forEach(function (s) {
			s.hidden = parseInt(s.dataset.spread, 10) !== state.currentSpread;
		});
	}

	function openBook() {
		if (state.dossierAnimating) {
			return;
		}
		state.bookOpen = true;
		if (state.coverSide === 'back') {
			state.currentSpread = 9;
		}
		el('book_cover').hidden = true;
		el('book_open').hidden = false;
		el('btn_open_book').setAttribute('aria-expanded', 'true');
		showCurrentSpread();
		updateSpreadNav();
		playPageTurn();
	}

	function closeBook(side) {
		if (state.dossierAnimating) {
			return;
		}
		state.bookOpen = false;
		state.coverSide = side === 'back' ? 'back' : 'front';
		el('book_open').hidden = true;
		el('book_cover').hidden = false;
		el('book_cover').classList.toggle('book_cover--back', state.coverSide === 'back');
		el('btn_open_book').setAttribute('aria-expanded', 'false');
		playSound('close');
	}

	function goSpread(delta) {
		if (!state.bookOpen || state.dossierAnimating) {
			return;
		}
		var next = state.currentSpread + delta;
		if (next < 0) {
			closeBook('front');
			return;
		}
		if (next > 9) {
			closeBook('back');
			return;
		}
		state.currentSpread = next;
		showCurrentSpread();
		updateSpreadNav();
		playPageTurn();
	}

	function updateSpreadNav() {
		var locked = state.dossierAnimating;
		el('btn_spread_prev').disabled = locked;
		el('btn_spread_next').disabled = locked;
		el('btn_close_book').disabled = locked;
		el('spread_indicator').textContent = 'Pages ' + (state.currentSpread + 1) + ' / 10';
	}

	function updateInstructions() {
		var text = 'Glissez un élément vers la page de gauche (toute la page accepte le dépôt).';
		if (state.dossierRevealed) {
			text += ' Décrivez les étiquettes à votre partenaire pour remplir l\'étiquette vide.';
		}
		el('dnd_instructions').textContent = text;
	}

	function onBookKeyDown(e) {
		if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
			return;
		}
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
			return;
		}
		var tag = e.target && e.target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) {
			return;
		}
		if (state.dossierAnimating) {
			e.preventDefault();
			return;
		}
		var reveal = el('password_reveal');
		if (reveal && !reveal.hidden) {
			return;
		}
		if (!state.bookOpen) {
			var openFromFront = state.coverSide !== 'back' && e.key === 'ArrowRight';
			var openFromBack = state.coverSide === 'back' && e.key === 'ArrowLeft';
			if (openFromFront || openFromBack) {
				e.preventDefault();
				openBook();
			}
			return;
		}
		e.preventDefault();
		goSpread(e.key === 'ArrowRight' ? 1 : -1);
	}

	function bindChrome(role) {
		document.body.classList.add('ah_puzzle');
		el('object_box_title').textContent = role === 'ravabulle'
			? 'Chapeaux à placer'
			: 'Aliens à placer';
		updateInstructions();

		el('btn_open_book').addEventListener('click', function () {
			if (!state.bookOpen) {
				openBook();
			}
		});
		el('btn_close_book').addEventListener('click', function () {
			closeBook('front');
		});
		el('btn_spread_prev').addEventListener('click', function () { goSpread(-1); });
		el('btn_spread_next').addEventListener('click', function () { goSpread(1); });
		el('btn_dismiss_reveal').addEventListener('click', function () {
			el('password_reveal').hidden = true;
		});
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onBookKeyDown);
	}

	function loadJson(url) {
		return fetch(url)
			.then(function (r) {
				if (!r.ok) {
					throw new Error(url);
				}
				return r.json();
			})
			.catch(function () {
				return null;
			});
	}

	function startUi() {
		bindChrome(state.role);
		renderPool();
		renderBook();
	}

	function init(options) {
		state.role = options.role;
		loadJson('data/book-layout.json').then(function (layout) {
			state.layout = layout;
			if (options.instance) {
				state.instance = options.instance;
				startUi();
				return;
			}
			loadJson('data/catalog.json').then(function (catalog) {
				state.instance = global.AliensAndHatsInstance.createInstance(
					options.seed || readSeed(),
					catalog
				);
				startUi();
			});
		});
	}

	global.AliensAndHatsCore = { init: init };
})(window);
