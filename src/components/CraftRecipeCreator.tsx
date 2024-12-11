'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from 'lucide-react'
import { Recipe, Category } from '@/types'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type CraftRecipeCreatorProps = {
  addRecipe: (recipe: Recipe) => void;
  existingRecipes: Recipe[];
  categories: Category[];
  updateRecipe: (recipe: Recipe) => void;
  addCategory: (category: Category) => void;
}

type Ingredient = {
  item: string;
  quantity: number;
  isRecipe: boolean;
}

export default function CraftRecipeCreator({ addRecipe, existingRecipes, categories, updateRecipe, addCategory }: CraftRecipeCreatorProps) {
  const [recipeName, setRecipeName] = useState('')
  const [outputQuantity, setOutputQuantity] = useState(1)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showWarning, setShowWarning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newIngredientName, setNewIngredientName] = useState('')
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null)
  const [showAddIngredientDialog, setShowAddIngredientDialog] = useState(false)

  const baseCategory = categories.find(category => category.name === 'Базовая категория')

  useEffect(() => {
    if (baseCategory) {
      setSelectedCategory(baseCategory.id)
    }
  }, [categories])

  const handleAddIngredient = (ingredientName: string, isExisting: boolean) => {
    if (ingredientName) {
      const newIngredient: Ingredient = {
        item: ingredientName,
        quantity: 1,
        isRecipe: isExisting
      }
      setIngredients([...ingredients, newIngredient])
      setNewIngredientName('')
      setShowAddIngredientDialog(false)
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const existingRecipe = existingRecipes.find(recipe => recipe.name.toLowerCase() === recipeName.toLowerCase())
    if (existingRecipe && !showWarning) {
      setShowWarning(true)
      return
    }

    const newRecipe: Recipe = {
      id: existingRecipe ? existingRecipe.id : Date.now().toString(),
      name: recipeName,
      outputQuantity,
      ingredients: ingredients.filter(ing => ing.item !== 'placeholder'),
      categoryId: selectedCategory
    }

    if (existingRecipe && updateRecipe) {
      updateRecipe(newRecipe)
      toast({
        title: "Рецепт обновлен",
        description: `Рецепт "${recipeName}" успешно обновлен.`,
      })
    } else {
      addRecipe(newRecipe)
      toast({
        title: "Рецепт добавлен",
        description: `Рецепт "${recipeName}" успешно добавлен.`,
      })
    }
    resetForm()
  }

  const resetForm = () => {
    setRecipeName('')
    setOutputQuantity(1)
    setIngredients([])
    setSelectedCategory(baseCategory ? baseCategory.id : '')
    setShowWarning(false)
  }

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      parentId: newCategoryParent === 'none' ? null : newCategoryParent
    }
    addCategory(newCategory)
    setNewCategoryName('')
    setNewCategoryParent(null)
    setShowNewCategoryDialog(false)
    toast({
      title: "Категория создана",
      description: `Новая категория "${newCategoryName}" успешно создана.`,
    })
  }

  const filteredRecipes = existingRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <Label htmlFor="category">Категория</Label>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => setShowNewCategoryDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новая категория
          </Button>
        </div>
      </div>
      <div>
        <Label>Ингредиенты</Label>
        <Button type="button" onClick={() => setShowAddIngredientDialog(true)} className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Добавить ингредиент
        </Button>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <Input
              value={ingredient.item}
              onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
              placeholder="Название ингредиента"
            />
            <Input
              type="number"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))}
              placeholder="Количество"
              min={1}
            />
            <span>{ingredient.isRecipe ? 'Рецепт' : 'Базовый ингредиент'}</span>
            <Button type="button" variant="destructive" onClick={() => handleRemoveIngredient(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {showWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Внимание!</p>
          <p>Рецепт с таким названием уже существует. Если вы продолжите, существующий рецепт будет перезаписан.</p>
        </div>
      )}
      <Button type="submit">Создать рецепт</Button>

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName">Название категории</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newCategoryParent">Родительская категория (необязательно)</Label>
              <Select value={newCategoryParent || 'none'} onValueChange={(value) => setNewCategoryParent(value === 'none' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительскую категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет родительской категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleAddCategory}>Создать категорию</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddIngredientDialog} onOpenChange={setShowAddIngredientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить ингредиент</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newIngredient">Новый ингредиент</Label>
              <Input
                id="newIngredient"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                placeholder="Введите название нового ингредиента"
              />
              <Button 
                type="button" 
                onClick={() => handleAddIngredient(newIngredientName, false)}
                className="mt-2"
              >
                Добавить новый ингредиент
              </Button>
            </div>
            <div>
              <Label htmlFor="existingIngredient">Существующие ингредиенты</Label>
              <Input
                id="existingIngredient"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск существующих ингредиентов"
              />
              <ScrollArea className="h-[200px] mt-2">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between py-2">
                    <span>{recipe.name}</span>
                    <Button onClick={() => handleAddIngredient(recipe.name, true)}>
                      Добавить
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}

