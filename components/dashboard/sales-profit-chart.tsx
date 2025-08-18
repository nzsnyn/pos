"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ChartDataPoint {
  date: string
  sales: number
  profit: number
  profitMargin: number
}

interface SalesProfitChartProps {
  data: ChartDataPoint[]
  title?: string
  period?: string
}

export function SalesProfitChart({ data, title = "Sales vs Profit Comparison", period = "Last 30 Days" }: SalesProfitChartProps) {
  // Calculate totals and trends
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0)
  const avgProfitMargin = data.length > 0 ? data.reduce((sum, item) => sum + item.profitMargin, 0) / data.length : 0
  
  // Calculate trend (comparing first half vs second half)
  const midPoint = Math.floor(data.length / 2)
  const firstHalfSales = data.slice(0, midPoint).reduce((sum, item) => sum + item.sales, 0) / midPoint
  const secondHalfSales = data.slice(midPoint).reduce((sum, item) => sum + item.sales, 0) / (data.length - midPoint)
  const salesTrend = secondHalfSales > firstHalfSales ? 'up' : 'down'
  const salesTrendPercentage = firstHalfSales > 0 ? Math.abs(((secondHalfSales - firstHalfSales) / firstHalfSales) * 100) : 0
  
  const firstHalfProfit = data.slice(0, midPoint).reduce((sum, item) => sum + item.profit, 0) / midPoint
  const secondHalfProfit = data.slice(midPoint).reduce((sum, item) => sum + item.profit, 0) / (data.length - midPoint)
  const profitTrend = secondHalfProfit > firstHalfProfit ? 'up' : 'down'
  const profitTrendPercentage = firstHalfProfit > 0 ? Math.abs(((secondHalfProfit - firstHalfProfit) / firstHalfProfit) * 100) : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipCurrency = (value: number, name: string) => {
    if (name === 'profitMargin') {
      return [`${value.toFixed(1)}%`, 'Profit Margin']
    }
    return [formatCurrency(value), name === 'sales' ? 'Penjualan' : 'Profit']
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Tanggal: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {formatTooltipCurrency(entry.value, entry.dataKey)[1]}: {formatTooltipCurrency(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{period}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Penjualan</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalSales)}</p>
                <Badge variant={salesTrend === 'up' ? 'default' : 'destructive'} className="flex items-center gap-1">
                  {salesTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {salesTrendPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Profit</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalProfit)}</p>
                <Badge variant={profitTrend === 'up' ? 'default' : 'destructive'} className="flex items-center gap-1">
                  {profitTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {profitTrendPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Margin Rata-rata</p>
              <p className="text-lg font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                yAxisId="currency"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="currency"
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                name="Penjualan"
              />
              <Line
                yAxisId="currency"
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                name="Profit"
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="profitMargin"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                name="Margin Profit (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-8 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span>Penjualan (Rp)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span>Profit (Rp)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500 border-dashed border-t-2"></div>
            <span>Margin Profit (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
