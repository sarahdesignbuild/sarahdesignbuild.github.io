// Gallery page: renders one category (gallery.html?<key>) and a lightbox viewer.
(() => {
    if (typeof galleryPhotos !== 'object') {
        document.getElementById('gallery-count').textContent = 'The gallery could not be loaded.';
        return;
    }

    const keys = Object.keys(galleryPhotos);
    const requested = decodeURIComponent(window.location.search.slice(1).split('&')[0]).trim();
    const key = keys.includes(requested) ? requested : keys[0];
    const category = galleryPhotos[key];
    const sizes = typeof galleryImageSizes === 'object' ? galleryImageSizes : {};

    // Web copies are always written as .jpg by tools/build-images.py.
    const webName = (file) => file.replace(/\.[^.]+$/, '.jpg');
    const url = (kind, file) => encodeURI(`images/web/${kind}/${key}/${webName(file)}`);

    document.title = `${category.title} | Vuurens Design Build`;
    document.getElementById('gallery-title').textContent = category.title;
    document.getElementById('gallery-count').textContent = `${category.images.length} photos`;

    // Category tabs
    const tabs = document.getElementById('gallery-tabs');
    keys.forEach((k) => {
        const a = document.createElement('a');
        a.href = `gallery.html?${encodeURIComponent(k)}`;
        a.textContent = galleryPhotos[k].title;
        if (k === key) a.setAttribute('aria-current', 'page');
        tabs.appendChild(a);
    });
    tabs.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });

    // Photo grid
    const grid = document.getElementById('photo-grid');
    category.images.forEach((file, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Open photo ${i + 1} of ${category.images.length}`);
        const img = document.createElement('img');
        img.src = url('thumb', file);
        img.alt = `${category.title} project photo ${i + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        const size = sizes[`${key}/${webName(file)}`];
        if (size) {
            img.width = size[0];
            img.height = size[1];
        }
        button.appendChild(img);
        button.addEventListener('click', () => open(i));
        grid.appendChild(button);
    });

    // Lightbox
    const box = document.getElementById('lightbox');
    const boxImg = box.querySelector('img');
    const spinner = box.querySelector('.lb-spinner');
    const counter = box.querySelector('.lb-count');
    const count = category.images.length;
    let index = 0;
    let lastFocus = null;

    function show(i) {
        index = (i + count) % count;
        const src = url('large', category.images[index]);
        spinner.hidden = false;
        boxImg.style.opacity = '0';
        boxImg.onload = () => {
            spinner.hidden = true;
            boxImg.style.opacity = '1';
        };
        boxImg.src = src;
        boxImg.alt = `${category.title} project photo ${index + 1}`;
        counter.textContent = `${index + 1} / ${count}`;
        // Warm the cache for the neighbours so swiping feels instant.
        [index - 1, index + 1].forEach((n) => {
            new Image().src = url('large', category.images[(n + count) % count]);
        });
    }

    function open(i) {
        lastFocus = document.activeElement;
        box.hidden = false;
        document.body.classList.add('no-scroll');
        show(i);
        // Let the phone's back button/gesture close the viewer instead of leaving the page.
        history.pushState({ lightbox: true }, '');
        box.querySelector('.lb-close').focus();
    }

    function close() {
        if (box.hidden) return;
        box.hidden = true;
        boxImg.removeAttribute('src');
        document.body.classList.remove('no-scroll');
        lastFocus?.focus();
    }

    function requestClose() {
        if (history.state?.lightbox) history.back();
        else close();
    }

    window.addEventListener('popstate', close);
    box.querySelector('.lb-close').addEventListener('click', requestClose);
    box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', (e) => {
        if (e.target === box) requestClose();
    });

    document.addEventListener('keydown', (e) => {
        if (box.hidden) return;
        if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
        else if (e.key === 'Escape') requestClose();
    });

    // Swipe left/right to navigate, swipe down to close.
    let touchX = null;
    let touchY = null;
    box.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) {
            touchX = null;
            return;
        }
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;
        touchX = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
        else if (dy > 90 && dy > Math.abs(dx) * 1.5) requestClose();
    });
})();
