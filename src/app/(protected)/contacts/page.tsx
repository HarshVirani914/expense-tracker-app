'use client'

import { useState } from 'react'
import { ContactList } from '@/features/contacts/components/contact-list'
import { ContactFormDialog } from '@/features/contacts/components/contact-form-dialog'
import type { ContactWithRelations, ContactFilters } from '@/features/contacts/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPlus, IconUserPlus, IconSearch } from '@tabler/icons-react'

export default function ContactsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<
    ContactWithRelations | undefined
  >(undefined)
  
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 20,
    search: '',
  })

  const handleEdit = (contact: ContactWithRelations) => {
    setSelectedContact(contact)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedContact(undefined)
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <IconUserPlus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Contacts</h1>
          </div>
          <p className="text-muted-foreground text-base pl-[52px]">
            Manage people you split expenses with
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <IconPlus className="h-5 w-5" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ContactList onEdit={handleEdit} filters={filters} />

      <ContactFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        contact={selectedContact}
      />
    </div>
  )
}
