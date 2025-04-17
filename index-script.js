document.addEventListener('DOMContentLoaded', function() {
    let isNavigating = false;

    // Handle mobile menu
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.hamburger') && !event.target.closest('.nav-buttons')) {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });

    // Inspirational quotes
    const quotes = [
        { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
        { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
        { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
        { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" }
    ];

    // Update quote randomly with fade effect
    function updateQuote() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (quoteText && quoteAuthor) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            // Add fade-out effect
            quoteText.style.opacity = 0;
            quoteAuthor.style.opacity = 0;

            setTimeout(() => {
                quoteText.textContent = randomQuote.text;
                quoteAuthor.textContent = "- " + randomQuote.author;
                
                // Add fade-in effect
                quoteText.style.opacity = 1;
                quoteAuthor.style.opacity = 1;
            }, 500);
        }
    }

    // Update quote on page load and every 10 seconds
    updateQuote();
    setInterval(updateQuote, 10000);

    // Handle navigation and hero buttons using data-href
    function handleButtonClick(button, event) {
        event.preventDefault(); // Prevent the default action of the click
        const href = button.dataset.href;
        if (href && !isNavigating) {
            isNavigating = true;
            history.pushState({page: href}, '', href);
            // Dispatch a custom event to handle the navigation if needed
            document.dispatchEvent(new CustomEvent('navigate', { detail: { href: href } }));
        }
    }

    // Add click handlers to nav buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            handleButtonClick(this, event);
        });
    });

    // Add click handlers to hero buttons
    document.querySelectorAll('.hero-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            handleButtonClick(this, event);
        });
    });

    // Listen for the custom 'navigate' event to handle navigation logic
    document.addEventListener('navigate', function(event) {
        // Here you can add logic to load content or change the state of the page
        // without a full reload if you're going for an SPA-like behavior
        console.log('Navigating to:', event.detail.href);
        // Reset the navigation flag after handling the navigation
        isNavigating = false;
    });

    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add touch event handlers for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && navMenu.classList.contains('active')) {
                // Swipe right, close menu
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }, 250);
    });

    // Optional: Add loading state to buttons
    function addLoadingState(button) {
        button.classList.add('loading');
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        return originalText;
    }

    function removeLoadingState(button, originalText) {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = originalText;
    }

    // Optional: Handle button loading states
    document.querySelectorAll('.nav-btn, .hero-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            const originalText = addLoadingState(this);
            setTimeout(() => {
                removeLoadingState(this, originalText);
                handleButtonClick(this, event);
            }, 500);
        });
    });

    // Reset the flag when the page loads
    isNavigating = false;
});
