const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentLikeRepositoryPostgres = require("../CommentLikeRepositoryPostgres");
const pool = require("../../database/postgres/pool");

describe("CommentLikeRepositoryPostgres", () => {
  beforeEach(async () => {
    await ThreadsTableTestHelper.addUserAndThread(); // generate user with id user-123 and thread with id thread-123
    await CommentsTableTestHelper.addComment(); // Note, comments.id yang digenerate di helper adalah comment-123
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("like function", () => {
    it("should add row to comment_likes table and it has comment_id and user_id from user", async () => {
      // Arrange
      const comment_id = "comment-123";
      const user_id = "user-123";

      const othLiker = "user-321";
      const fakeRegisterUser = {
        id: othLiker,
        username: "fake_user",
        password: "secret_password",
        fullname: "User Tester",
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const fakeIdGenerator = () => "123" + new Date().toISOString(); // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentLikeRepositoryPostgres.like(user_id, comment_id);
      await commentLikeRepositoryPostgres.like(othLiker, comment_id);

      // Assert
      const commentlikes = await CommentLikesTableTestHelper.countCommentLikes(
        comment_id
      );
      expect(commentlikes).toStrictEqual(2);
    });

    it("should return added comment like correctly", async () => {
      // Arrange
      const comment_id = "comment-123";
      const user_id = "user-123";

      const fakeIdGenerator = () => "123"; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const commentLike = await commentLikeRepositoryPostgres.like(
        user_id,
        comment_id
      );

      // Assert
      expect(commentLike).toStrictEqual({
        owner: user_id,
        comment_id: comment_id,
      });
    });
  });

  describe("dislike function", () => {
    it("should delete row from comment_likes table", async () => {
      // Arrange
      const comment_id = "comment-123";
      const user_id = "user-123";

      await CommentLikesTableTestHelper.addCommentLike(comment_id, user_id);

      const fakeIdGenerator = () => "123"; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentLikeRepositoryPostgres.dislike(user_id, comment_id);

      // Assert
      const commentlikes = await CommentLikesTableTestHelper.countCommentLikes(
        comment_id
      );
      expect(commentlikes).toStrictEqual(0);
    });
  });

  describe("haslike function", () => {
    it("should return true if user has like the comment and the opposite", async () => {
      // Arrange
      const comment_id = "comment-123";
      const user_id = "user-123";

      await CommentLikesTableTestHelper.addCommentLike(comment_id, user_id);

      const fakeIdGenerator = () => "123"; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const userMustHasLike = await commentLikeRepositoryPostgres.hasLike(
        user_id,
        comment_id
      );
      const userMustBeHasntLike = await commentLikeRepositoryPostgres.hasLike(
        "random-user-123",
        comment_id
      );

      // Assert
      expect(userMustHasLike).toStrictEqual(true);
      expect(userMustBeHasntLike).toStrictEqual(false);
    });
  });

  describe("countLikes function", () => {
    it("should return number of like from the comment", async () => {
      // Arrange
      const comment_id = "comment-123";
      const user_id = "user-123";

      const fakeLiker = "user-321";
      const fakeRegisterUser = {
        id: fakeLiker,
        username: "fake_user",
        password: "secret_password",
        fullname: "User Tester",
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);
      const othUserId = "user-789";
      const otherUser = {
        id: othUserId,
        username: "other_user",
        password: "otheruser123",
        fullname: "Other Tester",
      };
      await UsersTableTestHelper.addUser(otherUser);

      const fakeIdGenerator = () => "123" + new Date().toISOString(); // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentLikeRepositoryPostgres.like(user_id, comment_id);
      await commentLikeRepositoryPostgres.like(fakeLiker, comment_id);
      await commentLikeRepositoryPostgres.like(othUserId, comment_id);
      await commentLikeRepositoryPostgres.dislike(fakeLiker, comment_id);
      // Action
      const countCommentLikes = await commentLikeRepositoryPostgres.countLikes(
        comment_id
      );

      // Assert
      expect(Number(countCommentLikes)).toStrictEqual(2);
    });
  });
});
