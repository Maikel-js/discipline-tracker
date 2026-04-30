'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Target, Flame, TrendingUp, CheckCircle, AlertCircle, Network } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quarterly' | 'monthly' | 'yearly' | 'okr';
  progress: number;
  dueDate: string;
  linkedHabits: string[];
  linkedTasks: string[];
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'habit' | 'goal' | 'category';
  category?: string;
  completionRate?: number;
  streak?: number;
}

const categoryColors: Record<string, { bg: string; border: string; text: string; line: string; dot: string }> = {
  health: { bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-400', line: '#22c55e', dot: '#22c55e' },
  study: { bg: 'bg-blue-900/40', border: 'border-blue-500', text: 'text-blue-400', line: '#3b82f6', dot: '#3b82f6' },
  exercise: { bg: 'bg-red-900/40', border: 'border-red-500', text: 'text-red-400', line: '#ef4444', dot: '#ef4444' },
  work: { bg: 'bg-purple-900/40', border: 'border-purple-500', text: 'text-purple-400', line: '#a855f7', dot: '#a855f7' },
  personal: { bg: 'bg-yellow-900/40', border: 'border-yellow-500', text: 'text-yellow-400', line: '#eab308', dot: '#eab308' },
  other: { bg: 'bg-gray-800/40', border: 'border-gray-500', text: 'text-gray-400', line: '#6b7280', dot: '#6b7280' }
};

const categoryLabels: Record<string, string> = {
  health: 'Salud',
  study: 'Estudio',
  exercise: 'Ejercicio',
  work: 'Trabajo',
  personal: 'Personal',
  other: 'Otro'
};

export default function LifeGraph() {
  const { habits, stats } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 });

  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter(h => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  const categorizedHabits = useMemo(() => {
    const grouped: Record<string, typeof habits> = {};
    filteredHabits.forEach(habit => {
      if (!grouped[habit.category]) grouped[habit.category] = [];
      grouped[habit.category].push(habit);
    });
    return grouped;
  }, [filteredHabits]);

  const goalsWithHabits = useMemo(() => {
    return goals.filter(goal => goal.linkedHabits.length > 0);
  }, [goals]);

  useEffect(() => {
    const habitCount = filteredHabits.length;
    const goalCount = goalsWithHabits.length;
    const categoryCount = Object.keys(categorizedHabits).length;
    
    const minWidth = Math.max(800, (categoryCount + habitCount) * 120 + goalCount * 150);
    const minHeight = Math.max(600, 300 + habitCount * 30);
    
    setSvgDimensions({ width: minWidth, height: minHeight });
  }, [filteredHabits, goalsWithHabits, categorizedHabits]);

  const getGoalProgress = (goal: Goal) => {
    const linkedHabitIds = goal.linkedHabits;
    const linkedHabits = habits.filter(h => linkedHabitIds.includes(h.id));
    if (linkedHabits.length === 0) return goal.progress;
    
    const avgCompletion = Math.round(
      linkedHabits.reduce((acc, h) => acc + h.completionRate, 0) / linkedHabits.length
    );
    return avgCompletion;
  };

  const addGoal = (title: string, linkedHabitIds: string[]) => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: '',
      type: 'quarterly',
      progress: 0,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      linkedHabits: linkedHabitIds,
      linkedTasks: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setGoals([...goals, newGoal]);
  };

  const categories = Object.keys(categorizedHabits);
  const centerX = svgDimensions.width / 2;
  const centerY = svgDimensions.height / 2;

  const habitNodes: NodePosition[] = useMemo(() => {
    const nodes: NodePosition[] = [];
    const habitCount = filteredHabits.length;
    
    if (habitCount === 0) return nodes;

    const radius = Math.min(svgDimensions.width, svgDimensions.height) * 0.3;
    
    filteredHabits.forEach((habit, index) => {
      const angle = (index / habitCount) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes.push({
        id: habit.id,
        x,
        y,
        label: habit.name,
        type: 'habit',
        category: habit.category,
        completionRate: habit.completionRate,
        streak: habit.currentStreak
      });
    });

    return nodes;
  }, [filteredHabits, svgDimensions]);

  const categoryNodes: NodePosition[] = useMemo(() => {
    const nodes: NodePosition[] = [];
    const catCount = categories.length;
    
    categories.forEach((cat, index) => {
      const angle = (index / catCount) * 2 * Math.PI - Math.PI / 2;
      const radius = Math.min(svgDimensions.width, svgDimensions.height) * 0.15;
      const x = centerX + radius * Math.cos(angle) * 0.5;
      const y = centerY + radius * Math.sin(angle) * 0.5;
      
      nodes.push({
        id: `cat-${cat}`,
        x,
        y,
        label: categoryLabels[cat],
        type: 'category',
        category: cat
      });
    });

    return nodes;
  }, [categories, svgDimensions]);

  const goalNodes: NodePosition[] = useMemo(() => {
    const nodes: NodePosition[] = [];
    
    goalsWithHabits.forEach((goal, index) => {
      const x = 80 + index * 160;
      const y = 60;
      
      nodes.push({
        id: goal.id,
        x,
        y,
        label: goal.title,
        type: 'goal'
      });
    });

    return nodes;
  }, [goalsWithHabits]);

  const connections = useMemo(() => {
    const conns: { from: string; to: string; color: string; type: string }[] = [];
    
    habitNodes.forEach(habitNode => {
      const catNode = categoryNodes.find(cn => cn.category === habitNode.category);
      if (catNode) {
        conns.push({
          from: habitNode.id,
          to: catNode.id,
          color: categoryColors[habitNode.category || 'other'].line,
          type: 'category'
        });
      }

      goalsWithHabits.forEach(goal => {
        if (goal.linkedHabits.includes(habitNode.id)) {
          conns.push({
            from: habitNode.id,
            to: goal.id,
            color: '#a855f7',
            type: 'goal'
          });
        }
      });
    });

    return conns;
  }, [habitNodes, categoryNodes, goalsWithHabits]);

  const getNodeById = (id: string) => {
    return [...habitNodes, ...categoryNodes, ...goalNodes].find(n => n.id === id);
  };

  const backgroundGradient = useMemo(() => {
    if (filteredHabits.length === 0) return '#111827';
    
    const categoriesInUse = [...new Set(filteredHabits.map(h => h.category))];
    if (categoriesInUse.length === 1) {
      return categoryColors[categoriesInUse[0]].line;
    }
    return null;
  }, [filteredHabits]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          Life Graph - Red de Hábitos
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Todos ({habits.length})
          </button>
          {Object.keys(categoryColors).map(cat => {
            const count = habits.filter(h => h.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat ? `${categoryColors[cat].bg} ${categoryColors[cat].text} border ${categoryColors[cat].border}` : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div 
        className="border border-gray-700 rounded-xl overflow-x-auto transition-all duration-500"
        style={{
          background: backgroundGradient 
            ? `radial-gradient(circle at center, ${backgroundGradient}15 0%, #111827 70%)`
            : '#111827'
        }}
      >
        {filteredHabits.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No hay hábitos todavía</p>
              <p className="text-sm">Crea hábitos para ver el grafo</p>
            </div>
          </div>
        ) : (
          <svg width={svgDimensions.width} height={svgDimensions.height} className="min-w-[600px]">
            <defs>
              {Object.entries(categoryColors).map(([cat, colors]) => (
                <marker
                  key={cat}
                  id={`arrow-${cat}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={colors.line} />
                </marker>
              ))}
              <marker
                id="arrow-goal"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-strong">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g>
              {connections.map((conn, i) => {
                const fromNode = getNodeById(conn.from);
                const toNode = getNodeById(conn.to);
                if (!fromNode || !toNode) return null;

                const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;

                return (
                  <line
                    key={`conn-${i}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={conn.color}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : 0.3}
                    markerEnd={conn.type === 'category' ? `url(#arrow-${getNodeById(conn.to)?.category || 'other'})` : 'url(#arrow-goal)'}
                  />
                );
              })}
            </g>

            <g>
              {goalNodes.map(node => {
                const goal = goalsWithHabits.find(g => g.id === node.id);
                if (!goal) return null;
                const progress = getGoalProgress(goal);
                const isHovered = hoveredNode === node.id;

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                    filter={isHovered ? 'url(#glow-strong)' : undefined}
                  >
                    <rect
                      x={node.x - 65}
                      y={node.y - 22}
                      width={130}
                      height={44}
                      rx={10}
                      fill={isHovered ? '#374151' : '#1f2937'}
                      stroke="#a855f7"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    <text x={node.x} y={node.y - 3} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
                      {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
                    </text>
                    <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#9ca3af" fontSize={9}>
                      {progress}% · {goal.linkedHabits.length} hábitos
                    </text>
                  </g>
                );
              })}
            </g>

            <g>
              {categoryNodes.map(node => {
                const colors = categoryColors[node.category || 'other'];
                const habitsInCat = categorizedHabits[node.category || '']?.length || 0;
                const isHovered = hoveredNode === node.id;

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                    filter={isHovered ? 'url(#glow)' : undefined}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill={isHovered ? `${colors.line}20` : '#111827'}
                      stroke={colors.line}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    <text x={node.x} y={node.y - 2} textAnchor="middle" fill={colors.line} fontSize={10} fontWeight="bold">
                      {node.label}
                    </text>
                    <text x={node.x} y={node.y + 10} textAnchor="middle" fill="#6b7280" fontSize={8}>
                      {habitsInCat}
                    </text>
                  </g>
                );
              })}
            </g>

            <g>
              {habitNodes.map(node => {
                const colors = categoryColors[node.category || 'other'];
                const isHovered = hoveredNode === node.id;

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                    filter={isHovered ? 'url(#glow-strong)' : undefined}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={25}
                      fill={isHovered ? `${colors.line}30` : '#111827'}
                      stroke={colors.line}
                      strokeWidth={isHovered ? 3 : 2}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={25 * (node.completionRate || 0) / 100}
                      fill={`${colors.line}20`}
                    />
                    <text x={node.x} y={node.y - 3} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
                      {node.label.length > 10 ? node.label.slice(0, 10) + '...' : node.label}
                    </text>
                    <text x={node.x} y={node.y + 8} textAnchor="middle" fill={colors.line} fontSize={7}>
                      {node.completionRate}%
                    </text>
                    {(node.streak || 0) > 0 && (
                      <circle cx={node.x + 20} cy={node.y - 18} r={6} fill="#f97316">
                        <title>Racha: {node.streak} días</title>
                      </circle>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Hábitos por Categoría
          </h4>
          <div className="space-y-3">
            {Object.entries(categorizedHabits).map(([category, habitsInCat]) => {
              const colors = categoryColors[category];
              return (
                <div key={category} className={`p-3 rounded-lg ${colors.bg} border-l-2 ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${colors.text}`}>{categoryLabels[category]}</span>
                    <span className="text-xs text-gray-400">{habitsInCat.length} hábitos</span>
                  </div>
                  <div className="space-y-1">
                    {habitsInCat.map(habit => (
                      <div key={habit.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          {habit.currentStreak > 0 && (
                            <span className="text-xs text-orange-400 flex items-center gap-1">
                              <Flame size={12} />{habit.currentStreak}
                            </span>
                          )}
                          <span className={`text-xs ${habit.completionRate > 70 ? 'text-green-400' : habit.completionRate > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {habit.completionRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Metas Conectadas
          </h4>
          <div className="space-y-3">
            {goalsWithHabits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay metas con hábitos conectados</p>
              </div>
            ) : (
              goalsWithHabits.map(goal => {
                const progress = getGoalProgress(goal);
                const linkedHabits = habits.filter(h => goal.linkedHabits.includes(h.id));
                return (
                  <div key={goal.id} className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-purple-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-white">{goal.title}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          goal.status === 'active' ? 'bg-green-900 text-green-400' :
                          goal.status === 'completed' ? 'bg-blue-900 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-400">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {linkedHabits.map(habit => (
                        <span
                          key={habit.id}
                          className={`text-xs px-2 py-1 rounded ${categoryColors[habit.category].bg} ${categoryColors[habit.category].text} border ${categoryColors[habit.category].border}`}
                        >
                          {habit.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-4">
            <h4 className="font-medium mb-2">Conectar Hábitos a Meta</h4>
            <div className="space-y-2">
              <input
                placeholder="Nombre de la meta"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                id="goal-title-input"
              />
              <div className="flex flex-wrap gap-2">
                {habits.map(habit => (
                  <label
                    key={habit.id}
                    className="flex items-center gap-1 text-sm text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={habit.id}
                      className="goal-habit-checkbox"
                    />
                    <span className={categoryColors[habit.category].text}>{habit.name}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => {
                  const input = document.getElementById('goal-title-input') as HTMLInputElement;
                  const checkboxes = document.querySelectorAll('.goal-habit-checkbox:checked') as NodeListOf<HTMLInputElement>;
                  const linkedIds = Array.from(checkboxes).map(cb => cb.value);
                  if (input.value && linkedIds.length > 0) {
                    addGoal(input.value, linkedIds);
                    input.value = '';
                    checkboxes.forEach(cb => cb.checked = false);
                  }
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
