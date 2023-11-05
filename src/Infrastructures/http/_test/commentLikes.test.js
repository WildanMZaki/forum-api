const pool = require("../../database/postgres/pool");
const container = require("../../container");
const createServer = require("../createServer");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");

describe("/threads/{threadId}/comments/{commentId}/likes endpoint", () => {
  let threadId;
  let commentId;
  let token;
  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    const server = await createServer(container);

    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: "tester",
        password: "secret",
        fullname: "The Tester",
      },
    });
    const authResp = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "tester", password: "secret" },
    });
    const authJson = JSON.parse(authResp.payload);
    const { accessToken } = authJson.data;
    token = accessToken;

    const threadPayload = {
      title: "Thread title",
      body: "The thread body",
    };
    const threadResp = await server.inject({
      method: "POST",
      url: "/threads",
      payload: threadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Sertakan token dalam header Authorization
      },
    });
    const threadJson = JSON.parse(threadResp.payload);
    const { id } = threadJson.data.addedThread;
    threadId = id;

    const commentPayload = {
      content: "This is my comment",
    };

    // Action
    const comentResp = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      payload: commentPayload,
      headers: {
        Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
      },
    });
    const commentJson = JSON.parse(comentResp.payload);
    commentId = commentJson.data.addedComment.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should response 200 and add row in comment-likes table", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      const countLikeOfComment =
        await CommentLikesTableTestHelper.countCommentLikes(commentId);
      expect(countLikeOfComment).toStrictEqual(1);
    });

    it("should response 200 and delete row in comment-likes table", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Other User Like
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "seconduser",
          password: "iamseconduser",
          fullname: "The Second User",
        },
      });
      const authResp = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "seconduser", password: "iamseconduser" },
      });
      const authJson = JSON.parse(authResp.payload);
      const { accessToken } = authJson.data;

      // Action
      await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });
      await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`, // Sertakan token dalam header Authorization
        },
      });
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      const countLikeOfComment =
        await CommentLikesTableTestHelper.countCommentLikes(commentId);
      expect(countLikeOfComment).toStrictEqual(1);
    });

    it("should response 404 when threadId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/xxx/comments/${commentId}/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 404 when commentId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/xyz/likes`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 401 when no token in request", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        payload: {},
      });

      // Assert
      //   const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });
  });
});
