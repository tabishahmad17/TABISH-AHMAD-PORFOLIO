const canvas = document.getElementById('animation-canvas');
const context = canvas.getContext('2d');
const frameCount = 240; // 0 to 239

const images = [];
let imagesLoaded = 0;

// Preload images
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    const frameIndex = i.toString().padStart(6, '0');
    img.src = `video_frames_30fps_small/frame_${frameIndex}.jpg`;
    img.onload = () => {
        imagesLoaded++;
        // Render the first frame once it's loaded
        if (i === 0) {
            renderFrame(0);
        }
    };
    images.push(img);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-render the current frame on resize
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    
    if (maxScrollTop <= 0) {
        if (images[0] && images[0].complete) renderFrame(0);
        return;
    }
    
    let scrollFraction = scrollTop / maxScrollTop;
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    
    // Only render if image is loaded
    if (images[frameIndex] && images[frameIndex].complete) {
        renderFrame(frameIndex);
    }
}

function renderFrame(index) {
    if (images[index] && images[index].complete) {
        // Draw image covering the canvas (object-fit: cover equivalent for canvas)
        const img = images[index];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }
        
        // Zoom in by 10% 
        const zoom = 1.10;
        const finalDrawWidth = drawWidth * zoom;
        const finalDrawHeight = drawHeight * zoom;
        const finalOffsetX = offsetX - (finalDrawWidth - drawWidth) / 2;
        const finalOffsetY = offsetY - (finalDrawHeight - drawHeight) / 2;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, finalOffsetX, finalOffsetY, finalDrawWidth, finalDrawHeight);
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Set initial sizes

// Scroll event
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    
    // Ensure we don't divide by zero
    if (maxScrollTop <= 0) return;
    
    let scrollFraction = scrollTop / maxScrollTop;
    
    // Clamp fraction between 0 and 1
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    
    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => renderFrame(frameIndex));
});

// Smooth Scroll Reveal Animation
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });
        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }
}

// Active Nav Link Spy on Scroll
function initNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 180;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function init() {
    initScrollReveal();
    initNavSpy();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

