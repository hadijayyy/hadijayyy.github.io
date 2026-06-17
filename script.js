/* =============================================
   AI Automation Agency - Main JavaScript
   Linear.app-inspired enhanced interactions
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
    const codeCard = document.querySelector('.hero-code-card');
    const codeBody = document.querySelector('.code-body code');
    const heroActions = document.querySelector('.hero-actions');
    const allButtons = document.querySelectorAll('.btn:not(.btn-submit)');

    let statsAnimated = false;
    let isMenuOpen = false;


    // =============================================
    // 1) SMOOTH SCROLL WITH EASING
    // =============================================
    // Custom smooth scroll with easeInOutCubic easing
    function smoothScroll(targetY, duration = 800) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            window.scrollTo(0, startY + diff * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Override existing smooth scroll with custom easing
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
    // 2) ENHANCED INTERSECTION OBSERVER
    //    WITH DIRECTIONAL FADE ANIMATIONS
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

                    // Set custom properties for staggered animation
                    el.style.setProperty('--aos-delay', `${delay}ms`);
                    el.style.setProperty('--aos-duration', `${duration}ms`);

                    // Add animate class with a small delay for staggered effect
                    setTimeout(() => {
                        el.classList.add('aos-animate');
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        aosElements.forEach(el => observer.observe(el));

        // Also observe all sections for section transitions
        const sections = document.querySelectorAll('section');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        sections.forEach(section => sectionObserver.observe(section));
    }

    initScrollAnimations();


    // =============================================
    // 3) ANIMATED COUNTERS WITH EASING
    // =============================================
    function animateCounters() {
        if (statsAnimated) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statsAnimated = true;

                    statNumbers.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-count'));
                        const duration = 2200;
                        const startTime = performance.now();

                        function updateCounter(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            // Ease out quart — smoother deceleration
                            const eased = 1 - Math.pow(1 - progress, 4);
                            const current = Math.floor(eased * target);

                            counter.textContent = current;
                            // Add a subtle scale pulse on the stat's parent item
                            const statItem = counter.closest('.stat-item');
                            if (statItem) {
                                statItem.style.transform = `scale(${1 + (1 - eased) * 0.02})`;
                            }

                            if (progress < 1) {
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target;
                                if (statItem) {
                                    statItem.style.transform = 'scale(1)';
                                }
                            }
                        }

                        requestAnimationFrame(updateCounter);
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }

    animateCounters();


    // =============================================
    // 4) MAGNETIC BUTTON HOVER EFFECTS
    // =============================================
    function initMagneticButtons() {
        allButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Calculate distance from center (normalized -1 to 1)
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;

                // Magnetic pull: move button slightly toward cursor
                const pullX = deltaX * 8;
                const pullY = deltaY * 8;

                btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
                btn.style.transition = 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            });
        });
    }

    initMagneticButtons();


    // =============================================
    // 5) ENHANCED FORM WITH VALIDATION & STATES
    // =============================================
    if (contactForm) {
        // Real-time validation styling
        const formInputs = contactForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            input.addEventListener('input', () => {
                if (input.classList.contains('field-error')) {
                    validateField(input);
                }
            });
        });

        function validateField(field) {
            const fieldGroup = field.closest('.form-group');
            if (!fieldGroup) return true;

            // Remove existing error
            const existingError = fieldGroup.querySelector('.field-error-message');
            if (existingError) existingError.remove();

            field.classList.remove('field-error', 'field-success');

            if (field.required && !field.value.trim()) {
                field.classList.add('field-error');
                const errorMsg = document.createElement('span');
                errorMsg.className = 'field-error-message';
                errorMsg.textContent = 'Bidang ini harus diisi';
                fieldGroup.appendChild(errorMsg);
                return false;
            }

            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    field.classList.add('field-error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'field-error-message';
                    errorMsg.textContent = 'Format email tidak valid';
                    fieldGroup.appendChild(errorMsg);
                    return false;
                }
            }

            if (field.type === 'tel' && field.value.trim()) {
                const phoneRegex = /^[\d\s\-\+\ \(\)]{7,20}$/;
                if (!phoneRegex.test(field.value.trim())) {
                    field.classList.add('field-error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'field-error-message';
                    errorMsg.textContent = 'Format nomor telepon tidak valid';
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
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            return isValid;
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields
            if (!validateForm()) {
                // Scroll to first error
                const firstError = contactForm.querySelector('.field-error');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalContent = submitBtn.innerHTML;

            // Animated loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-loading-spinner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                    </svg>
                </span>
                <span>Mengirim...</span>
            `;

            // Slight delay for UX polish
            await new Promise(r => setTimeout(r, 400));

            // Collect form data
            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            try {
                // Send to Formspree
                // Replace YOUR_FORMSPREE_ID with your actual Formspree form ID
                // Get one at: https://formspree.io
                const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Smooth transition to success state
                    contactForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    contactForm.style.opacity = '0';
                    contactForm.style.transform = 'translateY(-10px)';

                    setTimeout(() => {
                        contactForm.classList.add('hidden');
                        contactForm.style.opacity = '';
                        contactForm.style.transform = '';
                        formSuccess.classList.add('show');
                        formSuccess.style.animation = 'successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

                        // Reset form after delay
                        setTimeout(() => {
                            formSuccess.style.animation = '';
                            formSuccess.classList.remove('show');
                            contactForm.reset();
                            contactForm.classList.remove('hidden');
                            // Clear validation styles
                            formInputs.forEach(input => {
                                input.classList.remove('field-error', 'field-success');
                                const msg = input.closest('.form-group')?.querySelector('.field-error-message');
                                if (msg) msg.remove();
                            });
                        }, 8000);
                    }, 400);
                } else {
                    throw new Error('Gagal mengirim pesan. Silakan coba lagi.');
                }
            } catch (error) {
                // Animated error state on button
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal — Coba Lagi';

                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.innerHTML = originalContent;
                }, 3000);

                // Also show alert for network errors
                if (!navigator.onLine) {
                    alert('Tidak ada koneksi internet. Silakan periksa koneksi Anda dan coba lagi.');
                }
            } finally {
                // Re-enable after a moment (unless in error state)
                setTimeout(() => {
                    if (!submitBtn.dataset.errorLock) {
                        submitBtn.disabled = false;
                    }
                }, 500);
            }
        });
    }


    // =============================================
    // 6) MOBILE MENU SLIDE ANIMATION
    // =============================================
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        // Create or remove overlay
        let overlay = document.querySelector('.nav-overlay');
        if (isMenuOpen) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'nav-overlay';
                document.body.appendChild(overlay);
            }
            // Trigger animation on next frame
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        } else {
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
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
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) closeMenu();
        });
    });

    // Close menu on outside click (uses overlay now, but keep as fallback)
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMenu();
        }
    });


    // =============================================
    // 7) NAVBAR BACKGROUND BLUR ON SCROLL
    // =============================================
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Dynamic blur intensity based on scroll depth
        const blurIntensity = Math.min(currentScroll / 300, 1);
        const blurValue = 20 + blurIntensity * 20; // 20px to 40px blur
        const opacity = 0.85 + blurIntensity * 0.12; // 0.85 to 0.97 opacity

        navbar.style.setProperty('--nav-blur', `${blurValue}px`);
        navbar.style.setProperty('--nav-bg-opacity', opacity);

        // Update active nav link
        updateActiveNavLink();

        lastScroll = currentScroll;
    }, { passive: true });


    // =============================================
    // 8) CODE CARD TYPING ANIMATION
    // =============================================
    function initCodeTyping() {
        if (!codeBody) return;

        const originalCode = codeBody.textContent || '';
        // Don't animate if code is very short
        if (originalCode.length < 20) return;

        // Clear the code so we can type it
        codeBody.textContent = '';
        codeBody.style.visibility = 'visible';

        const lines = originalCode.split('\n');
        let currentLineIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let isComplete = false;

        // Store original HTML structure for syntax highlighting
        const originalHTML = codeBody.innerHTML;

        function typeCode() {
            if (currentLineIndex >= lines.length) {
                isComplete = true;
                // Restore original highlighted HTML after typing
                setTimeout(() => {
                    codeBody.innerHTML = originalHTML;
                    codeBody.style.borderRight = 'none';
                }, 600);
                return;
            }

            const currentLine = lines[currentLineIndex];
            const isLastLine = currentLineIndex === lines.length - 1;

            // Build visible text up to current char
            let displayText = '';
            for (let i = 0; i <= currentLineIndex; i++) {
                if (i < currentLineIndex) {
                    displayText += lines[i] + '\n';
                } else {
                    displayText += lines[i].substring(0, currentCharIndex);
                }
            }

            // Use a monospace plain-text representation during typing
            codeBody.textContent = displayText;
            codeBody.style.borderRight = '2px solid var(--text-secondary)';

            // Advance
            if (currentCharIndex < currentLine.length) {
                currentCharIndex++;
                const delay = 15 + Math.random() * 25; // 15-40ms per char
                setTimeout(typeCode, delay);
            } else {
                // Line complete
                currentCharIndex = 0;
                currentLineIndex++;
                const lineDelay = isLastLine ? 300 : 120 + Math.random() * 180;
                setTimeout(typeCode, lineDelay);
            }
        }

        // Start typing when hero section is visible
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isComplete) {
                    // Small delay before starting
                    setTimeout(typeCode, 800);
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        heroObserver.observe(hero);
    }

    initCodeTyping();


    // =============================================
    // 9) SCROLL PROGRESS INDICATOR
    // =============================================
    function initScrollProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
        document.body.appendChild(progressBar);

        const fill = progressBar.querySelector('.scroll-progress-fill');

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            fill.style.transform = `scaleX(${scrollPercent / 100})`;

            // Update aria-valuenow for accessibility
            fill.setAttribute('aria-valuenow', Math.round(scrollPercent));
        }, { passive: true });
    }

    initScrollProgress();


    // =============================================
    // 10) SMOOTH SECTION TRANSITIONS
    // =============================================
    function initSectionTransitions() {
        // Add section-wrapper class to all sections for smooth appearance
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('section-transition');
        });

        // Parallax on hero background
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset;
                const heroHeight = hero ? hero.offsetHeight : 0;

                if (scrollY <= heroHeight) {
                    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
                    heroBg.style.opacity = 1 - (scrollY / heroHeight) * 0.5;
                }
            }, { passive: true });
        }

        // Scroll indicator fade
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset;
                if (scrollY > 200) {
                    scrollIndicator.style.opacity = '0';
                    scrollIndicator.style.pointerEvents = 'none';
                } else {
                    scrollIndicator.style.opacity = String(1 - scrollY / 200);
                    scrollIndicator.style.pointerEvents = scrollY > 200 ? 'none' : '';
                }
            }, { passive: true });
        }
    }

    initSectionTransitions();


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
    // ADDITIONAL ENHANCEMENTS
    // =============================================

    // --- Parallax Code Card (preserve existing tilt) ---
    if (codeCard) {
        codeCard.addEventListener('mousemove', (e) => {
            const rect = codeCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            codeCard.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });

        codeCard.addEventListener('mouseleave', () => {
            codeCard.style.transform =
                'perspective(1000px) rotateY(-5deg) rotateX(2deg) translateZ(0)';
        });
    }


    // =============================================
    // KEYBOARD NAVIGATION (Escape closes menu)
    // =============================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });


    // =============================================
    // CONSOLE EASTER EGG
    // =============================================
    console.log('%c AI Automation Agency ',
        'background: #FFFFFF; color: #0A0A0B; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
    );
    console.log('%c Tertarik collaborate? Hubungi kami di hello@aiautomation.id ',
        'color: #A1A1AA; font-size: 12px;'
    );

});
