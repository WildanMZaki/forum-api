/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentLikesTableTestHelper = {
  async addCommentLike(comment_id = "comment-123", owner = "user-123") {
    const id = "comment-like-123";
    const query = {
      text: "INSERT INTO comment_likes VALUES($1, $2, $3)",
      values: [id, owner, comment_id],
    };

    await pool.query(query);
  },

  async countCommentLikes(comment_id) {
    const query = {
      text: "SELECT * FROM comment_likes WHERE comment_id = $1",
      values: [comment_id],
    };

    const result = await pool.query(query);
    return result.rows.length;
  },

  async deleteCommentLike(user_id, comment_id) {
    const query = {
      text: "DELETE FROM comment_likes WHERE owner = $1 AND comment_id = $2",
      values: [user_id, comment_id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM comment_likes WHERE 1=1");
  },
};

module.exports = CommentLikesTableTestHelper;
