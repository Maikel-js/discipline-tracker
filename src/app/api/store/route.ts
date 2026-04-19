import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';

export async function GET(request: NextRequest) {
  const state = useStore.getState();
  
  return NextResponse.json({
    habits: state.habits,
    tasks: state.tasks,
    logs: state.logs,
    stats: state.stats,
    settings: state.settings
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    const state = useStore.getState();
    
    switch (action) {
      case 'addHabit':
        state.addHabit(data);
        break;
      case 'updateHabit':
        state.updateHabit(data.id, data.updates);
        break;
      case 'deleteHabit':
        state.deleteHabit(data.id);
        break;
      case 'completeHabit':
        state.completeHabit(data.id);
        break;
      case 'missHabit':
        state.missHabit(data.id);
        break;
      case 'addTask':
        state.addTask(data);
        break;
      case 'updateTask':
        state.updateTask(data.id, data.updates);
        break;
      case 'deleteTask':
        state.deleteTask(data.id);
        break;
      case 'moveTask':
        state.moveTask(data.id, data.status);
        break;
      case 'toggleExtremeMode':
        state.toggleExtremeMode();
        break;
      case 'updateSettings':
        state.updateSettings(data);
        break;
      default:
        return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}