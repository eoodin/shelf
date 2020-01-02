import React, {Component} from 'react';
import './App.css';
import {connect} from 'react-redux';
import {HashRouter as Router, Route, withRouter} from "react-router-dom";
import {Button, Layout, Menu} from 'antd';
import 'antd/dist/antd.css';

import Login from './LoginView'
import AdminPage from './AdminPage';

import {fetchProfile, userLogout} from "./store/actions/profile";

const {Header, Content, Footer} = Layout;

class RouteApp extends Component {

    componentDidMount() {
        this.props.fetchProfile();
    }

    render() {
        if (this.props.app.loading) {
            return <h1>Loading...</h1> /*<FullPageLoading />*/
        }

        if (!this.props.profile.user) {
            return <Login/>
        }

        function AppContent(props) {
            const {history, profile} = props;
            return <Layout className="layout">
                <Header style={{position: 'fixed', zIndex: 1, width: '100%'}}>
                    <div style={{display: "flex"}}>
                        <Menu mode="horizontal" theme="dark"
                              defaultSelectedKeys={['1']}
                              style={{lineHeight: '64px'}}>
                            <Menu.Item key="1" onClick={() => history.push('/projects')}>Project</Menu.Item>
                            <Menu.Item key="2" onClick={() => history.push('/admin')}>Admin</Menu.Item>
                        </Menu>
                        <div style={{flexGrow: 1}}/>
                        <div>{profile.user.displayName}</div>
                        <Button type="link" size="large" onClick={props.logout}
                                className="logout-button">Logout</Button>
                    </div>
                </Header>
                <Content style={{marginTop: 64}}>
                    <Route path='/projects' render={() => <h1>Projects!!</h1>}/>
                    <Route path='/admin' render={() => <AdminPage/>}/>
                </Content>
            </Layout>
        }

        const ContentWithRouter = withRouter(AppContent);
        const appProps = this.props;
        return (
            <Router><ContentWithRouter {...appProps}/></Router>
        );
    }
}

const mapStateToProps = state => ({
    profile: state.profile,
    app: state.app,
});

const mapDispatchToProps = dispatch => ({
    fetchProfile: () => dispatch(fetchProfile()),
    logout: () => dispatch(userLogout())
});

const StatedApp = connect(mapStateToProps, mapDispatchToProps)(RouteApp);

export default connect(mapStateToProps, mapDispatchToProps)(StatedApp);
