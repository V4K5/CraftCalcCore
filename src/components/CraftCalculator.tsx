'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Recipe, Category } from '@/types'
import { ScrollArea } from "@/components/ui/scroll-area"

type CraftCalculatorProps = {
  recipes: Recipe[];
}

type CalculatedIngredient = {
  item: string;
  quantity: number;
  level: number;
}

type CraftLevel = {
  level: number;
  ingredients: CalculatedIngredient[];
}

function ItemCard({ item, quantity, availableQuantity, onAvailableChange }: { 
  item: string; 
  quantity: number; 
  availableQuantity: number;
  onAvailableChange: (value: number) => void;
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between p-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
        <span className="flex-grow">{item}</span>
        <span className="font-bold mr-2">{quantity}</span>
        <Input 
          type="number" 
          value={availableQuantity} 
          onChange={(e) => onAvailableChange(Number(e.target.value))}
          className="w-20"
          min={0}
        />
      </CardContent>
    </Card>
  )
}

export default function CraftCalculator({ recipes, categories }: { recipes: Recipe[], categories: Category[] }) {
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [result, setResult] = useState<CraftLevel[]>([])
  const [availableResources, setAvailableResources] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')

  const calculateIngredients = (recipeName: string, targetQuantity: number, level: number = 0, available: Record<string, number>): CalculatedIngredient[] => {
    const recipe = recipes.find(r => r.name === recipeName)
    if (!recipe) return []

    const availableQuantity = available[recipeName] || 0
    const remainingQuantity = Math.max(targetQuantity - availableQuantity, 0)
    const batchesNeeded = Math.ceil(remainingQuantity / recipe.outputQuantity)

    let ingredients: CalculatedIngredient[] = []

    if (remainingQuantity > 0) {
      ingredients.push({
        item: recipe.name,
        quantity: remainingQuantity,
        level: level
      })

      recipe.ingredients.forEach(ing => {
        const subRecipe = recipes.find(r => r.name === ing.item)
        const requiredQuantity = ing.quantity * batchesNeeded
        
        if (subRecipe) {
          const subIngredients = calculateIngredients(ing.item, requiredQuantity, level + 1, available)
          ingredients = ingredients.concat(subIngredients)
        } else {
          const availableQuantity = available[ing.item] || 0
          const remainingQuantity = Math.max(requiredQuantity - availableQuantity, 0)
          if (remainingQuantity > 0) {
            ingredients.push({
              item: ing.item,
              quantity: remainingQuantity,
              level: level + 1
            })
          }
        }
      })
    }

    return ingredients
  }

  const handleCalculate = () => {
    if (selectedItem) {
      const calculatedIngredients = calculateIngredients(selectedItem, quantity, 0, availableResources)
      
      const groupedByLevel = calculatedIngredients.reduce((acc, curr) => {
        const existingLevel = acc.find(level => level.level === curr.level)
        if (existingLevel) {
          const existingIng = existingLevel.ingredients.find(ing => ing.item === curr.item)
          if (existingIng) {
            existingIng.quantity = curr.quantity
          } else {
            existingLevel.ingredients.push(curr)
          }
        } else {
          acc.push({ level: curr.level, ingredients: [curr] })
        }
        return acc
      }, [] as CraftLevel[])

      const sortedLevels = groupedByLevel
        .sort((a, b) => a.level - b.level)
        .map(level => ({
          ...level,
          ingredients: level.ingredients.map(ing => ({
            ...ing,
            quantity: Math.ceil(ing.quantity)
          }))
        }))

      setResult(sortedLevels)
    }
  }

  const handleAvailableChange = (item: string, value: number) => {
    setAvailableResources(prev => {
      const updated = { ...prev, [item]: value }
      if (value === 0) {
        delete updated[item]
      }
      return updated
    })
  }

  const handleClearAvailable = () => {
    setAvailableResources({})
  }

  useEffect(() => {
    handleCalculate()
  }, [availableResources, selectedItem, quantity])

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [recipes, searchTerm])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="searchTerm">Поиск предмета</Label>
        <Input
          id="searchTerm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Введите название предмета"
        />
      </div>
      <div>
        <Label htmlFor="itemSelect">Выберите предмет</Label>
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите предмет для крафта" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {filteredRecipes.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="quantity">Количество</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
        />
      </div>
      <Button onClick={handleCalculate}>Рассчитать</Button>
      <Button onClick={handleClearAvailable} variant="outline">Очистить имеющиеся предметы</Button>
      {result.length > 0 && (
        <div className="space-y-4">
          {result.map((level, index) => (
            <div key={index}>
              <h3 className="text-xl font-semibold mt-4 mb-2">
                {level.level === 0 ? "Конечный продукт" : `Уровень ${level.level}`}
              </h3>
              <div className="grid gap-2">
                {level.ingredients.map((item, itemIndex) => (
                  <ItemCard 
                    key={itemIndex} 
                    item={item.item} 
                    quantity={item.quantity} 
                    availableQuantity={availableResources[item.item] || 0}
                    onAvailableChange={(value) => handleAvailableChange(item.item, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

