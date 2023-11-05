const DetailReply = require("../DetailReply");

describe("a DetailReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "Comment Content",
      username: "uname",
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      "DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "Correct content",
      username: {},
      date: true,
      is_deleted: [],
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      "DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create detailReply object correctly", () => {
    // Arrange
    const payload1 = {
      id: "reply-123",
      content: "Comment reply content",
      username: "iamuser",
      date: "2021-08-08T07:22:33.555Z",
      is_deleted: false,
    };
    const payload2 = {
      id: "reply-456",
      content: "Comment reply content",
      username: "iamotheruser",
      date: "2023-08-08T07:22:33.555Z",
      is_deleted: true,
    };

    // Action
    const detailReply1 = new DetailReply(payload1);
    const detailReply2 = new DetailReply(payload2);

    // Assert
    expect(detailReply1.id).toEqual(payload1.id);
    expect(detailReply1.content).toEqual(payload1.content);
    expect(detailReply1.username).toEqual(payload1.username);
    expect(detailReply1.date).toEqual(payload1.date);

    expect(detailReply2.id).toEqual(payload2.id);
    expect(detailReply2.content).toEqual("**balasan telah dihapus**");
    expect(detailReply2.username).toEqual(payload2.username);
    expect(detailReply2.date).toEqual(payload2.date);
  });
});
