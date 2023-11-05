class DeleteCommentReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { id, owner, thread_id, comment_id } = useCasePayload;
    await this._threadRepository.verifyIsThreadExists(thread_id);
    await this._commentRepository.verifyIsCommentExists(comment_id);
    await this._replyRepository.verifyIsReplyExists(id);
    await this._replyRepository.verifyReplyOwner(id, owner);
    await this._replyRepository.deleteReply(id);
  }
}

module.exports = DeleteCommentReplyUseCase;
