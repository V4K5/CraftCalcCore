'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Category, DEFAULT_CATEGORY_ID } from '@/types'
import { Plus, Trash, Edit2 } from 'lucide-react'

type CategoryManagerProps = {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (categoryId: string, newName: string) => void;
  deleteCategory: (categoryId: string) => void;
}

export default function CategoryManager({ categories, addCategory, updateCategory, deleteCategory }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        parentId: selectedParentId
      }
      addCategory(newCategory)
      setNewCategoryName('')
      setSelectedParentId(null)
    }
  }

  const handleUpdateCategory = (categoryId: string, newName: string) => {
    updateCategory(categoryId, newName)
    setEditingCategory(null)
  }

  const renderCategoryTree = (parentId: string | null = null, level = 0): React.ReactNode[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => (
        <AccordionItem key={category.id} value={category.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              {editingCategory === category.id ? (
                <Input
                  value={category.name}
                  onChange={(e) => handleUpdateCategory(category.id, e.target.value)}
                  onBlur={() => setEditingCategory(null)}
                  autoFocus
                />
              ) : (
                <span>{category.name}</span>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(category.id)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {category.id !== DEFAULT_CATEGORY_ID && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCategory(category.id)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {renderCategoryTree(category.id, level + 1)}
          </AccordionContent>
        </AccordionItem>
      ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление категориями</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Новая категория"
          />
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" /> Добавить
          </Button>
        </div>
        <Accordion type="multiple" className="w-full">
          {renderCategoryTree()}
        </Accordion>
      </CardContent>
    </Card>
  )
}

