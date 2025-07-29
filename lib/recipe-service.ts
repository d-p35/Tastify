import { supabase } from '@/config/supabase';
import { Recipe, CreateRecipeRequest, Board } from '@/types/recipe';

export class RecipeService {
  // Recipe operations
  static async createRecipe(recipeData: CreateRecipeRequest): Promise<Recipe> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`);
    }

    return data;
  }

  static async getRecipe(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get recipe: ${error.message}`);
    }

    return data;
  }

  static async getUserRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get recipes: ${error.message}`);
    }

    return data || [];
  }

  static async updateRecipe(id: string, updates: Partial<CreateRecipeRequest>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`);
    }

    return data;
  }

  static async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  // Board operations
  static async createBoard(name: string): Promise<Board> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('boards')
      .insert({
        name,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create board: ${error.message}`);
    }

    return data;
  }

  static async getUserBoards(): Promise<Board[]> {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get boards: ${error.message}`);
    }

    return data || [];
  }

  static async addRecipeToBoard(boardId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('board_recipes')
      .insert({
        board_id: boardId,
        recipe_id: recipeId,
      });

    if (error) {
      throw new Error(`Failed to add recipe to board: ${error.message}`);
    }
  }

  static async removeRecipeFromBoard(boardId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('board_recipes')
      .delete()
      .eq('board_id', boardId)
      .eq('recipe_id', recipeId);

    if (error) {
      throw new Error(`Failed to remove recipe from board: ${error.message}`);
    }
  }

  static async getBoardRecipes(boardId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('board_recipes')
      .select(`
        recipe_id,
        recipes (*)
      `)
      .eq('board_id', boardId);

    if (error) {
      throw new Error(`Failed to get board recipes: ${error.message}`);
    }

    return data?.map((item: any) => item.recipes).filter(Boolean) as Recipe[] || [];
  }
}

// Placeholder function for AI recipe parsing (to be replaced with actual AI service)
export async function parseRecipeFromUrl(url: string) {
  try {
    // Call our backend API
    const response = await fetch('YOUR_VERCEL_BACKEND_URL/api/parseRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl: url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse recipe: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform the response to match our frontend expectations
    return {
      title: result.title,
      ingredients: result.ingredients,
      steps: result.steps,
      macros: result.macros
    };
  } catch (error) {
    console.error('Backend parsing failed, using fallback:', error);
    
    // Fallback to mock data if backend fails
    await new Promise((resolve: any) => setTimeout(resolve, 2000));
    
    return {
      title: "Delicious Recipe from " + (url.includes('tiktok') ? 'TikTok' : 'Instagram'),
      ingredients: [
        { item: "Pasta", quantity: "200g" },
        { item: "Olive oil", quantity: "2 tbsp" },
        { item: "Garlic", quantity: "3 cloves" },
        { item: "Cherry tomatoes", quantity: "250g" },
        { item: "Basil", quantity: "Fresh leaves" },
        { item: "Parmesan cheese", quantity: "50g grated" }
      ],
      steps: [
        "Boil water in a large pot and cook pasta according to package directions",
        "Heat olive oil in a pan and sauté minced garlic until fragrant",
        "Add cherry tomatoes and cook until they start to burst",
        "Drain pasta and add to the pan with tomatoes",
        "Toss with fresh basil and grated Parmesan",
        "Serve immediately while hot"
      ],
      macros: {
        calories: 420,
        protein: 15,
        fat: 12,
        carbs: 65,
        fiber: 4
      }
    };
  }
}
