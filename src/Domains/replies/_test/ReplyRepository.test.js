const ReplyRepository = require("../ReplyRepository");

describe("ReplyRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action and Assert
    await expect(replyRepository.addReply({})).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );

    await expect(
      replyRepository.verifyReplyOwner("reply-123", "user-123")
    ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      replyRepository.verifyIsReplyExists("reply-123")
    ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      replyRepository.getRepliesByCommentId("coment-123")
    ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(replyRepository.deleteReply("reply-123")).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
