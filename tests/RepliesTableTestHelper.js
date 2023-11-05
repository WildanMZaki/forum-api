/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply(
    reply_id = "reply-123",
    reply = {
      id: "reply-123",
      owner: "user-123",
      content: "This is reply content",
      comment_id: "comment-123",
    }
  ) {
    let { id } = reply;
    const { owner, comment_id, content } = reply;
    if (reply_id !== id) {
      id = reply_id;
    }
    const date = new Date().toISOString();
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5)",
      values: [id, owner, comment_id, content, date],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async softDeleteReply(id) {
    const query = {
      text: "UPDATE replies SET is_deleted = true WHERE id = $1",
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies WHERE 1=1");
  },
};

module.exports = RepliesTableTestHelper;
