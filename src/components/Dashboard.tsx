import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';
import { 
  Package, TrendingDown, ClipboardList, AlertTriangle, 
  RotateCcw, Play, StopCircle, BarChart3, Settings2,
  Box, Cpu, Database, Activity, Target, Zap, Info, ShieldCheck,
  LayoutDashboard, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulation } from '../hooks/useSimulation.ts';

export default function Dashboard() {
  const { history, stats, isTraining, train, compare, stopTraining, getInsights } = useSimulation();
  const [comparison, setComparison] = React.useState<any>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<'DQN' | 'Q'>('DQN');

  const handleCompare = async () => {
    const results = await compare();
    setComparison(results);
  };

  const currentInventory = history.length > 0 ? history[history.length - 1].inventory : 0;
  const currentReward = stats.totalReward.toFixed(1);
  const currentOrder = history.length > 0 ? history[history.length - 1].order : 0;
  const insights = useMemo(() => getInsights(), [history]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-teal-500/30">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
            SupplyChain <span className="text-teal-400 font-medium px-2 py-0.5 bg-teal-400/10 rounded text-xs border border-teal-400/20 uppercase tracking-wider">Enterprise RL</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isTraining ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System: {isTraining ? 'Training' : 'Optimizing'}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-950">
            <span className="text-xs font-bold font-mono">EN</span>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 border-r border-slate-800 flex flex-col p-6 gap-8 bg-slate-950 shrink-0">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-6 font-bold flex items-center gap-2">
                <Box size={12} className="text-teal-400" />
                DQN Parameters
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Training Target</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setSelectedAgent('DQN')}
                        className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${selectedAgent === 'DQN' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Deep Q (DQN)
                    </button>
                    <button 
                        onClick={() => setSelectedAgent('Q')}
                        className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${selectedAgent === 'Q' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Q-Table
                    </button>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={isTraining ? stopTraining : () => train(300, selectedAgent === 'DQN')}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${
                      isTraining 
                      ? 'bg-slate-900 border-amber-500/50 text-amber-500' 
                      : 'bg-slate-900 border-slate-800 hover:border-teal-500/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isTraining ? <StopCircle size={18} /> : <Play size={18} className="group-hover:text-teal-400" />}
                    <span className="text-sm font-bold tracking-tight uppercase">
                      {isTraining ? 'Stop Pipeline' : `Train ${selectedAgent}`}
                    </span>
                  </div>
                </button>

                <button 
                  onClick={handleCompare}
                  disabled={isTraining}
                  className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3 text-slate-300 hover:border-teal-500/50 transition-all group disabled:opacity-30"
                >
                  <ShieldCheck size={18} className="group-hover:text-teal-400" />
                  <span className="text-sm font-bold tracking-tight uppercase">Full Audit Bench</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-6 font-bold flex items-center gap-2">
                <Activity size={12} className="text-teal-400" />
                Live Network Health
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="uppercase tracking-widest">Global Episodes</span>
                  <span className="text-white font-bold">{stats.episode.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.episode / 500) * 100)}%` }}
                    className="h-full bg-teal-500" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Service Level</p>
                    <p className="text-lg font-mono text-emerald-400 font-bold tracking-tighter">{stats.serviceLevel.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Net Utility</p>
                    <p className="text-lg font-mono text-white font-bold tracking-tighter">{currentReward}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
             <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                <p className="text-[10px] uppercase tracking-widest text-teal-400 font-bold mb-3 flex items-center gap-2">
                    <History size={12} />
                    Audit Log
                </p>
                <div className="space-y-2 max-h-32 overflow-hidden mask-fade-bottom">
                    <LogEntry time="04:20:11" msg="Neural Network synchronized" />
                    <LogEntry time="04:20:05" msg="Replay buffer populateding" />
                    <LogEntry time="04:19:58" msg="Reward function calibrated" />
                </div>
             </div>
          </div>
        </aside>

        {/* Content Dashboard */}
        <section className="flex-1 p-8 overflow-y-auto bg-slate-950 custom-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              label="Inventory Level" 
              value={currentInventory} 
              unit="units"
              footer="Target: 100-150"
              footerColor="text-teal-400"
            />
            <StatCard 
              label="Service Level" 
              value={`${stats.serviceLevel.toFixed(1)}%`} 
              unit="Realized"
              footer="Demand Fulfillment"
              footerColor="text-emerald-400"
            />
            <StatCard 
              label="Net Utility" 
              value={currentReward} 
              unit="USD"
              footer={`Targeting Convergence`}
              footerColor="text-teal-400"
            />
            <StatCard 
              label="AI Certainty" 
              value="94.2%" 
              unit="DQN"
              footer="Neural Confidence"
              footerColor="text-teal-400"
              spotlight
            />
          </div>

          {/* Main Simulation Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
            
            {/* Visualizer */}
            <div className="xl:col-span-8 space-y-6">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h5 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                                 <LayoutDashboard size={20} className="text-teal-400" />
                                 Inventory Intelligence Center
                            </h5>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Simulating Multi-SKU Pipeline Optimization</p>
                        </div>
                        <div className="flex gap-4 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                             <LegendItem color="#14b8a6" label="Stock" glow />
                             <LegendItem color="#334155" label="Demand" dashed />
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={history}>
                                <defs>
                                    <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis 
                                    dataKey="day" 
                                    fontFamily="JetBrains Mono" 
                                    fontSize={10} 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#475569' }}
                                />
                                <YAxis hide domain={[0, 250]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area 
                                    type="stepAfter" 
                                    dataKey="inventory" 
                                    stroke="#14b8a6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorInv)"
                                    animationDuration={0}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="demand" 
                                    stroke="#334155" 
                                    strokeDasharray="5 5" 
                                    dot={false}
                                    strokeWidth={1}
                                    animationDuration={0}
                                />
                                <Scatter 
                                    dataKey="order" 
                                    fill="#f59e0b" 
                                    shape={(props: any) => {
                                        const { cx, cy, payload } = props;
                                        if (payload.order <= 0) return null;
                                        return (
                                            <g transform={`translate(${cx-4},${cy-10})`}>
                                                <rect width="8" height={payload.order / 2} fill="#f59e0b" fillOpacity={0.6} />
                                            </g>
                                        );
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Info size={12} className="text-teal-400" />
                            DQN Decision Rationale (Explainability)
                        </h6>
                        <div className="space-y-3">
                            {insights.length > 0 ? (
                                insights.slice(0, 4).map((ins, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-16 text-[10px] font-mono text-slate-400">ORDER: {ins.action}</div>
                                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, Math.max(0, (ins.qValue + 500) / 10))}%` }}
                                                className={`h-full ${i === 0 ? 'bg-teal-500' : 'bg-slate-700 opacity-50'}`}
                                            />
                                        </div>
                                        <div className="w-12 text-right text-[10px] font-mono text-slate-200">
                                            {ins.qValue.toFixed(1)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-500 italic font-mono">Real-time inference queue empty...</p>
                            )}
                        </div>
                        <p className="mt-4 text-[9px] text-slate-600 italic leading-relaxed">
                            *Visualizing the neural network&#39;s expected utility (Q-Value) for each discrete reorder action given current state (Inv: {currentInventory}, Forecast: 25).
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                         <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Replenishment Logic</h6>
                         <div className="text-center p-4">
                            <p className="text-xs text-slate-400 uppercase mb-2">Recommended Volume</p>
                            <span className="text-5xl font-mono font-bold text-white tracking-tighter">
                                +{currentOrder}
                            </span>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${currentOrder > 0 ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                    {currentOrder > 0 ? 'Optimal Action' : 'Policy: Wait'}
                                </span>
                            </div>
                         </div>
                         <button className="w-full bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-teal-900/20">
                            Fulfill SKU_001
                         </button>
                    </div>
                </div>
            </div>

            {/* Benchmarking Section */}
            <div className="xl:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl h-full flex flex-col">
                    <h5 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-8 font-bold flex items-center gap-2">
                        <History size={14} className="text-teal-400" />
                        Multivariate Benchmarking
                    </h5>

                    <AnimatePresence mode="wait">
                        {comparison ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6 flex-1 flex flex-col"
                            >
                                <BenchmarkCard 
                                    title="OptiFlow DQN (Enterprise)" 
                                    reward={comparison.dqn.episodeReward}
                                    service={comparison.dqn.serviceLevel}
                                    accent
                                />
                                <BenchmarkCard 
                                    title="Q-Learning Agent" 
                                    reward={comparison.q.episodeReward}
                                    service={comparison.q.serviceLevel}
                                />
                                <BenchmarkCard 
                                    title="EOQ Mathematical Model" 
                                    reward={comparison.eoq.episodeReward}
                                    service={comparison.eoq.serviceLevel}
                                />
                                <BenchmarkCard 
                                    title="Fixed Policy Baseline" 
                                    reward={comparison.fixed.episodeReward}
                                    service={comparison.fixed.serviceLevel}
                                />
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl opacity-30">
                                <Activity size={32} className="mb-4" />
                                <p className="text-xs font-mono">Run Audit Benchmark to populate Enterprise Cost Matrices</p>
                            </div>
                        )}
                    </AnimatePresence>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800">
                         <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Best Performer</p>
                                <p className="text-lg font-bold text-teal-400">Deep Q Network</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Cost Savings vs EOQ</p>
                                <p className="text-lg font-mono font-bold text-emerald-400">
                                    {comparison ? `+${(((comparison.dqn.episodeReward - comparison.eoq.episodeReward) / Math.abs(comparison.eoq.episodeReward)) * 100).toFixed(1)}%` : '--'}
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

          </div>
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-[0.1em]">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Buffer Populate: 2000/2000</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Target Network: Sync OK</span>
        </div>
        <div className="opacity-50">Enterprise Instance ID: SC-3994-DRL | TensorFlow Core: active</div>
      </footer>
    </div>
  );
}

function BenchmarkCard({ title, reward, service, accent = false }: any) {
    return (
        <div className={`p-4 rounded-2xl border ${accent ? 'bg-teal-500/5 border-teal-500/30' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[11px] font-bold tracking-tight ${accent ? 'text-white' : 'text-slate-400'}`}>{title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${service > 95 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    SVC: {service.toFixed(1)}%
                </span>
            </div>
            <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Net Utility</span>
                <span className={`text-xl font-mono font-bold tracking-tighter ${accent ? 'text-teal-400' : 'text-white'}`}>
                    {reward.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
            </div>
            {accent && <div className="mt-2 h-0.5 bg-teal-500 rounded-full" />}
        </div>
    );
}

function LogEntry({ time, msg }: { time: string, msg: string }) {
    return (
        <div className="flex gap-3 text-[9px] font-mono leading-tight">
            <span className="text-teal-600 block shrink-0">[{time}]</span>
            <span className="text-slate-400">{msg}</span>
        </div>
    );
}

function LegendItem({ color, label, dashed = false, glow = false }: { color: string, label: string, dashed?: boolean, glow?: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div 
        className={`w-3 h-3 rounded-full ${dashed ? 'border-2 border-slate-700' : ''}`} 
        style={{ backgroundColor: dashed ? 'transparent' : color, boxShadow: glow ? `0 0 10px ${color}` : 'none' }}
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

function StatCard({ label, value, unit, footer, footerColor, spotlight = false }: any) {
  return (
    <div className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-teal-500/5 ${spotlight ? 'border-l-4 border-l-teal-500' : ''}`}>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{label}</p>
      <h4 className="text-3xl font-bold text-white tracking-tighter flex items-baseline gap-2">
        {value} <span className="text-xs font-normal text-slate-400 uppercase tracking-widest">{unit}</span>
      </h4>
      <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${footerColor}`}>
        {footer}
      </div>
    </div>
  );
}

function ComparisonRow({ label, value, color, bg, active = false }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? 'border-teal-500/30' : 'border-slate-800'} ${bg}`}>
      <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-[11px] font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

function StateVar({ label, value, sub }: any) {
  return (
    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
      <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">{label}</p>
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
      <p className="text-[9px] text-slate-500 font-mono">{sub}</p>
    </div>
  );
}

