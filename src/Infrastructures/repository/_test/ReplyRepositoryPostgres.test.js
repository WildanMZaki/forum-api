const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");

describe("ReplyRepositoryPostgres", () => {
  const defUserId = "user-123";
  const defThreadId = "thread-123";
  const defCommentId = "comment-123";

  beforeEach(async () => {
    await ThreadsTableTestHelper.addUserAndThread();
    await CommentsTableTestHelper.addComment();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist added reply and return reply comment correctly", async () => {
      // Arrange
      const newReply = new NewReply({
        owner: defUserId,
        content: "This is the reply content",
        comment_id: defCommentId,
      });

      const fakeIdGenerator = () => "123"; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(
        `reply-${fakeIdGenerator()}`
      );
      expect(replies).toHaveLength(1);
    });

    it("should return added reply correctly", async () => {
      // Arrange
      const newReply = new NewReply({
        owner: defUserId,
        content: "This is the reply content",
        comment_id: defCommentId,
      });

      const fakeIdGenerator = () => "123"; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: `reply-${fakeIdGenerator()}`,
          content: newReply.content,
          owner: newReply.owner,
        })
      );
    });
  });

  describe("verifyReplyOwner", () => {
    it("should throw error when the owner doesnt match with replies.owner", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {} // Fake function
      );

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply(replyId);
      return expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, "user-xyz")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should pass authorization error when the owner matchs with users.id", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {} // Fake function
      );

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply(replyId);

      const verified = await replyRepositoryPostgres.verifyReplyOwner(
        replyId,
        defUserId
      );

      return expect(verified).toStrictEqual(true);
    });
  });

  describe("verifyIsReplyExists", () => {
    it("should throw not found error when reply do not exists", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {}
      );

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply(replyId);

      return expect(
        replyRepositoryPostgres.verifyIsReplyExists("xyz")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should pass not found error when reply was exists", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {}
      );

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply(replyId);

      const isExists = await replyRepositoryPostgres.verifyIsReplyExists(
        replyId
      );

      return expect(isExists).toStrictEqual(true);
    });
  });

  describe("deleteReply function", () => {
    it("should delete comment by soft delete (update it is_deleted column to true)", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {}
      );

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply(replyId);

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies[0].is_deleted).toStrictEqual(true);
      expect(replies).toHaveLength(1);
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies that have specific comment id", async () => {
      // Arrange
      // user_id and thread_id from helper was: user-123 and thread-123
      await RepliesTableTestHelper.addReply("reply-123");
      await RepliesTableTestHelper.addReply("reply-321");
      await RepliesTableTestHelper.softDeleteReply("reply-321");

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => {}
      );

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        defCommentId
      );

      // Assert
      expect(replies).toHaveLength(2);
      replies.forEach((reply) => {
        if (reply.id === "reply-321") {
          expect(reply.content).toStrictEqual("**balasan telah dihapus**");
        }
        expect(reply).toHaveProperty("id");
        expect(reply).toHaveProperty("content");
        expect(reply).toHaveProperty("username");
        expect(reply).toHaveProperty("date");
      });
    });
  });
});
