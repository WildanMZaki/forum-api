class LikeOrDislikeCommentUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { thread_id, comment_id, user_id } = useCasePayload;
    await this._threadRepository.verifyIsThreadExists(thread_id);
    await this._commentRepository.verifyIsCommentExists(comment_id);
    const userHasLike = await this._commentLikeRepository.hasLike(
      user_id,
      comment_id
    );
    if (!userHasLike) {
      await this._commentLikeRepository.like(user_id, comment_id);
    } else {
      await this._commentLikeRepository.dislike(user_id, comment_id);
    }
  }
}

module.exports = LikeOrDislikeCommentUseCase;
