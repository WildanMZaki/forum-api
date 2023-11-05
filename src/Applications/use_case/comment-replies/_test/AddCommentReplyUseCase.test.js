const AddedComment = require("../../../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const AddedReply = require("../../../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../../../Domains/replies/ReplyRepository");
const AddCommentReplyUseCase = require("../AddCommentReplyUseCase");
const NewReply = require("../../../../Domains/replies/entities/NewReply");

describe("AddCommentReplyUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add comment reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      owner: "user-123",
      content: "This is comment content",
      comment_id: "comment-123",
      thread_id: "thread-123",
    };

    const mockAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

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
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addCommentReplyUseCase = new AddCommentReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addCommentReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: "reply-123",
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.comment_id
    );

    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({
        owner: useCasePayload.owner,
        content: useCasePayload.content,
        comment_id: useCasePayload.comment_id,
      })
    );
  });
});
