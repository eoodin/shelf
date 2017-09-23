'use strict';

module.exports = (sequelize, DataTypes) => {
  var defectHistory = sequelize.define('defectHistory', {
    defectId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    historyId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    }
  }, { tableName: 'defect_histories', updatedAt: false });
  defectHistory.associate = function (models) {
    // associations can be defined here
  };
  defectHistory.saveFor = function(defect, changes, userId) {
    return sequelize.model('history').create({
      userId: userId
    }).then(his => {
      console.log('history created: ' + his.id);
      return defectHistory.create({
        defectId: defect.id,
        historyId: his.id
      }).then((dh) => {
        let change = sequelize.model('change');
        let updatings = [];
        for (let c in changes) {
          updatings.push(change.create({historyId: his.id, field: c, value: changes[c]}));
        }

        return sequelize.Promise.all(updatings);
      })
    });
  };
  
  return defectHistory;
};