document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile menu with improved functionality
    const hamburger = document.querySelector('.hamburger');
    const navButtons = document.querySelector('.nav-buttons');
    const header = document.querySelector('header');

    if (hamburger && navButtons) {
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navButtons.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navButtons.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navButtons.classList.remove('active');
            }
        });

        // Close menu when window is resized above mobile breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navButtons.classList.remove('active');
            }
        });
    }

    // Inspirational quotes functionality
    const quotes = [
        { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
        { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
        { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" }
    ];

    function updateQuote() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (quoteText && quoteAuthor) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteText.textContent = randomQuote.text;
            quoteAuthor.textContent = "- " + randomQuote.author;
        }
    }

    // Update quote on page load and every 10 seconds
    updateQuote();
    setInterval(updateQuote, 10000);

    // Handle navigation buttons with error handling
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/href='(.+?)'/);
                    if (match && match[1]) {
                        const href = match[1];
                        window.location.href = typeof wpData !== 'undefined' ? 
                            wpData.templateUrl + '/' + href : href;
                    }
                }
            } catch (error) {
                console.error('Error handling navigation button click:', error);
            }
        });
    });

    // Handle hero buttons with error handling
    document.querySelectorAll('.hero-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/href='(.+?)'/);
                    if (match && match[1]) {
                        const href = match[1];
                        window.location.href = typeof wpData !== 'undefined' ? 
                            wpData.templateUrl + '/' + href : href;
                    }
                }
            } catch (error) {
                console.error('Error handling hero button click:', error);
            }
        });
    });

    // Update relative URLs to absolute URLs with error handling
    document.querySelectorAll('a[href], img[src]').forEach(element => {
        try {
            if (element.hasAttribute('href')) {
                const href = element.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    element.setAttribute('href', 
                        typeof wpData !== 'undefined' ? 
                        wpData.templateUrl + '/' + href : href
                    );
                }
            }
            if (element.hasAttribute('src')) {
                const src = element.getAttribute('src');
                if (src && !src.startsWith('http')) {
                    element.setAttribute('src', 
                        typeof wpData !== 'undefined' ? 
                        wpData.templateUrl + '/' + src : src
                    );
                }
            }
        } catch (error) {
            console.error('Error updating URLs:', error);
        }
    });
});
