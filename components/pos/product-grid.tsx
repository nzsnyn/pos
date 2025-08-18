"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  wholesalePrice?: number | null
  category: {
    id: string
    name: string
  }
  image?: string | null
  stock: number
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-3">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="p-2 pb-1">
            <div className="aspect-square bg-gray-100 rounded-md mb-1 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
              ) : (
                <ShoppingCart className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-xs font-medium line-clamp-2 leading-tight">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Eceran:</span>
                    <span className="text-sm font-bold text-green-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {product.wholesalePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Grosir:</span>
                      <span className="text-sm font-bold text-blue-600">
                        Rp {product.wholesalePrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs px-1 py-0">
                  {product.stock > 0 ? `${product.stock}` : "Habis"}
                </Badge>
              </div>
              <Button 
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full text-xs h-7"
                size="sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Tambah
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
