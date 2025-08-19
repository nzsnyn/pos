"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  User,
  Loader2,
  AlertTriangle,
  Shield,
  ShieldCheck,
  UserCheck
} from "lucide-react"

interface Employee {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EmployeeFormData {
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  password: string
  confirmPassword: string
  isActive: boolean
}

const initialFormData: EmployeeFormData = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'CASHIER',
  password: '',
  confirmPassword: '',
  isActive: true
}

const roleLabels = {
  ADMIN: 'Administrator',
  MANAGER: 'Manajer',
  CASHIER: 'Kasir'
}

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  CASHIER: 'bg-green-100 text-green-800'
}

const roleIcons = {
  ADMIN: ShieldCheck,
  MANAGER: Shield,
  CASHIER: UserCheck
}

export default function EmployeesPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<EmployeeFormData>>({})
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch employees
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Filter employees
  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleLabels[employee.role].toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmployees(filtered)
  }, [employees, searchTerm])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        toast.error('Gagal memuat data karyawan')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (data: EmployeeFormData, isEditing = false): boolean => {
    const errors: Partial<EmployeeFormData> = {}

    if (!data.username.trim()) {
      errors.username = 'Username harus diisi'
    }

    if (!data.email.trim()) {
      errors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format email tidak valid'
    }

    if (!data.firstName.trim()) {
      errors.firstName = 'Nama depan harus diisi'
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'Nama belakang harus diisi'
    }

    if (!data.role) {
      errors.role = 'Role harus dipilih'
    }

    // Password validation for new employee or when editing password
    if (!isEditing || isEditingPassword) {
      if (!data.password) {
        errors.password = 'Password harus diisi'
      } else if (data.password.length < 6) {
        errors.password = 'Password minimal 6 karakter'
      }

      if (!data.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password harus diisi'
      } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak cocok'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setIsEditingPassword(false)
  }

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (employee: Employee) => {
    setFormData({
      username: employee.username,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      password: '',
      confirmPassword: '',
      isActive: employee.isActive
    })
    setFormErrors({})
    setIsEditingPassword(false)
    setSelectedEmployee(employee)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }

  const handleAdd = async () => {
    if (!validateForm(formData)) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          password: formData.password,
        }),
      })

      if (response.ok) {
        const newEmployee = await response.json()
        setEmployees(prev => [newEmployee, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast.success('Karyawan berhasil ditambahkan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menambahkan karyawan')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error('Terjadi kesalahan saat menambahkan karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedEmployee || !validateForm(formData, true)) return

    setSubmitting(true)
    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isActive: formData.isActive,
      }

      // Only include password if editing password
      if (isEditingPassword) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/users/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? updatedEmployee : emp))
        setShowEditDialog(false)
        setSelectedEmployee(null)
        resetForm()
        toast.success('Karyawan berhasil diperbarui')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui karyawan')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Terjadi kesalahan saat memperbarui karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEmployee) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/users/${selectedEmployee.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEmployees(prev => prev.map(emp => 
          emp.id === selectedEmployee.id ? { ...emp, isActive: false } : emp
        ))
        setShowDeleteDialog(false)
        setSelectedEmployee(null)
        toast.success('Karyawan berhasil dinonaktifkan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menonaktifkan karyawan')
      }
    } catch (error) {
      console.error('Error deactivating employee:', error)
      toast.error('Terjadi kesalahan saat menonaktifkan karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked")
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header
          storeName="Toko Saya POS"
          cashierName={user ? `${user.firstName} ${user.lastName}` : "Memuat..."}
          userRole={user?.role}
          currentTime={currentTime}
          onOpenSettings={handleSettings}
          onOpenReports={handleReports}
          onLogout={handleLogout}
          onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            mode="persistent"
          />
          
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Karyawan</h1>
                  <p className="text-gray-600">Kelola data karyawan dan akses sistem</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Karyawan
                </Button>
              </div>

              {/* Search */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Cari karyawan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Employees List */}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Memuat data...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-700">Nama</th>
                            <th className="text-left p-4 font-medium text-gray-700">Username</th>
                            <th className="text-left p-4 font-medium text-gray-700">Email</th>
                            <th className="text-left p-4 font-medium text-gray-700">Role</th>
                            <th className="text-left p-4 font-medium text-gray-700">Status</th>
                            <th className="text-left p-4 font-medium text-gray-700">Bergabung</th>
                            <th className="text-left p-4 font-medium text-gray-700">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>
                                  {searchTerm 
                                    ? "Tidak ada karyawan yang sesuai dengan pencarian" 
                                    : "Belum ada karyawan yang ditambahkan"
                                  }
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredEmployees.map((employee) => {
                              const RoleIcon = roleIcons[employee.role]
                              return (
                                <tr key={employee.id} className="border-t hover:bg-gray-50">
                                  <td className="p-4">
                                    <div className="font-medium text-gray-900">
                                      {employee.firstName} {employee.lastName}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-gray-600">{employee.username}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-gray-600">{employee.email}</div>
                                  </td>
                                  <td className="p-4">
                                    <Badge className={`gap-1 ${roleColors[employee.role]}`}>
                                      <RoleIcon className="h-3 w-3" />
                                      {roleLabels[employee.role]}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                                      {employee.isActive ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-gray-600">
                                      {new Date(employee.createdAt).toLocaleDateString('id-ID')}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(employee)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openDeleteDialog(employee)}
                                        disabled={!employee.isActive}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Karyawan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nama Depan *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Nama depan"
                    className={formErrors.firstName ? "border-red-500" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nama Belakang *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                    placeholder="Nama belakang"
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                  placeholder="Username untuk login"
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({...prev, role: value}))}>
                  <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">Kasir</SelectItem>
                    <SelectItem value="MANAGER">Manajer</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  placeholder="Minimal 6 karakter"
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                  placeholder="Ulangi password"
                  className={formErrors.confirmPassword ? "border-red-500" : ""}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tambah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Karyawan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">Nama Depan *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Nama depan"
                    className={formErrors.firstName ? "border-red-500" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Nama Belakang *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                    placeholder="Nama belakang"
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                  placeholder="Username untuk login"
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({...prev, role: value}))}>
                  <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">Kasir</SelectItem>
                    <SelectItem value="MANAGER">Manajer</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
                />
                <Label htmlFor="edit-active">Karyawan Aktif</Label>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Switch
                    id="edit-password"
                    checked={isEditingPassword}
                    onCheckedChange={setIsEditingPassword}
                  />
                  <Label htmlFor="edit-password">Ubah Password</Label>
                </div>

                {isEditingPassword && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-new-password">Password Baru *</Label>
                      <Input
                        id="edit-new-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                        placeholder="Minimal 6 karakter"
                        className={formErrors.password ? "border-red-500" : ""}
                      />
                      {formErrors.password && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-confirm-password">Konfirmasi Password Baru *</Label>
                      <Input
                        id="edit-confirm-password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Ulangi password baru"
                        className={formErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle>Nonaktifkan Karyawan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menonaktifkan karyawan "{selectedEmployee?.firstName} {selectedEmployee?.lastName}"?
                    <span className="block mt-2 text-gray-600">
                      Karyawan yang dinonaktifkan tidak akan bisa mengakses sistem.
                    </span>
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Nonaktifkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
