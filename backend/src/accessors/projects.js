const models = require('../models');

const find = async (id) => {
    return models.project.findByPk(id);
};

const save = async ({ id, ...data }) => {
    const user = await models.project.findByPk(id);
    if (user) return await user.update(data);
    return null
};

module.exports = {find, save};
