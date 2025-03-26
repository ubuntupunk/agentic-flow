import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Tag, Brain } from 'lucide-react';

interface EmailInsightsProps {
  analysis: {
    sentiment: string;
    topics: string[];
    entities: {
      people: string[];
      organizations: string[];
      dates: string[];
    };
    urgency: string;
    actionItems: string[];
    summary: string;
  };
}

export function EmailInsights({ analysis }: EmailInsightsProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Email Insights</h3>
        <Brain className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          {analysis.urgency === 'high' ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : analysis.urgency === 'medium' ? (
            <Clock className="w-5 h-5 text-yellow-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="text-sm font-medium">
            Urgency: <span className="capitalize">{analysis.urgency}</span>
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
          <p className="text-sm text-gray-600">{analysis.summary}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {topic}
              </span>
            ))}
          </div>
        </div>

        {analysis.actionItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Action Items</h4>
            <ul className="space-y-1">
              {analysis.actionItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {analysis.entities.people.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">People</h4>
              <ul className="text-sm text-gray-600">
                {analysis.entities.people.map((person, index) => (
                  <li key={index}>{person}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.entities.organizations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Organizations</h4>
              <ul className="text-sm text-gray-600">
                {analysis.entities.organizations.map((org, index) => (
                  <li key={index}>{org}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}