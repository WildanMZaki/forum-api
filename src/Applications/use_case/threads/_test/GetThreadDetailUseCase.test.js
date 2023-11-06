const UsersTableTestHelper = require("../../../../../tests/UsersTableTestHelper");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const DetailComment = require("../../../../Domains/comments/entities/DetailComment");
const ReplyRepository = require("../../../../Domains/replies/ReplyRepository");
const DetailReply = require("../../../../Domains/replies/entities/DetailReply");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const DetailThread = require("../../../../Domains/threads/entities/DetailThread");
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");

describe("GetThreadDetailUseCase", () => {
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

    const mockReply1 = new DetailReply({
      id: "reply-123",
      content: "This is a content of my comment reply",
      username: "replier",
      date: "2021-08-10T07:22:33.555Z",
      is_deleted: false,
    });
    const mockReply2 = new DetailReply({
      id: "reply-321",
      content: "This is a content of my comment reply",
      username: "replierdeleted",
      date: "2021-08-10T07:22:33.555Z",
      is_deleted: true,
    });
    const mockReplies = [mockReply1, mockReply2];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => mockReplies);
    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    mockDetailThread.comments.forEach((comment, i) => {
      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        comment.id
      );
      mockDetailThread.comments[i].replies = mockReplies;
    });
    expect(threadDetail).toStrictEqual(mockDetailThread);
  });
});
