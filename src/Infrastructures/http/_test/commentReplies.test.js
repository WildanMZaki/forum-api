const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("/threads/{threadId}/comments/{commentId}/replies endpoint", () => {
  let threadId;
  let commentId;
  let token;
  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    const server = await createServer(container);

    // Action
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
    const commentResp = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      payload: commentPayload,
      headers: {
        Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
      },
    });
    const commentJson = JSON.parse(commentResp.payload);
    commentId = commentJson.data.addedComment.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 201 and persisted comment", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: "This is my comment reply",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it("should response 404 when threadId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: "This is my comment reply",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/xxx/comments/${commentId}/replies`,
        payload: requestPayload,
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

      const requestPayload = {
        content: "This is my comment reply",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/xxx/replies`,
        payload: requestPayload,
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

      const requestPayload = {
        content: "This is my comment reply",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      //   const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {};

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: true,
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena tipe data tidak sesuai"
      );
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{id}", () => {
    let replyId;
    beforeEach(async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const reply = {
        content: "This is my comment reply",
      };

      // Action
      const replyResp = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: reply,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });
      const replyJson = JSON.parse(replyResp.payload);
      const { id } = replyJson.data.addedReply;
      replyId = id;
    });

    it("should response 200", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const resp = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(resp.payload);
      expect(resp.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Comment Reply deleted");
    });
    it("should response 401 when no token in request", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: {},
      });

      // Assert
      //   const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });
    it("should response 404 when threadId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/xxx/comments/${commentId}/replies/${replyId}`,
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
        method: "DELETE",
        url: `/threads/${threadId}/comments/xxx/replies/${replyId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
    it("should response 404 when replyId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/xxx`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
    it("should response 403 when accessToken was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "wrongUser",
          password: "secret123",
          fullname: "The Hacker",
        },
      });
      const authResp = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "wrongUser", password: "secret123" },
      });
      const authJson = JSON.parse(authResp.payload);
      const { accessToken } = authJson.data;
      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });
  });
});
