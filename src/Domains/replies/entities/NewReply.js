class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { owner, content, comment_id } = payload;

    this.owner = owner;
    this.content = content;
    this.comment_id = comment_id;
  }

  _verifyPayload({ owner, content, comment_id }) {
    if (!owner || !content || !comment_id) {
      throw new Error("NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof owner !== "string" ||
      typeof content !== "string" ||
      typeof comment_id !== "string"
    ) {
      throw new Error("NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}
module.exports = NewReply;
