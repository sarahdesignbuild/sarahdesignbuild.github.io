// Shared behavior for all pages: mobile menu toggle.
(() => {
    const header = document.querySelector('.site-header');
    const toggle = header && header.querySelector('.nav-toggle');
    if (!toggle) return;

    const setOpen = (open) => {
        header.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!header.classList.contains('open')));
    header.querySelectorAll('.site-nav a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) setOpen(false);
    });
})();
