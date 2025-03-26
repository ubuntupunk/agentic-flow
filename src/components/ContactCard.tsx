import React from 'react';
import { format } from 'date-fns';
import { Mail, Building, Phone, MapPin, Tag } from 'lucide-react';
import type { Contact } from '../types/contact';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export function ContactCard({ contact, onEdit }: ContactCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{contact.name}</h3>
        {onEdit && (
          <button
            onClick={() => onEdit(contact)}
            className="text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-gray-400" />
          <a
            href={`mailto:${contact.email}`}
            className="text-blue-600 hover:text-blue-700"
          >
            {contact.email}
          </a>
        </div>

        {contact.organization && (
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-gray-400" />
            <span>{contact.organization}</span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-gray-400" />
            <a
              href={`tel:${contact.phone}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {contact.phone}
            </a>
          </div>
        )}

        {contact.address && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span>{contact.address}</span>
          </div>
        )}

        {contact.lastInteraction && (
          <div className="text-sm text-gray-500">
            Last interaction: {format(contact.lastInteraction, 'PPP')}
          </div>
        )}

        {contact.labels && contact.labels.length > 0 && (
          <div className="flex items-center space-x-2 mt-4">
            <Tag className="w-5 h-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {contact.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {contact.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
            {contact.notes}
          </div>
        )}
      </div>
    </div>
  );
}