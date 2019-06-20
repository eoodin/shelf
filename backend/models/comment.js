'use strict';
module.exports = (sequelize, DataTypes) => {
  var comment = sequelize.define('comment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    content: DataTypes.STRING,
    userId: DataTypes.STRING
  });

  comment.associate = function(models)  {
  };
  return comment;
};
