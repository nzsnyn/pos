"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
  stock: number
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
              ) : (
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-sm font-medium line-clamp-2">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                </Badge>
              </div>
              <Button 
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
