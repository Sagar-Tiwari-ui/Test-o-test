document.addEventListener('DOMContentLoaded', function() {
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

    // Update quote randomly
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

    // Handle navigation buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('onclick')?.match(/href='(.+?)'/)?.[1];
            if (href) {
                e.preventDefault();
                window.location.href = href;
            }
        });
    });

    // Handle hero buttons
    document.querySelectorAll('.hero-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('onclick')?.match(/href='(.+?)'/)?.[1];
            if (href) {
                e.preventDefault();
                window.location.href = href;
            }
        });
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
});
