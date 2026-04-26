/* ======================================================
   SUCRÉE CHIC — CASE STUDY PAGE JS
   Mirrors homepage.js patterns:
     • Grid line scroll sync (LERP)
     • Navbar behaviour
     • p5.js grid trail mouse effect
     • jQuery word-span text reveal wrapper
     • anime.js section entrance animations
     • GSAP ScrollTrigger for v-lines
   ====================================================== */


// ─── GRID LINES SCROLL ANIMATION (LERP) ──────────────────────────────────────
let currentScroll = 0;
let targetScroll  = 0;
const ease = 0.05;

function syncGridLinesWithScroll() {
    targetScroll  = window.scrollY;
    currentScroll += (targetScroll - currentScroll) * ease;

    const sections = document.querySelectorAll('section, footer');

    sections.forEach((section, index) => {
        const grid = section.querySelector('.custom-grid');
        if (!grid) return;

        // Skip sections whose lines are handled by GSAP or the footer
        if (
            section.classList.contains('cs-objectives')  ||
            section.classList.contains('cs-challenges')  ||
            section.classList.contains('cs-needs')       ||
            section.tagName.toLowerCase() === 'footer'
        ) return;

        const sectionTop    = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight  = window.innerHeight;

        let relativeScroll  = (currentScroll + windowHeight) - sectionTop;
        let sectionDelay    = index * 150;
        let effectiveScroll = relativeScroll - sectionDelay;

        let hPercent = effectiveScroll / (windowHeight * 0.2);
        hPercent = Math.min(Math.max(hPercent, 0), 1);

        let vPercent = effectiveScroll / (sectionHeight + windowHeight * 0.2);
        vPercent = Math.min(Math.max(vPercent, 0), 1);

        const hLines = grid.querySelectorAll('.h-line');
        const vLines = grid.querySelectorAll('.v-line');

        hLines.forEach(line => {
            line.style.transform = `scaleX(${hPercent})`;
        });
        vLines.forEach(line => {
            line.style.transform = `scaleY(${vPercent})`;
        });
    });

    requestAnimationFrame(syncGridLinesWithScroll);
}
requestAnimationFrame(syncGridLinesWithScroll);


// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const menu        = document.querySelector('.menu');
const navContents = document.querySelector('#nav_contents');
const navbar      = document.querySelector('.main-navbar');

// Scroll blur / bg
window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Navbar background per section
const navColorMap = [
    { selector: '.cs-header',    color: 'rgba(245, 245, 245, 0.2)' },
    { selector: '.cs-about',     color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-problem',   color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-solution',  color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-objectives',color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-challenges',color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-audience',  color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-research',  color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.cs-needs',     color: 'rgba(137, 123, 150, 0.33)' },
    { selector: 'footer',        color: 'rgba(245, 245, 245, 0.2)'  },
];

function updateNavbarColor() {
    if (window.scrollY <= 50) {
        navbar.style.backgroundColor = 'transparent';
        return;
    }
    const navbarBottom = 90;
    const scrollY = window.scrollY + navbarBottom;
    for (let i = navColorMap.length - 1; i >= 0; i--) {
        const el = document.querySelector(navColorMap[i].selector);
        if (el && el.offsetTop <= scrollY) {
            navbar.style.backgroundColor = navColorMap[i].color;
            break;
        }
    }
}
window.addEventListener('scroll', updateNavbarColor);
updateNavbarColor();


// ─── MOBILE NAV (GSAP) ───────────────────────────────────────────────────────
let isMenuOpen = false;
const trigger          = document.querySelector('.mobile-nav-trigger');
const navMenu          = document.querySelector('.main-navbar ul');
const mobileMenuElements = document.querySelectorAll('.main-navbar ul li');
const body             = document.body;

if (trigger && navMenu) {
    trigger.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        trigger.classList.toggle('open');

        if (isMenuOpen) {
            navMenu.classList.add('open');
            body.classList.add('menu-open');
            navbar.classList.add('menu-is-open');
        } else {
            body.classList.remove('menu-open');
            navMenu.style.position = 'fixed';
            navMenu.style.height   = '100vh';
        }

        const tl = gsap.timeline({
            onComplete: () => {
                if (!isMenuOpen) {
                    navMenu.classList.remove('open');
                    navbar.classList.remove('menu-is-open');
                    navMenu.style.position = '';
                    navMenu.style.height   = '';
                }
            }
        });

        if (isMenuOpen) {
            tl.to(navMenu, { duration: 0.8, '--panel-right-1': '0%', ease: 'power1.out' }, 0)
              .to(navMenu, { duration: 0.8, '--panel-right-2': '0%', ease: 'power1.out' }, 0.1)
              .to(navMenu, { duration: 0.8, '--panel-right-3': '0%', ease: 'power1.out' }, 0.2)
              .to(navMenu, { duration: 0.8, '--panel-right-4': '0%', ease: 'power1.out' }, 0.3)
              .to(mobileMenuElements, {
                    opacity: 1, x: 0, filter: 'blur(0px)',
                    duration: 0.8, stagger: 0.1, ease: 'power2.out'
                }, 0.4);
        } else {
            tl.to(mobileMenuElements, {
                    opacity: 0, x: 100, filter: 'blur(10px)',
                    duration: 0.4, stagger: { each: 0.1, from: 'last' }, ease: 'power2.in'
                }, 0)
              .to(navMenu, { duration: 0.8, '--panel-right-1': '100%', ease: 'power1.out' }, 0.4)
              .to(navMenu, { duration: 0.8, '--panel-right-2': '100%', ease: 'power1.out' }, 0.5)
              .to(navMenu, { duration: 0.8, '--panel-right-3': '100%', ease: 'power1.out' }, 0.6)
              .to(navMenu, { duration: 0.8, '--panel-right-4': '100%', ease: 'power1.out' }, 0.7);
        }
    });
}


// ─── p5.js GRID TRAIL MOUSE EFFECT ───────────────────────────────────────────
const CELL_SIZE          = 40;
const COLOR_R            = 234;
const COLOR_G            = 234;
const COLOR_B            = 234;
const STARTING_ALPHA     = 255;
const PROB_OF_NEIGHBOR   = 0.1;
const AMT_FADE_PER_FRAME = 5;
const STROKE_WEIGHT_VAL  = 0.09;

let colorWithAlpha;
let numRows;
let numCols;
let currentRow   = -1;
let currentCol   = -1;
let allNeighbors = [];

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('position', 'fixed');
    cnv.style('inset', 0);
    cnv.style('z-index', '1');
    cnv.style('pointer-events', 'none');

    colorWithAlpha = color(COLOR_R, COLOR_G, COLOR_B, STARTING_ALPHA);
    noFill();
    stroke(colorWithAlpha);
    strokeWeight(STROKE_WEIGHT_VAL);
    numRows = Math.ceil(windowHeight / CELL_SIZE);
    numCols = Math.ceil(windowWidth  / CELL_SIZE);
}

function draw() {
    clear();

    let row = floor(mouseY / CELL_SIZE);
    let col = floor(mouseX / CELL_SIZE);

    if (mouseX !== pmouseX || mouseY !== pmouseY) {
        if (row !== currentRow || col !== currentCol) {
            currentRow = row;
            currentCol = col;
            if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
                allNeighbors.push(...getRandomNeighbors(row, col));
            }
        }
        let x = col * CELL_SIZE;
        let y = row * CELL_SIZE;
        stroke(colorWithAlpha);
        rect(x, y, CELL_SIZE, CELL_SIZE);
    }

    for (let neighbor of allNeighbors) {
        let nx = neighbor.col * CELL_SIZE;
        let ny = neighbor.row * CELL_SIZE;
        neighbor.opacity = max(0, neighbor.opacity - AMT_FADE_PER_FRAME);
        stroke(COLOR_R, COLOR_G, COLOR_B, neighbor.opacity);
        rect(nx, ny, CELL_SIZE, CELL_SIZE);
    }

    allNeighbors = allNeighbors.filter(n => n.opacity > 0);
}

function getRandomNeighbors(row, col) {
    let neighbors = [];
    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            let nRow = row + dRow;
            let nCol = col + dCol;
            let isCurrentCell = dRow === 0 && dCol === 0;
            let isInBounds = nRow >= 0 && nRow < numRows && nCol >= 0 && nCol < numCols;
            if (!isCurrentCell && isInBounds && Math.random() < PROB_OF_NEIGHBOR) {
                neighbors.push({ row: nRow, col: nCol, opacity: STARTING_ALPHA });
            }
        }
    }
    return neighbors;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    numRows = Math.ceil(windowHeight / CELL_SIZE);
    numCols = Math.ceil(windowWidth  / CELL_SIZE);
}


// ─── JQUERY: WORD-SPAN TEXT REVEAL WRAPPER ───────────────────────────────────
$(document).ready(function () {

    // All text elements that need the word-reveal treatment
    const REVEAL_SELECTOR = [
        '.reveal-h1-cs',
        '.reveal-label-cs',
        '.reveal-desc-cs',
        '.reveal-h2-about',    '.reveal-p-about',
        '.reveal-h2-problem',  '.reveal-p-problem',
        '.reveal-h2-solution', '.reveal-p-solution',
        '.reveal-h2-objectives',
        '.cs-objectives h4',
        '.reveal-h2-challenges',
        '.reveal-h2-audience',
        '.reveal-h2-research',
        '.reveal-h2-needs',
        '.reveal-h3-footer',
        '.reveal-h4-footer',
    ].join(', ');

    $(REVEAL_SELECTOR).each(function () {
        const el   = $(this);
        const html = el.html();
        const parts = html.split(/(<[^>]+>)/gi);
        const newHtml = parts.map(part => {
            if (part.match(/^<[^>]+>$/i)) return part;
            return part.split(/\s+/).map(word => {
                if (word.length === 0) return '';
                const letters = word.replace(/\S/g, '<span>$&</span>');
                return `<span style="display:inline-block;white-space:nowrap;">${letters}</span>`;
            }).join(' ');
        }).join('');
        el.html(newHtml);
    });


    // ── HERO SECTION ENTRANCE (runs immediately on load) ──────────────────────
    (function animateCsHeader() {
        const tl = anime.timeline({ easing: 'easeInOutQuint' });
        tl
        .add({
            targets: '.reveal-label-cs span',
            opacity:    [0, 1],
            translateY: [8, 0],
            delay: anime.stagger(30),
            duration: 800
        })
        .add({
            targets: '.reveal-h1-cs span',
            translateX: [80, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1400
        }, '-=400')
        .add({
            targets: '.reveal-desc-cs span',
            opacity: [0, 1],
            delay:   anime.stagger(3),
            duration: 1000
        }, '-=800')
        .add({
            targets: '.cs-cta',
            opacity:    [0, 1],
            translateY: [10, 0],
            duration: 600,
            easing: 'easeOutQuint'
        }, '-=600')
        .add({
            targets: '.cs-back-btn',
            opacity:    [0, 1],
            translateX: [-10, 0],
            duration: 500,
            easing: 'easeOutQuint'
        }, '-=1400')
        .add({
            targets: '.cs-mockup-img',
            opacity:    [0, 1],
            translateY: [25, 0],
            duration: 1000,
            easing: 'easeOutQuint'
        }, '-=1000');
    })();


    // ── ABOUT ─────────────────────────────────────────────────────────────────
    function animateCsAbout() {
        const tl = anime.timeline({ easing: 'easeInOutQuint', duration: 1200 });
        tl
        .add({
            targets: '.reveal-h2-about span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(70)
        })
        .add({
            targets: '.reveal-p-about span',
            opacity: [0, 1],
            delay:   anime.stagger(2)
        }, '-=600');
    }


    // ── PROBLEM STATEMENT ─────────────────────────────────────────────────────
    function animateCsProblem() {
        const tl = anime.timeline({ easing: 'easeInOutQuint', duration: 1200 });
        tl
        .add({
            targets: '.reveal-h2-problem span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(70)
        })
        .add({
            targets: '.reveal-p-problem span',
            opacity: [0, 1],
            delay:   anime.stagger(2)
        }, '-=600');
    }


    // ── SOLUTION ──────────────────────────────────────────────────────────────
    function animateCsSolution() {
        const tl = anime.timeline({ easing: 'easeInOutQuint', duration: 1200 });
        tl
        .add({
            targets: '.reveal-h2-solution span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(70)
        })
        .add({
            targets: '.reveal-p-solution span',
            opacity: [0, 1],
            delay:   anime.stagger(2)
        }, '-=600');
    }


    // ── OBJECTIVES & GOALS ────────────────────────────────────────────────────
    function animateCsObjectives() {
        const tl = anime.timeline({ easing: 'easeOutQuint' });
        tl
        .add({
            targets: '.reveal-h2-objectives span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1000
        })
        .add({
            targets: '.cs-objectives h4 span',
            opacity:    [0, 1],
            translateX: [10, 0],
            delay: anime.stagger(10),
            duration: 800
        }, '-=600')
        .add({
            targets: '.cs-goal-item',
            opacity:    [0, 1],
            translateY: [18, 0],
            delay: anime.stagger(120),
            duration: 700
        }, '-=1000')
        .add({
            targets: '.cs-goal-accent',
            scaleX: [0, 1],
            delay:  anime.stagger(100),
            duration: 400,
            easing: 'easeOutQuint'
        }, '-=800');
    }


    // ── BUSINESS CHALLENGES ───────────────────────────────────────────────────
    function animateCsChallenges() {
        const tl = anime.timeline({ easing: 'easeOutQuint' });
        tl
        .add({
            targets: '.reveal-h2-challenges span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1000
        })
        .add({
            targets: '.cs-challenge-item',
            opacity:    [0, 1],
            translateY: [14, 0],
            delay: anime.stagger(180),
            duration: 600
        }, '-=600')
        .add({
            targets: '.cs-challenge-line',
            width:  ['0%', '100%'],
            delay:  anime.stagger(180),
            duration: 700,
            easing: 'easeInOutQuad'
        }, '-=900');
    }


    // ── TARGET AUDIENCE ───────────────────────────────────────────────────────
    function animateCsAudience() {
        anime({
            targets: '.reveal-h2-audience span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1000,
            easing: 'easeInOutQuint'
        });

        anime({
            targets: '.cs-persona',
            opacity:    [0, 1],
            translateX: [-25, 0],
            delay: anime.stagger(220),
            duration: 900,
            easing: 'easeOutQuint'
        });
    }


    // ── QUANTITATIVE RESEARCH ─────────────────────────────────────────────────
    function animateCsResearch() {
        // Heading
        anime({
            targets: '.reveal-h2-research span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1000,
            easing: 'easeInOutQuint'
        });

        // Cards fade in staggered
        anime({
            targets: '.cs-stat',
            opacity:    [0, 1],
            translateY: [18, 0],
            delay: anime.stagger(100),
            duration: 700,
            easing: 'easeOutQuint'
        });

        // Count-up animation for stat numbers
        document.querySelectorAll('.cs-stat-number').forEach((el, i) => {
            const target = parseInt(el.dataset.target, 10);
            const obj = { val: 0 };
            anime({
                targets: obj,
                val: target,
                round: 1,
                duration: 1600,
                delay: i * 90,
                easing: 'easeOutExpo',
                update: function () {
                    el.textContent = Math.round(obj.val);
                }
            });
        });
    }


    // ── USER NEEDS ────────────────────────────────────────────────────────────
    function animateCsNeeds() {
        anime({
            targets: '.reveal-h2-needs span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60),
            duration: 1000,
            easing: 'easeInOutQuint'
        });

        anime({
            targets: '.cs-need-item',
            opacity:    [0, 1],
            translateY: [14, 0],
            delay: anime.stagger(140),
            duration: 700,
            easing: 'easeOutQuint'
        });
    }


    // ── FOOTER (mirrors homepage) ─────────────────────────────────────────────
    function animateFooter() {
        document.querySelector('footer .left-side').style.opacity  = '1';
        document.querySelector('footer .right-side').style.opacity = '1';

        const tl = anime.timeline({ easing: 'easeOutQuint', duration: 900 });
        tl
        .add({
            targets: '.open-to-work',
            translateX: [30, 0],
            opacity:    [0, 1],
            delay: anime.stagger(60)
        }, '+=400')
        .add({
            targets: '.reveal-h3-footer span',
            translateX: [60, 0],
            opacity:    [0, 1],
            delay: anime.stagger(80)
        }, '+=200')
        .add({
            targets: 'footer h4',
            opacity:    [0, 1],
            translateX: [10, 0],
            delay: anime.stagger(15)
        }, '-=800')
        .add({
            targets: '.reveal-line-h',
            width:   [0, '80px'],
            opacity: [0, 1]
        }, '-=800')
        .add({
            targets: '.LinkedIn',
            translateX: [30, 0],
            opacity:    [0, 1]
        }, '-=600')
        .add({
            targets: '.mail',
            translateX: [30, 0],
            opacity:    [0, 1]
        }, '-=600');

        gsap.to('footer .v-line', {
            scaleY: 1,
            duration: 1.5,
            ease: 'power2.out'
        });
    }


    // ── INTERSECTION OBSERVER ─────────────────────────────────────────────────
    const animated  = new Set();
    const observer  = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const t = entry.target;
            if (animated.has(t)) return;
            animated.add(t);

            if      (t.classList.contains('cs-about'))      { animateCsAbout();      observer.unobserve(t); }
            else if (t.classList.contains('cs-problem'))    { animateCsProblem();    observer.unobserve(t); }
            else if (t.classList.contains('cs-solution'))   { animateCsSolution();   observer.unobserve(t); }
            else if (t.classList.contains('cs-objectives')) { animateCsObjectives(); observer.unobserve(t); }
            else if (t.classList.contains('cs-challenges')) { animateCsChallenges(); observer.unobserve(t); }
            else if (t.classList.contains('cs-audience'))   { animateCsAudience();   observer.unobserve(t); }
            else if (t.classList.contains('cs-research'))   { animateCsResearch();   observer.unobserve(t); }
            else if (t.classList.contains('cs-needs'))      { animateCsNeeds();      observer.unobserve(t); }
            else if (t.tagName.toLowerCase() === 'footer')  { animateFooter();       observer.unobserve(t); }
        });
    }, { threshold: 0.18 });

    document.querySelectorAll(
        '.cs-about, .cs-problem, .cs-solution, .cs-objectives, .cs-challenges, .cs-audience, .cs-research, .cs-needs, footer'
    ).forEach(el => observer.observe(el));


    // ── GSAP ScrollTrigger — v-lines ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        gsap.registerPlugin(ScrollTrigger);

        // Objectives v-line
        gsap.to('.cs-objectives .cs-obj-v-line', {
            height: '100%',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.cs-objectives',
                start: 'top 80%',
                toggleActions: 'play none none none',
                once: true
            }
        });

        // Challenges v-line
        gsap.to('.cs-challenges .cs-chal-v-line', {
            height: '100%',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.cs-challenges',
                start: 'top 80%',
                toggleActions: 'play none none none',
                once: true
            }
        });

        // Needs v-line
        gsap.to('.cs-needs .cs-needs-v-line', {
            height: '100%',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.cs-needs',
                start: 'top 80%',
                toggleActions: 'play none none none',
                once: true
            }
        });

        // Footer v-line
        gsap.to('footer .v-line', {
            scaleY: 1,
            duration: 1.5,
            ease: 'power2.out'
        });
    });

    // Fallback: also register GSAP outside DOMContentLoaded in case it's already fired
    if (document.readyState !== 'loading') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('.cs-objectives .cs-obj-v-line', {
            height: '100%', duration: 1.5, ease: 'power2.out',
            scrollTrigger: { trigger: '.cs-objectives', start: 'top 80%', toggleActions: 'play none none none', once: true }
        });
        gsap.to('.cs-challenges .cs-chal-v-line', {
            height: '100%', duration: 1.5, ease: 'power2.out',
            scrollTrigger: { trigger: '.cs-challenges', start: 'top 80%', toggleActions: 'play none none none', once: true }
        });
        gsap.to('.cs-needs .cs-needs-v-line', {
            height: '100%', duration: 1.5, ease: 'power2.out',
            scrollTrigger: { trigger: '.cs-needs', start: 'top 80%', toggleActions: 'play none none none', once: true }
        });
    }


    // ── FOOTER LOTTIE ─────────────────────────────────────────────────────────
    const footerPlayer = document.getElementById('Lottie-footer');
    if (footerPlayer) {
        footerPlayer.addEventListener('complete', () => {
            setTimeout(() => {
                footerPlayer.seek(0);
                footerPlayer.play();
            }, 2000);
        });
    }

}); // end $(document).ready
