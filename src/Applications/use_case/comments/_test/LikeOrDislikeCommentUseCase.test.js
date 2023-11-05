const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const CommentLikeRepository = require("../../../../Domains/comment-likes/CommentLikeRepository");
const LikeOrDislikeCommentUseCase = require("../LikeOrDislikeCommentUseCase");

describe("LikeOrDislikeCommentUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the like comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      user_id: "user-123",
      thread_id: "thread-123",
      comment_id: "comment-123",
    };

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.hasLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    // This mean the user have not like the comment before
    mockCommentLikeRepository.like = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.dislike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeOrDislikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.comment_id
    );
    expect(mockCommentLikeRepository.hasLike).toBeCalledWith(
      useCasePayload.user_id,
      useCasePayload.comment_id
    );
    expect(mockCommentLikeRepository.like).toBeCalledWith(
      useCasePayload.user_id,
      useCasePayload.comment_id
    );
    expect(mockCommentLikeRepository.dislike).not.toBeCalled();
  });

  it("should orchestrating the dislike comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      user_id: "user-123",
      thread_id: "thread-123",
      comment_id: "comment-123",
    };

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.hasLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    // This mean, the user already like the comment
    mockCommentLikeRepository.like = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.dislike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeOrDislikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.comment_id
    );
    expect(mockCommentLikeRepository.hasLike).toBeCalledWith(
      useCasePayload.user_id,
      useCasePayload.comment_id
    );
    expect(mockCommentLikeRepository.like).not.toBeCalled();
    expect(mockCommentLikeRepository.dislike).toBeCalledWith(
      useCasePayload.user_id,
      useCasePayload.comment_id
    );
  });
});
