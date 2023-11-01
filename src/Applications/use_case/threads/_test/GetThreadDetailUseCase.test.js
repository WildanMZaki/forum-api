const UsersTableTestHelper = require("../../../../../tests/UsersTableTestHelper");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const DetailComment = require("../../../../Domains/comments/entities/DetailComment");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const AddThread = require("../../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../../Domains/threads/entities/AddedThread");
const DetailThread = require("../../../../Domains/threads/entities/DetailThread");
const AddThreadUseCase = require("../AddThreadUseCase");
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");

describe("AddThreadUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the get thread detail action correctly", async () => {
    // Arrange
    const useCasePayload = {
      id: "thread-123",
    };

    const mockDetailThread = new DetailThread({
      id: "thread-123",
      title: "A thread title",
      body: "The body of my thread",
      date: "2021-08-08T07:22:33.555Z",
      username: "iamuser",
    });

    const mockCommentDetail1 = new DetailComment({
      id: "comment-123",
      content: "This is a comntent of my comment",
      username: "commentator",
      date: "2021-08-10T07:22:33.555Z",
      is_deleted: false,
    });

    const mockCommentDetail2 = new DetailComment({
      id: "comment-321",
      content: "This is second comment content",
      username: "commentator2",
      date: "2021-08-17T07:22:33.555Z",
      is_deleted: true,
    });

    const mockComments = [mockCommentDetail1, mockCommentDetail2];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.getThreadDetail = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => mockComments);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.id
    );
    mockDetailThread.comments = mockComments;
    expect(threadDetail).toStrictEqual(mockDetailThread);
  });
});
