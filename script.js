// Recipe Finder App - Complete Implementation
class RecipeFinderApp {
    constructor() {
        this.apiKey = 'bae65b66b7a44900b094e224f187517d'; // Hardcoded API key
        this.currentPage = 0;
        this.recipesPerPage = 12;
        this.currentQuery = '';
        this.currentIngredients = [];
        this.currentFilters = [];
        this.currentRecipes = [];
        this.favorites = JSON.parse(localStorage.getItem('recipe_favorites')) || [];
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.updateFavoritesCount();
    }

    setupTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // API key setup - removed as key is hardcoded

        // Search tabs
        document.getElementById('dish-tab').addEventListener('click', () => {
            this.switchSearchTab('dish');
        });

        document.getElementById('ingredients-tab').addEventListener('click', () => {
            this.switchSearchTab('ingredients');
        });

        // Dish search
        document.getElementById('dish-search-btn').addEventListener('click', () => {
            this.searchByDish();
        });

        document.getElementById('dish-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchByDish();
            }
        });

        // Ingredients search
        document.getElementById('add-ingredient-btn').addEventListener('click', () => {
            this.addIngredient();
        });

        document.getElementById('ingredient-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addIngredient();
            }
        });

        document.getElementById('ingredients-search-btn').addEventListener('click', () => {
            this.searchByIngredients();
        });

        // Sorting
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortRecipes(e.target.value);
        });

        // Pagination
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextPage();
        });

        // Favorites
        document.getElementById('favorites-btn').addEventListener('click', () => {
            this.showFavorites();
        });

        document.getElementById('close-favorites').addEventListener('click', () => {
            this.hideFavorites();
        });

        // Modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideRecipeModal();
        });

        document.getElementById('modal-favorite-btn').addEventListener('click', () => {
            this.toggleModalFavorite();
        });

        // Recipe tabs
        document.querySelectorAll('.recipe-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchRecipeTab(e.target.dataset.tab);
            });
        });

        // Click outside modal to close
        document.getElementById('recipe-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('recipe-modal')) {
                this.hideRecipeModal();
            }
        });

        // Dietary filters
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
            });
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.setupTheme();
    }

    // API key methods removed - using hardcoded key

    switchSearchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.search-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-search`).classList.add('active');
    }

    addIngredient() {
        const input = document.getElementById('ingredient-input');
        const ingredient = input.value.trim().toLowerCase();
        
        if (ingredient && !this.currentIngredients.includes(ingredient)) {
            this.currentIngredients.push(ingredient);
            this.renderIngredients();
            input.value = '';
            this.updateIngredientsSearchButton();
        }
    }

    removeIngredient(ingredient) {
        this.currentIngredients = this.currentIngredients.filter(ing => ing !== ingredient);
        this.renderIngredients();
        this.updateIngredientsSearchButton();
    }

    renderIngredients() {
        const container = document.getElementById('selected-ingredients');
        container.innerHTML = '';

        this.currentIngredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <button onclick="app.removeIngredient('${ingredient}')">×</button>
            `;
            container.appendChild(tag);
        });
    }

    updateIngredientsSearchButton() {
        const btn = document.getElementById('ingredients-search-btn');
        btn.disabled = this.currentIngredients.length === 0;
    }

    updateFilters() {
        this.currentFilters = [];
        document.querySelectorAll('.filter-checkbox input:checked').forEach(checkbox => {
            this.currentFilters.push(checkbox.value);
        });
    }

    async searchByDish() {
        const query = document.getElementById('dish-input').value.trim();
        if (!query) {
            this.showNotification('Please enter a dish name', 'error');
            return;
        }

        this.currentQuery = query;
        this.currentPage = 0;
        this.addToRecentSearches(query);
        await this.performSearch('complexSearch', { query });
    }

    async searchByIngredients() {
        if (this.currentIngredients.length === 0) {
            this.showNotification('Please add at least one ingredient', 'error');
            return;
        }

        const ingredients = this.currentIngredients.join(',');
        this.currentQuery = `Recipes with: ${this.currentIngredients.join(', ')}`;
        this.currentPage = 0;
        this.addToRecentSearches(this.currentQuery);
        await this.performSearch('findByIngredients', { ingredients });
    }

    async performSearch(endpoint, params) {

        this.showLoading();
        this.hideError();
        this.updateFilters();

        try {
            let url = `https://api.spoonacular.com/recipes/${endpoint}?apiKey=${this.apiKey}`;
            
            // Add parameters based on endpoint
            if (endpoint === 'complexSearch') {
                url += `&query=${encodeURIComponent(params.query)}`;
                url += `&number=${this.recipesPerPage}`;
                url += `&offset=${this.currentPage * this.recipesPerPage}`;
                url += `&addRecipeInformation=true`;
                url += `&fillIngredients=true`;
                
                // Add dietary filters
                if (this.currentFilters.length > 0) {
                    url += `&diet=${this.currentFilters.join(',')}`;
                }
            } else if (endpoint === 'findByIngredients') {
                url += `&ingredients=${encodeURIComponent(params.ingredients)}`;
                url += `&number=${this.recipesPerPage}`;
                url += `&ranking=1`;
                url += `&ignorePantry=true`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (endpoint === 'findByIngredients') {
                // Get detailed information for ingredient-based search
                const detailedRecipes = await this.getRecipeDetails(data.slice(0, 12));
                this.currentRecipes = detailedRecipes;
            } else {
                this.currentRecipes = data.results || [];
            }

            this.hideLoading();
            
            if (this.currentRecipes.length === 0) {
                this.showError('No recipes found. Try different search terms.');
                return;
            }

            this.displayResults();
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideLoading();
            this.showError('Failed to fetch recipes. Please check your API key and try again.');
        }
    }

    async getRecipeDetails(recipeIds) {
        const detailedRecipes = [];
        
        // Process in batches to avoid rate limiting
        for (const recipe of recipeIds) {
            try {
                const response = await fetch(
                    `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${this.apiKey}`
                );
                
                if (response.ok) {
                    const details = await response.json();
                    detailedRecipes.push(details);
                }
                
                // Small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error fetching details for recipe ${recipe.id}:`, error);
            }
        }
        
        return detailedRecipes;
    }

    displayResults() {
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('results-title').textContent = this.currentQuery;
        
        const grid = document.getElementById('recipes-grid');
        grid.innerHTML = '';

        this.currentRecipes.forEach(recipe => {
            const card = this.createRecipeCard(recipe);
            grid.appendChild(card);
        });

        this.updatePagination();
        
        // Scroll to results
        document.getElementById('results-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card fade-in';
        card.onclick = () => this.showRecipeDetails(recipe);

        const isFavorite = this.favorites.some(fav => fav.id === recipe.id);
        const readyInMinutes = recipe.readyInMinutes || 'N/A';
        const healthScore = recipe.healthScore || 'N/A';
        
        // Clean summary text
        const summary = recipe.summary 
            ? this.stripHtmlTags(recipe.summary).substring(0, 100) + '...'
            : 'No description available';

        card.innerHTML = `
            <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${recipe.title}" 
                 class="recipe-image"
                 onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <button class="favorite-heart ${isFavorite ? 'active' : ''}" 
                    onclick="event.stopPropagation(); app.toggleFavorite(${recipe.id})">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-summary">${summary}</p>
                <div class="recipe-meta">
                    <span class="recipe-badge">⏱️ ${readyInMinutes} min</span>
                    <span class="recipe-badge">❤️ ${healthScore}</span>
                </div>
            </div>
        `;

        return card;
    }

    async showRecipeDetails(recipe) {
        // Get full recipe details if not already available
        let detailedRecipe = recipe;
        
        if (!recipe.analyzedInstructions) {
            try {
                const response = await fetch(
                    `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${this.apiKey}&includeNutrition=true`
                );
                
                if (response.ok) {
                    detailedRecipe = await response.json();
                }
            } catch (error) {
                console.error('Error fetching recipe details:', error);
            }
        }

        // Populate modal
        document.getElementById('modal-title').textContent = detailedRecipe.title;
        document.getElementById('modal-image').src = detailedRecipe.image || 'https://via.placeholder.com/800x400?text=No+Image';
        
        // Update badges
        document.querySelector('#ready-time span').textContent = `${detailedRecipe.readyInMinutes || 'N/A'} min`;
        document.querySelector('#servings span').textContent = detailedRecipe.servings || 'N/A';
        document.querySelector('#health-score span').textContent = detailedRecipe.healthScore || 'N/A';
        
        // Update favorite button
        const isFavorite = this.favorites.some(fav => fav.id === detailedRecipe.id);
        const favoriteBtn = document.getElementById('modal-favorite-btn');
        favoriteBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
        favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        favoriteBtn.dataset.recipeId = detailedRecipe.id;
        
        // Update summary
        document.getElementById('recipe-summary-text').innerHTML = 
            detailedRecipe.summary || 'No summary available';
        
        // Update ingredients
        this.renderIngredientsList(detailedRecipe.extendedIngredients || []);
        
        // Update instructions
        this.renderInstructionsList(detailedRecipe.analyzedInstructions || []);
        
        // Update nutrition
        this.renderNutritionInfo(detailedRecipe.nutrition?.nutrients || []);
        
        // Show modal
        document.getElementById('recipe-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    renderIngredientsList(ingredients) {
        const list = document.getElementById('ingredients-list');
        list.innerHTML = '';
        
        ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient.original || ingredient.name;
            list.appendChild(li);
        });
    }

    renderInstructionsList(instructions) {
        const list = document.getElementById('instructions-list');
        list.innerHTML = '';
        
        if (instructions.length === 0) {
            list.innerHTML = '<li>Instructions not available for this recipe.</li>';
            return;
        }
        
        instructions[0].steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step.step;
            list.appendChild(li);
        });
    }

    renderNutritionInfo(nutrients) {
        const grid = document.getElementById('nutrition-info');
        grid.innerHTML = '';
        
        if (nutrients.length === 0) {
            grid.innerHTML = '<p>Nutrition information not available.</p>';
            return;
        }
        
        // Show key nutrients
        const keyNutrients = ['Calories', 'Fat', 'Carbohydrates', 'Protein', 'Fiber', 'Sugar'];
        
        keyNutrients.forEach(nutrientName => {
            const nutrient = nutrients.find(n => n.name === nutrientName);
            if (nutrient) {
                const item = document.createElement('div');
                item.className = 'nutrition-item';
                item.innerHTML = `
                    <span class="nutrition-value">${Math.round(nutrient.amount)}</span>
                    <span class="nutrition-label">${nutrient.name} (${nutrient.unit})</span>
                `;
                grid.appendChild(item);
            }
        });
    }

    hideRecipeModal() {
        document.getElementById('recipe-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    switchRecipeTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.recipe-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.recipe-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleFavorite(recipeId) {
        const recipe = this.currentRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const existingIndex = this.favorites.findIndex(fav => fav.id === recipeId);
        
        if (existingIndex > -1) {
            // Remove from favorites
            this.favorites.splice(existingIndex, 1);
            this.showNotification('Recipe removed from favorites', 'info');
        } else {
            // Add to favorites
            this.favorites.push({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                summary: recipe.summary,
                readyInMinutes: recipe.readyInMinutes,
                healthScore: recipe.healthScore
            });
            this.showNotification('Recipe added to favorites', 'success');
        }
        
        localStorage.setItem('recipe_favorites', JSON.stringify(this.favorites));
        this.updateFavoritesCount();
        
        // Update UI
        this.updateFavoriteButtons(recipeId);
    }

    toggleModalFavorite() {
        const recipeId = parseInt(document.getElementById('modal-favorite-btn').dataset.recipeId);
        this.toggleFavorite(recipeId);
    }

    updateFavoriteButtons(recipeId) {
        const isFavorite = this.favorites.some(fav => fav.id === recipeId);
        
        // Update recipe card favorite button
        const cardButton = document.querySelector(`.recipe-card .favorite-heart[onclick*="${recipeId}"]`);
        if (cardButton) {
            cardButton.className = `favorite-heart ${isFavorite ? 'active' : ''}`;
            cardButton.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
        
        // Update modal favorite button
        const modalButton = document.getElementById('modal-favorite-btn');
        if (modalButton && parseInt(modalButton.dataset.recipeId) === recipeId) {
            modalButton.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
            modalButton.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
    }

    updateFavoritesCount() {
        document.querySelector('.favorites-count').textContent = this.favorites.length;
    }

    showFavorites() {
        document.getElementById('favorites-section').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const grid = document.getElementById('favorites-grid');
        const noFavorites = document.getElementById('no-favorites');
        
        if (this.favorites.length === 0) {
            grid.innerHTML = '';
            noFavorites.classList.remove('hidden');
        } else {
            noFavorites.classList.add('hidden');
            grid.innerHTML = '';
            
            this.favorites.forEach(recipe => {
                const card = this.createRecipeCard(recipe);
                grid.appendChild(card);
            });
        }
    }

    hideFavorites() {
        document.getElementById('favorites-section').classList.add('hidden');
        document.body.style.overflow = '';
    }

    sortRecipes(sortBy) {
        switch (sortBy) {
            case 'popularity':
                this.currentRecipes.sort((a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
                break;
            case 'time':
                this.currentRecipes.sort((a, b) => (a.readyInMinutes || 999) - (b.readyInMinutes || 999));
                break;
            case 'healthScore':
                this.currentRecipes.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
                break;
        }
        
        this.displayResults();
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.performCurrentSearch();
        }
    }

    nextPage() {
        this.currentPage++;
        this.performCurrentSearch();
    }

    async performCurrentSearch() {
        if (this.currentIngredients.length > 0) {
            await this.searchByIngredients();
        } else if (this.currentQuery) {
            const dishInput = document.getElementById('dish-input');
            const originalValue = dishInput.value;
            dishInput.value = this.currentQuery;
            await this.searchByDish();
            dishInput.value = originalValue;
        }
    }

    updatePagination() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageInfo = document.getElementById('page-info');
        
        prevBtn.disabled = this.currentPage === 0;
        pageInfo.textContent = `Page ${this.currentPage + 1}`;
        
        // Enable next button if we got full page of results
        nextBtn.disabled = this.currentRecipes.length < this.recipesPerPage;
    }

    addToRecentSearches(query) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(search => search !== query);
        
        // Add to beginning
        this.recentSearches.unshift(query);
        
        // Keep only last 10 searches
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('results-section').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.querySelector('p').textContent = message;
        errorElement.classList.remove('hidden');
        document.getElementById('results-section').classList.add('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 9999;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(notification);
        }

        // Set color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
        }, 3000);
    }

    stripHtmlTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RecipeFinderApp();
});

// Service Worker for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close modals
        if (!document.getElementById('recipe-modal').classList.contains('hidden')) {
            app.hideRecipeModal();
        }
        if (!document.getElementById('favorites-section').classList.contains('hidden')) {
            app.hideFavorites();
        }
    }
    
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'k':
                e.preventDefault();
                document.getElementById('dish-input').focus();
                break;
            case 'f':
                e.preventDefault();
                app.showFavorites();
                break;
            case 'd':
                e.preventDefault();
                app.toggleTheme();
                break;
        }
    }
});

// Add some helper functions for better UX
window.addEventListener('online', () => {
    if (window.app) {
        window.app.showNotification('Back online!', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.showNotification('You are offline. Some features may not work.', 'warning');
    }
});

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

// Auto-save functionality for search inputs
let searchTimeout;
document.addEventListener('input', (e) => {
    if (e.target.matches('#dish-input, #ingredient-input')) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            localStorage.setItem('draft_search', e.target.value);
        }, 1000);
    }
});

// Restore draft searches on page load
window.addEventListener('load', () => {
    const draftSearch = localStorage.getItem('draft_search');
    if (draftSearch) {
        document.getElementById('dish-input').value = draftSearch;
    }
});
