const NewReply = require("../../../Domains/replies/entities/NewReply");

class AddCommentReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { thread_id } = useCasePayload;
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.verifyIsThreadExists(thread_id);
    await this._commentRepository.verifyIsCommentExists(newReply.comment_id);
    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddCommentReplyUseCase;
