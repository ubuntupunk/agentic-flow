import React from 'react';
import { format } from 'date-fns';
import CalendarHeatmap from 'react-calendar-heatmap';
import { MessageSquare, Paperclip, Tag, Users } from 'lucide-react';
import type { ThreadAnalysis, ThreadEvent } from '../types/email';

interface ThreadVisualizerProps {
  analysis: ThreadAnalysis;
}

export function ThreadVisualizer({ analysis }: ThreadVisualizerProps) {
  const getEventIcon = (type: ThreadEvent['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'attachment':
        return <Paperclip className="w-4 h-4 text-green-500" />;
      case 'label':
        return <Tag className="w-4 h-4 text-purple-500" />;
      case 'participant':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Thread Analysis</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <ul className="space-y-2">
            <li>Messages: {analysis.messageCount}</li>
            <li>Participants: {analysis.participants.length}</li>
            <li>Duration: {format(analysis.duration, 'dd:hh:mm')}</li>
            <li>Sentiment: {analysis.sentiment}</li>
          </ul>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.topics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Activity Timeline</h3>
        <CalendarHeatmap
          startDate={analysis.timeline[0]?.date}
          endDate={analysis.timeline[analysis.timeline.length - 1]?.date}
          values={analysis.timeline.map(event => ({
            date: event.date,
            count: 1,
          }))}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            return `color-scale-${Math.min(value.count, 4)}`;
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Event Timeline</h3>
        <div className="space-y-4">
          {analysis.timeline.map((event, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
            >
              {getEventIcon(event.type)}
              <span className="text-sm text-gray-500">
                {format(event.date, 'MMM d, h:mm a')}
              </span>
              <span className="flex-1">{event.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}