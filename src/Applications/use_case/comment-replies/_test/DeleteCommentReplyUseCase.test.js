const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const ReplyRepository = require("../../../../Domains/replies/ReplyRepository");
const DeleteCommentReplyUseCase = require("../DeleteCommentReplyUseCase");

describe("DeleteCommentReplyUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      id: "reply-123",
      owner: "user-123",
      comment_id: "comment-123",
      thread_id: "thread-123",
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockReplyRepository.verifyIsReplyExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockReplyRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockReplyRepository.deleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentReplyUseCase = new DeleteCommentReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.comment_id
    );
    expect(mockReplyRepository.verifyIsReplyExists).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(
      useCasePayload.id,
      useCasePayload.owner
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.id);
  });
});
