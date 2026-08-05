  const pomodoroMinutes = settings.pomodoroLength || 50;
  const progress = ((pomodoroMinutes * 60 - secondsLeft) / (pomodoroMinutes * 60)) * 100;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Timer size={18} className="text-red-500" />
          Pomodoro
        </div>
        <div className="text-xs text-gray-400">
          {(settings.pomodoroLength || 50)} min trabajo / {(settings.breakLength || 15)} min descanso
        </div>
      </div>