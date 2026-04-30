// =========== PRELOADER ===========
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hasSeenPreloader = sessionStorage.getItem('preloaderExecuted');

    if (hasSeenPreloader) {
        preloader.style.display = 'none';
        document.body.classList.remove('preloader-active');
        const navbar = document.querySelector('.main-navbar');
        if (navbar) navbar.classList.add('is-visible');
        return; 
    }

    sessionStorage.setItem('preloaderExecuted', 'true');

    const fill = document.getElementById('preloader-line-fill');
    const percentEl = document.getElementById('preloader-percent');
    const logoWrap = document.querySelector('.preloader-logo-wrap');;

    
    let progress = 0;
    let targetProgress = 0;
    let animFrame;
    let isExiting = false;

    let logoLoopInterval = null;
    let logoAnimationStarted = false;

function startLogoAnimation() {
    if (!logoWrap) return;
    
    logoWrap.style.opacity = "1";

    function runOnce() {
        const tl = anime.timeline({ easing: 'easeOutQuart' });

        tl
        .add({
            targets: '#preloader-svg .svg-main-text path',
            opacity: [0, 1],
            translateX: [60, 0],
            filter: ['blur(10px)', 'blur(0px)'],
            duration: 800,
            delay: anime.stagger(80),
        })
        .add({
            targets: '#preloader-svg .svg-lines path:nth-child(1)',
            opacity: [0, 1],
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: 700,
        }, "-=600")
        .add({
            targets: '#preloader-svg .svg-lines path:nth-child(n+2), #preloader-svg rect',
            opacity: [0, 1],
            duration: 500,
        }, "-=400")
        .add({
            targets: '#preloader-svg .svg-sub-text path',
            opacity: [0, 1],
            translateX: [60, 0],
            filter: ['blur(10px)', 'blur(0px)'],
            duration: 700,
            delay: anime.stagger(60),
        }, "-=400");

        return tl.finished;
    }

    async function loopAnimation() {
        while (!isExiting) {

            anime.set('#preloader-svg .svg-main-text path', { opacity: 0, translateX: 60, filter: 'blur(10px)' });
            anime.set('#preloader-svg .svg-lines path, #preloader-svg rect', { opacity: 0 });
            anime.set('#preloader-svg .svg-sub-text path', { opacity: 0, translateX: 60, filter: 'blur(10px)' });

            await runOnce();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    loopAnimation();
    }

    setTimeout(() => {
        if (percentEl) percentEl.style.opacity = "1";
        startLogoAnimation();
    }, 200);

    function updateTarget() {
        const resources = performance.getEntriesByType('resource');
        if (resources.length === 0) { targetProgress = 90; return; }
        const loaded = resources.filter(r => r.responseEnd > 0).length;
        targetProgress = Math.min(Math.round((loaded / resources.length) * 100), 98);
    }

    function animateProgress() {
        updateTarget();
        if (progress < targetProgress) {
            progress += Math.max(0.3, (targetProgress - progress) * 0.04);
            progress = Math.min(progress, targetProgress);
        }
        const p = Math.round(progress);
        
        if (percentEl) {
            percentEl.textContent = p + '%';
            percentEl.style.bottom = (p - 4) + 'vh';
        }
        if (fill) fill.style.height = p + '%';

        if (!isExiting) animFrame = requestAnimationFrame(animateProgress);
    }
    animFrame = requestAnimationFrame(animateProgress);

    function exitPreloader() {
        if (isExiting) return;
        isExiting = true;
        cancelAnimationFrame(animFrame);

        if (fill) {
            fill.style.transition = 'height 0.3s ease';
            fill.style.height = '100%';
        }

        setTimeout(() => {
            anime({
                targets: '.preloader-logo-wrap, .preloader-line-wrapper, #preloader-percent',
                opacity: 0,
                duration: 400,
                easing: 'linear'
            });

            const isMobile = window.innerWidth <= 991.98;

    if (isMobile) {
        const panels = ['.pre-panel-1', '.pre-panel-2', '.pre-panel-3', '.pre-panel-4'];
        const topValues = ['0%', '25%', '50%', '75%'];
        
        panels.forEach((selector, i) => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.width = '100%';
                el.style.height = '25%';
                el.style.left = '0';
                el.style.top = topValues[i];
                el.style.transform = 'none';
            }
    });

    anime({
        targets: panels,
        translateX: ['0%', '-100%'], 
        duration: 1000,
        delay: anime.stagger(100),
        easing: 'easeInOutQuart',
        complete: function() {
            preloader.style.display = 'none';
            document.body.classList.remove('preloader-active');
            const navbar = document.querySelector('.main-navbar');
            if (navbar) navbar.classList.add('is-visible');
            window.dispatchEvent(new Event('preloaderDone'));
        }
        
    });
    } else {
        anime({
            targets: '.pre-panel-1, .pre-panel-2, .pre-panel-3, .pre-panel-4',
            scaleY: [1, 0],
            duration: 1000,
            delay: anime.stagger(100),
            easing: 'easeInOutQuart',
            complete: function() {
                preloader.style.display = 'none';
                document.body.classList.remove('preloader-active');
                const navbar = document.querySelector('.main-navbar');
                if (navbar) navbar.classList.add('is-visible');
                window.dispatchEvent(new Event('preloaderDone'));
            }
        });
    }
        }, 500);
    }

    if (document.readyState === 'complete') {
        setTimeout(exitPreloader, 1000); 
    } else {
        window.addEventListener('load', () => setTimeout(exitPreloader, 800));
    }

    const navbar = document.querySelector('.main-navbar');
    if (!document.getElementById('preloader') && navbar) {
        navbar.classList.add('is-visible');
        window.dispatchEvent(new Event('preloaderDone'));
    }

})();



// SCROLL SMOOTHING VARIABLES (LERP)
let currentScroll = 0;
let targetScroll = 0;
const ease = 0.05;


// GRID LINES SCROLL ANIMATION
function syncGridLinesWithScroll() {
    targetScroll = window.scrollY;
    currentScroll += (targetScroll - currentScroll) * ease;

    const sections = document.querySelectorAll('section, footer, .body-work-item main');
    
    sections.forEach((section, index) => {
        const grid = section.querySelector('.custom-grid');
        if (!grid) return;

        if (section.classList.contains('section4') || 
            section.classList.contains('section6') || 
            section.tagName.toLowerCase() === 'footer' ||
            section.classList.contains('main-work-item')) {
            return; 
        }

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;

        let relativeScroll = (currentScroll + windowHeight) - sectionTop;
        let sectionDelay = index * 150;
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
            if (window.innerWidth <= 991.98 && line.classList.contains('v-50, v-40')) return;
            line.style.transform = `scaleY(${vPercent})`; 
        });
    });
    requestAnimationFrame(syncGridLinesWithScroll);
}
requestAnimationFrame(syncGridLinesWithScroll);





// NAVIGATION & UI CONTROLS 
const menu = document.querySelector(".menu");
const navContents = document.querySelector("#nav_contents");

const navLinks = document.querySelectorAll(".main-navbar ul li a, .menu");
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (navContents.classList.contains("toggle")) {
            navContents.classList.remove("toggle");
        } else {
            navContents.classList.add("toggle");
        }
    });
});

// NAVBAR SCROLL STYLING
const navbar = document.querySelector('.main-navbar');

window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// NAVBAR COLOR PER SECTION
const navColorMap = [
    { selector: 'header',   color: 'rgba(245, 245, 245, 0.2)' },
    { selector: '.section1', color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.section2', color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.section3', color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.section4', color: 'rgba(245, 245, 245, 0.2)' },
    { selector: '.section5', color: 'rgba(137, 123, 150, 0.33)' },
    { selector: '.section6', color: 'rgba(137, 123, 150, 0.33)' },
    { selector: 'footer',    color: 'rgba(245, 245, 245, 0.2)' },
];

function updateNavbarColor() {
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



// NAVBAR GSAP ANIMATION- MD-SM-XS SCREENS
let isMenuOpen = false;
const trigger = document.querySelector(".mobile-nav-trigger");
const navMenu = document.querySelector(".main-navbar ul");
const mobileMenuElements = document.querySelectorAll(".main-navbar ul li");
const body = document.body;

function scrollToSection(targetId) {
    if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const target = document.querySelector(targetId);
    if (target) {
        requestAnimationFrame(() => {
            const navHeight = document.querySelector('.main-navbar').offsetHeight;
            const targetTop = target.offsetTop - navHeight + 800;
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
    }
}

if (trigger && navMenu) {
    trigger.addEventListener("click", () => {
        isMenuOpen = !isMenuOpen;
        trigger.classList.toggle("open");

        const tl = gsap.timeline({
            onComplete: () => {
                if (!isMenuOpen) {
                    navMenu.classList.remove("open");
                    navbar.classList.remove('menu-is-open');
                    body.classList.remove("menu-open"); 
                }
            }
        });

        if (isMenuOpen) {
            navMenu.classList.add("open");
            body.classList.add("menu-open");
            navbar.classList.add('menu-is-open');

            tl.to(navMenu, { duration: 0.8, "--panel-right-1": "0%", ease: "power1.out" }, 0)
              .to(navMenu, { duration: 0.8, "--panel-right-2": "0%", ease: "power1.out" }, 0.1)
              .to(navMenu, { duration: 0.8, "--panel-right-3": "0%", ease: "power1.out" }, 0.2)
              .to(navMenu, { duration: 0.8, "--panel-right-4": "0%", ease: "power1.out" }, 0.3)
              .to(mobileMenuElements, {
                    opacity: 1, x: 0, filter: "blur(0px)",
                    duration: 0.8, stagger: 0.1, ease: "power2.out"
                }, 0.4);
        } else {
            tl.to(mobileMenuElements, {
                    opacity: 0, x: 100, filter: "blur(10px)",
                    duration: 0.4, stagger: { each: 0.1, from: "last" }, ease: "power2.in"
                }, 0)
              .to(navMenu, { duration: 0.8, "--panel-right-1": "100%", ease: "power1.out" }, 0.4)
              .to(navMenu, { duration: 0.8, "--panel-right-2": "100%", ease: "power1.out" }, 0.5)
              .to(navMenu, { duration: 0.8, "--panel-right-3": "100%", ease: "power1.out" }, 0.6)
              .to(navMenu, { duration: 0.8, "--panel-right-4": "100%", ease: "power1.out" }, 0.7);
        }
    });
}

mobileMenuElements.forEach(item => {
    const link = item.querySelector("a");
    if (link) {
        link.addEventListener("click", (e) => {
            if (isMenuOpen) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                body.classList.remove("menu-open");
                trigger.click();
                navContents.classList.remove("toggle"); 
                setTimeout(() => {
                    scrollToSection(targetId);
                }, 950);
            }
        });
    }
});


// SMOOTH SCROLL FOR NAVBAR LINKS
document.querySelectorAll('.main-navbar ul li a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        if (isMenuOpen) return;
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navHeight = document.querySelector('.main-navbar').offsetHeight;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
    });
});


//GRID TRAIL MOUSE FOLLOW EFFECT
const CELL_SIZE = 40;
const COLOR_R = 234;
const COLOR_G = 234;
const COLOR_B = 234;
const STARTING_ALPHA = 255;
const BACKGROUND_COLOR = 214;
const PROB_OF_NEIGHBOR = 0.1;
const AMT_FADE_PER_FRAME = 5;
const STROKE_WEIGHT = 0.09;

let colorWithAlpha;
let numRows;
let numCols;
let currentRow = -1;
let currentCol = -1;
let allNeighbors = [];

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style("position", "fixed");
    cnv.style("inset", 0);
    cnv.style("z-index", "1");
    cnv.style("pointer-events", "none");

    colorWithAlpha = color(COLOR_R, COLOR_G, COLOR_B, STARTING_ALPHA);
    noFill();
    stroke(colorWithAlpha);
    strokeWeight(STROKE_WEIGHT);
    numRows = Math.ceil(windowHeight / CELL_SIZE);
    numCols = Math.ceil(windowWidth / CELL_SIZE);
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
    }
    if (mouseX !== pmouseX || mouseY !== pmouseY) {
        let x = col * CELL_SIZE;
        let y = row * CELL_SIZE;
        stroke(colorWithAlpha);
        rect(x, y, CELL_SIZE, CELL_SIZE);
    }

    for (let neighbor of allNeighbors) {
        let neighborX = neighbor.col * CELL_SIZE;
        let neighborY = neighbor.row * CELL_SIZE;

        neighbor.opacity = max(0, neighbor.opacity - AMT_FADE_PER_FRAME);
        stroke(COLOR_R, COLOR_G, COLOR_B, neighbor.opacity);
        rect(neighborX, neighborY, CELL_SIZE, CELL_SIZE);
    }

    allNeighbors = allNeighbors.filter((neighbor) => neighbor.opacity > 0);
}

function getRandomNeighbors(row, col) {
    let neighbors = [];

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            let neighborRow = row + dRow;
            let neighborCol = col + dCol;

            let isCurrentCell = dRow === 0 && dCol === 0;

            let isInBounds =
                neighborRow >= 0 &&
                neighborRow < numRows &&
                neighborCol >= 0 &&
                neighborCol < numCols;

            if (!isCurrentCell && isInBounds && Math.random() < PROB_OF_NEIGHBOR) {
                neighbors.push({
                    row: neighborRow,
                    col: neighborCol,
                    opacity: STARTING_ALPHA,
                });
            }
        }
    }
    return neighbors;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    numRows = Math.ceil(windowHeight / CELL_SIZE);
    numCols = Math.ceil(windowWidth / CELL_SIZE);
}



$(document).ready(function() {

    function decodeHTMLEntities(str) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    }

    function encodeForHTML(char) {
        return char
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    
    $(".heading h1, .heading p.p1, .heading p.p2, .section1 h2, .p1-right-side p, .p-left-side p, .p2-right-side p, .reveal-h2-s2, .reveal-p-s2, .project1 h4, .project1 p, .project2 h4, .project2 p, .project3 h4, .project3 p, .reveal-h2-s3, .reveal-h4-s3, .reveal-h2-s4, .section4 h2, .section4 h4, .section4 p, .section4 li, .reveal-h2-s5, .reveal-h2-s6, .reveal-p-s6, .reveal-a-s6, .reveal-h3-footer,  .reveal-h2-work, .reveal-p-work ").each(function() {
        const el = $(this);
        const html = el.html();
        const parts = html.split(/(<[^>]+>)/gi);
        const newHtml = parts.map(part => {
            if (part.match(/^<[^>]+>$/i)) return part;
            const decoded = decodeHTMLEntities(part);
            return decoded.split(/\s+/).map(word => {
                if (word.length === 0) return "";
                const letters = [...word].map(char => `<span>${encodeForHTML(char)}</span>`).join('');
                return `<span style="display: inline-block; white-space: nowrap;">${letters}</span>`;
            }).join(" ");
        }).join("");
        el.html(newHtml);

        function updateHLinePosition() {
            const taskDesc = document.querySelector('.main-work-item .task-description');
            const hLine = document.querySelector('.main-work-item .custom-grid .h-line');
            
            if (!taskDesc || !hLine) return;

            const h2 = document.querySelector('.main-work-item h2');
            const h2Height = h2 ? h2.offsetHeight : 0;
            const descHeight = taskDesc.offsetHeight;
            const padding = 120;

            const topValue = padding + h2Height + descHeight + 30;
            hLine.style.top = topValue + 'px';
        }

        updateHLinePosition();
        window.addEventListener('resize', updateHLinePosition);

    });



// HERO SECTION ENTRANCE ANIMATION
window.addEventListener('preloaderDone', function() {
    const video = document.querySelector('.header-video');
     if (video) {
        video.pause();
        video.currentTime = 0;
    }

    setTimeout(() => {
        if (video) {
            video.style.opacity = '1';
            video.play();
        }
    }, 500);


    var tlHeader = anime.timeline();
    tlHeader
    .add({
        targets: '.main-navbar .brand',
        translateX: [-60, 0],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutQuint'
    })
    .add({
        targets: '.main-navbar ul li',
        translateX: [80, 0],
        opacity: [0, 1],
        delay: anime.stagger(130, { from: 'last' }),
        duration: 1500,
        easing: 'easeOutQuint'
    }, '-=600')
    .add({
        targets: '.mobile-nav-trigger',
        translateX: [60, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuint'
    }, 400)
    .add({
        targets: '.heading h1 span',
        translateX: [100, 0], 
        opacity: [0, 1],
        delay: anime.stagger(80),
        easing: 'easeInOutQuint'
    })
    .add({
        targets: '.heading p.p1',
        backgroundColor: window.innerWidth <= 575.98 
            ? ['rgba(137, 123, 150, 0)', 'rgba(137, 123, 150, 0)']
            : ['rgba(137, 123, 150, 0)', 'rgba(137, 123, 150, 1)'],
        boxShadow: window.innerWidth <= 575.98
            ? ['0px 0px 0px 0px rgba(66, 58, 75, 0)', '0px 0px 0px 0px rgba(66, 58, 75, 0)']
            : ['0px 0px 10px 0px rgba(66, 58, 75, 0.39)', '0px 0px 10px 0px rgba(66, 58, 75, 0.39)'],
        opacity: [0, 1],
        duration: 300,
        easing: 'linear'
    })
    .add({
        targets: '.heading p.p1 span',
        opacity: [0, 1],
        delay: anime.stagger(50),
        easing: 'linear'
    }, '-=400') 
    .add({
        targets: '.heading p.p2 span',
        opacity: [0, 1],
        delay: anime.stagger(50),
        easing: 'easeInOutQuint'
    }, '-=700');
});



// HEADER - VIDEO TO LOTTIE ON XS
if (window.innerWidth <= 767.98) {
    const headerLottie = document.getElementById('header-lottie-mobile');
    
    if (headerLottie) {
        headerLottie.play();

        const applyHeaderStretch = () => {
            const svg = headerLottie.shadowRoot?.querySelector('svg') || headerLottie.querySelector('svg');
            if (svg) {
                svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                svg.style.width = '100%';
                svg.style.height = '100%';
                const vb = svg.getAttribute('viewBox');
                if (vb) {
                    const parts = vb.split(' ');
                    svg.setAttribute('viewBox', parts.join(' '));
                }
                return true;
            }
            return false;
        };

        if (!applyHeaderStretch()) {
            const observer = new MutationObserver(() => {
                if (applyHeaderStretch()) observer.disconnect();
            });
            observer.observe(headerLottie, { childList: true, subtree: true });
            if (headerLottie.shadowRoot) {
                observer.observe(headerLottie.shadowRoot, { childList: true, subtree: true });
            }
        }
    } 
}


//SECTIONS ENTRANCE ANIMATION
    function animateSection1() {
        var tlSection1 = anime.timeline({ easing: 'easeInOutQuint', duration: 1500 });
        tlSection1
        .add({
            targets: '.section1 h2 span',
            translateX: [60, 0], 
            opacity: [0, 1],
            delay: anime.stagger(80)
        })
        .add({ 
            targets: '.p1-right-side p span', 
            opacity: [0, 1], 
            delay: anime.stagger(2) 
        }, '-=1000')

        .add({ 
            targets: '.p-left-side p span', 
            opacity: [0, 1], 
            delay: anime.stagger(2) 
        }, '-=1000')

        .add({ 
            targets: '.p2-right-side p span', 
            opacity: [0, 1], 
            delay: anime.stagger(2) 
        }, '-=1000');
    }

function animateSection2() {
    var tlSection2 = anime.timeline({ easing: 'easeInOutQuint', duration: 1500 });
    tlSection2
    .add({
        targets: '.reveal-h2-s2 span',
        translateX: [60, 0],
        opacity: [0, 1],
        delay: anime.stagger(60)
    })

    .add({ 
        targets: '.reveal-star-s2', 
        scale: [0, 1.2, 1], 
        opacity: [0, 1], 
        duration: 400 
    }, '+=500')

    .add({ 
        targets: '.reveal-p-s2 span', 
        opacity: [0, 1], 
        delay: anime.stagger(5) 
    }, '-=300')

    .add({
        targets: '.project1 .shadow-container',
        clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
        translateX: [-15, 0],
        duration: 1200,
        easing: 'linear',
        complete: function() {
            document.querySelector('.project1 a').style.boxShadow = '-4px -4px 30px 5px rgba(186, 185, 185, 1)';
        }
    }, '+=800')

    .add({
        targets: '.project1 h4 span',
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(40),
        duration: 600,
        easing: 'easeOutQuint'
    }, '+=300')

    .add({
        targets: '.project1 p span',
        opacity: [0, 1],
        delay: anime.stagger(5),
        duration: 400
    }, '+=200')

    .add({
        targets: '.project2 .shadow-container',
        clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
        translateX: [-15, 0],
        duration: 1200,
        easing: 'linear',
        complete: function() {
            document.querySelector('.project2 a').style.boxShadow = '-4px -4px 30px 5px rgba(186, 185, 185, 1)';
        }
    }, '+=800')

    .add({
        targets: '.project2 h4 span',
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(40),
        duration: 600,
        easing: 'easeOutQuint'
    }, '+=300')

    .add({
        targets: '.project2 p span',
        opacity: [0, 1],
        delay: anime.stagger(5),
        duration: 400
    }, '+=200')

    .add({
        targets: '.project3 .shadow-container',
        clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
        translateX: [-15, 0],
        duration: 1200,
        easing: 'linear',
        complete: function() {
            document.querySelector('.project3 a').style.boxShadow = '-4px -4px 30px 5px rgba(186, 185, 185, 1)';
        }
    }, '+=800')

    .add({
        targets: '.project3 h4 span',
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(40),
        duration: 600,
        easing: 'easeOutQuint'
    }, '+=300')

    .add({
        targets: '.project3 p span',
        opacity: [0, 1],
        delay: anime.stagger(5),
        duration: 400
    }, '+=200')
}


    function animateSection3() {
        var tlSection3 = anime.timeline({ easing: 'easeInOutQuint'});
        tlSection3
        .add({
            targets: '.reveal-h2-s3 span',
            translateX: [60, 0],
            opacity: [0, 1],
            delay: anime.stagger(60)
        })

        .add({ 
            targets: '.reveal-h4-s3 span', 
            opacity: [0, 1], 
            delay: anime.stagger(30) 
        }, '-=800');
    }

    
    function animateSection4() {

        document.querySelector('.skills').style.opacity = '1';

        var tlSection4 = anime.timeline({
            easing: 'easeOutQuint',
            duration: 1000 
        });

    
        tlSection4.add({
            targets: '.section4 h2 span',
             translateX: [60, 0],
            opacity: [0, 1], 
            duration: 1000,
            delay: anime.stagger(60) 
        });

        function addColumnToTimeline(columnSelector) {
            tlSection4
            .add({
                targets: columnSelector + ' p span',
                opacity: [0, 1],
                delay: anime.stagger(1)
            }, '-=800')

            .add({
                targets: columnSelector + ' h4 span',
                opacity: [0, 1],
                translateX: [10, 0],
                delay: anime.stagger(15)
            }, '-=800')
    
            .add({
                targets: columnSelector + ' .line',
                width: ['0px', '130px'],
                opacity: [0, 1],
                duration: 400
            }, '-=800')

            .add({
                targets: columnSelector + ' li',
                opacity: [0, 1],
                delay: anime.stagger(50) 
            }, '-=800');
        }


if (window.innerWidth <= 575.98) {
    // XS
    addColumnToTimeline('.skill-digital');
    addColumnToTimeline('.skill-graphic');
    addColumnToTimeline('.skill-webdev');
    addColumnToTimeline('.skill-animations');
    addColumnToTimeline('.skill-marketing');
    addColumnToTimeline('.skill-video');

} else if (window.innerWidth <= 910) {
    // SM-MD
    addColumnToTimeline('.skill-digital');
    addColumnToTimeline('.skill-graphic');
    addColumnToTimeline('.skill-animations');
    addColumnToTimeline('.skill-video');
    addColumnToTimeline('.skill-webdev');
    addColumnToTimeline('.skill-marketing');

} else {
    // MD+
    addColumnToTimeline('.skill-digital');
    addColumnToTimeline('.skill-webdev');
    addColumnToTimeline('.skill-animations');
    addColumnToTimeline('.skill-graphic');
    addColumnToTimeline('.skill-marketing');
    addColumnToTimeline('.skill-video');
}
}


    function animateSection5() {
        var tlSection5 = anime.timeline({
            easing: 'easeInOutQuint'
        });
        
        tlSection5.add({
            targets: '.reveal-h2-s5 span',
            translateX: [60, 0],
            opacity: [0, 1], 
            duration: 1000,
            delay: anime.stagger(60) 
        });

        tlSection5.add({
            targets: '#Lottie-sec5',
            opacity: [0, 1],
            duration: 1000,
            begin: function(anim) {
                let player = document.querySelector('#Lottie-sec5');
                player.seek(0);
                player.play();  
            }
        }, '-=500');

        tlSection5.add({
            targets: '.softwares-container .software img',
            clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
            webkitClipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
            opacity: [0, 1],
            translateX: [-15, 0],
            duration: 1200,
            easing: 'easeInOutQuart',
            delay: anime.stagger(150) 
        }, '-=400');
    }

    
// SECTION5 - LOTTIE SVG STRETCH
    const lottieS5 = document.querySelector('#Lottie-sec5');
    if (lottieS5) {
        const applyStretch = () => {
            const svg = lottieS5.shadowRoot?.querySelector('svg') || lottieS5.querySelector('svg');
            if (svg) {
                svg.setAttribute('preserveAspectRatio', 'none');
                svg.style.width = '100%';
                svg.style.height = '100%';
                return true;
            }
            return false;
        };

        if (!applyStretch()) {
            const observer = new MutationObserver(() => {
                if (applyStretch()) observer.disconnect();
            });
            observer.observe(lottieS5, { childList: true, subtree: true });
            if (lottieS5.shadowRoot) {
                observer.observe(lottieS5.shadowRoot, { childList: true, subtree: true });
            }
        }
    }

    function animateSection6() {
        
        var tlSection6 = anime.timeline({
            easing: 'easeOutQuint',
            duration: 1000
        });

        tlSection6
        .add({
            targets: '.reveal-h2-s6 span',
            translateX: [60, 0],
            opacity: [0, 1],
            delay: anime.stagger(60)
        })
        .add({
            targets: '.section6 h4', 
                opacity: [0, 1],
                translateX: [10, 0],
                delay: anime.stagger(15)
        }, '-=800')

        .add({
            targets: '.section6 .content .line', 
            opacity: [0, 1],
            delay: anime.stagger(2) 
        }, '-=600')
        
        .add({
            targets: '.reveal-p-s6 span', 
            opacity: [0, 1],
            delay: anime.stagger(2) 
        }, '-=600')
    }

    function animateFooter() {

        document.querySelector('footer .left-side').style.opacity = '1';
        document.querySelector('footer .right-side').style.opacity = '1'; 

        var tlFooter = anime.timeline({
            easing: 'easeOutQuint',
            duration: 900
        });

        tlFooter
        .add({
            targets: '.open-to-work', 
            translateX: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(60)
        }, '+=400')

        .add({
            targets: '.reveal-h3-footer span', 
            translateX: [60, 0],
            opacity: [0, 1],
            delay: anime.stagger(80)
        }, '+=200')

        .add({
            targets: 'footer h4', 
            opacity: [0, 1],
            translateX: [10, 0],
            delay: anime.stagger(15)
        }, '-=800')
       

        .add({
            targets: '.reveal-line-h',
            width: [0, '80px'],
            opacity: [0, 1],
        }, '-=800')
        
        .add({
            targets: '.LinkedIn',
            translateX: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100)
        }, '-=600')

        .add({
            targets: '.mail',
            translateX: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100)
        }, '-=600');

        gsap.to("footer .v-line", {
            scaleY: 1,
            duration: 1.5,
            ease: "power2.out"
        });
    }


function animateWorkItem() {
    const flipbook = document.querySelector(".main-work-item .flipbook-south-korea");

    anime({
        targets: '.reveal-h2-work span',
        translateX: [60, 0],
        opacity: [0, 1],
        delay: anime.stagger(60),
        easing: 'easeInOutQuint',
        duration: 1000,
        complete: () => {
            anime({
                targets: '.reveal-p-work span',
                opacity: [0, 1],
                delay: anime.stagger(5),
                easing: 'easeInOutQuint',
                duration: 1000,
                complete: () => {
                    gsap.to(".main-work-item .h-line", {
                        width: "100%",
                        duration: 1,
                        ease: "linear",
                        onComplete: () => {
                            gsap.set(".hint-wrapper", { display: "flex", opacity: 1 });

                            const hintTl = gsap.timeline();
                            
                           
                            hintTl.to(".hint-wrapper img", {
                                opacity: 1,
                                duration: 0.6,
                                ease: "power2.out"
                            })
                            .to(".hint-wrapper p", {
                                opacity: 1,
                                x: 0, 
                                duration: 1,
                                ease: "power2.out" 
                            }, "-=0.1"); 

                            if (!flipbook) {
                                gsap.to(".plugit img, .work-img, .flipbook-south-korea, .safe-driving-rules video", {
                                    opacity: 1, 
                                    duration: 0.8, 
                                    ease: "linear",
                                    delay: 0.3,
                                    onComplete: () => {
                                        gsap.to(".plugit a.btn-hover-effect, .faded-ashes a.btn-hover-effect, .blockmates a.btn-hover-effect", {
                                            opacity: 1, 
                                            duration: 0.2, 
                                            ease: "linear",
                                        });
                                    }
                                });
                            } else {
                                gsap.to(".main-work-item .flipbook-south-korea", { 
                                    opacity: 1, 
                                    duration: 1.2, 
                                    ease: "power2.out",
                                    delay: 0.8 
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}



    
// PROJECT CARD ENTRANCE

const PROJECT_ENTRY_DELAY = 1500;
const PROJECT_STAGGER_DELAY = 50;

function animateProject(projectSelector, index = 0) {
    var tl = anime.timeline({ 
        easing: 'linear', 
        delay: PROJECT_ENTRY_DELAY + (index * PROJECT_STAGGER_DELAY)
    });
    tl
    .add({
        targets: projectSelector + ' .shadow-container',
        clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
        translateX: [-15, 0],
        duration: 1200,
        easing: 'easeInOutQuad'
    })
    .add({
        targets: projectSelector + ' h4 span',
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(40),
        duration: 600,
        easing: 'easeOutQuint'
    }, '+=400')
    .add({
        targets: projectSelector + ' p span',
        opacity: [0, 1],
        delay: anime.stagger(5),
        duration: 400
    });
}


// PROJECT HOVER EFFECTS
document.querySelectorAll('.project1, .project2, .project3').forEach(project => {
    const link = project.querySelector('a');
    link.addEventListener('mouseenter', () => {
        anime({ 
            targets: link, 
            filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'], 
            scale: [1, 0.97, 1.005], 
            duration: 1200, 
            easing: 'easeOutQuad' });
    });

    link.addEventListener('mouseleave', () => {
        anime({ 
            targets: link, 
            filter: 'blur(0px)', 
            scale: 1, 
            duration: 600, 
            easing: 'easeOutQuad' });
    });
});


// INTERSECTION OBSERVER FOR SECTIONS

const animatedSections = new Set();
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
                
            if (animatedSections.has(target)) return;
            animatedSections.add(target);

            if (target.classList.contains('section1')) { animateSection1(); observer.unobserve(target); }
            else if (target.classList.contains('section2')) { animateSection2(); observer.unobserve(target); }
            else if (target.classList.contains('section3')) { animateSection3(); observer.unobserve(target); }
            else if (target.classList.contains('section4')) { animateSection4(); observer.unobserve(target); }
            else if (target.classList.contains('section5')) { animateSection5(); observer.unobserve(target); }
            else if (target.classList.contains('section6')) { animateSection6(); observer.unobserve(target); }
            else if (target.tagName.toLowerCase() === 'footer') { animateFooter(); observer.unobserve(target); }
            else if (target.classList.contains('main-work-item')) { animateWorkItem(); observer.unobserve(target); }
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.section1, .section2, .section3, .section4, .section5, .section6, footer, .main-work-item').forEach(section => {
        observer.observe(section);
    });
});



//SECTION2- LOTTIE ANIMATION CONTROL
const player = document.querySelector("#gridLottie");
    if(player) {
        player.addEventListener("complete", () => {
            setTimeout(() => { player.seek(0); player.play(); }, 2000);
        });
    }

//FOOTER- LOTTIE ANIMATION
const footerPlayer = document.getElementById("Lottie-footer");
    if (footerPlayer) {
        footerPlayer.addEventListener("complete", () => {
            setTimeout(() => {
                footerPlayer.seek(0); 
                footerPlayer.play(); 
            }, 2000); 
        });
    }


// SECTION 3 - MASK & TEXT REVEAL
const section3Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            section3Observer.unobserve(entry.target);

            const isMobile = window.innerWidth <= 991.98;
            const mobileDelay = 3600;   
            const desktopDelay = 3600; 
            const delay = isMobile ? mobileDelay : desktopDelay;
            
            setTimeout(() => {
                const tl = anime.timeline({ easing: 'easeInOutQuart' });
                const workItems = document.querySelectorAll('.section3 .work-item');
                
                workItems.forEach((item, index) => {
                    const target = isMobile
                        ? item.querySelector('.task-md-xs')
                        : item.querySelector('.card');
                    const title = item.querySelector('h6');
                    
                    if (target) {
                        tl.add({
                            targets: target,
                            duration: 600,
                            begin: function() {
                                target.style.opacity = '1'; 
                                target.style.clipPath = 'polygon(0 0, 0% 0, 0% 0%, 0 0%)';
                                target.style.webkitClipPath = 'polygon(0 0, 0% 0, 0% 0%, 0 0%)';
                            },
                            update: function(anim) {
                                const prog = anim.progress;
                                const path = `polygon(0 0, ${prog}% 0, ${prog}% ${prog}%, 0 ${prog}%)`;
                                target.style.clipPath = path;
                                target.style.webkitClipPath = path;
                            },
                            complete: function() {
                                target.style.clipPath = 'none';
                                target.style.webkitClipPath = 'none';
                            }
                        }, index === 0 ? 0 : '+=500')
                        .add({ 
                            targets: title, 
                            opacity: [0, 1], 
                            translateX: [10, 0], 
                            duration: 600 
                        }, '-=400');
                    }
                });
            }, delay);
        }
    });
}, { threshold: 0.05 });

const s3Target = document.querySelector('.section3');
if (s3Target) section3Observer.observe(s3Target);


$('.internal-navbar a').on('click', function(e) {
    if ($(this).attr('href').indexOf('.html') !== -1) {
        e.preventDefault();
        
        const targetUrl = $(this).attr('href');
        const navMenu = document.querySelector(".internal-navbar ul");
        const mobileMenuElements = document.querySelectorAll(".internal-navbar ul li span");
        
        gsap.to(['main', '.content-wrapper', 'footer'], {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut"
        });

        anime({
            targets: mobileMenuElements,
            opacity: [1, 0],
            translateX: [0, 60],
            filter: ["blur(0px)", "blur(10px)"],
            duration: 400,
            delay: anime.stagger(50, {direction: 'reverse'}), 
            easing: 'easeInQuint',
            complete: () => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        window.location.href = targetUrl;
                    }
                });

                tl.to(navMenu, { duration: 0.6, "--panel-right-1": "100%", ease: "power1.inOut" }, 0)
                  .to(navMenu, { duration: 0.6, "--panel-right-2": "100%", ease: "power1.inOut" }, 0.1)
                  .to(navMenu, { duration: 0.6, "--panel-right-3": "100%", ease: "power1.inOut" }, 0.2)
                  .to(navMenu, { duration: 0.6, "--panel-right-4": "100%", ease: "power1.inOut" }, 0.3);
            }
        });
    }
});

    


// SOUTH KOREA BOOKLET
const section3Element = document.querySelector('.section3, .main-work-item');
if (section3Element) section3Observer.observe(section3Element);

const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");
const root = document.documentElement;

if (prevBtn && nextBtn && book) {

    const papers = [];
    for (let i = 1; i <= 12; i++) {
        papers.push(document.querySelector(`#p${i}`));
    }

    prevBtn.addEventListener("click", goNextPage);
    nextBtn.addEventListener("click", goPrevPage);

    let currentLocation = 1;
    let numOfPapers = 12;
    let maxLocation = numOfPapers + 1;

    function updateArrowPosition(isOpen) {
        if (isOpen) {
            root.style.setProperty('--book-offset', '28vw'); 
        } else {
            root.style.setProperty('--book-offset', '15vw');
        }
    }

    function openBook() {
        updateArrowPosition(true);
        book.classList.remove("at-beginning");
        book.classList.remove("at-end");
    }

    function closeBook(isAtBeginning) {
        updateArrowPosition(false);
        if(isAtBeginning) {
            book.classList.add("at-beginning");
            book.classList.remove("at-end");
        } else {
            book.classList.add("at-end");
            book.classList.remove("at-beginning");
        }
    }

    
if (window.innerWidth <= 991.98) {
    const mobileOverlay = document.querySelector('#mobile-book-overlay');
    const mobileContent = document.querySelector('.mobile-book-content');
    const closeMobileBook = document.querySelector('#close-mobile-book');
    const flipbook = document.querySelector('.main-work-item .flipbook-south-korea');

    if (mobileOverlay && flipbook) {

        const openMobileOverlay = () => {
            mobileContent.appendChild(flipbook);
            mobileOverlay.style.display = 'flex';
            document.body.classList.add('no-scroll');
            anime({
                targets: '#mobile-book-overlay',
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        };

        const closeMobileOverlay = () => {
            anime({
                targets: '#mobile-book-overlay',
                opacity: 0,
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    mobileOverlay.style.display = 'none';
                    document.body.classList.remove('no-scroll');
                    const mainWorkItem = document.querySelector('.main-work-item');
                    if (mainWorkItem) mainWorkItem.appendChild(flipbook);
                }
            });
        };

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                const isLandscape = window.matchMedia('(orientation: landscape)').matches;
                if (isLandscape && window.innerWidth <= 991.98) {
                    if (mobileOverlay.style.display !== 'flex') {
                        openMobileOverlay();
                    }
                } else {
                    if (mobileOverlay.style.display === 'flex') {
                        closeMobileOverlay();
                    }
                }
            }, 300); 
        });

        if (closeMobileBook) {
            closeMobileBook.addEventListener('click', closeMobileOverlay);
        }

        mobileOverlay.querySelector('.mobile-book-overlay-bg').addEventListener('click', closeMobileOverlay);
    }
}

function updateButtons() {
    nextBtn.style.visibility = currentLocation <= 1 ? 'hidden' : 'visible';
    prevBtn.style.visibility = currentLocation >= maxLocation ? 'hidden' : 'visible';

    // landscape mobile
    if (window.innerWidth <= 991.98 && window.matchMedia('(orientation: landscape)').matches) {
        const isSinglePage = currentLocation === 1 || currentLocation >= maxLocation;
        const mobileContent = document.querySelector('.mobile-book-content');
        if (mobileContent) mobileContent.classList.toggle('single-page', isSinglePage);
    }

    // SM screens
    if (window.innerWidth <= 767.98 && window.innerWidth > 670) {
        if (currentLocation === 1 || currentLocation >= maxLocation) {
            prevBtn.style.top = '50%';
            prevBtn.style.left = 'calc(50% - 17.5vw - 100px)';
            nextBtn.style.top = '50%';
            nextBtn.style.left = 'calc(50% + 17.5vw + 100px)';
        } else {
            prevBtn.style.top = 'calc(30vh + 20px)';
            prevBtn.style.left = 'calc(50% - 30px)';
            nextBtn.style.top = 'calc(30vh + 20px)';
            nextBtn.style.left = 'calc(50% + 30px)';
        }
    }

    if (currentLocation >= maxLocation) {
        book.style.boxShadow = 'none';
        book.style.webkitBoxShadow = 'none';
    } else {
        book.style.boxShadow = '';
        book.style.webkitBoxShadow = '';
    }
}

function goNextPage() {
    if(currentLocation < maxLocation) {
        switch(currentLocation) {
            case 1:
                openBook();
                papers[0].classList.add("flipped");
                papers[0].style.zIndex = 1;
                break;
            case 12:
                papers[11].classList.add("flipped");
                papers[11].style.zIndex = 12;
                closeBook(false);
                break;
            default:
                papers[currentLocation - 1].classList.add("flipped");
                papers[currentLocation - 1].style.zIndex = currentLocation;
                break;
        }
        currentLocation++;
        updateButtons();
    }
}

function goPrevPage() {
    if(currentLocation > 1) {
        switch(currentLocation) {
            case 2:
                closeBook(true);
                papers[0].classList.remove("flipped");
                papers[0].style.zIndex = 12;
                break;
            case 13:
                openBook();
                papers[11].classList.remove("flipped");
                papers[11].style.zIndex = 1;
                break;
            default:
                papers[currentLocation - 2].classList.remove("flipped");
                papers[currentLocation - 2].style.zIndex = numOfPapers - (currentLocation - 2);
                break;
        }
        currentLocation--;
        updateButtons();
    }
}

closeBook(true);
updateButtons();

    const bookOverlay = document.querySelector("#book-overlay");
    const triggerBtn1 = document.querySelector(".work-item1 .btn-hover-effect");
    const closeBookBtn = document.querySelector("#close-overlay");

    if (triggerBtn1 && bookOverlay) {
        triggerBtn1.addEventListener("click", (e) => {
            bookOverlay.style.display = "flex";
            
            anime({
                targets: '#book-overlay',
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutQuad'
            });
        });
    }

    const closeBookOverlay = () => {
        anime({
            targets: '#book-overlay',
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                bookOverlay.style.display = "none";
                document.body.classList.remove("no-scroll");
            }
        });
    };

    if (closeBookBtn) {
        closeBookBtn.addEventListener("click", closeBookOverlay);
    }

    if (bookOverlay && window.innerWidth <= 991.98) {
        bookOverlay.querySelector(".overlay-background").addEventListener("click", closeBookOverlay);
    }

    function updateButtonsPosition() {
        const bookEl = document.querySelector('.main-work-item .book');
        if (!bookEl) return;

        const bookRect = bookEl.getBoundingClientRect();
        const flipbookEl = document.querySelector('.main-work-item .flipbook-south-korea');
        const flipbookRect = flipbookEl.getBoundingClientRect();

        const bookCenterY = bookRect.top - flipbookRect.top + bookRect.height / 2;

        prevBtn.style.top = bookCenterY + 'px';
        nextBtn.style.top = bookCenterY + 'px';

        if (currentLocation === totalPapers) {
            document.querySelector('.book').style.boxShadow = 'none';
        } else {
            document.querySelector('.book').style.boxShadow = '0 0 20px rgba(0,0,0,0.2)'; 
        }
    }
}



// BODY VS. MIND POSTER - LIGHTBOX
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.querySelector(".bodymind#lightbox-overlay");
    const lightboxImg = document.querySelector(".bodymind #lightbox-img");
    const closeBtnLightbox = document.querySelector(".bodymind #close-lightbox");
    const triggerBtn4 = document.querySelector(".work-item4 .btn-hover-effect");

    if (triggerBtn4 && lightbox) {
        triggerBtn4.addEventListener("click", (e) => {
            e.preventDefault();
            
            lightboxImg.src = "images/body-vs-mind.png"; 

            lightbox.style.display = "flex";
            document.body.classList.add("no-scroll");

            anime({
                targets: '.bodymind#lightbox-overlay',
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        });
    }

    const closeLightbox = () => {
        anime({
            targets: '.bodymind#lightbox-overlay',
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                lightbox.style.display = "none";
                document.body.classList.remove("no-scroll");
            }
        });
    };

    if (closeBtnLightbox) {
        closeBtnLightbox.addEventListener("click", closeLightbox);
    }

    const bgOverlay = document.querySelector(".bodymind .overlay-background");
    if (bgOverlay) {
        bgOverlay.addEventListener("click", closeLightbox);
    }
});


// SAFE DRIVING RULES- VIDEO LIGHTBOX
document.addEventListener('DOMContentLoaded', () => {
    const videoOverlay = document.querySelector("#video-overlay");
    const projectVideo = document.querySelector("#project-video");
    const closeVideoBtn = document.querySelector("#close-video");
    const triggerBtn5 = document.querySelector(".work-item5 .btn-hover-effect");

    if (triggerBtn5 && videoOverlay) {
        triggerBtn5.addEventListener("click", (e) => {
            e.preventDefault();
            
            videoOverlay.style.display = "flex";
            document.body.classList.add("no-scroll");
            
            projectVideo.currentTime = 0; 
            projectVideo.play();

            anime({
                targets: '#video-overlay',
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutQuad'
            });
        });
    }

    const closeVideo = () => {
        anime({
            targets: '#video-overlay',
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                videoOverlay.style.display = "none";
                document.body.classList.remove("no-scroll");
                projectVideo.pause();
            }
        });
    };

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener("click", closeVideo);
    }

    if (videoOverlay && window.innerWidth <= 991.98) {
        videoOverlay.querySelector(".overlay-background").addEventListener("click", closeVideo);
    }
});


// APP PLANNING- BLOCKMATES
document.addEventListener('DOMContentLoaded', () => {
    const pdfOverlay = document.querySelector("#pdf-overlay");
    const pdfFrame = document.querySelector("#project-pdf");
    const closePdfBtn = document.querySelector("#close-pdf");
    const triggerBtn6 = document.querySelector(".work-item6 .btn-hover-effect");

    if (triggerBtn6 && pdfOverlay) {
        triggerBtn6.addEventListener("click", (e) => {
            e.preventDefault();
            
            pdfFrame.src = "images/app-planning-blockmates.pdf"; 

            pdfOverlay.style.display = "flex";
            document.body.classList.add("no-scroll");

            anime({
                targets: '#pdf-overlay',
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutQuad'
            });
        });
    }

    const closePdf = () => {
        anime({
            targets: '#pdf-overlay',
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                pdfOverlay.style.display = "none";
                document.body.classList.remove("no-scroll");
                pdfFrame.src = "";
            }
        });
    };

    if (closePdfBtn) {
        closePdfBtn.addEventListener("click", closePdf);
    }

    if (pdfOverlay && window.innerWidth <= 991.98) {
        pdfOverlay.querySelector(".overlay-background").addEventListener("click", closePdf);
    }
});


// BLOCKMATES PAGE - PDF
document.addEventListener('DOMContentLoaded', () => {
    const pdfOverlay = document.querySelector("#pdf-overlay");
    const pdfFrame = document.querySelector("#project-pdf");
    const closePdfBtn = document.querySelector("#close-pdf");
    const triggerBtn = document.querySelector(".blockmates .btn-hover-effect");

    if (triggerBtn && pdfOverlay) {
        triggerBtn.addEventListener("click", (e) => {
            e.preventDefault();
            pdfFrame.src = "images/app-planning-blockmates.pdf";
            pdfOverlay.style.display = "flex";
            document.body.classList.add("no-scroll");
            anime({
                targets: '#pdf-overlay',
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutQuad'
            });
        });

        const closePdf = () => {
            anime({
                targets: '#pdf-overlay',
                opacity: 0,
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    pdfOverlay.style.display = "none";
                    document.body.classList.remove("no-scroll");
                    pdfFrame.src = "";
                }
            });
        };

        if (closePdfBtn) closePdfBtn.addEventListener("click", closePdf);
        pdfOverlay.querySelector(".overlay-background").addEventListener("click", closePdf);
    }
});


// SECTION 4, 6, footer- LINES ANIMATION
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(".section4 .v-line", {
        height: "100%",
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
            trigger: ".section4",
            start: "top 80%",
            toggleActions: "play none none none", 
            once: true
        }
    });

     gsap.to(".section4 .h-line", {
        width: "100%",
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
            trigger: ".section4",
            start: "top 80%",
            toggleActions: "play none none none", 
            once: true
        }
    });

   gsap.to(".section6 .v-line", {
        height: "100%",
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2, 
        scrollTrigger: {
            trigger: ".section6",
            start: "top 80%", 
            toggleActions: "play none none none",
            once: true 
        }
    });

    gsap.to("footer .v-line", {
            scaleY: 1,
            duration: 1.5,
            ease: "power2.out"
        });


        if (window.innerWidth <= 991.98) {
        gsap.to(".section1 .custom-grid .v-50", {
            scaleY: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".section1",
                start: "top 80%",
                toggleActions: "play none none none",
                once: true
            }
        });
    }

});














































