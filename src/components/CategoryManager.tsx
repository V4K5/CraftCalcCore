'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Category, DEFAULT_CATEGORY_ID } from '@/types'
import { Plus, Trash, Edit2, Check, X } from 'lucide-react'

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
  const [editedName, setEditedName] = useState<string>('')

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

  const handleStartEditing = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId)
    setEditedName(currentName)
  }

  const handleUpdateCategory = (categoryId: string) => {
    if (editedName.trim() !== '') {
      updateCategory(categoryId, editedName.trim())
      setEditingCategory(null)
      setEditedName('')
    }
  }

  const handleCancelEditing = () => {
    setEditingCategory(null)
    setEditedName('')
  }

  const renderCategoryTree = (parentId: string | null = null, level = 0): React.ReactNode[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => (
        <AccordionItem key={category.id} value={category.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              {editingCategory === category.id ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                  />
                  <div
                    className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateCategory(category.id)
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <div
                    className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelEditing()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <span>{category.name}</span>
              )}
              {editingCategory !== category.id && (
                <div className="flex items-center space-x-2">
                  <div
                    className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEditing(category.id, category.name)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </div>
                  {category.id !== DEFAULT_CATEGORY_ID && (
                    <div
                      className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCategory(category.id)
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )}
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

