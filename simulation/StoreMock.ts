export class StoreMock {
  nodes = [];
  messages = [];

  update() {
    return (updater) => {
      const values = updater(this);
      Object.entries(values)
        .forEach(([key, value]) => {
          this[key] = value;
        });
    }
  }
}