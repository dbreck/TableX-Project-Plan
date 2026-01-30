import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  LayoutDashboard,
  FileText, 
  Code, 
  CheckSquare, 
  Layers, 
  ChevronRight,
  ClipboardList,
  Calendar,
  Sparkles,
  Mail,
  Info,
  Plus,
  Trash2,
  Edit3,
  Save,
  XCircle,
  GripVertical,
  Sun,
  Moon
} from 'lucide-react';

import { 
  TabID, 
  ActionItem,
  GanttTask,
  SimpleListItem,
  DiscoveryActivity,
  Deliverable
} from './types';

import { 
  CLIENT_CONTACTS,
  TEAM_MEMBERS, 
  CURRENT_STATE_POINTS,
  TIMELINE_TASKS, 
  DISCOVERY_ACTIVITIES,
  DELIVERABLES, 
  QUOTEX_ARTIFACTS,
  INITIAL_ACTION_ITEMS 
} from './constants';

import { 
  breakDownTask, 
  draftStatusEmail 
} from './services/geminiService';

import Modal from './components/Modal';

// --- Custom Hook for Persistence ---
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Could not save to local storage", e);
    }
  }, [key, value]);

  return [value, setValue];
}

// --- Main Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabID>('overview');
  
  // Theme State (Default to Dark)
  const [isDarkMode, setIsDarkMode] = useStickyState<boolean>(true, 'tablex_dark_mode');

  // Apply Theme to HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // State for AI Features
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Persistent Data States ---
  
  // 1. Overview Tab
  const [currentStatePoints, setCurrentStatePoints] = useStickyState<SimpleListItem[]>(CURRENT_STATE_POINTS, 'tablex_current_state_v1');
  
  // 2. Timeline Tab
  const [tasks, setTasks] = useStickyState<GanttTask[]>(TIMELINE_TASKS, 'tablex_timeline_tasks_v2');

  // 3. Scope Tab
  const [activities, setActivities] = useStickyState<DiscoveryActivity[]>(DISCOVERY_ACTIVITIES, 'tablex_activities_v1');
  const [deliverables, setDeliverables] = useStickyState<Deliverable[]>(DELIVERABLES, 'tablex_deliverables_v1');

  // 4. QuoteX Tab
  const [quotexArtifacts, setQuotexArtifacts] = useStickyState<SimpleListItem[]>(QUOTEX_ARTIFACTS, 'tablex_quotex_artifacts_v1');

  // 5. Action Items (Checklist)
  const [actionItems, setActionItems] = useStickyState<ActionItem[]>(INITIAL_ACTION_ITEMS, 'tablex_action_items_v1');

  
  // --- Input States (Transient) ---
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null); // For edit modal
  const [inputs, setInputs] = useState({
    currentState: '',
    taskName: '',
    taskOwner: '',
    taskDuration: '2',
    activityTitle: '',
    activityDesc: '',
    deliverableName: '',
    deliverableDesc: '',
    quotexItem: '',
    actionItem: ''
  });

  // --- Dragging State ---
  const [dragState, setDragState] = useState<{
    taskId: number;
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    originalStart: number;
    originalDuration: number;
    pixelsPerDay: number;
  } | null>(null);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // --- Handlers ---

  const handleAIRequest = async (title: string, fn: () => Promise<string>) => {
    setModalTitle(title);
    setModalContent('');
    setLoading(true);
    setModalOpen(true);
    try {
      const result = await fn();
      setModalContent(result);
    } catch (e) {
      setModalContent("Error: Could not fetch data from Gemini. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Generic Generic Generic Add/Delete Helpers
  const addItem = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>, 
    item: T, 
    inputField: keyof typeof inputs | (keyof typeof inputs)[],
    resetValue: string = ''
  ) => {
    setter(prev => [...prev, item]);
    if (Array.isArray(inputField)) {
       inputField.forEach(f => handleInputChange(f, resetValue));
    } else {
       handleInputChange(inputField, resetValue);
    }
  };

  const deleteItem = <T extends { id: any }>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: any) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  // Specific Actions
  const addCurrentState = () => {
    if (!inputs.currentState) return;
    addItem(setCurrentStatePoints, { id: Date.now().toString(), text: inputs.currentState }, 'currentState');
  };

  const addTask = () => {
    if (!inputs.taskName) return;
    const newTask: GanttTask = {
      id: Date.now(),
      name: inputs.taskName,
      owner: inputs.taskOwner || 'Team',
      start: tasks.length > 0 ? tasks[tasks.length - 1].start + 1 : 0, // simple heuristic
      duration: parseInt(inputs.taskDuration) || 1,
      color: 'bg-zinc-500', // default
      description: 'New user created task'
    };
    addItem(setTasks, newTask, ['taskName', 'taskOwner', 'taskDuration'], '2');
  };

  const addActivity = () => {
    if (!inputs.activityTitle) return;
    addItem(setActivities, { id: Date.now().toString(), title: inputs.activityTitle, desc: inputs.activityDesc }, ['activityTitle', 'activityDesc']);
  };

  const addDeliverable = () => {
    if (!inputs.deliverableName) return;
    addItem(setDeliverables, { id: Date.now().toString(), name: inputs.deliverableName, desc: inputs.deliverableDesc }, ['deliverableName', 'deliverableDesc']);
  };

  const addQuotexArtifact = () => {
    if (!inputs.quotexItem) return;
    addItem(setQuotexArtifacts, { id: Date.now().toString(), text: inputs.quotexItem }, 'quotexItem');
  };

  const addActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.actionItem.trim()) return;
    addItem(setActionItems, { id: Date.now(), text: inputs.actionItem, isCompleted: false }, 'actionItem');
  };

  const saveTaskDetails = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const toggleActionItem = (id: number) => {
    setActionItems(prev => prev.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const handleDraftEmail = () => {
    const completedCount = actionItems.filter(i => i.isCompleted).length;
    const totalCount = actionItems.length;
    handleAIRequest("Draft Status Email", () => draftStatusEmail(completedCount, totalCount));
  };

  // --- Drag & Drop Logic ---
  
  const handleDragStart = (e: React.MouseEvent, task: GanttTask, type: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find width of the container
    const container = e.currentTarget.closest('.timeline-track-container');
    if (!container) return;
    
    const containerWidth = (container as HTMLElement).offsetWidth;
    // Assuming 15 day timeline
    const pixelsPerDay = containerWidth / 15;

    setDragState({
      taskId: task.id,
      type,
      startX: e.clientX,
      originalStart: task.start,
      originalDuration: task.duration,
      pixelsPerDay
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaX / dragState.pixelsPerDay);

      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id !== dragState.taskId) return task;

        let newStart = dragState.originalStart;
        let newDuration = dragState.originalDuration;

        if (dragState.type === 'move') {
          // Move logic: update start, keep duration
          newStart = Math.max(0, Math.min(15 - newDuration, dragState.originalStart + deltaDays));
        } else if (dragState.type === 'resize-right') {
          // Resize right: keep start, update duration
          const maxDuration = 15 - newStart;
          newDuration = Math.max(1, Math.min(maxDuration, dragState.originalDuration + deltaDays));
        } else if (dragState.type === 'resize-left') {
          // Resize left: update start and duration (end remains same)
          const originalEnd = dragState.originalStart + dragState.originalDuration;
          const proposedStart = dragState.originalStart + deltaDays;
          // Ensure we don't start before 0
          // Ensure we don't shrink duration below 1
          // Ensure new start is not after originalEnd - 1
          newStart = Math.max(0, Math.min(originalEnd - 1, proposedStart));
          newDuration = originalEnd - newStart;
        }

        return { ...task, start: newStart, duration: newDuration };
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Add Cursor styling to body while dragging
    document.body.style.cursor = dragState.type === 'move' ? 'grabbing' : 'ew-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [dragState, setTasks]);


  const tabs = [
    { id: 'overview', label: 'Overview & Team', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'scope', label: 'Scope & Deliverables', icon: FileText },
    { id: 'quotex', label: 'QuoteX Platform', icon: Code },
    { id: 'actions', label: 'Next Steps', icon: CheckSquare },
  ];

  // --- Render Views ---

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Client Info */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-4">Client Overview</h2>
        <div className="mb-8">
          <p className="text-lg font-bold text-slate-900 dark:text-zinc-50">TableX (tablex.com)</p>
          <p className="text-slate-600 dark:text-zinc-400 text-base mt-1">Commercial table manufacturer based in Jasper, IN.</p>
        </div>
        
        <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Key Contacts</h3>
        <div className="space-y-6">
          {CLIENT_CONTACTS.map((contact, i) => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-zinc-200">{contact.name}</div>
                <div className="text-slate-500 dark:text-zinc-400 text-sm">{contact.role}</div>
              </div>
              <div className="text-right text-slate-600 dark:text-zinc-400">
                <div className="text-teal-600 dark:text-teal-400 font-medium text-sm">{contact.email}</div>
                <div className="text-sm mt-0.5">{contact.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Team & Current State */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-4">ClearPH Team</h2>
          <div className="space-y-6">
            {TEAM_MEMBERS.map((member, i) => {
               let bgClass = 'bg-slate-100 dark:bg-zinc-800';
               let textClass = 'text-slate-700 dark:text-zinc-300';
               if (member.name.startsWith('Danny')) { bgClass = 'bg-teal-50 dark:bg-teal-900/40'; textClass = 'text-teal-700 dark:text-teal-300'; }
               if (member.name.startsWith('Arabella')) { bgClass = 'bg-orange-50 dark:bg-orange-900/40'; textClass = 'text-orange-700 dark:text-orange-300'; }
               
               return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center ${textClass} font-bold text-base shadow-sm`}>
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-zinc-200">{member.name}</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{member.role}</p>
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-orange-900/10 p-8 rounded-2xl border border-amber-100/50 dark:border-orange-800/30">
          <h2 className="text-lg font-bold mb-3 text-amber-900 dark:text-orange-200">Current State Analysis</h2>
          <ul className="list-disc pl-5 space-y-3 text-base text-amber-800/90 dark:text-orange-200/80 leading-relaxed mb-4">
            {currentStatePoints.map((item) => (
               <li key={item.id} className="group relative pr-6">
                 {item.text}
                 <button 
                   onClick={() => deleteItem(setCurrentStatePoints, item.id)}
                   className="absolute right-0 top-1 text-amber-900/40 dark:text-orange-200/40 hover:text-amber-700 dark:hover:text-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"
                   title="Delete"
                 >
                   <Trash2 size={14} />
                 </button>
               </li>
            ))}
          </ul>
          
          <div className="flex gap-2 pt-2 border-t border-amber-200/50 dark:border-orange-800/30">
             <input 
               type="text" 
               value={inputs.currentState}
               onChange={(e) => handleInputChange('currentState', e.target.value)}
               placeholder="Add new analysis point..."
               className="flex-1 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-amber-200 dark:border-orange-800/50 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
             />
             <button onClick={addCurrentState} className="bg-amber-100 dark:bg-orange-800 text-amber-800 dark:text-orange-100 px-3 py-1 rounded text-xs font-bold hover:bg-amber-200 dark:hover:bg-orange-700 transition-colors">+</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-x-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Project Timeline</h2>
          <p className="text-base text-slate-500 dark:text-zinc-400 mt-1">Discovery & Framing • 3 Weeks Estimate</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg border border-slate-100 dark:border-zinc-700">
           <div className="flex items-center gap-2 px-2">
             <div className="w-2.5 h-2.5 rounded-full bg-zinc-500"></div> Admin
           </div>
           <div className="flex items-center gap-2 px-2 border-l border-slate-200 dark:border-zinc-700">
             <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div> Discovery
           </div>
           <div className="flex items-center gap-2 px-2 border-l border-slate-200 dark:border-zinc-700">
             <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Strategy
           </div>
           <div className="flex items-center gap-2 px-2 border-l border-slate-200 dark:border-zinc-700">
             <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div> Definition
           </div>
        </div>
      </div>

      {/* Gantt Header */}
      <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 dark:border-zinc-800 pb-3 mb-4 min-w-[800px]">
         <div className="text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider pl-2">Task & Owner</div>
         <div className="grid grid-cols-3 text-center gap-2">
            <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 py-1.5 rounded-md">Week 1 (Feb 2-6)</div>
            <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 py-1.5 rounded-md">Week 2 (Feb 9-13)</div>
            <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 py-1.5 rounded-md">Week 3 (Feb 16-20)</div>
         </div>
      </div>

      {/* Gantt Body */}
      <div className="space-y-2 min-w-[800px]">
        {tasks.map((task) => (
          <div key={task.id} className="grid grid-cols-[240px_1fr] items-center group hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 rounded-lg p-2 transition-colors relative">
            
            {/* Delete Button (Absolute to left) */}
            <button 
              onClick={() => deleteItem(setTasks, task.id)}
              className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>

            {/* Left Column: Task Info */}
            <div className="pr-6 flex flex-col">
              <div className="flex items-center gap-2">
                 <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-snug">{task.name}</div>
                 
                 {/* Notes Button */}
                 <button 
                  onClick={() => setEditingTask(task)}
                  className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors ${task.userNotes ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-zinc-600 hover:text-slate-500 dark:hover:text-zinc-400'}`}
                  title="Edit Task & Notes"
                 >
                    <Edit3 size={14} />
                 </button>

                 <div className="relative group/info">
                    <Info size={14} className="text-slate-400 dark:text-zinc-500 hover:text-teal-500 dark:hover:text-teal-400 cursor-help" />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-3 bg-slate-800 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 pointer-events-none border border-slate-700 dark:border-zinc-700">
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-zinc-800 rotate-45 border-l border-b border-slate-700 dark:border-zinc-700"></div>
                        <p className="relative z-10 leading-relaxed font-medium">{task.description}</p>
                    </div>
                 </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{task.owner}</div>
              {task.userNotes && (
                <div className="mt-1 text-[10px] text-teal-600 dark:text-teal-400 truncate max-w-[200px] border-l-2 border-teal-200 dark:border-teal-800 pl-2">
                  {task.userNotes}
                </div>
              )}
            </div>

            {/* Right Column: Visual Bar */}
            <div className="relative h-10 flex items-center timeline-track-container">
              {/* Grid Lines for reference */}
              <div className="absolute inset-0 grid grid-cols-3 gap-2 pointer-events-none">
                 <div className="border-l border-dashed border-slate-200 dark:border-zinc-800 h-full ml-[1px]"></div>
                 <div className="border-l border-dashed border-slate-200 dark:border-zinc-800 h-full ml-[1px]"></div>
                 <div className="border-l border-dashed border-slate-200 dark:border-zinc-800 h-full ml-[1px]"></div>
              </div>

              {/* The Task Bar */}
              <div 
                className={`absolute h-7 rounded-md shadow-sm ${task.color} opacity-90 group-hover:opacity-100 transition-all select-none`}
                style={{
                  left: `${(task.start / 15) * 100}%`, // 15 working days
                  width: `${(task.duration / 15) * 100}%`
                }}
                title={`Double click to edit. Drag to move/resize.`}
              >
                 {/* Left Handle */}
                 <div 
                   className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 hover:bg-white/30 rounded-l-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                   onMouseDown={(e) => handleDragStart(e, task, 'resize-left')}
                 >
                    <div className="w-0.5 h-3 bg-white/50 rounded-full"></div>
                 </div>

                 {/* Right Handle */}
                 <div 
                   className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 hover:bg-white/30 rounded-r-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                   onMouseDown={(e) => handleDragStart(e, task, 'resize-right')}
                 >
                    <div className="w-0.5 h-3 bg-white/50 rounded-full"></div>
                 </div>

                 {/* Main Grab Area */}
                 <div 
                    className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center px-3"
                    onMouseDown={(e) => handleDragStart(e, task, 'move')}
                    onDoubleClick={() => setEditingTask(task)}
                 >
                    {task.duration > 2 && <span className="text-[10px] text-white/95 font-bold tracking-wide pointer-events-none">{task.duration} days</span>}
                 </div>
              </div>
            </div>

          </div>
        ))}
      </div>
      
      {/* Add Task Form */}
      <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/30 rounded-lg p-4 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">New Task Name</label>
            <input 
              type="text" 
              value={inputs.taskName}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              className="w-full mt-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" 
              placeholder="e.g. Design Review"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">Owner</label>
            <input 
              type="text" 
              value={inputs.taskOwner}
              onChange={(e) => handleInputChange('taskOwner', e.target.value)}
              className="w-full mt-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" 
              placeholder="e.g. Danny"
            />
          </div>
          <div className="w-full md:w-24">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">Days</label>
            <input 
              type="number" 
              min="1" max="15"
              value={inputs.taskDuration}
              onChange={(e) => handleInputChange('taskDuration', e.target.value)}
              className="w-full mt-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" 
            />
          </div>
          <button 
            onClick={addTask}
            className="w-full md:w-auto px-4 py-1.5 bg-teal-600 text-white rounded font-bold text-sm hover:bg-teal-700 shadow-sm"
          >
            Add Task
          </button>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-slate-600 dark:text-zinc-500 px-1">
         <div>* Timeline assumes 5-day work weeks starting Feb 02, 2026.</div>
         <div className="font-semibold text-slate-800 dark:text-zinc-300">Estimated Completion: Feb 20, 2026</div>
      </div>
    </div>
  );

  const renderScope = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Discovery Activities */}
      <section>
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Discovery Activities</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((item, i) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700 transition-all group relative">
              <button 
                onClick={() => deleteItem(setActivities, item.id)}
                className="absolute top-4 right-4 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              <div className="text-teal-600 dark:text-teal-400 font-bold text-xl mb-3 opacity-30 group-hover:opacity-100 transition-opacity">0{i+1}</div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-[15px] text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
          
          {/* Add Activity Card */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-center">
             <input 
               className="w-full bg-white dark:bg-zinc-900 border-b border-slate-300 dark:border-zinc-700 focus:border-teal-500 outline-none font-bold text-lg text-slate-900 dark:text-white mb-3 placeholder:text-slate-400 px-2 py-1 rounded-t"
               placeholder="New Activity Title"
               value={inputs.activityTitle}
               onChange={(e) => handleInputChange('activityTitle', e.target.value)}
             />
             <textarea 
               className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded p-2 focus:border-teal-500 outline-none text-sm text-slate-900 dark:text-white mb-3 resize-none"
               placeholder="Description..."
               rows={2}
               value={inputs.activityDesc}
               onChange={(e) => handleInputChange('activityDesc', e.target.value)}
             />
             <button onClick={addActivity} className="self-start bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-teal-700">
               + Add Activity
             </button>
          </div>
        </div>
      </section>

      {/* Deliverables Table */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-6">Phase 1 Deliverables</h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 w-20">#</th>
                <th className="px-8 py-5">Deliverable</th>
                <th className="px-8 py-5 hidden md:table-cell">Description</th>
                <th className="px-4 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {deliverables.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-8 py-6 text-slate-400 dark:text-zinc-500 font-mono text-sm">{i+1}</td>
                  <td className="px-8 py-6 font-bold text-slate-900 dark:text-zinc-200 text-[15px]">{row.name}</td>
                  <td className="px-8 py-6 text-slate-600 dark:text-zinc-400 text-[15px] leading-relaxed hidden md:table-cell">{row.desc}</td>
                  <td className="px-4 py-6 text-right">
                     <button onClick={() => deleteItem(setDeliverables, row.id)} className="text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
              {/* Add Deliverable Row */}
              <tr className="bg-slate-50/50 dark:bg-zinc-800/30">
                 <td className="px-8 py-4 text-slate-300 dark:text-zinc-600 font-mono text-sm">+</td>
                 <td className="px-8 py-4">
                    <input 
                      className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
                      placeholder="New Deliverable Name"
                      value={inputs.deliverableName}
                      onChange={(e) => handleInputChange('deliverableName', e.target.value)}
                    />
                 </td>
                 <td className="px-8 py-4 hidden md:table-cell">
                    <input 
                      className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
                      placeholder="Description"
                      value={inputs.deliverableDesc}
                      onChange={(e) => handleInputChange('deliverableDesc', e.target.value)}
                    />
                 </td>
                 <td className="px-4 py-4 text-right">
                    <button onClick={addDeliverable} className="bg-teal-600 text-white rounded p-1 hover:bg-teal-700">
                       <Plus size={16} />
                    </button>
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderQuoteX = () => (
    <div className="bg-black text-white rounded-3xl p-10 shadow-2xl animate-fade-in relative overflow-hidden border border-zinc-800">
      <div className="absolute top-0 right-0 p-40 bg-teal-900 rounded-full blur-[150px] opacity-30 pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
             <Code size={32} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">QuoteX Parallel Track</h2>
            <p className="text-zinc-400 text-lg mt-1">Custom Sales Rep Portal & Quoting Tool</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-teal-400 font-bold mb-3 uppercase tracking-wide text-sm">Goal</h3>
              <p className="text-zinc-300 text-xl font-light leading-relaxed">
                Replace cumbersome manual processes. Enable reps to perform <span className="text-white font-semibold">80% of quotes</span> self-service, reducing internal load.
              </p>
            </div>

            <div>
              <h3 className="text-teal-400 font-bold mb-3 uppercase tracking-wide text-sm">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Radix UI'].map(tech => (
                  <span key={tech} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm font-medium text-teal-100 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
              <ClipboardList size={20} className="text-teal-400"/>
              Immediate Needs (Artifacts)
            </h3>
            <ul className="space-y-4 text-[15px] text-zinc-300 mb-6">
              {quotexArtifacts.map(item => (
                <li key={item.id} className="flex gap-3 items-start group">
                  <ChevronRight size={18} className="text-teal-500 shrink-0 mt-0.5" />
                  <span className="flex-1">{item.text}</span>
                  <button 
                    onClick={() => deleteItem(setQuotexArtifacts, item.id)}
                    className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="flex gap-2">
               <input 
                 className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                 placeholder="Add new artifact..."
                 value={inputs.quotexItem}
                 onChange={(e) => handleInputChange('quotexItem', e.target.value)}
               />
               <button onClick={addQuotexArtifact} className="bg-teal-600 text-white px-3 rounded font-bold hover:bg-teal-700 transition-colors">
                 <Plus size={18} />
               </button>
            </div>

            <div className="mt-8 pt-5 border-t border-zinc-800">
              <p className="text-sm text-zinc-500 italic">
                Note: Shared discovery insights (product data/SKU logic) with the main website project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNextSteps = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-900/30 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-teal-900 dark:text-teal-100">Immediate Next Steps</h2>
                <p className="text-teal-600/80 dark:text-teal-300/80 text-sm mt-1">Checklist for Phase 1 Kickoff</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-300 bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-teal-100 dark:border-teal-900/30 shadow-sm">
              In Progress
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {actionItems.map((step) => (
              <div 
                key={step.id} 
                onClick={() => toggleActionItem(step.id)}
                className={`
                  p-5 flex items-start justify-between cursor-pointer transition-all duration-200 group
                  ${step.isCompleted ? 'bg-slate-50 dark:bg-zinc-800/50' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/30'}
                `}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`
                    mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                    ${step.isCompleted ? 'bg-teal-500 border-teal-500 text-white shadow-sm' : 'border-slate-300 dark:border-zinc-600 text-transparent group-hover:border-teal-400'}
                  `}>
                    <CheckSquare size={16} strokeWidth={3} />
                  </div>
                  <span className={`text-[15px] font-medium leading-relaxed transition-colors ${step.isCompleted ? 'text-slate-400 dark:text-zinc-500 line-through' : 'text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    {step.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(setActionItems, step.id);
                    }}
                    className="p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAIRequest(`AI Breakdown: ${step.text}`, () => breakDownTask(step.text));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg flex items-center gap-2 text-xs font-bold ml-2"
                  >
                    <Sparkles size={14} />
                    Breakdown
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200/60 dark:border-zinc-800">
             <form onSubmit={addActionItem} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputs.actionItem}
                  onChange={(e) => handleInputChange('actionItem', e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 bg-white dark:bg-black text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
                <button 
                  type="submit"
                  disabled={!inputs.actionItem.trim()}
                  className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={20} />
                </button>
             </form>
          </div>
          
          {/* AI Status Action */}
          <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200/60 dark:border-zinc-800 flex justify-end">
             <button 
               onClick={handleDraftEmail}
               className="flex items-center gap-2 bg-slate-900 dark:bg-black border border-transparent dark:border-zinc-700 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
             >
               <Mail size={18} className="text-teal-300" />
               Draft Status Email ✨
             </button>
          </div>
       </div>
       
       <div className="text-center mt-8 text-sm text-slate-400 dark:text-zinc-500">
         <p>Use the ✨ Sparkles button to get AI suggestions for each task.</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans relative pb-12 transition-colors duration-300">
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        content={modalContent} 
        isLoading={loading}
      />

      {/* Editing Modal for Task Details */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Task Details</h3>
              <button onClick={() => setEditingTask(null)}><div className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">✕</div></button>
            </div>
            <div className="p-6 space-y-5">
              
              {/* Name & Owner */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 mb-1">Task Name</label>
                   <input 
                     type="text" 
                     className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                     value={editingTask.name}
                     onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 mb-1">Owner</label>
                   <input 
                     type="text" 
                     className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                     value={editingTask.owner}
                     onChange={(e) => setEditingTask({...editingTask, owner: e.target.value})}
                   />
                </div>
              </div>

              {/* Start & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 mb-1">Start Day (Offset)</label>
                  <input 
                    type="number" min="0" max="15"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    value={editingTask.start}
                    onChange={(e) => setEditingTask({...editingTask, start: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 mb-1">Duration (Days)</label>
                  <input 
                    type="number" min="1" max="15"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    value={editingTask.duration}
                    onChange={(e) => setEditingTask({...editingTask, duration: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 dark:text-zinc-500 mb-2">My Notes</label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm leading-relaxed bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  placeholder="Add your personal notes or updates here..."
                  value={editingTask.userNotes || ''}
                  onChange={(e) => setEditingTask({...editingTask, userNotes: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl flex justify-end gap-2">
              <button 
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={saveTaskDetails}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-1.5 bg-teal-600 rounded-lg shadow-sm">
                <Layers className="text-white w-6 h-6" />
              </div>
              TableX <span className="text-slate-400 dark:text-zinc-500 font-normal">Dashboard</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1 pl-11">Discovery & Framing • January 29, 2026</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-slate-500 hover:text-teal-500 dark:text-zinc-400 dark:hover:text-teal-400 bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-zinc-700 transition-all mr-2"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold border border-teal-100/50 dark:border-teal-900/30 shadow-sm">
                <Sparkles size={14} className="text-teal-500 dark:text-teal-400"/>
                Gemini 2.0 Flash
             </div>
             <div className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-zinc-700 shadow-sm">
               Phase 1
             </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabID)}
                  className={`
                    flex items-center gap-2.5 py-4 px-1 border-b-[3px] font-medium text-[15px] transition-all whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'border-teal-600 text-teal-700 dark:text-teal-400' 
                      : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'}
                  `}
                >
                  <Icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'scope' && renderScope()}
        {activeTab === 'quotex' && renderQuoteX()}
        {activeTab === 'actions' && renderNextSteps()}
      </main>

    </div>
  );
}