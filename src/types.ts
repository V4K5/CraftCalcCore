export type Category = {
    id: string;
    name: string;
    parentId: string | null;
  }
  
  export type Recipe = {
    id: string;
    name: string;
    outputQuantity: number;
    ingredients: { item: string; quantity: number; isRecipe: boolean }[];
    categoryId: string;
  }
  
  export const DEFAULT_CATEGORY_ID = 'default';