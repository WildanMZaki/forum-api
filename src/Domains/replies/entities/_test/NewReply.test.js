const NewReply = require("../NewReply");

describe("a NewReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      comment_id: "comment-123",
    }; //kurang content

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      owner: true,
      content: 123,
      comment_id: "comment-valid",
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewReply object correctly", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      content: "Comment Reply Content",
      comment_id: "comment-123",
    };

    // Action
    const { owner, content, comment_id } = new NewReply(payload);

    // Assert
    expect(owner).toEqual(payload.owner);
    expect(content).toEqual(payload.content);
    expect(comment_id).toEqual(payload.comment_id);
  });
});
