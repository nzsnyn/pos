"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useEffect, useState } from "react"

interface EndShiftDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  startBalance: number
  finalBalance: number
  startTime?: string
  totalSales: number
}

export function EndShiftDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  startBalance,
  finalBalance,
  startTime,
  totalSales
}: EndShiftDialogProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const calculateShiftDuration = () => {
    if (!startTime) return "Tidak diketahui"
    
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours} jam ${minutes} menit`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Akhiri Shift?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Date and Time */}
          <div className="text-center">
            <div className="text-lg font-medium text-gray-800">{currentTime}</div>
          </div>

          {/* Shift Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ringkasan Shift</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kasir:</span>
                <span className="font-medium">{userName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durasi Shift:</span>
                <span className="font-medium">{calculateShiftDuration()}</span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saldo Awal:</span>
                  <span className="font-medium">{formatCurrency(startBalance)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saldo Akhir:</span>
                  <span className="font-medium">{formatCurrency(finalBalance)}</span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Penjualan:</span>
                    <span className={`font-bold text-lg ${totalSales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(totalSales))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={onConfirm} 
              variant="destructive" 
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Akhiri Shift
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
