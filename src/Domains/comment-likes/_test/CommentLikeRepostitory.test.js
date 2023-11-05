const CommentLikeRepository = require("../CommentLikeRepository");

describe("CommentLikeRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const commentLikeRepository = new CommentLikeRepository();

    // Action and Assert
    await expect(
      commentLikeRepository.like("user-123", "comment-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentLikeRepository.dislike("user-123", "comment-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentLikeRepository.hasLike("user-123", "comment-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentLikeRepository.countLikes("comment-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
