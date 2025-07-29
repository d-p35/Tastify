export interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  macros: Macros;
  video_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  item: string;
  quantity: string;
  notes?: string;
}

export interface Macros {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  sugar?: number;
}

export interface Board {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BoardRecipe {
  board_id: string;
  recipe_id: string;
  added_at: string;
}

export interface BoardMember {
  board_id: string;
  member_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface CreateRecipeRequest {
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  macros?: Macros;
  video_url?: string;
}

export interface ParsedRecipeResponse {
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  macros: Macros;
}
