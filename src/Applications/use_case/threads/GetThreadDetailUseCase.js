class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { id } = useCasePayload;
    await this._threadRepository.verifyIsThreadExists(id);
    const thread = await this._threadRepository.getThreadDetail(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    thread.comments = comments;
    for (let i = 0; i < thread.comments.length; i++) {
      const comment = thread.comments[i];
      const replies = await this._replyRepository.getRepliesByCommentId(
        comment.id
      );
      thread.comments[i].replies = replies;
    }
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
