'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CraftRecipeCreator from '@/components/CraftRecipeCreator'
import CraftCalculator from '@/components/CraftCalculator'
import RecipeManager from '@/components/RecipeManager'
import CategoryManager from '@/components/CategoryManager'
import { Recipe, Category, DEFAULT_CATEGORY_ID } from '@/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState("create")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes')
    const savedCategories = localStorage.getItem('categories')
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes))
    }
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories)
      if (!parsedCategories.some((c: Category) => c.id === DEFAULT_CATEGORY_ID)) {
        parsedCategories.push({ id: DEFAULT_CATEGORY_ID, name: 'Без категории', parentId: null })
      }
      setCategories(parsedCategories)
    } else {
      setCategories([{ id: DEFAULT_CATEGORY_ID, name: 'Без категории', parentId: null }])
    }
  }, [])

  const addRecipe = (recipe: Recipe) => {
    const updatedRecipes = [...recipes, recipe]
    setRecipes(updatedRecipes)
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
  }

  const updateRecipe = (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    )
    setRecipes(updatedRecipes)
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
  }

  const deleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId)
    setRecipes(updatedRecipes)
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
  }

  const addCategory = (category: Category) => {
    const updatedCategories = [...categories, category]
    setCategories(updatedCategories)
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
  }

  const updateCategory = (categoryId: string, newName: string) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    );
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const deleteCategory = (categoryId: string) => {
    if (categoryId === DEFAULT_CATEGORY_ID) return // Запрещаем удаление категории "Без категории"

    const deleteCategoryRecursive = (catId: string) => {
      const childCategories = categories.filter(cat => cat.parentId === catId);
      childCategories.forEach(child => deleteCategoryRecursive(child.id));

      const updatedCategories = categories.filter(category => category.id !== catId);
      setCategories(updatedCategories);

      // Обновляем рецепты, перемещая их в категорию "Без категории"
      const updatedRecipes = recipes.map(recipe =>
        recipe.categoryId === catId ? { ...recipe, categoryId: DEFAULT_CATEGORY_ID } : recipe
      );
      setRecipes(updatedRecipes);
    };

    deleteCategoryRecursive(categoryId);

    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('recipes', JSON.stringify(recipes));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Калькулятор крафта</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Создание рецепта</TabsTrigger>
          <TabsTrigger value="calculate">Расчет крафта</TabsTrigger>
          <TabsTrigger value="manage">Управление рецептами</TabsTrigger>
          <TabsTrigger value="categories">Управление категориями</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CraftRecipeCreator 
            addRecipe={addRecipe} 
            existingRecipes={recipes}
            categories={categories}
          />
        </TabsContent>
        <TabsContent value="calculate">
          <CraftCalculator recipes={recipes} categories={categories} />
        </TabsContent>
        <TabsContent value="manage">
          <RecipeManager 
            recipes={recipes} 
            categories={categories}
            updateRecipe={updateRecipe}
            deleteRecipe={deleteRecipe}
          />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManager 
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}