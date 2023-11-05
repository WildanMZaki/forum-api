const AddCommentReplyUseCase = require("../../../../Applications/use_case/comment-replies/AddCommentReplyUseCase");
const DeleteCommentReplyUseCase = require("../../../../Applications/use_case/comment-replies/DeleteCommentReplyUseCase");

class CommentRepliesHandler {
  constructor(container) {
    this._container = container;

    this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
    this.deleteCommentReplyHandler = this.deleteCommentReplyHandler.bind(this);
  }

  async postCommentReplyHandler(request, h) {
    const addCommentReplyUseCase = this._container.getInstance(
      AddCommentReplyUseCase.name
    );
    const { threadId: thread_id, commentId: comment_id } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const addedReply = await addCommentReplyUseCase.execute({
      owner,
      content,
      comment_id,
      thread_id,
    });

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentReplyHandler(request, h) {
    const deleteCommentReplyUseCase = this._container.getInstance(
      DeleteCommentReplyUseCase.name
    );

    const { id, commentId: comment_id, threadId: thread_id } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentReplyUseCase.execute({
      id,
      owner,
      comment_id,
      thread_id,
    });

    const response = h.response({
      status: "success",
      message: "Comment Reply deleted",
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentRepliesHandler;
