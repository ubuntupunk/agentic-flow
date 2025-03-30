import React from 'react';
import { MessageSquare, Users, Calendar, Brain } from 'lucide-react';
import { format } from 'date-fns';
import type { ThreadAnalysis } from '../types/email';
import { ThreadVisualizer } from './ThreadVisualizer';

interface ThreadAnalysisViewProps {
  analysis: ThreadAnalysis;
  onClose: () => void;
}

export function ThreadAnalysisView({ analysis, onClose }: ThreadAnalysisViewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Thread Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Messages</h3>
              </div>
              <p className="text-2xl font-bold">{analysis.messageCount}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Participants</h3>
              </div>
              <p className="text-2xl font-bold">{analysis.participants.length}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Duration</h3>
              </div>
              <p className="text-2xl font-bold">
                {format(analysis.duration, 'dd:hh:mm')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Sentiment</h3>
              </div>
              <p className="text-2xl font-bold capitalize">{analysis.sentiment}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <ThreadVisualizer analysis={analysis} />
        </div>
      </div>
    </div>
  );
}