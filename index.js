let quotes = [];

// Fetch quotes from the server
fetch('https://quote-generator-ki3z.onrender.com/')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data); // Log the fetched data
        if (Array.isArray(data)) {
            quotes = data; // Assign data to quotes
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

// Function to display a random quote based on selected mood and search input
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

    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        document.getElementById('quote').textContent = `"${randomQuote.quote}" — ${randomQuote.author}`;
        trackQuoteHistory(randomQuote); // Track viewed quote
    } else {
        document.getElementById('quote').textContent = "No quotes found.";
    }
}

// Function to set the Quote of the Day
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
    } else {
        const quoteOfTheDay = JSON.parse(storedQuote);
        document.getElementById('quote-of-the-day').textContent = `"${quoteOfTheDay.quote}" — ${quoteOfTheDay.author}`;
    }
}

// Event listeners for buttons
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

    const newQuote = { quote: newQuoteText, author: newQuoteAuthor, category: newQuoteCategory };

    fetch('https://quote-generator-ki3z.onrender.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('add-quote-message').textContent = "Quote added successfully!";
        quotes.push(data);
        displayQuote();
        setQuoteOfTheDay();
    })
    .catch(error => console.error('Error adding quote:', error));
});

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

// Quote of the Day Button
document.getElementById('quote-of-the-day-btn').addEventListener('click', () => {
    fetch('https://quote-generator-ki3z.onrender.com/24')
        .then(response => response.json())
        .then(data => {
            document.getElementById('quote').textContent = `"${data.quote}" — ${data.author}`;
        })
        .catch(error => console.error('Error fetching quote of the day:', error));
});

// Share Quotes
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

// Like/Dislike Quotes
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
