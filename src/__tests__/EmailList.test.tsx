import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmailList } from '../components/EmailList'; // Adjust path if needed
import type { Email } from '../types/email'; // Adjust path if needed

// Mock data
const mockEmails: Email[] = [
  {
    id: '1',
    from: 'sender1@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Email Subject 1',
    body: 'Body 1',
    snippet: 'Snippet 1...',
    date: new Date('2024-01-01T10:00:00Z'),
    labels: ['INBOX', 'UNREAD'],
    isUnread: true,
    priority: 'normal',
    attachments: [],
  },
  {
    id: '2',
    from: 'sender2@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Email Subject 2',
    body: 'Body 2',
    snippet: 'Snippet 2...',
    date: new Date('2024-01-02T11:00:00Z'),
    labels: ['INBOX'],
    isUnread: false,
    priority: 'high',
    attachments: [],
  },
];

describe('EmailList Component', () => {
  it('renders a list of emails', () => {
    const handleEmailSelect = vi.fn();
    render(<EmailList emails={mockEmails} onEmailSelect={handleEmailSelect} />);

    // Check if email subjects are rendered
    expect(screen.getByText('Test Email Subject 1')).toBeInTheDocument();
    expect(screen.getByText('Test Email Subject 2')).toBeInTheDocument();

    // Check if senders are rendered
    expect(screen.getByText('sender1@example.com')).toBeInTheDocument();
    expect(screen.getByText('sender2@example.com')).toBeInTheDocument();
  });

  it('calls onEmailSelect when an email item is clicked', () => {
    const handleEmailSelect = vi.fn();
    render(<EmailList emails={mockEmails} onEmailSelect={handleEmailSelect} />);

    // Find the first email item (assuming the subject is clickable or within a clickable element)
    const firstEmailItem = screen.getByText('Test Email Subject 1').closest('div'); // Adjust selector based on actual component structure
    expect(firstEmailItem).toBeInTheDocument();

    if (firstEmailItem) {
      fireEvent.click(firstEmailItem);
      // Check if the callback was called once with the correct email data
      expect(handleEmailSelect).toHaveBeenCalledTimes(1);
      expect(handleEmailSelect).toHaveBeenCalledWith(mockEmails[0]);
    }
  });

  it('renders an empty state message when no emails are provided', () => {
    const handleEmailSelect = vi.fn();
    render(<EmailList emails={[]} onEmailSelect={handleEmailSelect} />);

    // Check for an empty state message (adjust text as needed)
    expect(screen.getByText(/no emails found/i)).toBeInTheDocument(); // Example text
    expect(screen.queryByText('Test Email Subject 1')).not.toBeInTheDocument();
  });

  it('applies different styling for unread emails', () => {
    const handleEmailSelect = vi.fn();
    render(<EmailList emails={mockEmails} onEmailSelect={handleEmailSelect} />);

    const unreadEmailItem = screen.getByText('Test Email Subject 1').closest('div');
    const readEmailItem = screen.getByText('Test Email Subject 2').closest('div');

    // Check for a class or style difference (e.g., font-weight)
    // This depends heavily on the actual implementation of EmailList/EmailListItem
    // Example check (adjust class name):
    expect(unreadEmailItem).toHaveClass('font-bold'); // Assuming unread emails are bold
    expect(readEmailItem).not.toHaveClass('font-bold');
  });
});
