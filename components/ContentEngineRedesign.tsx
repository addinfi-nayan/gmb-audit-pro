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
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

  const entries: ContentEntry[] = [
    {
      id: "addinfi",
      name: "Addinfi",
      status: "Dormant",
      activity: [1, 0, 0, 0, 0, 0, 0],
      color: "indigo",
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
  const fullDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              CE
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Content Engine
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your weekly content performance</p>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewMode === "cards" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewMode === "timeline" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "cards" ? (
          <div className="grid md:grid-cols-2 gap-8">
            {entries.map((entry) => (
              <div key={entry.id} className="group">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  {/* Header */}
                  <div className={`h-32 bg-gradient-to-br from-${entry.color}-400 to-${entry.color}-600 p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                          {entry.name.charAt(0)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          entry.status === "Active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {entry.status}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{entry.name}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {entry.phone}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Weekly Activity - Bar Chart Style */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Weekly Activity</h4>
                      <div className="space-y-2">
                        {days.map((day, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-8 text-xs font-medium text-gray-600">{day}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r from-${entry.color}-400 to-${entry.color}-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                                  entry.activity[index] === 1 ? 'w-full' : 'w-0'
                                }`}
                              >
                                {entry.activity[index] === 1 && (
                                  <span className="text-white text-xs font-bold">✓</span>
                                )}
                              </div>
                            </div>
                            <div className="w-8 text-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                entry.activity[index] === 1
                                  ? `bg-gradient-to-br from-${entry.color}-400 to-${entry.color}-600 text-white`
                                  : "bg-gray-100 text-gray-400"
                              }`}>
                                {entry.activity[index]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {entry.activity.filter(a => a === 1).length}
                        </div>
                        <div className="text-xs text-gray-600">Posts</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {Math.round((entry.activity.filter(a => a === 1).length / 7) * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">Rate</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl">
                          {entry.status === "Active" ? "�" : "💤"}
                        </div>
                        <div className="text-xs text-gray-600">Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Content Timeline</h2>
            
            {/* Timeline View */}
            <div className="space-y-8">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Entry */}
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${entry.color}-400 to-${entry.color}-600 flex items-center justify-center text-white font-bold text-xl shadow-lg z-10 relative`}>
                      {entry.name.charAt(0)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{entry.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                entry.status === "Active" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {entry.status}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {entry.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Weekly Activity - Bar Chart Style */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Weekly Activity</h4>
                          <div className="space-y-1">
                            {days.map((day, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-6 text-xs font-medium text-gray-600">{day}</div>
                                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r from-${entry.color}-400 to-${entry.color}-600 rounded-full transition-all duration-500 ${
                                      entry.activity[index] === 1 ? 'w-full' : 'w-0'
                                    }`}
                                  />
                                </div>
                                <div className="w-4 text-center">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                    entry.activity[index] === 1
                                      ? `bg-gradient-to-br from-${entry.color}-400 to-${entry.color}-600 text-white`
                                      : "bg-gray-100 text-gray-400"
                                  }`}>
                                    {entry.activity[index]}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Profiles</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {entries.filter(e => e.status === "Active").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {entries.reduce((sum, e) => sum + e.activity.filter(a => a === 1).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
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
