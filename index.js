// Global Variables
let quotes = [];

// Fetch quotes from the local db.json
function fetchQuotes() {
    fetch('/db.json') // Ensure this path is correct based on your setup
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data); // Log the fetched data
            if (Array.isArray(data.quotes)) {
                quotes = data.quotes; // Assign data to quotes
                console.log('Fetched quotes:', quotes);
                if (quotes.length === 0) {
                    console.error('No quotes available.');
                } else {
                    displayQuote(); // Display only if there are quotes
                    setQuoteOfTheDay(); // Set or update the quote of the day
                }
            } else {
                console.error('Unexpected data format:', data);
            }
        })
        .catch(error => console.error('Error fetching quotes:', error));
}

// Display a random quote based on selected mood and search input
function displayQuote(searchTerm = '') {
    const selectedMood = document.getElementById('mood-selector').value;

    const filteredQuotes = quotes.filter(quote => {
        const matchesMood = selectedMood === 'all' || quote.category === selectedMood;
        const matchesSearch = searchTerm === '' || 
            quote.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.author.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMood && matchesSearch;
    });

    console.log('Filtered quotes:', filteredQuotes); // Log filtered quotes

    const quoteElement = document.getElementById('quote');
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        quoteElement.textContent = `"${randomQuote.quote}" — ${randomQuote.author}`;
        trackQuoteHistory(randomQuote); // Track viewed quote
    } else {
        quoteElement.textContent = "No quotes found.";
    }
}

// Set the Quote of the Day
function setQuoteOfTheDay() {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const storedDate = localStorage.getItem('quoteOfTheDayDate');
    const storedQuote = localStorage.getItem('quoteOfTheDay');

    if (storedDate !== today) {
        // Fetch a new quote for the day
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quoteOfTheDay = quotes[randomIndex];
        localStorage.setItem('quoteOfTheDayDate', today);
        localStorage.setItem('quoteOfTheDay', JSON.stringify(quoteOfTheDay));
        updateQuoteOfTheDayUI(quoteOfTheDay);
    } else if (storedQuote) {
        const quoteOfTheDay = JSON.parse(storedQuote);
        updateQuoteOfTheDayUI(quoteOfTheDay);
    }
}

// Update the Quote of the Day UI
function updateQuoteOfTheDayUI(quote) {
    const quoteOfTheDayElement = document.getElementById('quote-of-the-day');
    quoteOfTheDayElement.textContent = `"${quote.quote}" — ${quote.author}`;
}

// Track Quote History
function trackQuoteHistory(quote) {
    let history = JSON.parse(localStorage.getItem('quoteHistory')) || [];
    if (!history.includes(quote.id)) {
        history.push(quote.id);
        localStorage.setItem('quoteHistory', JSON.stringify(history));
        updateQuoteHistoryUI();
    }
}

// Update Quote History UI
function updateQuoteHistoryUI() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('quoteHistory')) || [];
    
    history.forEach(quoteId => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            const li = document.createElement('li');
            li.textContent = `"${quote.quote}" — ${quote.author}`;
            historyList.appendChild(li);
        }
    });
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('new-quote-btn').addEventListener('click', () => {
        const searchTerm = document.querySelector('input[type="search"]').value;
        displayQuote(searchTerm);
    });

    document.getElementById('mood-selector').addEventListener('change', () => {
        const searchTerm = document.querySelector('input[type="search"]').value;
        displayQuote(searchTerm);
    });

    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const searchTerm = event.target.querySelector('input[type="search"]').value;
        displayQuote(searchTerm);
    });

    document.getElementById('add-quote-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const newQuoteText = document.getElementById('new-quote-text').value;
        const newQuoteAuthor = document.getElementById('new-quote-author').value;
        const newQuoteCategory = document.getElementById('new-quote-category').value;

        const newQuote = { 
            quote: newQuoteText, 
            author: newQuoteAuthor, 
            category: newQuoteCategory, 
            id: quotes.length + 1 
        }; // Generate a new ID

        quotes.push(newQuote);
        displayQuote();
        setQuoteOfTheDay();
        document.getElementById('add-quote-message').textContent = "Quote added successfully!";
    });

    document.querySelector('.share-quote-btn').addEventListener('click', () => {
        const quoteText = document.getElementById('quote').textContent;
        if (navigator.share) {
            navigator.share({
                title: 'Quote',
                text: quoteText,
                url: window.location.href
            }).catch(error => console.error('Error sharing:', error));
        } else {
            alert('Share not supported on this browser.');
        }
    });

    document.querySelector('.like-quote-btn').addEventListener('click', () => {
        const quoteText = document.getElementById('quote').textContent;
        console.log(`Liked: ${quoteText}`);
        // Add functionality to save liked quotes if needed
    });

    document.querySelector('.dislike-quote-btn').addEventListener('click', () => {
        const quoteText = document.getElementById('quote').textContent;
        console.log(`Disliked: ${quoteText}`);
        // Add functionality to save disliked quotes if needed
    });
}

// Initialize the App
function initializeApp() {
    fetchQuotes();
    setupEventListeners();
}

// Start the App
initializeApp();