import React, { useState } from 'react';
import { Calendar, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { Email } from '../types/email';

interface EmailSchedulerProps {
  email: Email;
  onSchedule: (date: Date) => Promise<void>;
  onClose: () => void;
}

export function EmailScheduler({ email, onSchedule, onClose }: EmailSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    setIsLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduleDate = new Date(selectedDate);
      scheduleDate.setHours(hours, minutes);
      await onSchedule(scheduleDate);
      onClose();
    } catch (error) {
      console.error('Failed to schedule email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickScheduleOptions = [
    { label: 'Later Today', hours: 3 },
    { label: 'Tomorrow Morning', hours: 24 },
    { label: 'Tomorrow Evening', hours: 32 },
    { label: 'Next Week', hours: 168 },
  ];

  const handleQuickSchedule = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    setSelectedDate(date);
    setSelectedTime(format(date, 'HH:mm'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Schedule Email</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Schedule
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickScheduleOptions.map(({ label, hours }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickSchedule(hours)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Schedule
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="block w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="block w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <button
                onClick={handleSchedule}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Schedule Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}