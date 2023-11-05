const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");
const DetailReply = require("../../Domains/replies/entities/DetailReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { owner, content, comment_id } = newReply;

    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, owner, comment_id, content, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1 AND owner = $2",
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("owner tidak valid");
    }

    return true;
  }

  async verifyIsReplyExists(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("reply tidak ada");
    }

    return true;
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: "SELECT replies.id, replies.content, replies.date, replies.is_deleted, u.username FROM replies JOIN users u ON u.id = replies.owner WHERE replies.comment_id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    const comments = [];
    result.rows.forEach((row) => {
      comments.push(new DetailReply(row));
    });

    return comments;
  }

  async deleteReply(id) {
    const query = {
      text: "UPDATE replies SET is_deleted = true WHERE id = $1",
      values: [id],
    };
    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
