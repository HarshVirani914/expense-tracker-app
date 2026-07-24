"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ContactsGrid } from "@/features/contacts/components/contacts-grid";
import { ContactsSummaryCard } from "@/features/contacts/components/contacts-summary-card";
import { ManageContactSheet } from "@/features/contacts/components/manage-contact-sheet";
import { useContactStats } from "@/features/contacts/hooks/use-contact-stats";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import type {
  ContactFilters,
  ContactWithRelations,
} from "@/features/contacts/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState } from "@/components/empty-state";
import { IconAddressBook, IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function ContactsPage() {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<
    ContactWithRelations | undefined
  >(undefined);

  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 100,
    search: "",
  });

  const { stats, isLoading: isStatsLoading } = useContactStats();
  const { contacts, isLoading: isContactsLoading } = useContacts(filters);

  const handleContactClick = (contact: ContactWithRelations) => {
    setSelectedContact(contact);
    setIsSheetOpen(true);
  };

  const handleEdit = (contact: ContactWithRelations) => {
    setSelectedContact(contact);
    setIsSheetOpen(false);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContact(undefined);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedContact(undefined);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleAddContact = () => {
    setSelectedContact(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      {!isMobile && (
        <FeaturePageHero className="p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-3xl font-bold tracking-tight min-[480px]:text-4xl">
                Contacts
              </h1>
              <p className="text-muted-foreground text-base">
                People you split expenses with
              </p>
            </div>
            <Button
              onClick={handleAddContact}
              className="gap-2 shrink-0"
              size="lg"
            >
              <IconPlus className="h-5 w-5" />
              Add Contact
            </Button>
          </div>
        </FeaturePageHero>
      )}

      {isStatsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : stats ? (
        <ContactsSummaryCard stats={stats} />
      ) : null}

      <div className="relative max-w-sm min-w-0 w-full">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Search contacts"
          placeholder="Search contacts..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {isContactsLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : contacts && contacts.length > 0 ? (
        <ContactsGrid contacts={contacts} onContactClick={handleContactClick} />
      ) : (
        <EmptyState
          icon={IconAddressBook}
          title={filters.search ? "No contacts found" : "No contacts yet"}
          description={
            filters.search
              ? "Try adjusting your search to find who you're looking for."
              : "Add your first contact to get started."
          }
          actionLabel={filters.search ? undefined : "Add First Contact"}
          onAction={handleAddContact}
        />
      )}

      <ContactFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        contact={selectedContact}
      />

      {selectedContact && (
        <ManageContactSheet
          contact={selectedContact}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onEdit={handleEdit}
        />
      )}

      {isMobile && (
        <Button
          onClick={handleAddContact}
          size="lg"
          aria-label="Add contact"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
