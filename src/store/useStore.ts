      name: 'discipline-tracker-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migration for protocols
          if (persistedState.protocols) {
            persistedState.protocols = persistedState.protocols.map((p: any) => ({
              ...p,
              tags: p.tags || [],
              linkedHabits: p.linkedHabits || [],
              linkedTasks: p.linkedTasks || [],
              steps: (p.steps || []).map((s: any) => ({
                ...s,
                id: s.id || Math.random().toString(36).substr(2, 9),
                completed: !!s.completed
              })),
              status: p.status || 'active'
            }));
          }
        }
        if (version < 3) {
          // Update pomodoro defaults (25/5 -> 50/15)
          if (persistedState.settings) {
            if (persistedState.settings.pomodoroLength === 25) {
              persistedState.settings.pomodoroLength = 50;
            }
            if (persistedState.settings.breakLength === 5) {
              persistedState.settings.breakLength = 15;
            }
          }
        }
        return persistedState;
      }