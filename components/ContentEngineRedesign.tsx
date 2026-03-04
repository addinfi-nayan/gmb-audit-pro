"use client";
import { useState } from "react";

interface ContentEntry {
  id: string;
  name: string;
  status: "Active" | "Dormant";
  activity: number[];
  color: string;
  phone: string;
}

const ContentEngineRedesign = () => {
  const [selectedEntry, setSelectedEntry] = useState<string>("addinfi");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const entries: ContentEntry[] = [
    {
      id: "addinfi",
      name: "Addinfi",
      status: "Dormant",
      activity: [1, 0, 0, 0, 0, 0, 0],
      color: "blue",
      phone: "+91 98765 00000"
    },
    {
      id: "nagpur-soft",
      name: "Nagpur Soft Tech",
      status: "Active", 
      activity: [1, 1, 0, 0, 0, 0, 0],
      color: "emerald",
      phone: "+91 91234 00000"
    }
  ];

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Engine</h1>
              <p className="text-gray-600 mt-1">Monitor your weekly posting activity</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "grid" 
                    ? "bg-gray-900 text-white" 
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "list" 
                    ? "bg-gray-900 text-white" 
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className={`h-2 bg-gradient-to-r from-${entry.color}-500 to-${entry.color}-600`} />
                
                <div className="p-6">
                  {/* Profile Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-${entry.color}-100 flex items-center justify-center text-${entry.color}-600 font-bold text-lg`}>
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.status === "Active" ? "bg-green-500" : "bg-gray-300"
                          }`} />
                          <span className={`text-sm ${
                            entry.status === "Active" ? "text-green-600" : "text-gray-500"
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-gray-500">{entry.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Weekly Activity */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Activity</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                            entry.activity[index] === 1
                              ? `bg-${entry.color}-500 text-white`
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {day}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {entry.activity.filter(a => a === 1).length}
                      </div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {Math.round((entry.activity.filter(a => a === 1).length / 7) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {entry.status === "Active" ? "🟢" : "⚪"}
                      </div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Profiles</h2>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full bg-${entry.color}-100 flex items-center justify-center text-${entry.color}-600 font-bold`}>
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{entry.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.status === "Active" ? "bg-green-500" : "bg-gray-300"
                          }`} />
                          <span className={`text-sm ${
                            entry.status === "Active" ? "text-green-600" : "text-gray-500"
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {entry.activity.filter(a => a === 1)} posts this week
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-gray-500">{entry.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {days.map((day, index) => (
                        <div key={index} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                          entry.activity[index] === 1
                            ? `bg-${entry.color}-500 text-white`
                            : "bg-gray-200 text-gray-400"
                        }`}>
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Profiles</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {entries.filter(e => e.status === "Active").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {entries.reduce((sum, e) => sum + e.activity.filter(a => a === 1).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((entries.reduce((sum, e) => sum + e.activity.filter(a => a === 1).length, 0) / (entries.length * 7)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Avg. Activity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEngineRedesign;
