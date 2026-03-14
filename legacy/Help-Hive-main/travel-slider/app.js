const data = [
    {
        location: 'Core Platform',
        title1: 'INTELLIGENT',
        title2: 'DASHBOARD',
        desc: 'Real-time insights into your organization\'s performance with our beautiful, glassmorphic analytics overview.',
        img: 'assets/slide1.png'
    },
    {
        location: 'Mission Control',
        title1: 'CENTRAL',
        title2: 'COMMAND',
        desc: 'A seamless workspace designed for NGO administrators to manage resources, alerts, and active campaigns efficiently.',
        img: 'assets/slide2.png'
    },
    {
        location: 'Network',
        title1: 'VOLUNTEER',
        title2: 'MANAGEMENT',
        desc: 'Track skills, availability, and engagement for thousands of dedicated volunteers across multiple locations.',
        img: 'assets/slide3.png'
    },
    {
        location: 'Operations',
        title1: 'EVENT',
        title2: 'COORDINATION',
        desc: 'Plan, dispatch, and monitor humanitarian events and relief drives with precise location tracking.',
        img: 'assets/slide4.png'
    },
    {
        location: 'Ecosystem',
        title1: 'POWERFUL',
        title2: 'FEATURES',
        desc: 'Everything your organization needs to stay organized, from inventory tracking to automated volunteer assignment.',
        img: 'assets/slide5.png'
    },
    {
        location: 'Global Reach',
        title1: 'CRISIS',
        title2: 'RESPONSE',
        desc: 'Fast and effective tools for coordinating responses to natural disasters and humanitarian crises around the world.',
        img: 'assets/slide6.png'
    }
];

// DOM Elements
const backgroundsContainer = document.querySelector('.backgrounds-container');
const cardStack = document.querySelector('.card-stack');
const locationText = document.querySelector('.location-text .val');
const titleLine1 = document.querySelectorAll('.title-line')[0];
const titleLine2 = document.querySelectorAll('.title-line')[1];
const description = document.querySelector('.description');
const currentSlideNum = document.querySelector('.slide-numbers .current');
const progressBar = document.querySelector('.progress-bar');
const nextBtn = document.querySelector('.nav-arrow.next');
const prevBtn = document.querySelector('.nav-arrow.prev');

// State
let currentIndex = 0;
let isAnimating = false;
let autoPlayTimer;
const AUTO_PLAY_DURATION = 6000; // 6 seconds per slide

// Initialize DOM based on data
function init() {
    // Inject backgrounds
    backgroundsContainer.innerHTML = '';
    data.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `bg-img ${index === 0 ? 'active' : ''}`;
        div.style.backgroundImage = `url('${item.img}')`;
        div.dataset.index = index;
        if(index !== 0) {
            div.style.opacity = 0;
            div.style.zIndex = 1;
        } else {
            div.style.opacity = 1;
            div.style.zIndex = 2;
        }
        backgroundsContainer.appendChild(div);
    });

    // Inject cards (skipping the first one as it is the current active full screen)
    cardStack.innerHTML = '';
    for(let i = 1; i < data.length; i++) {
        createCard(i);
    }
    
    // Position cards initially
    updateCardPositions(0);

    // Initial Loading Animation
    playLoadAnimation();
}

function createCard(index) {
    const item = data[index];
    const card = document.createElement('div');
    card.className = 'slider-card';
    card.dataset.index = index;
    
    card.innerHTML = `
        <img src="${item.img}" alt="${item.title1}">
        <div class="card-content">
            <div class="card-location">${item.location}</div>
            <div class="card-title">${item.title1}</div>
        </div>
    `;
    cardStack.appendChild(card);
}

function updateCardPositions(duration = 0.8) {
    const cards = document.querySelectorAll('.slider-card');
    cards.forEach((card, i) => {
        gsap.to(card, {
            x: i * (200 + 40), // card width + gap
            duration: duration,
            ease: "sine.inOut"
        });
    });
}

// Initial Load Animation Sequence
function playLoadAnimation() {
    const tl = gsap.timeline({
        onComplete: startAutoPlay
    });

    gsap.set('.navbar', { y: -100 });
    gsap.set('.hero-content > div', { y: 50, opacity: 0 });
    gsap.set('.slider-card', { y: 100, opacity: 0 });
    gsap.set('.pagination-controls', { opacity: 0, x: -20 });

    tl.to('.page-cover', {
        xPercent: -100,
        duration: 1.2,
        ease: "power3.inOut"
    })
    .to('.navbar', {
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.5")
    .to('.hero-content > div', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    }, "-=0.6")
    .to('.pagination-controls', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.6")
    .to('.slider-card', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    }, "-=0.8");
}

function startAutoPlay() {
    if(autoPlayTimer) autoPlayTimer.kill();
    
    gsap.set(progressBar, { width: "0%" });
    autoPlayTimer = gsap.to(progressBar, {
        width: "100%",
        duration: AUTO_PLAY_DURATION / 1000,
        ease: "none",
        onComplete: () => {
            handleNext();
        }
    });
}

function updateText(index) {
    const item = data[index];
    const tln = gsap.timeline();

    // Slide titles up and out
    tln.to(['.location-text', '.title-line', '.description', '.actions-wrapper'], {
        y: -40,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
            // Update content
            locationText.innerText = item.location;
            titleLine1.innerText = item.title1;
            titleLine2.innerText = item.title2;
            description.innerText = item.desc;
            
            // Set position down for incoming animation
            gsap.set(['.location-text', '.title-line', '.description', '.actions-wrapper'], { y: 40 });
        }
    })
    // Slide titles up and in
    .to(['.location-text', '.title-line', '.description', '.actions-wrapper'], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
    });

    // Update numbers
    const numTl = gsap.timeline();
    numTl.to('.slide-numbers .current', {
        y: -20,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            currentSlideNum.innerText = `0${index + 1}`;
            gsap.set('.slide-numbers .current', { y: 20 });
        }
    }).to('.slide-numbers .current', {
        y: 0,
        opacity: 1,
        duration: 0.3
    });
}

function changeSlide(direction) {
    if(isAnimating) return;
    isAnimating = true;
    
    if(autoPlayTimer) autoPlayTimer.kill();
    gsap.set(progressBar, { width: "0%" });

    const prevIndex = currentIndex;
    
    if(direction === 'next') {
        currentIndex = (currentIndex + 1) % data.length;
    } else {
        currentIndex = (currentIndex - 1 + data.length) % data.length;
    }

    const tln = gsap.timeline({
        onComplete: () => {
            isAnimating = false;
            startAutoPlay();
        }
    });

    const bgs = document.querySelectorAll('.bg-img');
    const oldBg = bgs[prevIndex];
    const newBg = bgs[currentIndex];

    if(direction === 'next') {
        const targetCard = cardStack.querySelector(`.slider-card[data-index="${currentIndex}"]`);
        
        // Setup new background to match the exact size and position of the target card using clip-path
        const rect = targetCard.getBoundingClientRect();
        const clipTop = rect.top;
        const clipRight = window.innerWidth - rect.right;
        const clipBottom = window.innerHeight - rect.bottom;
        const clipLeft = rect.left;

        // Reset newBg to be fully visible but clipped to look like the card
        newBg.style.display = 'block';
        gsap.set(newBg, { 
            zIndex: 3, 
            opacity: 1,
            clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round 12px)`
        });

        // Hide the actual DOM card so the background can take its place visually
        gsap.set(targetCard, { opacity: 0 });

        // Phase 1: Expand new background to full screen
        tln.to(newBg, {
            clipPath: `inset(0px 0px 0px 0px round 0px)`,
            duration: 1.2,
            ease: "sine.inOut"
        }, 0);

        // Phase 1: Old background scales slightly and fades
        tln.to(oldBg, {
            scale: 1.1,
            opacity: 0,
            duration: 1.2,
            ease: "sine.inOut"
        }, 0);

        // Phase 2: Add the old background as a new card at the end of the stack
        const oldCardDiv = document.createElement('div');
        oldCardDiv.className = 'slider-card';
        oldCardDiv.dataset.index = prevIndex;
        oldCardDiv.innerHTML = `
            <img src="${data[prevIndex].img}" alt="">
            <div class="card-content">
                <div class="card-location">${data[prevIndex].location}</div>
                <div class="card-title">${data[prevIndex].title1}</div>
            </div>
        `;
        
        // Append it immediately so updateCardPositions accounts for it
        cardStack.appendChild(oldCardDiv);

        // Start it slightly off screen or faded for entry
        gsap.set(oldCardDiv, {
            x: (cardStack.children.length - 1) * 240 + 50, 
            y: 0,
            opacity: 0,
            scale: 0.9
        });

        tln.to(oldCardDiv, {
            x: (cardStack.children.length - 2) * 240, // Account for the hidden one being removed later
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "sine.inOut"
        }, 0.2);

        tln.call(() => {
            targetCard.remove(); 
            oldBg.style.display = 'none';
            oldBg.style.scale = 1;
            oldBg.style.opacity = 1;
            oldBg.style.zIndex = 1;
            newBg.style.zIndex = 2;
            newBg.style.clipPath = 'none';
            
            // Snap remaining cards to perfect positions
            updateCardPositions(0);
        }, null, 1.2);

    } else {
        // Simple prev implementation holding layout
        newBg.style.display = 'block';
        gsap.set(newBg, { opacity: 0, zIndex: 3, scale: 1.05 });
        tln.to(newBg, { opacity: 1, scale: 1, duration: 1, ease: 'sine.inOut'}, 0);
        tln.to(oldBg, { opacity: 0, duration: 1, ease: 'sine.inOut'}, 0);
        
        const cards = document.querySelectorAll('.slider-card');
        if(cards.length > 0) {
            const lastCard = cards[cards.length-1];
            cardStack.insertBefore(lastCard, cardStack.firstChild);
        }
        updateCardPositions(0.8);

        tln.call(() => {
            oldBg.style.display = 'none';
            oldBg.style.opacity = 1;
            oldBg.style.zIndex = 1;
            newBg.style.zIndex = 2;
        }, null, 1);
    }

    updateText(currentIndex);
}

function handleNext() {
    changeSlide('next');
}

function handlePrev() {
    changeSlide('prev');
}

nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);

// Start app
window.onload = init;
