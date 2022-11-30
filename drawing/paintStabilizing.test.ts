import { sortMessageBySentDate, groupBySentDateAndProperties } from "./paintStabilizing";
describe("paintStabilizing", () => {
  describe("sortMessageBySentDate", () => {
    it("should create a correct order of messages from last to most recent", () => {
      const start = new Date();
      const messages = [
        { id: "D", sent: new Date(start.getTime() + 1000).toISOString() },
        { id: "B", sent: new Date(start.getTime() + 1).toISOString() },
        { id: "C", sent: new Date(start.getTime() + 400).toISOString() },
        { id: "A", sent: start.toISOString() }
      ];
      messages.sort(sortMessageBySentDate);
      expect(messages[0].id).toBe("A");
      expect(messages[1].id).toBe("B");
      expect(messages[2].id).toBe("C");
      expect(messages[3].id).toBe("D");
    })
  });

  describe("groupBySentDateAndProperties", () => {
    it("should create groups of messages by sent date and custom function", () => {
      const start = new Date();
      let messages = [
        { id: "A", sent: start.toISOString(), type: "TypeA" },
        { id: "B", sent: start.toISOString(), type: "TypeB" },
        { id: "C1", sent: new Date(start.getTime() + 1000).toISOString(), type: "TypeC" },
        { id: "C2", sent: new Date(start.getTime() + 1099).toISOString(), type: "TypeC" }
      ];
      const equals = (a, b) => a.type === b.type; 
      const grouped = messages.reduce(groupBySentDateAndProperties(100, equals), []);
      expect(grouped[0].id).toBe("A");
      expect(grouped[1].id).toBe("B");
      expect(grouped[2][0].id).toBe("C1");
      expect(grouped[2][1].id).toBe("C2");
    });

    it("should create groups of messages with exclusive properties", () => {
      const start = new Date();
      let messages = [
        { id: "A", sent: start.toISOString(), type: "hello" },
        { id: "B", sent: start.toISOString(), type: "world" },
        { id: "C1", sent: start.toISOString(), type: "world" },
        { id: "C2", sent: start.toISOString(), type: "hello" }
      ];
      const equals = (a, b) => {
        const typeEquals = a.type === b.type;
        const idSimilar = a.id[0] === b.id[0];
        return (typeEquals && !idSimilar) || (!typeEquals && idSimilar);
      };
      const grouped = messages.reduce(groupBySentDateAndProperties(100, equals), []);
      expect(grouped[0][0].id).toBe("A");
      expect(grouped[0][1].id).toBe("C2");
      expect(grouped[1][0].id).toBe("B");
      expect(grouped[1][1].id).toBe("C1");
    });
  });
});