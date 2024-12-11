'use client'

import { useState, useEffect, useCallback } from 'react'
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
        parsedCategories.push({ id: DEFAULT_CATEGORY_ID, name: 'Базовая категория', parentId: null })
      }
      setCategories(parsedCategories)
    } else {
      setCategories([{ id: DEFAULT_CATEGORY_ID, name: 'Базовая категория', parentId: null }])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes))
  }, [recipes])

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prevRecipes => [...prevRecipes, recipe])
  }, [])

  const updateRecipe = useCallback((updatedRecipe: Recipe) => {
    setRecipes(prevRecipes => prevRecipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ))
  }, [])

  const deleteRecipe = useCallback((recipeId: string) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId))
  }, [])

  const addCategory = useCallback((category: Category) => {
    setCategories(prevCategories => [...prevCategories, category])
  }, [])

  const updateCategory = useCallback((categoryId: string, newName: string) => {
    setCategories(prevCategories => prevCategories.map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    ))
  }, [])
    
  const deleteCategory = useCallback((categoryId: string) => {
    if (categoryId === DEFAULT_CATEGORY_ID) return // Запрещаем удаление категории "Базовая категория"
    
    setCategories(prevCategories => {
      const deleteCategoryRecursive = (catId: string, cats: Category[]): Category[] => {
        const updatedCats = cats.filter(cat => cat.id !== catId);
        const childCategories = cats.filter(cat => cat.parentId === catId);
        childCategories.forEach(child => {
          updatedCats = deleteCategoryRecursive(child.id, updatedCats);
        });
        return updatedCats;
      };
      
      return deleteCategoryRecursive(categoryId, prevCategories);
    });
    
    setRecipes(prevRecipes => prevRecipes.map(recipe =>
      recipe.categoryId === categoryId ? { ...recipe, categoryId: DEFAULT_CATEGORY_ID } : recipe
    ));
  }, [])
    
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
            updateRecipe={updateRecipe}
            addCategory={addCategory}
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

