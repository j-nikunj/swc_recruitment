# 🍽️ Recipe Finder

A **modern recipe discovery web app** that helps users find delicious recipes by **dish name or ingredients**. Built with **HTML, CSS, and JavaScript**, it uses the [Spoonacular API](https://spoonacular.com/food-api) to fetch rich recipe data, including ingredients, cooking time, nutrition facts, and more — all presented in a clean, responsive interface with **dark mode** and **favorites** support.

---

## 🚀 Features

- 🔍 **Search Recipes by Dish Name or Ingredients**
  Instantly explore thousands of recipes by typing a dish name or listing ingredients you have at home.

- 🥦 **Dietary Filters**
  Filter recipes by preferences like *Vegetarian*, *Vegan*, *Gluten-Free*, or *Keto*.

- 💾 **Favorites System**
  Save your favorite recipes locally — stored persistently in the browser using `localStorage`.

- 🌙 **Dark & Light Mode**
  Seamless theme toggling with saved preference between sessions.

- ⚡ **Pagination & Sorting**
  Browse recipes page by page and sort them by popularity, cooking time, or health score.

- 🧾 **Recipe Details Modal**
  Get a full view of any recipe including:
  - Summary and ingredients
  - Step-by-step instructions
  - Nutrition breakdown (calories, carbs, fat, protein, etc.)

- 🧠 **Smart UX Enhancements**
  - Keyboard shortcuts (`Ctrl + K` for search, `Ctrl + F` for favorites, `Ctrl + D` for theme toggle)
  - Recent searches saved automatically
  - Offline/online notifications
  - Smooth transitions and animations

---

## 🧩 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **HTML5** | Structure and layout |
| **CSS3** (Flexbox + Grid) | Styling, animations, and responsive design |
| **Vanilla JavaScript (ES6)** | Dynamic logic and API integration |
| **Spoonacular API** | Recipe data source |
| **LocalStorage API** | Persistent user data storage |

---

## 📂 Project Structure

```
Recipe-Finder/
├── index.html        # Main HTML structure
├── style.css         # App styling (light/dark themes, layout, animations)
├── script.js         # Core JavaScript logic and API handling
└── README.md         # Documentation
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/recipe-finder.git
cd recipe-finder
```

### 2️⃣ Add Your API Key
This project uses a hardcoded Spoonacular API key in `script.js`.
For security and scalability, **replace it with your own**:

```js
this.apiKey = 'YOUR_API_KEY_HERE';
```
Get your free key from: [https://spoonacular.com/food-api](https://spoonacular.com/food-api)

### 3️⃣ Run the App
Simply open `index.html` in your browser.

> 💡 For a better local experience, use a lightweight local server:
```bash
# Python 3
python -m http.server
```
Then visit → [http://localhost:8000](http://localhost:8000)

---

## 💡 Keyboard Shortcuts

| Shortcut | Action |
|-----------|---------|
| `Ctrl + K` | Focus search input |
| `Ctrl + F` | Open favorites panel |
| `Ctrl + D` | Toggle dark mode |
| `Esc` | Close modal or favorites panel |

---

## 🧠 Future Improvements

- Add offline caching using a Service Worker
- Implement search suggestions / autocomplete
- Enable user accounts and cloud-based favorites
- Improve accessibility (ARIA roles, tab navigation)

---

## 🧑‍💻 Author

**Nikunj Jindal**
Student at IIT Guwahati  
✨ Passionate about DSA, Web Development, and building intuitive digital tools.

---

## 📜 License

This project is open-sourced under the **MIT License** — feel free to use and modify it for learning or personal projects.
