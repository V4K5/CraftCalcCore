'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CraftRecipeCreator from '@/components/CraftRecipeCreator'
import CraftCalculator from '@/components/CraftCalculator'
import RecipeManager from '@/components/RecipeManager'

export type Recipe = {
  id: string;
  name: string;
  outputQuantity: number;
  ingredients: { item: string; quantity: number; isRecipe: boolean }[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("create")
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes))
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Калькулятор крафта</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Создание рецепта</TabsTrigger>
          <TabsTrigger value="calculate">Расчет крафта</TabsTrigger>
          <TabsTrigger value="manage">Управление рецептами</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CraftRecipeCreator 
            addRecipe={addRecipe} 
            existingRecipes={recipes}
          />
        </TabsContent>
        <TabsContent value="calculate">
          <CraftCalculator recipes={recipes} />
        </TabsContent>
        <TabsContent value="manage">
          <RecipeManager recipes={recipes} updateRecipe={updateRecipe} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

