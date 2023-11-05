const LikeOrDislikeCommentUseCase = require("../../../../Applications/use_case/comments/LikeOrDislikeCommentUseCase");

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async putCommentLikeHandler(request, h) {
    const likeOrDislikeCommentUseCase = this._container.getInstance(
      LikeOrDislikeCommentUseCase.name
    );
    const { threadId: thread_id, commentId: comment_id } = request.params;
    const { id: user_id } = request.auth.credentials;
    await likeOrDislikeCommentUseCase.execute({
      thread_id,
      comment_id,
      user_id,
    });

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
