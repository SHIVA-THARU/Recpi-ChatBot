import axios from 'axios';

// Axios instance for TheMealDB API (no API key needed)
const mealDbApi = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 10000, // 10 second timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Error handler for API requests
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
  } else if (error.request) {
    // Request made but no response received
    throw new Error('Network error: Unable to reach the server. Please check your internet connection.');
  } else {
    // Error in request setup
    throw new Error(`Request error: ${error.message}`);
  }
};

// Search meals using TheMealDB API
export const searchMeals = async (query) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid search query. Please provide a valid search term.');
  }

  try {
    const res = await mealDbApi.get(`/search.php?s=${encodeURIComponent(query.trim())}`);
    const meals = res.data.meals;

    if (!meals) {
      return [];
    }

    return meals.map(meal => ({
      product_name: meal.strMeal || 'Unknown',
      preparation: meal.strInstructions || 'No instructions available',
      ingredients_text: extractIngredients(meal),
      cooking_time: extractCookingTime(meal.strInstructions) || 'Not specified',
      tips: generateTips(meal),
      image: meal.strMealThumb || null,
      category: meal.strCategory || 'Uncategorized',
      area: meal.strArea || 'Unknown origin'
    }));
  } catch (error) {
    console.error('Error fetching meal:', error);
    handleApiError(error);
  }
};

// Helper function to extract ingredients and measures
const extractIngredients = (meal) => {
  if (!meal) return '';
  
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${(measure || '').trim()} ${ingredient.trim()}`);
    }
  }
  return ingredients.join('\n');
};

// Helper function to extract cooking time from instructions
const extractCookingTime = (instructions) => {
  if (!instructions) return null;
  
  const timeRegex = /(?:\d+)\s*(?:minute|min|hour|hr)s?/gi;
  const matches = instructions.match(timeRegex);
  
  return matches ? matches.join(', ') : null;
};

// Helper function to generate cooking tips
const generateTips = (meal) => {
  const tips = [];
  
  if (meal.strYoutube) {
    tips.push('Watch the video tutorial for better understanding');
  }
  
  if (meal.strTags) {
    tips.push(`Tags: ${meal.strTags}`);
  }
  
  if (meal.strSource) {
    tips.push('Check the source recipe for detailed information');
  }
  
  return tips.length > 0 ? tips.join('\n') : 'Follow the instructions carefully';
};
