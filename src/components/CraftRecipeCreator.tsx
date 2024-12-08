'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { Recipe } from '@/app/page'
import { toast } from '@/components/ui/use-toast'

type CraftRecipeCreatorProps = {
  addRecipe: (recipe: Recipe) => void;
  existingRecipes: Recipe[];
}

type Ingredient = {
  item: string;
  quantity: number;
  isRecipe: boolean;
}

export default function CraftRecipeCreator({ addRecipe, existingRecipes }: CraftRecipeCreatorProps) {
  const [recipeName, setRecipeName] = useState('')
  const [outputQuantity, setOutputQuantity] = useState(1)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: 'placeholder', quantity: 1, isRecipe: false }])
  }

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number | boolean) => {
    const newIngredients = [...ingredients]
    if (field === 'item') {
      newIngredients[index].item = value as string
      newIngredients[index].isRecipe = existingRecipes.some(recipe => recipe.name === value)
    } else if (field === 'quantity') {
      newIngredients[index].quantity = value as number
    } else if (field === 'isRecipe') {
      newIngredients[index].isRecipe = value as boolean
    }
    setIngredients(newIngredients)
  }

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(newIngredients)
  }

  const resetForm = () => {
    setRecipeName('')
    setOutputQuantity(1)
    setIngredients([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: recipeName,
      outputQuantity,
      ingredients: ingredients.filter(ing => ing.item !== 'placeholder')
    }
    addRecipe(newRecipe)
    toast({
      title: "Рецепт добавлен",
      description: `Рецепт "${recipeName}" успешно добавлен.`,
    })
    resetForm()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="recipeName">Название рецепта</Label>
        <Input
          id="recipeName"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="outputQuantity">Количество получаемого ресурса</Label>
        <Input
          id="outputQuantity"
          type="number"
          value={outputQuantity}
          onChange={(e) => setOutputQuantity(Number(e.target.value))}
          min={1}
          required
        />
      </div>
      <div>
        <Label>Ингредиенты (необязательно)</Label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-2 mt-2">
            <Select 
              value={ingredient.item} 
              onValueChange={(value) => handleIngredientChange(index, 'item', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите ингредиент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Выберите ингредиент</SelectItem>
                {existingRecipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Количество"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))}
              min={1}
            />
            <Button type="button" variant="destructive" onClick={() => handleRemoveIngredient(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handleAddIngredient} className="mt-2">
          Добавить ингредиент
        </Button>
      </div>
      <Button type="submit">Создать рецепт</Button>
    </form>
  )
}

