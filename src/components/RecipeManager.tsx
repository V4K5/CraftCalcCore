'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Recipe } from '@/app/page'
import { Plus, Minus, Save } from 'lucide-react'

type RecipeManagerProps = {
  recipes: Recipe[];
  updateRecipe: (updatedRecipe: Recipe) => void;
}

export default function RecipeManager({ recipes, updateRecipe }: RecipeManagerProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null)

  const handleRecipeSelect = (recipeName: string) => {
    const recipe = recipes.find(r => r.name === recipeName)
    if (recipe) {
      setSelectedRecipe(recipe)
      setEditedRecipe({ ...recipe })
    }
  }

  const handleIngredientChange = (index: number, field: 'item' | 'quantity', value: string | number) => {
    if (editedRecipe) {
      const updatedIngredients = [...editedRecipe.ingredients]
      updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
      setEditedRecipe({ ...editedRecipe, ingredients: updatedIngredients })
    }
  }

  const handleAddIngredient = () => {
    if (editedRecipe) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [...editedRecipe.ingredients, { item: '', quantity: 1, isRecipe: false }]
      })
    }
  }

  const handleRemoveIngredient = (index: number) => {
    if (editedRecipe) {
      const updatedIngredients = editedRecipe.ingredients.filter((_, i) => i !== index)
      setEditedRecipe({ ...editedRecipe, ingredients: updatedIngredients })
    }
  }

  const handleSave = () => {
    if (editedRecipe) {
      updateRecipe(editedRecipe)
      setSelectedRecipe(editedRecipe)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="recipeSelect">Выберите рецепт для редактирования</Label>
        <Select onValueChange={handleRecipeSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите рецепт" />
          </SelectTrigger>
          <SelectContent>
            {recipes.map((recipe) => (
              <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {editedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle>{editedRecipe.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="outputQuantity">Количество получаемого ресурса</Label>
              <Input
                id="outputQuantity"
                type="number"
                value={editedRecipe.outputQuantity}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, outputQuantity: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Ингредиенты</Label>
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Название ингредиента"
                    value={ingredient.item}
                    onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Количество"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                    min={1}
                  />
                  <Button variant="outline" size="icon" onClick={() => handleRemoveIngredient(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddIngredient} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Добавить ингредиент
              </Button>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Сохранить изменения
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
