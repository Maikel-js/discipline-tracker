declare global {
  var __TEST_STORE__: any;
}

describe('Accountability Partners Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Add Partner', () => {
    it('should add partner with id', () => {
      store.addAccountabilityPartner({
        name: 'John Doe',
        email: 'john@test.com',
        notifyOnMiss: true,
        notifyOnComplete: false
      });

      expect(store.accountabilityPartners).toHaveLength(1);
      expect(store.accountabilityPartners[0].id).toBeDefined();
      expect(store.accountabilityPartners[0].name).toBe('John Doe');
    });

    it('should add multiple partners', () => {
      store.addAccountabilityPartner({
        name: 'Partner 1',
        email: 'p1@test.com',
        notifyOnMiss: true,
        notifyOnComplete: true
      });

      store.addAccountabilityPartner({
        name: 'Partner 2',
        email: 'p2@test.com',
        notifyOnMiss: false,
        notifyOnComplete: true
      });

      expect(store.accountabilityPartners).toHaveLength(2);
    });
  });

  describe('Remove Partner', () => {
    it('should remove partner by id', () => {
      store.addAccountabilityPartner({
        name: 'To Remove',
        email: 'remove@test.com',
        notifyOnMiss: true,
        notifyOnComplete: false
      });

      const partner = store.accountabilityPartners[0];
      store.removeAccountabilityPartner(partner.id);

      expect(store.accountabilityPartners).toHaveLength(0);
    });

    it('should not affect other partners when removing one', () => {
      store.addAccountabilityPartner({
        name: 'P1',
        email: 'p1@test.com',
        notifyOnMiss: true,
        notifyOnComplete: false
      });

      store.addAccountabilityPartner({
        name: 'P2',
        email: 'p2@test.com',
        notifyOnMiss: true,
        notifyOnComplete: false
      });

      const partner = store.accountabilityPartners[0];
      store.removeAccountabilityPartner(partner.id);

      expect(store.accountabilityPartners).toHaveLength(1);
      expect(store.accountabilityPartners[0].name).toBe('P2');
    });
  });

  describe('Notify Partner', () => {
    it('should update lastNotified on notify', () => {
      store.addAccountabilityPartner({
        name: 'Partner',
        email: 'p@test.com',
        notifyOnMiss: true,
        notifyOnComplete: false
      });

      const partner = store.accountabilityPartners[0];
      expect(partner.lastNotified).toBeUndefined();

      store.notifyPartner(partner.id, 'habit-1', 'missed');

      const updatedPartner = store.accountabilityPartners.find((p: any) => p.id === partner.id);
      expect(updatedPartner.lastNotified).toBeDefined();
    });

    it('should not notify if notifyOnMiss is false and status is missed', () => {
      store.addAccountabilityPartner({
        name: 'Partner',
        email: 'p@test.com',
        notifyOnMiss: false,
        notifyOnComplete: true
      });

      const partner = store.accountabilityPartners[0];
      const initialLastNotified = partner.lastNotified;

      store.notifyPartner(partner.id, 'habit-1', 'missed');

      const updatedPartner = store.accountabilityPartners.find((p: any) => p.id === partner.id);
      expect(updatedPartner.lastNotified).toBe(initialLastNotified);
    });

    it('should notify if notifyOnComplete is true and status is completed', () => {
      store.addAccountabilityPartner({
        name: 'Partner',
        email: 'p@test.com',
        notifyOnMiss: false,
        notifyOnComplete: true
      });

      const partner = store.accountabilityPartners[0];

      store.notifyPartner(partner.id, 'habit-1', 'completed');

      const updatedPartner = store.accountabilityPartners.find((p: any) => p.id === partner.id);
      expect(updatedPartner.lastNotified).toBeDefined();
    });
  });
});
