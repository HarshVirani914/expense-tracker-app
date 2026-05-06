"use client";

import { useContacts } from "../hooks/use-contacts";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ContactSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const ContactSelect = ({
  value = [],
  onChange,
  placeholder = "Select contacts",
  disabled = false,
}: ContactSelectProps) => {
  const [open, setOpen] = useState(false);
  const { contacts, isLoading } = useContacts({ limit: 100 });

  const selectedContacts = contacts?.filter((c) => value.includes(c.id)) || [];

  const handleSelect = (contactId: string) => {
    if (value.includes(contactId)) {
      onChange(value.filter((id) => id !== contactId));
    } else {
      onChange([...value, contactId]);
    }
  };

  const handleRemove = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== contactId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedContacts.length > 0 ? (
              selectedContacts.map((contact) => (
                <Badge key={contact.id} variant="default" className="gap-1">
                  {contact.name}
                  <span
                    onClick={(e: React.MouseEvent<HTMLSpanElement>) =>
                      handleRemove(contact.id, e)
                    }
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search contacts..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No contacts found."}
            </CommandEmpty>
            <CommandGroup>
              {contacts?.map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={contact.name}
                  onSelect={() => handleSelect(contact.id)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value.includes(contact.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <IconCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{contact.name}</div>
                    {contact.email && (
                      <div className="text-xs text-muted-foreground">
                        {contact.email}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
