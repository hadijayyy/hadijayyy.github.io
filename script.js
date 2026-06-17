/* =============================================
   AI Automation Agency - Main JavaScript
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

    let statsAnimated = false;
    let isMenuOpen = false;


    // =============================================
    // MOBILE MENU TOGGLE
    // =============================================
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    function closeMenu() {
        isMenuOpen = false;
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
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

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMenu();
        }
    });


    // =============================================
    // NAVBAR SCROLL EFFECT
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

        // Update active nav link
        updateActiveNavLink();

        lastScroll = currentScroll;
    }, { passive: true });


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
    // SMOOTH SCROLL (fallback for older browsers)
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });


    // =============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // =============================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        aosElements.forEach(el => observer.observe(el));
    }

    initScrollAnimations();


    // =============================================
    // ANIMATED COUNTERS
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

                            // Ease out cubic
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(eased * target);

                            counter.textContent = current;

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
        }, { threshold: 0.5 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }

    animateCounters();


    // =============================================
    // CONTACT FORM HANDLING (Formspree)
    // =============================================
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

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
                    // Show success message
                    contactForm.classList.add('hidden');
                    formSuccess.classList.add('show');

                    // Reset form for next time
                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.classList.remove('hidden');
                        formSuccess.classList.remove('show');
                    }, 8000);
                } else {
                    throw new Error('Gagal mengirim pesan. Silakan coba lagi.');
                }
            } catch (error) {
                alert(error.message || 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }


    // =============================================
    // PARALLAX CODE CARD (mouse tilt effect)
    // =============================================
    const codeCard = document.querySelector('.hero-code-card');

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
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        codeCard.addEventListener('mouseleave', () => {
            codeCard.style.transform =
                'perspective(1000px) rotateY(-5deg) rotateX(2deg)';
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
        'background: linear-gradient(135deg, #8b5cf6, #14b8a6); color: white; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
    );
    console.log('%c Tertarik collaborate? Hubungi kami di hello@aiautomation.id ',
        'color: #94a3b8; font-size: 12px;'
    );

});
