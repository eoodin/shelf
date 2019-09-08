const expect = require('chai').expect;
const {makeMockModels} = require('sequelize-test-helpers');
const {match, stub, resetHistory} = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('project data accessor', function () {
    const project = {findByPk: stub()};
    const mockModels = makeMockModels({project: project});
    const projects = proxyquire('./projects.js', {
        '../models': mockModels
    });

    const id = 1;
    const data = {
        firstname: 'Testy',
        lastname: 'McTestface',
        email: 'testy.mctestface.test.tes',
        token: 'some-token'
    };
    const fakeProject = {id, ...data, update: stub()};

    let result;

    describe('find project', () => {
        it('return null if no project  found', async() => {
            after(resetHistory);
            project.findByPk.resolves(null);
            let p = await projects.find(id);
            expect(project.findByPk).to.have.been.calledWith(match(id));
            expect(p).to.be.null;
        })
    });

    context('project does not exist', () => {
        before(async () => {
            project.findByPk.resolves(undefined);
            result = await projects.save({id, ...data})
        });

        after(resetHistory);

        it('called Project.findByPk', () => {
            expect(project.findByPk).to.have.been.calledWith(match(id))
        });

        it("didn't call project.update", () => {
            expect(fakeProject.update).not.to.have.been.called
        });

        it('returned null', () => {
            expect(result).to.be.null
        })
    });

    context('project exists', () => {
        before(async () => {
            fakeProject.update.resolves(fakeProject);
            project.findByPk.resolves(fakeProject);
            result = await projects.save({id, ...data})
        });

        after(resetHistory);

        it('called Project.findByPk', () => {
            expect(project.findByPk).to.have.been.calledWith(match(id))
        });

        it('called project.update', () => {
            expect(fakeProject.update).to.have.been.calledWith(match(data))
        });

        it('returned the project', () => {
            expect(result).to.deep.equal(fakeProject)
        })
    })
});
