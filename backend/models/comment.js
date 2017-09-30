'use strict';
module.exports = (sequelize, DataTypes) => {
  var comment = sequelize.define('comment', {
    content: DataTypes.STRING,
    userId: DataTypes.STRING
  });

  comment.associate = function(models)  {
  }
  return comment;
};