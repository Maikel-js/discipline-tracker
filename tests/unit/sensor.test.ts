declare global {
  var __TEST_STORE__: any;
}

describe('Sensor Data Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Update Sensor Data', () => {
    it('should add sensor reading with id and timestamp', () => {
      store.updateSensorData('steps', 10000);

      expect(store.sensorData).toHaveLength(1);
      expect(store.sensorData[0].id).toBeDefined();
      expect(store.sensorData[0].type).toBe('steps');
      expect(store.sensorData[0].value).toBe(10000);
      expect(store.sensorData[0].timestamp).toBeDefined();
    });

    it('should set correct unit for steps', () => {
      store.updateSensorData('steps', 5000);

      expect(store.sensorData[0].unit).toBe('pasos');
    });

    it('should set correct unit for sleep', () => {
      store.updateSensorData('sleep', 8);

      expect(store.sensorData[0].unit).toBe('horas');
    });

    it('should set correct unit for activity', () => {
      store.updateSensorData('activity', 30);

      expect(store.sensorData[0].unit).toBe('minutos');
    });

    it('should set correct unit for heartRate', () => {
      store.updateSensorData('heartRate', 72);

      expect(store.sensorData[0].unit).toBe('lpm');
    });

    it('should add multiple readings', () => {
      store.updateSensorData('steps', 8000);
      store.updateSensorData('sleep', 7);
      store.updateSensorData('heartRate', 68);

      expect(store.sensorData).toHaveLength(3);
    });
  });

  describe('Check Auto Mark Habit', () => {
    it('should auto-complete habit when steps >= 10000 and category is exercise', () => {
      store.addHabit({
        name: 'Run',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'exercise',
        status: 'pending'
      });

      const habit = store.habits[0];
      expect(habit.status).toBe('pending');

      store.updateSensorData('steps', 12000);

      const result = store.checkAutoMarkHabit(habit.id, 'steps');

      expect(result).toBe(true);
      const updatedHabit = store.habits.find((h: any) => h.id === habit.id);
      expect(updatedHabit.status).toBe('completed');
    });

    it('should not auto-complete if steps < 10000', () => {
      store.addHabit({
        name: 'Run',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'exercise',
        status: 'pending'
      });

      const habit = store.habits[0];

      store.updateSensorData('steps', 5000);

      const result = store.checkAutoMarkHabit(habit.id, 'steps');

      expect(result).toBe(false);
      expect(habit.status).toBe('pending');
    });

    it('should auto-complete when sleep >= 7 and category is health', () => {
      store.addHabit({
        name: 'Sleep well',
        scheduledTime: '22:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];

      store.updateSensorData('sleep', 8);

      const result = store.checkAutoMarkHabit(habit.id, 'sleep');

      expect(result).toBe(true);
      const updatedHabit = store.habits.find((h: any) => h.id === habit.id);
      expect(updatedHabit.status).toBe('completed');
    });

    it('should return false if no sensor data available', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'exercise',
        status: 'pending'
      });

      const habit = store.habits[0];

      const result = store.checkAutoMarkHabit(habit.id, 'steps');

      expect(result).toBe(false);
    });

    it('should return false if habit not found', () => {
      store.updateSensorData('steps', 12000);

      const result = store.checkAutoMarkHabit('non-existent', 'steps');

      expect(result).toBe(false);
    });
  });
});
