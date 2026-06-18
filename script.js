/* =============================================
   Portfolio — Apple.com-style Animations
   Minimal, smooth, elegant
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    'use strict';

    // =============================================
    // ELEMENTS
    // =============================================
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const statNumbers = document.querySelectorAll('.stat-number');
    const aosElements = document.querySelectorAll('[data-aos]');
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');

    let statsAnimated = false;
    let isMenuOpen = false;


    // =============================================
    // 1) SMOOTH SCROLL — ease-out
    // =============================================
    function smoothScroll(targetY, duration = 800) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        let startTime = null;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            window.scrollTo(0, startY + diff * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
                smoothScroll(targetPosition, 900);
            }
        });
    });


    // =============================================
    // 2) INTERSECTION OBSERVER — fade-in-up
    // =============================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-aos-delay')) || 0;
                    const duration = parseInt(el.getAttribute('data-aos-duration')) || 600;

                    el.style.setProperty('--aos-delay', `${delay}ms`);
                    el.style.setProperty('--aos-duration', `${duration}ms`);

                    setTimeout(() => {
                        el.classList.add('aos-animate');
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        aosElements.forEach(el => observer.observe(el));
    }

    initScrollAnimations();


    // =============================================
    // 3) PARALLAX — subtle hero depth
    // =============================================
    function initHeroParallax() {
        if (!heroBg) return;

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const heroHeight = hero ? hero.offsetHeight : 0;

            if (scrollY <= heroHeight) {
                heroBg.style.transform = `translateY(${scrollY * 0.15}px)`;
                heroBg.style.opacity = 1 - (scrollY / heroHeight) * 0.4;
            }
        }, { passive: true });

        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset;
                scrollIndicator.style.opacity = scrollY > 200 ? '0' : String(1 - scrollY / 200);
                scrollIndicator.style.pointerEvents = scrollY > 200 ? 'none' : '';
            }, { passive: true });
        }
    }

    initHeroParallax();


    // =============================================
    // 4) NAVBAR — progressive blur on scroll
    // =============================================
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const progress = Math.min(currentScroll / 200, 1);

        // Progressive: 10px → 40px blur, 0.6 → 0.95 opacity
        navbar.style.setProperty('--nav-blur', `${10 + progress * 30}px`);
        navbar.style.setProperty('--nav-bg-opacity', `${0.6 + progress * 0.35}`);

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        updateActiveNavLink();
    }, { passive: true });


    // =============================================
    // 5) SMOOTH COUNTER ANIMATIONS — ease-out
    // =============================================
    function animateCounters() {
        if (statsAnimated) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statsAnimated = true;

                    statNumbers.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-count'));
                        const duration = 2000;
                        const startTime = performance.now();

                        function updateCounter(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            counter.textContent = Math.floor(eased * target);

                            if (progress < 1) {
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target;
                            }
                        }

                        requestAnimationFrame(updateCounter);
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) observer.observe(heroStats);
    }

    animateCounters();


    // =============================================
    // 6) FORM VALIDATION — clean states
    // =============================================
    if (contactForm) {
        const formInputs = contactForm.querySelectorAll('input, textarea, select');

        formInputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('field-error')) {
                    validateField(input);
                }
                // Re-establish success styling as user types valid content
                if (input.value.trim() && !input.classList.contains('field-error')) {
                    const fg = input.closest('.form-group');
                    const existing = fg?.querySelector('.field-error-message');
                    if (existing) existing.remove();
                    input.classList.add('field-success');
                }
                if (!input.value.trim() && input.classList.contains('field-success')) {
                    if (!input.required) {
                        input.classList.remove('field-success');
                    }
                }
            });
        });

        function validateField(field) {
            const fieldGroup = field.closest('.form-group');
            if (!fieldGroup) return true;

            const existingError = fieldGroup.querySelector('.field-error-message');
            if (existingError) existingError.remove();

            field.classList.remove('field-error', 'field-success');

            if (field.required && !field.value.trim()) {
                field.classList.add('field-error');
                const errorMsg = document.createElement('span');
                errorMsg.className = 'field-error-message';
                errorMsg.textContent = 'This field is required';
                fieldGroup.appendChild(errorMsg);
                return false;
            }

            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    field.classList.add('field-error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'field-error-message';
                    errorMsg.textContent = 'Please enter a valid email';
                    fieldGroup.appendChild(errorMsg);
                    return false;
                }
            }

            if (field.type === 'tel' && field.value.trim()) {
                const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
                if (!phoneRegex.test(field.value.trim())) {
                    field.classList.add('field-error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'field-error-message';
                    errorMsg.textContent = 'Please enter a valid phone number';
                    fieldGroup.appendChild(errorMsg);
                    return false;
                }
            }

            if (field.value.trim()) {
                field.classList.add('field-success');
            }

            return true;
        }

        function validateForm() {
            let isValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) isValid = false;
            });
            return isValid;
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                const firstError = contactForm.querySelector('.field-error');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalContent = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-loading-spinner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                    </svg>
                </span>
                <span>Sending...</span>
            `;

            await new Promise(r => setTimeout(r, 400));

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            try {
                const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    contactForm.style.opacity = '0';
                    contactForm.style.transform = 'translateY(-10px)';

                    setTimeout(() => {
                        contactForm.classList.add('hidden');
                        contactForm.style.opacity = '';
                        contactForm.style.transform = '';
                        formSuccess.classList.add('show');
                        formSuccess.style.animation = 'successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

                        setTimeout(() => {
                            formSuccess.style.animation = '';
                            formSuccess.classList.remove('show');
                            contactForm.reset();
                            contactForm.classList.remove('hidden');
                            formInputs.forEach(input => {
                                input.classList.remove('field-error', 'field-success');
                                const msg = input.closest('.form-group')?.querySelector('.field-error-message');
                                if (msg) msg.remove();
                            });
                        }, 8000);
                    }, 400);
                } else {
                    throw new Error('Failed to send message. Please try again.');
                }
            } catch (error) {
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed — Try Again';

                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.innerHTML = originalContent;
                }, 3000);

                if (!navigator.onLine) {
                    alert('No internet connection. Please check your connection and try again.');
                }
            } finally {
                setTimeout(() => {
                    if (!submitBtn.dataset.errorLock) {
                        submitBtn.disabled = false;
                    }
                }, 500);
            }
        });
    }


    // =============================================
    // MOBILE MENU
    // =============================================
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        let overlay = document.querySelector('.nav-overlay');
        if (isMenuOpen) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'nav-overlay';
                document.body.appendChild(overlay);
            }
            requestAnimationFrame(() => overlay.classList.add('active'));
        } else {
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
        }
    }

    function closeMenu() {
        if (!isMenuOpen) return;
        isMenuOpen = false;
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';

        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) closeMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMenu();
        }
    });


    // =============================================
    // ACTIVE NAV LINK
    // =============================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }


    // =============================================
    // KEYBOARD NAVIGATION
    // =============================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });


    // =============================================
    // CONSOLE EASTER EGG
    // =============================================
    console.log('%c Ryan Hadi — AI Automation Specialist ',
        'background: #FFFFFF; color: #0A0A0B; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
    );
    console.log('%c Hire me on Fiverr: https://www.fiverr.com/ryanhadi_ai ',
        'color: #A1A1AA; font-size: 12px;'
    );

});
