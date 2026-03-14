import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../../pages/SliderLanding.css';

const sliderData = [
    {
        location: 'Global Operations',
        title1: 'CRISIS',
        title2: 'RESPONSE',
        desc: 'Mobilize emergency relief teams instantly. HelpHive coordinates volunteers and vital supplies where they are needed most, the moment disaster strikes.',
        img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop'
    },
    {
        location: 'Community Support',
        title1: 'VOLUNTEER',
        title2: 'NETWORK',
        desc: 'Empower a global community. Scale your workforce efficiently by matching skilled volunteers with high-impact community drives and local events.',
        img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop'
    },
    {
        location: 'Supply Chain',
        title1: 'RESOURCE',
        title2: 'INVENTORY',
        desc: 'Eliminate waste and shortages. Track real-time inventories of food, medicine, and critical supplies across all your distribution warehouses.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop'
    },
    {
        location: 'Medical Outreach',
        title1: 'HEALTHCARE',
        title2: 'INITIATIVES',
        desc: 'Deploy medical professionals efficiently. Manage triage centers and vaccination drives with precise geospatial coordination for maximum impact.',
        img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop'
    },
    {
        location: 'Event Management',
        title1: 'COORDINATION',
        title2: 'CENTERS',
        desc: 'From massive fundraising galas to grassroots neighborhood cleanups, plan every detail and assign team leads directly from the command dashboard.',
        img: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop'
    },
    {
        location: 'United Vision',
        title1: 'EMPOWERING',
        title2: 'HUMANITY',
        desc: 'Join thousands of NGOs already using HelpHive to streamline their operations, reduce administrative overhead, and save more lives globally.',
        img: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop'
    }
];

export default function HeroSlider() {
    const appRef = useRef(null);
    const backgroundsContainerRef = useRef(null);
    const cardStackRef = useRef(null);

    // Text Refs
    const locationTextRef = useRef(null);
    const titleLine1Ref = useRef(null);
    const titleLine2Ref = useRef(null);
    const descRef = useRef(null);
    const slideNumRef = useRef(null);

    // Use REF instead of STATE to avoid re-renders that destroy GSAP DOM
    const currentIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const autoPlayTimerRef = useRef(null);
    const AUTO_PLAY_DURATION = 6000;

    const startAutoPlay = () => {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);

        // Keep logical 6s autoplay without visual progress bar
        autoPlayTimerRef.current = setTimeout(() => {
            handleChangeSlide('next');
        }, AUTO_PLAY_DURATION);
    };

    const updateCardPositions = (duration = 0.8) => {
        if (!cardStackRef.current) return;
        const cards = Array.from(cardStackRef.current.children);
        cards.forEach((card, i) => {
            gsap.to(card, {
                x: i * 110,
                duration: duration,
                ease: "sine.inOut"
            });
        });
    };

    const updateText = (nextIndex) => {
        const item = sliderData[nextIndex];
        if (!locationTextRef.current) return;

        const tln = gsap.timeline();
        const targets = [locationTextRef.current.closest('.location-text'),
                         titleLine1Ref.current, titleLine2Ref.current,
                         descRef.current,
                         descRef.current?.closest('.desc-wrapper')?.nextElementSibling];

        const validTargets = targets.filter(Boolean);

        tln.to(validTargets, {
            y: -40, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.in",
            onComplete: () => {
                if (locationTextRef.current) locationTextRef.current.innerText = item.location;
                if (titleLine1Ref.current) titleLine1Ref.current.innerText = item.title1;
                if (titleLine2Ref.current) titleLine2Ref.current.innerText = item.title2;
                if (descRef.current) descRef.current.innerText = item.desc;
                gsap.set(validTargets, { y: 40 });
            }
        }).to(validTargets, {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out"
        });

        // Update numbers
        if (slideNumRef.current) {
            const numTl = gsap.timeline();
            numTl.to(slideNumRef.current, {
                y: -20, opacity: 0, duration: 0.3,
                onComplete: () => {
                    if (slideNumRef.current) {
                        slideNumRef.current.innerText = `0${nextIndex + 1}`;
                        gsap.set(slideNumRef.current, { y: 20 });
                    }
                }
            }).to(slideNumRef.current, { y: 0, opacity: 1, duration: 0.3 });
        }
    };

    const handleChangeSlide = (direction) => {
        if (isAnimatingRef.current) return;
        if (!backgroundsContainerRef.current || !cardStackRef.current) return;

        isAnimatingRef.current = true;

        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);

        const curIdx = currentIndexRef.current;
        const nextIndex = direction === 'next'
            ? (curIdx + 1) % sliderData.length
            : (curIdx - 1 + sliderData.length) % sliderData.length;

        const tln = gsap.timeline({
            onComplete: () => {
                isAnimatingRef.current = false;
                currentIndexRef.current = nextIndex;
                startAutoPlay();
            }
        });

        const bgs = backgroundsContainerRef.current.children;
        const oldBg = bgs[curIdx];
        const newBg = bgs[nextIndex];

        if (!oldBg || !newBg) {
            isAnimatingRef.current = false;
            startAutoPlay();
            return;
        }

        if (direction === 'next') {
            const targetCard = cardStackRef.current.querySelector(`.slider-card[data-index="${nextIndex}"]`);

            if (targetCard && appRef.current) {
                const appRect = appRef.current.getBoundingClientRect();
                const rect = targetCard.getBoundingClientRect();
                const clipTop = rect.top - appRect.top;
                const clipLeft = rect.left - appRect.left;
                const clipRight = appRect.right - rect.right;
                const clipBottom = appRect.bottom - rect.bottom;

                newBg.style.display = 'block';
                gsap.set(newBg, {
                    zIndex: 3, opacity: 1,
                    clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round 12px)`
                });

                gsap.set(targetCard, { opacity: 0 });

                tln.to(newBg, { clipPath: `inset(0px 0px 0px 0px round 0px)`, duration: 1.2, ease: "sine.inOut" }, 0);
                tln.to(oldBg, { scale: 1.1, opacity: 0, duration: 1.2, ease: "sine.inOut" }, 0);

                // Create the old slide's card and append
                const oldCardDiv = document.createElement('div');
                oldCardDiv.className = 'slider-card';
                oldCardDiv.dataset.index = curIdx;
                oldCardDiv.innerHTML = `
                    <img class="card-img" src="${sliderData[curIdx].img}" alt="">
                    <div class="card-content">
                        <div class="card-location">${sliderData[curIdx].location}</div>
                        <div class="card-title">${sliderData[curIdx].title1}</div>
                    </div>
                `;
                cardStackRef.current.appendChild(oldCardDiv);

                gsap.set(oldCardDiv, {
                    x: (cardStackRef.current.children.length - 1) * 110 + 30,
                    y: 0, opacity: 0, scale: 0.9
                });

                tln.to(oldCardDiv, {
                    x: (cardStackRef.current.children.length - 2) * 110,
                    scale: 1, opacity: 1, duration: 1, ease: "sine.inOut"
                }, 0.2);

                tln.call(() => {
                    targetCard.remove();
                    oldBg.style.display = 'none';
                    gsap.set(oldBg, { scale: 1, opacity: 1, zIndex: 1, clearProps: "clipPath" });
                    gsap.set(newBg, { zIndex: 2, clearProps: "clipPath" });
                    updateCardPositions(0);
                }, null, 1.2);
            } else {
                // Fallback: no card found, just crossfade
                newBg.style.display = 'block';
                gsap.set(newBg, { opacity: 0, zIndex: 3 });
                tln.to(newBg, { opacity: 1, duration: 1, ease: 'sine.inOut' }, 0);
                tln.to(oldBg, { opacity: 0, duration: 1, ease: 'sine.inOut' }, 0);
                tln.call(() => {
                    oldBg.style.display = 'none';
                    gsap.set(oldBg, { opacity: 1, zIndex: 1 });
                    gsap.set(newBg, { zIndex: 2 });
                }, null, 1);
            }
        } else {
            // Prev Logic
            newBg.style.display = 'block';
            gsap.set(newBg, { opacity: 0, zIndex: 3, scale: 1.05 });
            tln.to(newBg, { opacity: 1, scale: 1, duration: 1, ease: 'sine.inOut' }, 0);
            tln.to(oldBg, { opacity: 0, duration: 1, ease: 'sine.inOut' }, 0);

            if (cardStackRef.current.children.length > 0) {
                const lastCard = cardStackRef.current.lastElementChild;
                cardStackRef.current.insertBefore(lastCard, cardStackRef.current.firstChild);
            }
            updateCardPositions(0.8);

            tln.call(() => {
                oldBg.style.display = 'none';
                gsap.set(oldBg, { opacity: 1, zIndex: 1 });
                gsap.set(newBg, { zIndex: 2 });
            }, null, 1);
        }

        updateText(nextIndex);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Position cards
            const cards = Array.from(cardStackRef.current?.children || []);
            cards.forEach((card, i) => {
                gsap.set(card, { x: i * 110 });
            });

            // Initial Play Animation
            const tl = gsap.timeline({
                onComplete: startAutoPlay
            });

            gsap.set('.hero-content > div', { y: 50, opacity: 0 });
            gsap.set('.slider-card', { y: 100, opacity: 0 });
            gsap.set('.pagination-controls', { opacity: 0, x: -20 });

            tl.to('.page-cover', { xPercent: -100, duration: 1.2, ease: "power3.inOut" })
              .to('.hero-content > div', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "-=0.6")
              .to('.pagination-controls', { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
              .to('.slider-card', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "-=0.8");

        }, appRef);

        return () => {
            ctx.revert();
            if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        };
    }, []);

    return (
        <div ref={appRef} className="slider-app-container relative">
            <div className="page-cover"></div>

            <main className="slider-app">
                {/* Background images — rendered once, never re-rendered */}
                <div className="backgrounds-container" ref={backgroundsContainerRef}>
                    {sliderData.map((slide, idx) => (
                        <div
                            key={`bg-${idx}`}
                            className={`bg-img ${idx === 0 ? 'active' : ''}`}
                            data-index={idx}
                            style={{
                                backgroundImage: `url(${slide.img})`,
                                display: idx === 0 ? 'block' : 'none',
                                opacity: idx === 0 ? 1 : 0,
                                zIndex: idx === 0 ? 2 : 1
                            }}
                        />
                    ))}
                </div>

                <div className="hero-content">
                    <div className="location-wrapper">
                        <p className="location-text">
                            <svg className="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span className="val" ref={locationTextRef}>{sliderData[0].location}</span>
                        </p>
                    </div>

                    <div className="title-wrapper">
                        <h1 className="title">
                            <div className="title-line" ref={titleLine1Ref}>{sliderData[0].title1}</div>
                            <div className="title-line" ref={titleLine2Ref}>{sliderData[0].title2}</div>
                        </h1>
                    </div>

                    <div className="desc-wrapper">
                        <p className="description" ref={descRef}>{sliderData[0].desc}</p>
                    </div>

                    <div className="actions-wrapper">
                        <button className="slider-btn btn-icon cursor-pointer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                        <button className="slider-btn btn-outline cursor-pointer">Learn More</button>
                    </div>
                </div>

                {/* Card stack — rendered once with static indices, GSAP manages DOM after */}
                <div className="cards-container">
                    <div className="card-stack" ref={cardStackRef}>
                        {sliderData.slice(1).map((slide, idx) => (
                            <div key={`card-${idx + 1}`} className="slider-card" data-index={idx + 1}>
                                <img className="card-img" src={slide.img} alt={slide.title1} />
                                <div className="card-content">
                                    <div className="card-location">{slide.location}</div>
                                    <div className="card-title">{slide.title1}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pagination-controls">
                    <div className="controls-left">
                        <button className="nav-arrow prev cursor-pointer" onClick={() => handleChangeSlide('prev')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                        <button className="nav-arrow next cursor-pointer" onClick={() => handleChangeSlide('next')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>
                    <div className="controls-right">
                        <div className="slide-numbers">
                            <span className="current" ref={slideNumRef}>01</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
