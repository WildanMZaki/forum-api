const CommentLikeRepository = require("../../Domains/comment-likes/CommentLikeRepository");

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async like(user_id, comment_id) {
    const id = `comment-like-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING owner, comment_id",
      values: [id, user_id, comment_id],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async dislike(user_id, comment_id) {
    const query = {
      text: "DELETE FROM comment_likes WHERE owner = $1 AND comment_id = $2",
      values: [user_id, comment_id],
    };

    await this._pool.query(query);
  }

  async hasLike(user_id, comment_id) {
    const query = {
      text: "SELECT * FROM comment_likes WHERE owner = $1 AND comment_id = $2",
      values: [user_id, comment_id],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async countLikes(comment_id) {
    const query = {
      text: "SELECT COUNT(*) AS like_count FROM comment_likes WHERE comment_id = $1",
      values: [comment_id],
    };

    const result = await this._pool.query(query);
    return result.rows[0].like_count;
  }
}

module.exports = CommentLikeRepositoryPostgres;
