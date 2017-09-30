'use strict';
module.exports = (sequelize, DataTypes) => {
  var defectComment = sequelize.define('defectComment', {
    defectId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    commentId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    }
  }, { timestamps: false});

  defectComment.associate = function(models) {
    defectComment.belongsTo(models.defect);
    defectComment.belongsTo(models.comment);
  }

  return defectComment;
};